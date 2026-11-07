import { useState, useEffect } from "react";
import { Clock, Users, Car, MapPin, CheckCircle, ArrowLeftRight, Gauge, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { getTransfer } from "../services/drivers";
import type { TransferResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { Button } from "./ui/button";

interface TransferDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  transferId?: string;
}

const VEHICLE_ICONS: Record<string, string> = {
  sedan: "🚗",
  minivan: "🚐",
  bus: "🚌",
  suv: "🚙",
  premium: "🚘",
};

const VEHICLE_LABELS: Record<string, string> = {
  sedan: "Легковой автомобиль",
  minivan: "Минивэн",
  bus: "Автобус",
  suv: "Внедорожник",
  premium: "Премиум-класс",
};

export function TransferDetailPage({ onNavigate, transferId }: TransferDetailPageProps) {
  const [transfer, setTransfer] = useState<TransferResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transferId) return;
    setLoading(true);
    getTransfer(transferId)
      .then(setTransfer)
      .catch(() => toast.error("Ошибка загрузки трансфера"))
      .finally(() => setLoading(false));
  }, [transferId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Трансфер не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${transfer.title} — Трансфер на Иссык-Куль`}
        description={`${transfer.title}. ${transfer.from_location} → ${transfer.to_location}. ${transfer.price} сом. Закажите трансфер на Иссык-Куль.`}
        canonical={`/transfer/${transfer.id}`}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Трансферы", url: "/transfers" },
          { name: transfer.title, url: `/transfer/${transfer.id}` },
        ])}
      />

      <div className="py-14 px-4 text-center text-white" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, var(--lake-blue) 50%, #0e7490 100%)" }}>
        <span className="text-5xl mb-3 block">
          {VEHICLE_ICONS[transfer.vehicle_type?.toLowerCase() || ""] || "🚗"}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{transfer.title}</h1>
        <p className="text-white/70 mt-1">
          {VEHICLE_LABELS[transfer.vehicle_type?.toLowerCase() || ""] || transfer.vehicle_type || "Трансфер"}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Трансферы", page: "transfers" },
          { name: transfer.title },
        ]} onNavigate={onNavigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
              <ArrowLeftRight size={24} style={{ color: "var(--lake-blue)" }} />
              <div className="flex-1 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>ОТКУДА</div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>{transfer.from_location}</div>
                </div>
                <div className="px-4">
                  <div className="w-20 h-0.5" style={{ background: "var(--border)" }} />
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>КУДА</div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>{transfer.to_location}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Users size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ПАССАЖИРОВ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>до {transfer.max_passengers}</div>
              </div>
              {transfer.duration_minutes && (
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                  <Clock size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>В ПУТИ</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{transfer.duration_minutes} мин</div>
                </div>
              )}
              <div className="p-4 rounded-xl text-center" style={{ background: "var(--surface)" }}>
                <Car size={20} style={{ color: "var(--lake-blue)" }} className="mx-auto mb-1" />
                <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ТРАНСПОРТ</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {VEHICLE_LABELS[transfer.vehicle_type?.toLowerCase() || ""] || "Автомобиль"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Описание</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {transfer.description || "Подробности трансфера уточняйте у водителя."}
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Почему стоит выбрать этот трансфер</h3>
              <div className="space-y-2">
                {[
                  "Комфортабельный автомобиль с кондиционером",
                  "Встреча в аэропорту с табличкой",
                  "Помощь с багажом",
                  "Бесплатная отмена за 24 часа",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle size={14} style={{ color: "var(--turquoise)" }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {transfer.price.toLocaleString()} {transfer.currency}
              </div>
              <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>за поездку</div>
              <Button
                onClick={() => onNavigate("dashboard")}
                className="w-full py-3 rounded-xl font-semibold text-white mb-3"
                style={{ background: "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
              >
                Заказать трансфер
              </Button>
              <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                Бесплатная отмена за 24 часа
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
