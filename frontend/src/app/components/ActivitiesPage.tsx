import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Users, Heart, Mountain, Waves, Footprints, Bike, Compass, ChevronRight, Filter } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { listActivities } from "../services/activities";
import type { ActivityResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface ActivitiesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ACTIVITY_CATEGORIES = [
  { key: "all", label: "Все", icon: Compass },
  { key: "water", label: "Водные", icon: Waves },
  { key: "hiking", label: "Походы", icon: Footprints },
  { key: "bike", label: "Вело", icon: Bike },
  { key: "extreme", label: "Экстрим", icon: Mountain },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  water: ["вод", "water", "катамаран", "яхт", "parasailing", "дайвинг", "снорк", "лодк", "каяк", "сап"],
  hiking: ["поход", "hiking", "трек", "trek", "пеш", "гор", "перевал"],
  bike: ["вел", "bike", "cycling", "квадро", "quadro"],
  extreme: ["экстрем", "extreme", "рафт", "bungee", "зиплайн", "джип", "паркур"],
};

export function ActivitiesPage({ onNavigate }: ActivitiesPageProps) {
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    listActivities()
      .then((res) => setActivities(res.items))
      .catch(() => toast.error("Ошибка загрузки активностей"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !(a.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all") {
      const kw = CATEGORY_KEYWORDS[category] || [];
      const matches = kw.some((k) => (a.title + " " + (a.description || "")).toLowerCase().includes(k));
      if (!matches) return false;
    }
    return true;
  });

  const gradientForActivity = (title: string) => {
    const gradients = [
      "linear-gradient(135deg, #0c4a6e, #0891b2)",
      "linear-gradient(135deg, #065f46, #10b981)",
      "linear-gradient(135deg, #7c3aed, #a78bfa)",
      "linear-gradient(135deg, #b45309, #f59e0b)",
      "linear-gradient(135deg, #be123c, #fb7185)",
      "linear-gradient(135deg, #1d4ed8, #60a5fa)",
      "linear-gradient(135deg, #0e7490, #22d3ee)",
      "linear-gradient(135deg, #047857, #34d399)",
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
    return gradients[Math.abs(hash) % gradients.length];
  };

  const ActivityIcon = ({ title }: { title: string }) => {
    const icons = [Mountain, Waves, Footprints, Bike, Compass];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
    const Icon = icons[Math.abs(hash) % icons.length];
    return <Icon size={36} className="text-white/90" />;
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Активный отдых на Иссык-Куле — водные виды, походы, экстрим"
        description="Активный отдых на Иссык-Куле, Кыргызстан. Водные виды спорта, походы, велопрогулки, джип-туры и экстремальные развлечения."
        canonical="/activities"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Активный отдых", url: "/activities" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #065f46 0%, #10b981 50%, #0c4a6e 100%)" }}>
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Активный отдых
          </h1>
          <p className="text-white/80 mb-6">От водных видов спорта до горных походов — найди своё приключение</p>
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/10">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Название активности..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent text-white placeholder-white/50"
            />
            <Filter size={16} className="text-white/50" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Активный отдых" }]} onNavigate={onNavigate} />
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {ACTIVITY_CATEGORIES.map((c) => (
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
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Активности не найдены</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Попробуйте изменить поиск или категорию</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Найдено <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> активностей
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                  onClick={() => onNavigate("activity", { activity_id: a.id })}
                >
                  <div
                    className="relative overflow-hidden flex items-center justify-center"
                    style={{ height: 220, background: gradientForActivity(a.title) }}
                  >
                    <ActivityIcon title={a.title} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setSaved((prev) => prev.includes(a.id) ? prev.filter((i) => i !== a.id) : [...prev, a.id]); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                    >
                      <Heart size={15} fill={saved.includes(a.id) ? "#ef4444" : "none"} stroke={saved.includes(a.id) ? "#ef4444" : "#6b8299"} />
                    </button>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90">
                      {a.price.toLocaleString()} {a.currency}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      <span><Clock size={11} className="inline mr-1" />{a.duration_minutes} мин</span>
                      <span><Users size={11} className="inline mr-1" />до {a.max_participants} чел</span>
                      {a.location && <span><MapPin size={11} className="inline mr-1" />{a.location}</span>}
                    </div>
                    {a.description && (
                      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {a.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm" style={{ color: "var(--lake-blue)" }}>{a.price.toLocaleString()} {a.currency}</span>
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
