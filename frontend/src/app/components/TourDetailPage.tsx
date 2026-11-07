import { useState, useEffect } from "react";
import { Clock, Users, MapPin, CheckCircle, Compass, Mountain, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { getTour } from "../services/guides";
import type { TourResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Button } from "./ui/button";

interface TourDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  tourId?: string;
}

export function TourDetailPage({ onNavigate, tourId }: TourDetailPageProps) {
  const [tour, setTour] = useState<TourResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tourId) return;
    setLoading(true);
    getTour(tourId)
      .then(setTour)
      .catch(() => toast.error("Ошибка загрузки тура"))
      .finally(() => setLoading(false));
  }, [tourId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Тур не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${tour.title} — Тур на Иссык-Куль, Кыргызстан`}
        description={`${tour.title}. ${tour.duration_days} дней, ${tour.price} сом. ${tour.description?.slice(0, 150) || ""} Забронируйте тур на Иссык-Куле.`}
        canonical={`/tour/${tour.id}`}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Туры", url: "/tours" },
          { name: tour.title, url: `/tour/${tour.id}` },
        ])}
      />

      <div className="py-14 px-4 text-center text-white" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, var(--turquoise) 100%)" }}>
        <Compass size={48} className="mx-auto mb-3 text-white/90" />
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{tour.title}</h1>
        <p className="text-white/70 mt-1">{tour.duration_days} дней приключений</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Туры", page: "tours" },
          { name: tour.title },
        ]} onNavigate={onNavigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Clock size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ДЛИТЕЛЬНОСТЬ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{tour.duration_days} дней</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Users size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>УЧАСТНИКИ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>до {tour.max_guests} чел</div>
              </div>
              {tour.meeting_point && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <MapPin size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>МЕСТО ВСТРЕЧИ</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{tour.meeting_point}</div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Описание</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {tour.description || "Описание отсутствует"}
              </p>
            </div>

            {tour.includes && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>В стоимость включено</h2>
                <div className="grid grid-cols-2 gap-2">
                  {tour.includes.split(",").map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <CheckCircle size={14} style={{ color: "var(--turquoise)" }} /> {item.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {tour.price.toLocaleString()} {tour.currency}
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>с человека</div>
              <Button
                onClick={() => onNavigate("dashboard")}
                className="w-full py-3 rounded-xl font-semibold text-white mb-3"
                style={{ background: "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
              >
                Забронировать тур
              </Button>
              <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                Бесплатная отмена за 48 часов
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
