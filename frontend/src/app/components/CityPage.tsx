import { useState, useEffect } from "react";
import { MapPin, Search, Compass, Utensils, Car, Mountain, Star, Home, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { Button } from "./ui/button";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { getCities, getProperties } from "../services/properties";
import { listTours } from "../services/guides";
import { listRestaurantsApi } from "../services/restaurants-service";
import { listActivities } from "../services/activities";
import { listTransfers } from "../services/drivers";
import type { CityResponse, PropertyResponse } from "../types/api";
import type { TourResponse } from "../types/api";
import type { RestaurantResponse } from "../types/api";
import type { ActivityResponse } from "../types/api";
import type { TransferResponse } from "../types/api";

const CITY_ALIASES: Record<string, string> = {
  "cholpon-ata": "Чолпон-Ата",
  "bosteri": "Бостери",
  "kara-oy": "Кара-Ой",
  "chok-tal": "Чок-Тал",
  "tamchy": "Тамчы",
};

interface CityPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  citySlug?: string;
  initialCity?: CityResponse | null;
  initialProperties?: PropertyResponse[];
  initialTours?: TourResponse[];
  initialRestaurants?: RestaurantResponse[];
  initialActivities?: ActivityResponse[];
  initialTransfers?: TransferResponse[];
}

type TabKey = "housing" | "restaurants" | "tours" | "activities" | "transfers";

