import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Users, Car, Heart, ChevronRight, ArrowLeftRight, Gauge, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { listTransfers } from "../services/drivers";
import type { TransferResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface TransfersPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const VEHICLE_ICONS: Record<string, string> = {
  sedan: "🚗",
  minivan: "🚐",
  bus: "🚌",
  suv: "🚙",
  premium: "🚘",
};

const VEHICLE_LABELS: Record<string, string> = {
  sedan: "Легковой",
  minivan: "Минивэн",
  bus: "Автобус",
  suv: "Внедорожник",
  premium: "Премиум",
};

export function TransfersPage({ onNavigate }: TransfersPageProps) {
  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    listTransfers()
      .then((res) => setTransfers(res.items))
      .catch(() => toast.error("Ошибка загрузки трансферов"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transfers.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.from_location.toLowerCase().includes(search.toLowerCase()) &&
        !t.to_location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Трансферы на Иссык-Куле — такси, минивэны, автобусы"
        description="Закажите трансфер на Иссык-Куль, Кыргызстан. Автомобили любых классов — от эконом до премиум. Трансфер из аэропорта и между городами."
        canonical="/transfers"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Трансферы", url: "/transfers" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, var(--lake-blue) 50%, #0e7490 100%)" }}>
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Трансферы на Иссык-Куль
          </h1>
          <p className="text-white/80 mb-6">Комфортные поездки по всему побережью — из аэропорта, между городами и курортами</p>
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/10">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Куда едем? (город, курорт, аэропорт...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent text-white placeholder-white/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Трансферы" }]} onNavigate={onNavigate} />
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <Car size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Трансферы не найдены</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Попробуйте изменить поиск</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Найдено <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> трансферов
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => onNavigate("transfer", { transfer_id: t.id })}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "var(--lake-blue-light)" }}>
                          {VEHICLE_ICONS[t.vehicle_type?.toLowerCase() || ""] || "🚗"}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{t.title}</h3>
                          {t.vehicle_type && (
                            <span className="text-xs" style={{ color: "var(--turquoise)" }}>
                              {VEHICLE_LABELS[t.vehicle_type.toLowerCase()] || t.vehicle_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSaved((prev) => prev.includes(t.id) ? prev.filter((i) => i !== t.id) : [...prev, t.id]); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "var(--surface)" }}
                      >
                        <Heart size={14} fill={saved.includes(t.id) ? "#ef4444" : "none"} stroke={saved.includes(t.id) ? "#ef4444" : "#6b8299"} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "var(--surface)" }}>
                      <div className="flex-1 text-center">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ОТКУДА</div>
                        <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{t.from_location}</div>
                      </div>
                      <div className="flex-shrink-0">
                        <ArrowLeftRight size={16} style={{ color: "var(--lake-blue)" }} />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>КУДА</div>
                        <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{t.to_location}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                      {t.duration_minutes && (
                        <span className="flex items-center gap-1"><Clock size={11} />{t.duration_minutes} мин</span>
                      )}
                      <span className="flex items-center gap-1"><Users size={11} />до {t.max_passengers} чел</span>
                    </div>

                    {t.description && (
                      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <span className="font-bold text-base" style={{ color: "var(--lake-blue)" }}>
                          {t.price.toLocaleString()} {t.currency}
                        </span>
                        {t.duration_minutes && (
                          <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>
                            ~{Math.round(t.price / (t.duration_minutes / 60))} {t.currency}/час
                          </span>
                        )}
                      </div>
                      <button className="flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors" style={{ background: "var(--lake-blue-light)", color: "var(--lake-blue)" }}>
                        Подробнее <ChevronRight size={12} />
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
