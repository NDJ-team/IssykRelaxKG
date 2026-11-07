import { useState, useEffect } from "react";
import { Clock, Users, MapPin, Heart, Search, Mountain, Sailboat, Camera, ChevronRight, Compass } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { listTours } from "../services/guides";
import type { TourResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface ToursPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const CATEGORIES = [
  { key: "all", label: "Все", icon: Compass },
  { key: "adventure", label: "Приключения", icon: Mountain },
  { key: "water", label: "Водные", icon: Sailboat },
  { key: "nature", label: "Природа", icon: Mountain },
  { key: "photo", label: "Фототуры", icon: Camera },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  adventure: ["приключен", "adventure", "экскурс", "джип", "horse", "конн"],
  water: ["вод", "water", "яхт", "parasailing", "катамаран"],
  nature: ["природ", "nature", "поход", "гор", "трек", "озер"],
  photo: ["фото", "photo", "съемк", "shoot"],
};

export function ToursPage({ onNavigate }: ToursPageProps) {
  const [tours, setTours] = useState<TourResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    listTours()
      .then((res) => setTours(res.items))
      .catch(() => toast.error("Ошибка загрузки туров"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tours.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all") {
      const kw = CATEGORY_KEYWORDS[category] || [];
      const matches = kw.some((k) => (t.title + " " + (t.description || "")).toLowerCase().includes(k));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Туры и экскурсии на Иссык-Куле, Кыргызстан — конные, яхтинг, джип-туры"
        description="Лучшие туры и экскурсии на Иссык-Куле, Кыргызстан"
        canonical="/tours"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Туры и экскурсии", url: "/tours" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, var(--turquoise) 100%)" }}>
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Туры и экскурсии
          </h1>
          <p className="text-white/80 mb-6">Незабываемые приключения на берегах высокогорного озера</p>
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
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Туры" }]} onNavigate={onNavigate} />
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border"
              style={{
                background: category === c.key ? "var(--lake-blue)" : "white",
                color: category === c.key ? "white" : "var(--text-secondary)",
                borderColor: category === c.key ? "var(--lake-blue)" : "var(--border)",
              }}
            >
              <c.icon size={14} />
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <Compass size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Туры не найдены</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tour) => (
              <div
                key={tour.id}
                className="rounded-2xl border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
                onClick={() => onNavigate("tour", { tour_id: tour.id })}
              >
                <div className="relative overflow-hidden" style={{ height: 220, background: "var(--surface)" }}>
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--lake-blue-light)" }}>
                    <Compass size={40} style={{ color: "var(--lake-blue)" }} />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSaved((prev) => prev.includes(tour.id) ? prev.filter((i) => i !== tour.id) : [...prev, tour.id]); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <Heart size={15} fill={saved.includes(tour.id) ? "#ef4444" : "none"} stroke={saved.includes(tour.id) ? "#ef4444" : "#6b8299"} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{tour.title}</h3>
                  <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                    <span><Clock size={10} className="inline mr-1" />{tour.duration_days} дн.</span>
                    <span><Users size={10} className="inline mr-1" />до {tour.max_guests} чел.</span>
                  </div>
                  {tour.meeting_point && (
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin size={11} style={{ color: "var(--text-secondary)" }} />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{tour.meeting_point}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm" style={{ color: "var(--lake-blue)" }}>{tour.price.toLocaleString()} {tour.currency}</span>
                    <button className="flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors" style={{ background: "var(--lake-blue-light)", color: "var(--lake-blue)" }}>
                      Подробнее <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