export function CityPage({ onNavigate, citySlug, initialCity, initialProperties, initialTours, initialRestaurants, initialActivities, initialTransfers }: CityPageProps) {
  const [city, setCity] = useState<CityResponse | null>(initialCity ?? null);
  const [properties, setProperties] = useState<PropertyResponse[]>(initialProperties || []);
  const [tours, setTours] = useState<TourResponse[]>(initialTours || []);
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>(initialRestaurants || []);
  const [activities, setActivities] = useState<ActivityResponse[]>(initialActivities || []);
  const [transfers, setTransfers] = useState<TransferResponse[]>(initialTransfers || []);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("housing");
  const [searchQuery, setSearchQuery] = useState("");

  const hasInitialData = initialProperties !== undefined;
  const displayName = city?.name || CITY_ALIASES[citySlug || ""] || citySlug || "Иссык-Куль";
  const cityName = displayName;
  const slug = citySlug || "";

  const cityDescriptions: Record<string, string> = {
    "cholpon-ata": "Жемчужина Иссык-Кульского побережья — курорт с развитой инфраструктурой, ночными клубами, ресторанами и галечным пляжем. Идеальное место для семейного и молодёжного отдыха.",
    "bosteri": "Один из самых популярных курортов с песчаными пляжами, аквапарком и бурной ночной жизнью. Рай для любителей вечеринок и водных развлечений.",
    "kara-oy": "Уютный посёлок с тихими песчаными пляжами, идеально подходит для спокойного семейного отдыха вдали от городской суеты.",
    "tamchy": "Спокойный курорт с прекрасными пляжами, дельфинарием и аквапарком. Отличный выбор для отдыха с детьми.",
    "chok-tal": "Уединённый курортный посёлок с чистыми пляжами и кристальной водой. Прекрасное место для расслабленного отпуска.",
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "housing", label: "Жильё", icon: <Home size={16} /> },
    { key: "restaurants", label: "Рестораны", icon: <Utensils size={16} /> },
    { key: "tours", label: "Туры", icon: <Compass size={16} /> },
    { key: "activities", label: "Активный отдых", icon: <Mountain size={16} /> },
    { key: "transfers", label: "Трансферы", icon: <Car size={16} /> },
  ];

  useEffect(() => {
    if (!slug) return;
    if (hasInitialData) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const cities = await getCities();
        const matched = cities.find((c) => c.slug === slug);
        let cityId: string | undefined;
        if (matched) {
          setCity(matched);
          cityId = matched.id;
        }
        const display = CITY_ALIASES[slug] || slug;
        const [props, ts, rsts, acts, trs] = await Promise.all([
          getProperties(cityId ? { city_id: cityId, limit: "50" } : { query: display, limit: "50" }),
          listTours(cityId, 0, 20),
          listRestaurantsApi(cityId, 0, 20),
          listActivities(cityId, 0, 20),
          listTransfers(cityId, 0, 20),
        ]);
        setProperties(props.items);
        setTours(ts.items);
        setRestaurants(rsts.items);
        setActivities(acts.items);
        setTransfers(trs.items);
      } catch {
        try {
          const display = CITY_ALIASES[slug] || slug;
          const props = await getProperties({ query: display, limit: "50" });
          setProperties(props.items);
        } catch {}
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const counts = {
    housing: properties.length,
    restaurants: restaurants.length,
    tours: tours.length,
    activities: activities.length,
    transfers: transfers.length,
  };

  const filteredProperties = searchQuery
    ? properties.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : properties;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${cityName} — отдых на Иссык-Куле, Кыргызстан | жильё, туры, рестораны, трансферы`}
        description={`${cityDescriptions[slug] || `Лучшие предложения в ${cityName} на Иссык-Куле, Кыргызстан.`} ${properties.length} вариантов жилья, ${restaurants.length} ресторанов, ${tours.length} туров. Бронируйте онлайн.`}
        canonical={`/city/${slug}`}
        image={properties[0]?.images?.[0]}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: `Курорт ${cityName}`, url: `/city/${slug}` },
        ])}
      />

      <div className="py-14 px-4" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0891b2 50%, #0d9488 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={24} className="text-white/80" />
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              {cityName}
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">{cityDescriptions[slug] || `Отдых на Иссык-Куле — лучшие предложения в ${cityName}`}</p>
          <div className="flex flex-wrap gap-3 mt-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchQuery(""); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.key ? "white" : "rgba(255,255,255,0.15)",
                  color: activeTab === tab.key ? "var(--text-primary)" : "white",
                  backdropFilter: activeTab === tab.key ? "none" : "blur(4px)",
                }}
              >
                {tab.icon}
                {tab.label}
                <span className="ml-1 text-xs opacity-70">({counts[tab.key]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Поиск жилья", page: "search" }, { name: cityName }]} onNavigate={onNavigate} />

        {activeTab === "housing" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <Search size={18} style={{ color: "var(--lake-blue)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, описанию..."
                  className="w-full text-sm outline-none bg-transparent"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <Button onClick={() => onNavigate("search", { query: searchQuery || cityName })} style={{ background: "var(--lake-blue)" }}>
                Найти
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
              </div>
            ) : filteredProperties.length === 0 ? (
              <EmptyState icon={<Home size={40} />} title="Нет объявлений" subtitle={`В ${cityName} пока нет доступных вариантов жилья.`} action={{ label: "Поискать на всём Иссык-Куле", onClick: () => onNavigate("search") }} />
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Найдено {filteredProperties.length} вариантов</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => onNavigate("property", { property_id: listing.id })}
                      className="group text-left rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      <div className="relative overflow-hidden" style={{ height: 200 }}>
                        <ImgWithFallback src={listing.images?.[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm leading-snug mb-1" style={{ color: "var(--text-primary)" }}>{listing.title}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin size={12} style={{ color: "var(--text-secondary)" }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{listing.city?.name || cityName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base" style={{ color: "var(--lake-blue)" }}>
                            {listing.price_per_night.toLocaleString()} Сом / ночь
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "restaurants" && (
          <EntityGrid
            items={restaurants}
            loading={loading}
            emptyTitle="Нет ресторанов"
            emptySubtitle={`В ${cityName} пока нет ресторанов.`}
            onItemClick={(r) => onNavigate("restaurant", { restaurant_id: r.id })}
            renderCard={(r: RestaurantResponse) => ({
              title: r.name,
              subtitle: r.cuisine_type || undefined,
              meta: [r.address, r.opening_hours].filter(Boolean).join(" · "),
              price: r.price_range || undefined,
              icon: "Utensils",
            })}
          />
        )}

        {activeTab === "tours" && (
          <EntityGrid
            items={tours}
            loading={loading}
            emptyTitle="Нет туров"
            emptySubtitle={`В ${cityName} пока нет туров.`}
            onItemClick={(t) => onNavigate("tour", { tour_id: t.id })}
            renderCard={(t: TourResponse) => ({
              title: t.title,
              subtitle: `${t.duration_days} дн.`,
              meta: t.meeting_point || undefined,
              price: `${t.price.toLocaleString()} ${t.currency}`,
              icon: "Compass",
            })}
          />
        )}

        {activeTab === "activities" && (
          <EntityGrid
            items={activities}
            loading={loading}
            emptyTitle="Нет активностей"
            emptySubtitle={`В ${cityName} пока нет активностей.`}
            onItemClick={(a) => onNavigate("activity", { activity_id: a.id })}
            renderCard={(a: ActivityResponse) => ({
              title: a.title,
              subtitle: `${a.duration_minutes} мин`,
              meta: a.location || undefined,
              price: `${a.price.toLocaleString()} ${a.currency}`,
              icon: "Mountain",
            })}
          />
        )}

        {activeTab === "transfers" && (
          <EntityGrid
            items={transfers}
            loading={loading}
            emptyTitle="Нет трансферов"
            emptySubtitle={`В ${cityName} пока нет трансферов.`}
            onItemClick={(t) => onNavigate("transfer", { transfer_id: t.id })}
            renderCard={(t: TransferResponse) => ({
              title: t.title,
              subtitle: `${t.from_location} → ${t.to_location}`,
              meta: t.duration_minutes ? `${t.duration_minutes} мин` : undefined,
              price: `${t.price.toLocaleString()} ${t.currency}`,
              icon: "Car",
            })}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="mx-auto mb-3" style={{ color: "var(--text-secondary)" }}>{icon}</div>
      <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</p>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
      {action && (
        <button onClick={action.onClick} className="text-sm font-medium flex items-center gap-1 mx-auto" style={{ color: "var(--lake-blue)" }}>
          {action.label} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function EntityGrid<T extends { id: string }>({ items, loading, emptyTitle, emptySubtitle, onItemClick, renderCard }: {
  items: T[]; loading: boolean; emptyTitle: string; emptySubtitle: string;
  onItemClick: (item: T) => void;
  renderCard: (item: T) => { title: string; subtitle?: string; meta?: string; price?: string; icon: string };
}) {
  const iconMap: Record<string, React.ReactNode> = {
    Utensils: <Utensils size={24} />,
    Compass: <Compass size={24} />,
    Mountain: <Mountain size={24} />,
    Car: <Car size={24} />,
  };
  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} /></div>;
  }
  if (items.length === 0) {
    return <EmptyState icon={<Compass size={40} />} title={emptyTitle} subtitle={emptySubtitle} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const card = renderCard(item);
        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item)}
            className="flex items-center gap-4 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--lake-blue-light)" }}>
              <span style={{ color: "var(--lake-blue)" }}>{iconMap[card.icon] || <Compass size={24} />}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{card.title}</div>
              {card.subtitle && <div className="text-xs mt-0.5" style={{ color: "var(--turquoise)" }}>{card.subtitle}</div>}
              {card.meta && <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>{card.meta}</div>}
            </div>
            {card.price && (
              <div className="text-sm font-bold shrink-0" style={{ color: "var(--lake-blue)" }}>{card.price}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
