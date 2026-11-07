import { useState, useEffect } from "react";
import { Search, Clock, Users, MapPin, Heart, Compass, ChevronRight, Backpack, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { listTourPackages } from "../services/agency";
import type { TourPackageResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface TourPackagesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function TourPackagesPage({ onNavigate }: TourPackagesPageProps) {
  const [packages, setPackages] = useState<TourPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    listTourPackages()
      .then((res) => setPackages(res.items))
      .catch(() => toast.error("Ошибка загрузки пакетных туров"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = packages.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !(p.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getGradient = (title: string) => {
    const gradients = [
      "linear-gradient(135deg, #7c3aed, #a78bfa)",
      "linear-gradient(135deg, #db2777, #f472b6)",
      "linear-gradient(135deg, #0369a1, #38bdf8)",
      "linear-gradient(135deg, #ea580c, #fb923c)",
      "linear-gradient(135deg, #059669, #34d399)",
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Пакетные туры на Иссык-Куль — готовые программы отдыха"
        description="Готовые пакетные туры на Иссык-Куль, Кыргызстан. Проживание, питание, экскурсии — всё включено. Выберите готовый тур и экономьте!"
        canonical="/tour-packages"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Пакетные туры", url: "/tour-packages" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c084fc 100%)" }}>
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Пакетные туры
          </h1>
          <p className="text-white/80 mb-6">Готовые программы отдыха — заселяйся и отдыхай, ни о чём не думая</p>
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/10">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Название тура..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent text-white placeholder-white/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Пакетные туры" }]} onNavigate={onNavigate} />
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <Backpack size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Пакетные туры не найдены</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Попробуйте изменить поиск</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Найдено <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> туров
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => onNavigate("tour-package", { pkg_id: p.id })}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{ height: 200, background: getGradient(p.title) }}
                  >
                    <Backpack size={48} className="text-white/80" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setSaved((prev) => prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                    >
                      <Heart size={15} fill={saved.includes(p.id) ? "#ef4444" : "none"} stroke={saved.includes(p.id) ? "#ef4444" : "#6b8299"} />
                    </button>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90">
                      {p.price.toLocaleString()} {p.currency}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      <span><Calendar size={11} className="inline mr-1" />{p.duration_days} дн.</span>
                      {p.max_guests > 0 && <span><Users size={11} className="inline mr-1" />до {p.max_guests} чел</span>}
                    </div>
                    {p.description && (
                      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {p.description}
                      </p>
                    )}
                    {p.includes && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.includes.split(",").slice(0, 3).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--lake-blue-light)", color: "var(--lake-blue)" }}>
                            {item.trim()}
                          </span>
                        ))}
                        {p.includes.split(",").length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                            +{p.includes.split(",").length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <span className="font-bold text-sm" style={{ color: "var(--lake-blue)" }}>
                        {p.price.toLocaleString()} {p.currency}
                      </span>
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
