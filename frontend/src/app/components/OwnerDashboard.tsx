import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Eye, Star, Plus, DollarSign, X } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getOwnerProperties, getOwnerBookings, getOwnerWallet, checkInBooking, cancelOwnerBooking } from "../services/owner";
import { BOOKING_STATUS_CONFIG } from "../lib/booking-status";
import type { PropertyResponse, BookingResponse, WalletResponse } from "../types/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { WalletSection } from "./WalletSection";

interface OwnerDashboardProps {
  onNavigate: (page: string) => void;
}

const STATUS_CFG = BOOKING_STATUS_CONFIG;

const TABS = ["Обзор", "Объявления", "Бронирования", "Кошелёк"];

function BookingDetailModal({
  booking,
  propertyTitle,
  onClose,
  onCheckIn,
}: {
  booking: BookingResponse;
  propertyTitle: string;
  onClose: () => void;
  onCheckIn: (code: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const sc = STATUS_CFG[booking.status] || { label: booking.status, color: "var(--text-secondary)", bg: "var(--surface)" };

  const handleCheckIn = async () => {
    if (!booking.verification_code) return;
    setCheckingIn(true);
    try {
      await onCheckIn(booking.verification_code);
      toast.success("Заселение подтверждено");
    } catch {
      toast.error("Ошибка подтверждения заселения");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(booking.id);
      toast.success("Бронирование отменено");
    } catch {
      toast.error("Ошибка при отмене");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="relative w-full max-w-lg rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: "var(--text-secondary)" }}>
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Детали бронирования</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Объект</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>{propertyTitle}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Заезд</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>{new Date(booking.check_in).toLocaleDateString("ru-RU")}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Выезд</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>{new Date(booking.check_out).toLocaleDateString("ru-RU")}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Гости</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>{booking.guest_count} чел.</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Сумма</span><span className="font-bold" style={{ color: "var(--lake-blue)" }}>{booking.total_price.toLocaleString()} Сом</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Статус</span><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></div>
          {booking.special_requests && (
            <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Пожелания</span><span className="font-medium" style={{ color: "var(--text-primary)" }}>{booking.special_requests}</span></div>
          )}
          {booking.verification_code && (
            <div className="flex justify-between"><span style={{ color: "var(--text-secondary)" }}>Код подтверждения</span><span className="font-mono font-bold text-lg tracking-wider" style={{ color: "var(--lake-blue)" }}>{booking.verification_code}</span></div>
          )}
        </div>

        {booking.status === "paid" && (
          <div className="border-t mt-4 pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>ПОДТВЕРЖДЕНИЕ ЗАСЕЛЕНИЯ</p>
            <div className="flex gap-3 text-xs mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: booking.guest_confirmed ? "#dcfce7" : "var(--surface)" }}>
                <span>{booking.guest_confirmed ? "✅" : "⏳"}</span>
                <span style={{ color: booking.guest_confirmed ? "var(--turquoise)" : "var(--text-secondary)" }}>Гость</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: booking.owner_confirmed ? "#dcfce7" : "var(--surface)" }}>
                <span>{booking.owner_confirmed ? "✅" : "⏳"}</span>
                <span style={{ color: booking.owner_confirmed ? "var(--turquoise)" : "var(--text-secondary)" }}>Вы</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          {booking.status === "paid" && booking.verification_code && !booking.owner_confirmed && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "var(--lake-blue)" }}
            >
              {checkingIn ? "Подтверждение..." : "Подтвердить заселение"}
            </button>
          )}
          {(booking.status === "paid" || booking.status === "checked_in") && (
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors"
              style={{ borderColor: "#ef4444", color: "#ef4444" }}
            >
              {cancelling ? "Отмена..." : "Отменить бронь"}
            </button>
          )}
        </div>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Отменить бронирование?</AlertDialogTitle>
              <AlertDialogDescription>
                Бронирование будет отменено. Средства будут возвращены гостю.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Нет, оставить</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setShowCancelDialog(false); handleCancel(); }}>
                Да, отменить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const [tab, setTab] = useState("Обзор");
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [props, books, wall] = await Promise.all([
          getOwnerProperties({ limit: 50 }),
          getOwnerBookings({ limit: 50 }),
          getOwnerWallet(),
        ]);
        setProperties(props.items);
        setBookings(books.items);
        setWallet(wall);
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const propertyMap = new Map(properties.map((p) => [p.id, p.title]));

  const handleCheckIn = async (verificationCode: string) => {
    await checkInBooking(verificationCode);
    setBookings((prev) =>
      prev.map((b) =>
        b.verification_code === verificationCode ? { ...b, status: "checked_in" } : b
      )
    );
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    await cancelOwnerBooking(bookingId);
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
    setSelectedBooking(null);
  };

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  const statsCards = [
    { label: "Всего бронирований", value: String(activeBookings.length), delta: "текущие", icon: Calendar, color: "var(--lake-blue)" },
    { label: "Выручка", value: `${totalRevenue.toLocaleString()} Сом`, delta: "всего", icon: DollarSign, color: "var(--turquoise)" },
    { label: "Объектов", value: String(properties.length), delta: "активных", icon: Eye, color: "#7c3aed" },
    { label: "Баланс", value: wallet ? `${wallet.available_balance.toLocaleString()} Сом` : "—", delta: "доступно", icon: Star, color: "var(--sand)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet>
        <title>Панель владельца | IssykRelax</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель владельца</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Управляйте своими объектами и бронированиями</p>
          </div>
          <button onClick={() => onNavigate("add-listing")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
            <Plus size={15} /> Добавить объект
          </button>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 border"
              style={{
                background: tab === t ? "var(--lake-blue)" : "white",
                color: tab === t ? "white" : "var(--text-secondary)",
                borderColor: tab === t ? "var(--lake-blue)" : "var(--border)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((s) => (
            <div key={s.label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                  {s.delta}
                </span>
              </div>
              <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {(tab === "Обзор" || tab === "Бронирования") && (
          <div className="rounded-2xl border mb-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Бронирования</h3>
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет бронирований</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {bookings.map((b) => {
                  const sc = STATUS_CFG[b.status] || { label: b.status, color: "var(--text-secondary)", bg: "var(--surface)" };
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{propertyMap.get(b.property_id) || `Объект #${b.property_id.slice(0, 8)}`}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {new Date(b.check_in).toLocaleDateString("ru-RU")}–{new Date(b.check_out).toLocaleDateString("ru-RU")} · {b.guest_count} гостей
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      <div className="font-bold text-sm flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                        {b.total_price.toLocaleString()} Сом
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(tab === "Обзор" || tab === "Объявления") && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои объекты</h3>
              <button onClick={() => onNavigate("add-listing")} className="flex items-center gap-1 text-sm font-medium" style={{ color: "var(--lake-blue)" }}>
                <Plus size={14} /> Добавить
              </button>
            </div>
            {properties.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет объектов</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {properties.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-4">
                    <div
                      className="w-16 h-14 rounded-xl flex-shrink-0 overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      {p.images?.[0] && (
                        <ImgWithFallback src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                          {p.category?.name || "Объект"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span>💰 {p.price_per_night.toLocaleString()} Сом/ночь</span>
                        <span>👥 До {p.max_guests} гостей</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded-lg" style={{
                        background: p.is_active ? "var(--turquoise-light)" : "var(--surface)",
                        color: p.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)",
                      }}>
                        {p.is_active ? "Активно" : "Выкл"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Кошелёк" && <WalletSection />}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          propertyTitle={propertyMap.get(selectedBooking.property_id) || `Объект #${selectedBooking.property_id.slice(0, 8)}`}
          onClose={() => setSelectedBooking(null)}
          onCheckIn={handleCheckIn}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
}
