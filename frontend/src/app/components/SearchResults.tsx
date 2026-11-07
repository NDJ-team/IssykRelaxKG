import { useState, useEffect } from "react";
import { MapPin, Heart, SlidersHorizontal, Grid3X3, Map, Wifi, Car, Waves, Dog, Baby, CheckCircle, X, Users, Bed, Bath, Star } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { getProperties, getCities } from "../services/properties";
import { addFavorite, removeFavorite, getFavoriteIds } from "../services/favorites";
import { useAuth } from "../context/AuthContext";
import type { PropertyResponse, CityResponse } from "../types/api";

interface SearchResultsProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params?: Record<string, string>;
}

const AMENITY_FILTERS = [
  { key: "beachfront", label: "Пляж", icon: Waves },
  { key: "pool", label: "Бассейн", icon: Waves },
  { key: "wifi", label: "WiFi", icon: Wifi },
  { key: "parking", label: "Парковка", icon: Car },
  { key: "family", label: "Семьям", icon: Baby },
  { key: "pets", label: "С питомцами", icon: Dog },
];

const ITEMS_PER_PAGE = 12;

function LoadingCard() {
  return (
    <div className="rounded-2xl overflow-hidden border animate-pulse" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div style={{ height: 200, background: "var(--surface)" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded bg-gray-200 w-3/4" />
        <div className="h-3 rounded bg-gray-200 w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 rounded-md bg-gray-200 w-16" />
          <div className="h-5 rounded-md bg-gray-200 w-16" />
        </div>
        <div className="h-4 rounded bg-gray-200 w-1/3" />
      </div>
    </div>
  );
}

export function SearchResults({ onNavigate, params }: SearchResultsProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [guests, setGuests] = useState(2);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [selectedCityId, setSelectedCityId] = useState(params?.city_id || "");
  const [debouncedPrice, setDebouncedPrice] = useState(priceRange);

  const offset = params?.offset ? parseInt(params.offset) : 0;

  useEffect(() => {
    getCities().then(setCities).catch(() => toast.error("Ошибка загрузки городов"));
  }, []);

  useEffect(() => {
    if (!user) { setSavedListings([]); return; }
    getFavoriteIds().then((res) => setSavedListings(res.favorite_ids)).catch(() => {});
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPrice(priceRange), 400);
    return () => clearTimeout(timer);
  }, [priceRange]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const amenityStr = selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined;
        const sortMap: Record<string, string> = { rating: "rating_points", price: "price_asc" };
        const res = await getProperties({
          query: params?.query,
          category_id: params?.category_id,
          city_id: selectedCityId || params?.city_id,
          max_guests: guests,
          min_price: debouncedPrice[0],
          max_price: debouncedPrice[1],
          amenities: amenityStr,
          sort_by: sortMap[sortBy] || "rating_points",
          offset,
          limit: ITEMS_PER_PAGE,
        });
        setProperties(res.items);
        setTotal(res.total);
      } catch {
        toast.error("Ошибка загрузки результатов");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params?.query, params?.category_id, debouncedPrice, selectedAmenities, guests, selectedCityId, offset]);

  function toggleSave(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { toast.error("Войдите в аккаунт, чтобы сохранять"); return; }
    const isSaved = savedListings.includes(id);
    setSavedListings((prev) => isSaved ? prev.filter((i) => i !== id) : [...prev, id]);
    (isSaved ? removeFavorite(id) : addFavorite(id)).catch(() => {
      setSavedListings((prev) => isSaved ? [...prev, id] : prev.filter((i) => i !== id));
      toast.error("Ошибка при сохранении");
    });
  }

  function toggleAmenity(key: string) {
    setSelectedAmenities((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setDebouncedPrice([0, 50000]);
    setSelectedAmenities([]);
    setGuests(2);
    setSelectedCityId("");
  };

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Город</h3>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border text-sm outline-none bg-white"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <option value="">Все города</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Цена за ночь (Сом)</h3>
        <Slider min={0} max={50000} step={500} value={priceRange} onValueChange={setPriceRange} className="mb-2" />
        <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{priceRange[0].toLocaleString()} Сом</span>
          <span>{priceRange[1].toLocaleString()} Сом</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Гости</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: "var(--border)" }}>−</button>
          <span className="text-sm font-semibold w-6 text-center" style={{ color: "var(--text-primary)" }}>{guests}</span>
          <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: "var(--border)" }}>+</button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Удобства</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITY_FILTERS.map((a) => {
            const active = selectedAmenities.includes(a.key);
            return (
              <button
                key={a.key}
                onClick={() => toggleAmenity(a.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
                style={{
                  background: active ? "var(--lake-blue)" : "white",
                  color: active ? "white" : "var(--text-secondary)",
                  borderColor: active ? "var(--lake-blue)" : "var(--border)",
                }}
              >
                <a.icon size={13} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={resetFilters}
        className="w-full text-sm py-2 rounded-lg border transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        Сбросить фильтры
      </button>
    </div>
  );

  const currentPage = Math.floor(offset / ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Поиск и бронирование жилья на Иссык-Куле — отели, коттеджи, юрты"
        description="Найдите идеальное жильё на Иссык-Куле, Кыргызстан: отели, коттеджи, юрты, гостевые дома, курорты. Сравните цены на проживание в Чолпон-Ате, Бостери, Кара-Ое. Читайте отзывы, бронируйте онлайн."
        canonical="/search"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Поиск жилья", url: "/search" },
        ])}
      />
      <div className="border-b py-4 px-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-sm flex-1 min-w-0" style={{ borderColor: "var(--border)" }}>
            <MapPin size={14} style={{ color: "var(--lake-blue)" }} />
            <span style={{ color: "var(--text-secondary)" }}>{params?.query || "Иссык-Куль"}</span>
            <span className="mx-1 text-gray-300">·</span>
            <span style={{ color: "var(--text-secondary)" }}>{guests} гостей</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm px-3 py-2 rounded-xl border bg-white outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="rating">Рейтинг</option>
              <option value="price">Цена</option>
            </select>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors"
              style={{
                borderColor: filtersOpen ? "var(--lake-blue)" : "var(--border)",
                background: filtersOpen ? "var(--lake-blue-light)" : "white",
                color: filtersOpen ? "var(--lake-blue)" : "var(--text-primary)",
              }}
            >
              <SlidersHorizontal size={14} /> Фильтры
            </button>
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 transition-colors"
                style={{ background: viewMode === "grid" ? "var(--lake-blue)" : "white", color: viewMode === "grid" ? "white" : "var(--text-secondary)" }}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className="p-2 transition-colors"
                style={{ background: viewMode === "map" ? "var(--lake-blue)" : "white", color: viewMode === "map" ? "white" : "var(--text-secondary)" }}
              >
                <Map size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Поиск жилья" }]} onNavigate={onNavigate} />
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 p-5 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <FiltersPanel />
            </div>
          </aside>

          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Фильтры</h2>
                  <button onClick={() => setFiltersOpen(false)} style={{ color: "var(--text-secondary)" }}><X size={20} /></button>
                </div>
                <FiltersPanel />
                <Button className="w-full mt-4" onClick={() => setFiltersOpen(false)} style={{ background: "var(--lake-blue)" }}>
                  Показать {properties.length} объектов
                </Button>
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {loading ? "Загрузка..." : (
                  <>Найдено <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{total}</span> объектов</>
                )}
                {selectedAmenities.length > 0 && (
                  <span className="ml-2 text-xs" style={{ color: "var(--lake-blue)" }}>
                    · Фильтры: {selectedAmenities.length}
                  </span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--lake-blue-light)" }}>
                  <MapPin size={28} style={{ color: "var(--lake-blue)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Ничего не найдено</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: "var(--lake-blue)" }}
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => onNavigate("property", { property_id: listing.id })}
                      className="group text-left rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      <div className="relative overflow-hidden" style={{ height: 200 }}>
                        <ImgWithFallback
                          src={listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => toggleSave(listing.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                        >
                          <Heart size={15} fill={savedListings.includes(listing.id) ? "#ef4444" : "none"} stroke={savedListings.includes(listing.id) ? "#ef4444" : "#6b8299"} />
                        </button>
                        {listing.is_active && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ background: "var(--turquoise)", color: "white" }}>
                            <CheckCircle size={10} /> Верифицирован
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{listing.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin size={11} style={{ color: "var(--text-secondary)" }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{listing.city?.name || "Иссык-Куль"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                          <span className="flex items-center gap-1"><Users size={12} /> {listing.max_guests}</span>
                          <span className="flex items-center gap-1"><Bed size={12} /> {listing.bedrooms}</span>
                          <span className="flex items-center gap-1"><Bath size={12} /> {listing.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {listing.amenities?.slice(0, 3).map((a) => (
                            <span key={a} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>{a}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold" style={{ color: "var(--lake-blue)" }}>{listing.price_per_night.toLocaleString()} Сом</span>
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}> / ночь</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {listing.rating_points > 0 && (
                              <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                                <Star size={11} fill="var(--sand)" stroke="var(--sand)" />
                                {listing.rating_points}
                              </span>
                            )}
                            {listing.max_guests >= guests && (
                              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>Доступно</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {currentPage > 0 && (
                      <button
                        onClick={() => onNavigate("search", { ...params, offset: String((currentPage - 1) * ITEMS_PER_PAGE) })}
                        className="px-3 py-1.5 rounded-lg text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        Назад
                      </button>
                    )}
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => onNavigate("search", { ...params, offset: String(i * ITEMS_PER_PAGE) })}
                        className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: i === currentPage ? "var(--lake-blue)" : "var(--surface)",
                          color: i === currentPage ? "white" : "var(--text-secondary)",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    {currentPage < totalPages - 1 && (
                      <button
                        onClick={() => onNavigate("search", { ...params, offset: String((currentPage + 1) * ITEMS_PER_PAGE) })}
                        className="px-3 py-1.5 rounded-lg text-sm border"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        Далее
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--border)", height: 600 }}>
                <div className="w-full h-full relative" style={{ background: "linear-gradient(135deg, #e8f4f8 0%, #cce7f0 100%)" }}>
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 pointer-events-none">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "var(--lake-blue-light)" }}>
                      <Map size={36} style={{ color: "var(--lake-blue)" }} />
                    </div>
                    <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>Карта Иссык-Куля</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{properties.length} объектов на карте</p>
                  </div>
                  {properties.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onNavigate("property", { property_id: p.id })}
                      className="absolute px-2 py-1 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                      style={{ top: `${25 + Math.random() * 45}%`, left: `${20 + Math.random() * 50}%`, background: "var(--lake-blue)", color: "white" }}
                    >
                      {p.price_per_night.toLocaleString()} Сом
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
