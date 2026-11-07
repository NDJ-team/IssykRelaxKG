import { useState, useEffect } from "react";
import { MapPin, Clock, Phone, Utensils, Star, CheckCircle, Heart, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema, localBusinessSchema } from "../lib/schemas";
import { getRestaurantApi } from "../services/restaurants-service";
import type { RestaurantResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Button } from "./ui/button";

interface RestaurantDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  restaurantId?: string;
}

export function RestaurantDetailPage({ onNavigate, restaurantId }: RestaurantDetailPageProps) {
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    getRestaurantApi(restaurantId)
      .then(setRestaurant)
      .catch(() => toast.error("Ошибка загрузки ресторана"))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Ресторан не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${restaurant.name} — Ресторан на Иссык-Куле`}
        description={`${restaurant.name}. ${restaurant.cuisine_type || "Разнообразная кухня"}. ${restaurant.address || "Иссык-Куль"}. ${restaurant.description?.slice(0, 150) || ""}`}
        canonical={`/restaurant/${restaurant.id}`}
        jsonLd={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Главная", url: "/" },
            { name: "Рестораны", url: "/restaurants" },
            { name: restaurant.name, url: `/restaurant/${restaurant.id}` },
          ]),
        ]}
      />

      <div className="py-14 px-4 text-center text-white" style={{ background: "linear-gradient(135deg, var(--lake-blue-dark) 0%, var(--lake-blue) 100%)" }}>
        <Utensils size={48} className="mx-auto mb-3 text-white/90" />
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{restaurant.name}</h1>
        <p className="text-white/70 mt-1">{restaurant.cuisine_type || "Ресторан на Иссык-Куле"}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Рестораны", page: "restaurants" },
          { name: restaurant.name },
        ]} onNavigate={onNavigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.cuisine_type && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <Utensils size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>КУХНЯ</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{restaurant.cuisine_type}</div>
                </div>
              )}
              {restaurant.price_range && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <Star size={20} style={{ color: "var(--sand)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ЦЕНЫ</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{restaurant.price_range}</div>
                </div>
              )}
              {restaurant.opening_hours && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <Clock size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ЧАСЫ РАБОТЫ</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{restaurant.opening_hours}</div>
                </div>
              )}
              {restaurant.phone && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <Phone size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ТЕЛЕФОН</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{restaurant.phone}</div>
                </div>
              )}
            </div>

            {restaurant.description && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>О ресторане</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{restaurant.description}</p>
              </div>
            )}

            {restaurant.address && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Адрес</h2>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                  <MapPin size={20} style={{ color: "var(--lake-blue)" }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{restaurant.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Связь с рестораном</div>
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white mb-3 transition-all hover:shadow-lg"
                  style={{ background: "var(--lake-blue)" }}
                >
                  <Phone size={16} /> Позвонить
                </a>
              )}
              {restaurant.address && (
                <a
                  href={`https://2gis.kz/search/${encodeURIComponent(restaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold mb-3 transition-all hover:shadow-lg border"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <MapPin size={16} /> Открыть на карте
                </a>
              )}
              <Button
                onClick={() => onNavigate("dashboard")}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
              >
                Забронировать столик
              </Button>
              <p className="text-xs text-center mt-3" style={{ color: "var(--text-secondary)" }}>
                Забронируйте столик онлайн
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
