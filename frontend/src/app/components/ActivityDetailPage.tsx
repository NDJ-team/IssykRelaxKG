import { useState, useEffect } from "react";
import { Clock, Users, MapPin, CheckCircle, ArrowLeft, Mountain, Waves, Footprints, Bike, Compass, Star } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { getActivity } from "../services/activities";
import type { ActivityResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Button } from "./ui/button";

interface ActivityDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  activityId?: string;
}

export function ActivityDetailPage({ onNavigate, activityId }: ActivityDetailPageProps) {
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activityId) return;
    setLoading(true);
    getActivity(activityId)
      .then(setActivity)
      .catch(() => toast.error("Ошибка загрузки активности"))
      .finally(() => setLoading(false));
  }, [activityId]);

  const gradientForActivity = (title: string) => {
    const gradients = [
      "linear-gradient(135deg, #0c4a6e, #0891b2)",
      "linear-gradient(135deg, #065f46, #10b981)",
      "linear-gradient(135deg, #7c3aed, #a78bfa)",
      "linear-gradient(135deg, #b45309, #f59e0b)",
      "linear-gradient(135deg, #be123c, #fb7185)",
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
    return <Icon size={48} className="text-white" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Активность не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${activity.title} — Активный отдых на Иссык-Куле`}
        description={`${activity.title}. ${activity.description?.slice(0, 150) || ""} Цена: ${activity.price} сом. Забронируйте активность на Иссык-Куле.`}
        canonical={`/activity/${activity.id}`}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Активный отдых", url: "/activities" },
          { name: activity.title, url: `/activity/${activity.id}` },
        ])}
      />

      <div
        className="relative py-16 px-4 flex items-center justify-center text-center text-white"
        style={{ background: gradientForActivity(activity.title) }}
      >
        <ActivityIcon title={activity.title} />
        <div className="ml-4">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{activity.title}</h1>
          <p className="text-white/70 mt-1">{activity.location || "Иссык-Куль"}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Активный отдых", page: "activities" },
          { name: activity.title },
        ]} onNavigate={onNavigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Clock size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ДЛИТЕЛЬНОСТЬ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{activity.duration_minutes} мин</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Users size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>УЧАСТНИКИ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>до {activity.max_participants}</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <MapPin size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ЛОКАЦИЯ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{activity.location || "Иссык-Куль"}</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Описание</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {activity.description || "Описание отсутствует"}
              </p>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {activity.price.toLocaleString()} {activity.currency}
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>с человека</div>
              <Button
                onClick={() => onNavigate("dashboard")}
                className="w-full py-3 rounded-xl font-semibold text-white mb-3"
                style={{ background: "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
              >
                Забронировать
              </Button>
              <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                Свяжемся для уточнения деталей
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
