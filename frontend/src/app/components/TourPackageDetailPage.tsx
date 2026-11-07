import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, Clock, Backpack, MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { getTourPackage } from "../services/agency";
import type { TourPackageResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Button } from "./ui/button";

interface TourPackageDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  pkgId?: string;
}

export function TourPackageDetailPage({ onNavigate, pkgId }: TourPackageDetailPageProps) {
  const [pkg, setPkg] = useState<TourPackageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pkgId) return;
    setLoading(true);
    getTourPackage(pkgId)
      .then(setPkg)
      .catch(() => toast.error("Ошибка загрузки пакета"))
      .finally(() => setLoading(false));
  }, [pkgId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Тур не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${pkg.title} — Пакетный тур на Иссык-Куль`}
        description={`${pkg.title}. ${pkg.duration_days} дней, ${pkg.price} сом. ${pkg.description?.slice(0, 150) || ""}`}
        canonical={`/tour-package/${pkg.id}`}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Пакетные туры", url: "/tour-packages" },
          { name: pkg.title, url: `/tour-package/${pkg.id}` },
        ])}
      />

      <div className="py-14 px-4 text-center text-white" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c084fc 100%)" }}>
        <Backpack size={48} className="mx-auto mb-3 text-white/90" />
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{pkg.title}</h1>
        <p className="text-white/70 mt-1">{pkg.duration_days} дней незабываемого отдыха</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Пакетные туры", page: "tour-packages" },
          { name: pkg.title },
        ]} onNavigate={onNavigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Calendar size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ДЛИТЕЛЬНОСТЬ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{pkg.duration_days} дней</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Users size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>УЧАСТНИКИ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>до {pkg.max_guests} чел</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Clock size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ЦЕНА ЗА ДЕНЬ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {Math.round(pkg.price / pkg.duration_days).toLocaleString()} {pkg.currency}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Описание</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {pkg.description || "Описание отсутствует"}
              </p>
            </div>

            {pkg.includes && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>В стоимость включено</h2>
                <div className="grid grid-cols-2 gap-2">
                  {pkg.includes.split(",").map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <CheckCircle size={14} style={{ color: "var(--turquoise)" }} /> {item.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pkg.itinerary && Object.keys(pkg.itinerary).length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Программа тура</h2>
                <div className="space-y-3">
                  {Object.entries(pkg.itinerary).map(([day, desc]) => (
                    <div key={day} className="flex gap-3 p-3 rounded-xl" style={{ background: "var(--surface)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--lake-blue)" }}>
                        {day.replace(/\D/g, "")}
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary)" }}>День {day.replace(/\D/g, "")}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{String(desc)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {pkg.price.toLocaleString()} {pkg.currency}
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>за тур</div>
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
