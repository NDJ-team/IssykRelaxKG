import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Phone, Heart, Search, Utensils, Fish, Beef, Leaf, Coffee } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { listRestaurantsApi } from "../services/restaurants-service";
import type { RestaurantResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface RestaurantsPageProps {
  onNavigate: (page: string) => void;
}

const CUISINE_FILTERS = [
  { key: "all", label: "Все кухни", icon: Utensils },
  { key: "kyrgyz", label: "Кыргызская", icon: Utensils },
  { key: "sea", label: "Морская", icon: Fish },
  { key: "meat", label: "Мясная", icon: Beef },
  { key: "veg", label: "Веган", icon: Leaf },
  { key: "eastern", label: "Восточная", icon: Coffee },
];

const CUISINE_KEYWORDS: Record<string, string[]> = {
  kyrgyz: ["кыргыз", "kyrgyz", "националь", "ашлянфу"],
  sea: ["мор", "рыб", "sea", "fish"],
  meat: ["мяс", "meat", "гриль", "steak"],
  veg: ["вегет", "веган", "veg", "эко"],
  eastern: ["восточ", "eastern", "узбек", "плов"],
};

export function RestaurantsPage({ onNavigate }: RestaurantsPageProps) {
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    listRestaurantsApi()
      .then((res) => setRestaurants(res.items))
      .catch(() => toast.error("Ошибка загрузки ресторанов"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    if (cuisineFilter !== "all") {
      const kw = CUISINE_KEYWORDS[cuisineFilter] || [];
      const matches = kw.some((k) => (r.cuisine_type || "").toLowerCase().includes(k) || (r.description || "").toLowerCase().includes(k));
      if (!matches) return false;
    }
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !(r.cuisine_type || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Рестораны и кафе на Иссык-Куле — где поесть в Чолпон-Ате, Бостери"
        description="Лучшие рестораны, кафе и столовые на Иссык-Куле, Кыргызстан"
        canonical="/restaurants"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Рестораны", url: "/restaurants" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, var(--lake-blue-dark) 0%, var(--lake-blue) 100%)" }}>
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Рестораны Иссык-Куля
          </h1>
          <p className="text-white/80 mb-6">Лучшие заведения на берегу — от традиционного плова до морской кухни</p>
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Название ресторана или кухня..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Рестораны" }]} onNavigate={onNavigate} />
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {CUISINE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setCuisineFilter(f.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border"
                style={{
                  background: cuisineFilter === f.key ? "var(--lake-blue)" : "white",
                  color: cuisineFilter === f.key ? "white" : "var(--text-secondary)",
                  borderColor: cuisineFilter === f.key ? "var(--lake-blue)" : "var(--border)",
                }}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm px-3 py-2 rounded-xl border bg-white outline-none"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="rating">Рейтинг</option>
              <option value="reviews">Популярность</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Найдено <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> ресторанов
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => onNavigate("restaurant", { restaurant_id: r.id })}
                >
                  <div className="relative overflow-hidden" style={{ height: 220, background: "var(--surface)" }}>
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--lake-blue-light)" }}>
                      <Utensils size={40} style={{ color: "var(--lake-blue)" }} />
                    </div>
                    <button
                      onClick={() => setSaved((prev) => prev.includes(r.id) ? prev.filter((i) => i !== r.id) : [...prev, r.id])}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
                    >
                      <Heart size={15} fill={saved.includes(r.id) ? "#ef4444" : "none"} stroke={saved.includes(r.id) ? "#ef4444" : "#6b8299"} />
                    </button>
                    {r.price_range && (
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold" style={{ background: "white", color: "var(--text-primary)" }}>
                        {r.price_range}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</h3>
                    </div>
                    {r.cuisine_type && <p className="text-xs mb-2" style={{ color: "var(--turquoise)" }}>{r.cuisine_type}</p>}
                    {r.address && (
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={11} style={{ color: "var(--text-secondary)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.address}</span>
                      </div>
                    )}
                    {r.opening_hours && (
                      <div className="flex items-center gap-1 mb-3">
                        <Clock size={11} style={{ color: "var(--text-secondary)" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.opening_hours}</span>
                      </div>
                    )}
                    {r.description && (
                      <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{r.description}</p>
                    )}
                    <div className="flex gap-2">
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors hover:bg-gray-50" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
                          <Phone size={13} /> Позвонить
                        </a>
                      )}
                      <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                        Забронировать столик
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
