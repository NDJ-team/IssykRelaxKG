import { useState, useEffect } from "react";
import { User, Calendar, MapPin, CheckCircle, Clock, X, Save, Instagram, Send, Phone, Lock, Users, Bed, Bath, Home, Heart, Star, Settings, LayoutDashboard, Shield, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { getMyBookings, cancelBooking, confirmGuestCheckIn } from "../services/bookings";
import { getProperty } from "../services/properties";
import { getFavoriteProperties } from "../services/favorites";
import { updateProfile, changePassword } from "../services/api";
import { BOOKING_STATUS_CONFIG } from "../lib/booking-status";
import type { BookingResponse, PropertyResponse } from "../types/api";
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

interface UserDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const STATUS_CONFIG = BOOKING_STATUS_CONFIG;

const TABS = [
  { id: "bookings", label: "Бронирования", icon: Calendar },
  { id: "favorites", label: "Избранное", icon: Heart },
  { id: "wallet", label: "Кошелёк", icon: Wallet },
  { id: "profile", label: "Профиль", icon: User },
];

function BookingDetailModal({
  booking,
  onClose,
  onCancel,
  onRebook,
  onNavigate,
  onConfirmCheckIn,
  cancelling,
  confirming,
}: {
  booking: BookingResponse;
  onClose: () => void;
  onCancel: (id: string) => void;
  onRebook: (booking: BookingResponse) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onConfirmCheckIn: (id: string) => Promise<void>;
  cancelling: boolean;
  confirming: boolean;
}) {
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    getProperty(booking.property_id)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoadingProperty(false));
  }, [booking.property_id]);

  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const nights = Math.max(1, Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000));

  const timeline = [
    { label: "Бронирование", done: true, date: booking.created_at },
    { label: "Оплата", done: booking.status !== "pending", date: booking.status !== "pending" ? booking.created_at : undefined },
    { label: "Подтверждение гостя", done: booking.guest_confirmed, date: undefined },
    { label: "Подтверждение владельца", done: booking.owner_confirmed, date: undefined },
    { label: "Заселение", done: booking.status === "checked_in", date: undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white hover:bg-gray-100 shadow-sm" style={{ color: "var(--text-secondary)" }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Детали бронирования</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            #{booking.id.slice(0, 8)} · {new Date(booking.created_at).toLocaleDateString("ru-RU")}
          </p>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>СТАТУС БРОНИРОВАНИЯ</p>
          <div className="flex items-center gap-1">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? "text-white" : ""}`}
                    style={{ background: step.done ? "var(--turquoise)" : "var(--surface)", color: step.done ? "white" : "var(--text-secondary)" }}>
                    {step.done ? "✓" : String(i + 1)}
                  </div>
                  <span className="text-[10px] mt-1 text-center leading-tight" style={{ color: step.done ? "var(--turquoise)" : "var(--text-secondary)" }}>
                    {step.label}
                  </span>
                </div>
                {i < timeline.length - 1 && (
                  <div className="flex-1 h-px mb-5" style={{ background: step.done ? "var(--turquoise)" : "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking details */}
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span style={{ color: "var(--text-secondary)" }}>Объект</span>
            <button
              onClick={() => { onClose(); onNavigate("property", { property_id: booking.property_id }); }}
              className="font-medium text-right hover:underline"
              style={{ color: "var(--lake-blue)" }}
            >
              {loadingProperty ? "Загрузка..." : property?.title || `#${booking.property_id.slice(0, 8)}`}
            </button>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Заезд</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{new Date(booking.check_in).toLocaleDateString("ru-RU")}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Выезд</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{new Date(booking.check_out).toLocaleDateString("ru-RU")}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Ночёй</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{nights}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Гости</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{booking.guest_count} чел.</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Сумма</span>
            <span className="font-bold" style={{ color: "var(--lake-blue)" }}>{booking.total_price.toLocaleString()} Сом</span>
          </div>
          {booking.special_requests && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Пожелания</span>
              <span className="font-medium text-right max-w-[60%]" style={{ color: "var(--text-primary)" }}>{booking.special_requests}</span>
            </div>
          )}
          {booking.verification_code && (
            <div className="pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>КОД ПОДТВЕРЖДЕНИЯ</div>
              <div className="font-mono font-bold text-2xl tracking-widest text-center py-2 rounded-xl" style={{ background: "var(--surface)", color: "var(--lake-blue)" }}>
                {booking.verification_code}
              </div>
              <p className="text-xs mt-1 text-center" style={{ color: "var(--text-secondary)" }}>
                Покажите этот код владельцу при заселении
              </p>
            </div>
          )}
        </div>

        {/* Property info */}
        {property && (
          <div className="border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
              <Home size={15} /> Информация об объекте
            </h4>
            {property.images && property.images.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {property.images.slice(0, 4).map((img, i) => (
                  <ImgWithFallback key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ))}
              </div>
            )}
            {property.full_address && (
              <div className="flex items-start gap-2 mb-2 text-xs">
                <MapPin size={14} style={{ color: "var(--text-secondary)" }} className="mt-0.5 flex-shrink-0" />
                <span style={{ color: "var(--text-secondary)" }}>{property.full_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1"><Users size={12} /> {property.max_guests}</span>
              {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={12} /> {property.bedrooms}</span>}
              <span className="flex items-center gap-1"><Bath size={12} /> {property.beds} кр.</span>
              {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms} ван.</span>}
            </div>
            {(property.instagram || property.telegram || property.whatsapp) && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>СВЯЗАТЬСЯ С ВЛАДЕЛЬЦОМ</p>
                <div className="flex flex-wrap gap-2">
                  {property.instagram && (
                    <a href={`https://instagram.com/${property.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "linear-gradient(135deg, #f58529, #dd2a7b)", color: "#fff" }}>
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                  {property.telegram && (
                    <a href={`https://t.me/${property.telegram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "#0088cc", color: "#fff" }}>
                      <Send size={14} /> Telegram
                    </a>
                  )}
                  {property.whatsapp && (
                    <a href={`https://wa.me/${property.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "#25d366", color: "#fff" }}>
                      <Phone size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Check-in confirmation */}
        {booking.status === "paid" && (
          <div className="border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>ПОДТВЕРЖДЕНИЕ ЗАСЕЛЕНИЯ</p>
            <div className="flex gap-3 text-xs mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: booking.guest_confirmed ? "#dcfce7" : "var(--surface)" }}>
                <span>{booking.guest_confirmed ? "✅" : "⏳"}</span>
                <span style={{ color: booking.guest_confirmed ? "var(--turquoise)" : "var(--text-secondary)" }}>Вы</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: booking.owner_confirmed ? "#dcfce7" : "var(--surface)" }}>
                <span>{booking.owner_confirmed ? "✅" : "⏳"}</span>
                <span style={{ color: booking.owner_confirmed ? "var(--turquoise)" : "var(--text-secondary)" }}>Владелец</span>
              </div>
            </div>
            {!booking.guest_confirmed && (
              <button
                onClick={() => onConfirmCheckIn(booking.id)}
                disabled={confirming}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "var(--lake-blue)" }}
              >
                {confirming ? "Подтверждение..." : "Подтвердить заселение"}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          {booking.status === "paid" && !booking.guest_confirmed && (
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-red-50"
              style={{ borderColor: "#ef4444", color: "#ef4444" }}
            >
              {cancelling ? "Отмена..." : "Отменить бронь"}
            </button>
          )}
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Отменить бронирование?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Средства будут возвращены.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Нет, оставить</AlertDialogCancel>
                <AlertDialogAction onClick={() => { setShowCancelDialog(false); onCancel(booking.id); }}>
                  Да, отменить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            onClick={() => onRebook(booking)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--lake-blue)" }}
          >
            Забронировать снова
          </button>
        </div>
      </div>
    </div>
  );
}

function FavoritesSection({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getFavoriteProperties({ limit: 50 });
        setProperties(res.items);
        setTotal(res.total);
      } catch {
        toast.error("Ошибка загрузки избранного");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <Heart size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
        <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Нет избранных объектов</p>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Сохраняйте понравившиеся объекты, чтобы быстро вернуться к ним</p>
        <button onClick={() => onNavigate("search")} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "var(--lake-blue)" }}>
          Найти жильё
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Всего <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{total}</span> объектов
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate("property", { property_id: p.id })}
            className="text-left rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div style={{ height: 180 }}>
              <ImgWithFallback
                src={p.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
              <div className="flex items-center gap-1 mb-1">
                <MapPin size={11} style={{ color: "var(--text-secondary)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.city?.name || "Иссык-Куль"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                <span className="flex items-center gap-1"><Users size={12} /> {p.max_guests}</span>
                <span className="flex items-center gap-1"><Bed size={12} /> {p.bedrooms}</span>
                <span className="flex items-center gap-1"><Bath size={12} /> {p.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-sm" style={{ color: "var(--lake-blue)" }}>{p.price_per_night.toLocaleString()} Сом</span>
                {p.rating_points > 0 && (
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                    <Star size={10} fill="var(--sand)" stroke="var(--sand)" /> {p.rating_points}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileForm({ user, onUpdate }: { user: UserResponse | null; onUpdate: (u: UserResponse) => void }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ full_name: fullName, phone: phone || undefined });
      onUpdate(updated);
      setSaved(true);
      toast.success("Профиль обновлён");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Ошибка при сохранении профиля");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <h3 className="font-bold mb-5" style={{ color: "var(--text-primary)" }}>Личная информация</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>EMAIL</label>
            <div className="w-full border rounded-xl px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}>
              {user?.email}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ИМЯ</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ТЕЛЕФОН</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+996"
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>РОЛЬ</label>
            <div className="w-full border rounded-xl px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }}>
              {user?.role === "owner" ? "Владелец" : user?.role === "admin" ? "Администратор" : "Турист"}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: saved ? "var(--turquoise)" : "var(--lake-blue)" }}
          >
            <Save size={16} />
            {saving ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async () => {
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Пароли не совпадают" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Минимум 6 символов" });
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: res.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(res.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mt-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Lock size={16} /> Смена пароля
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ТЕКУЩИЙ ПАРОЛЬ</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>НОВЫЙ ПАРОЛЬ</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
              placeholder="Минимум 6 символов"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ПОДТВЕРДИТЕ ПАРОЛЬ</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
          <button
            onClick={handleChange}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: saving ? "var(--text-secondary)" : "var(--lake-blue)" }}
          >
            {saving ? "Сохранение..." : "Изменить пароль"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [propertyTitles, setPropertyTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyBookings({ limit: 50 });
        setBookings(res.items);
        const ids = [...new Set(res.items.map((b) => b.property_id))];
        const titles: Record<string, string> = {};
        await Promise.all(ids.map(async (pid) => {
          try {
            const p = await getProperty(pid);
            titles[pid] = p.title;
          } catch { /* ignore */ }
        }));
        setPropertyTitles(titles);
      } catch {
        toast.error("Ошибка загрузки бронирований");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleConfirmCheckIn = async (id: string) => {
    setConfirming(id);
    try {
      const updated = await confirmGuestCheckIn(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
      );
      setSelectedBooking((prev) => prev ? { ...prev, ...updated } : null);
      toast.success("Заселение подтверждено!");
    } catch {
      toast.error("Ошибка подтверждения заселения");
    } finally {
      setConfirming(null);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      setSelectedBooking(null);
      toast.success("Бронирование отменено");
    } catch {
      toast.error("Ошибка при отмене бронирования");
    } finally {
      setCancelling(null);
    }
  };

  const handleRebook = (booking: BookingResponse) => {
    setSelectedBooking(null);
    onNavigate("property", { property_id: booking.property_id });
  };

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet>
        <title>Личный кабинет | IssykRelax</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-6 mb-6 border" style={{ background: "linear-gradient(135deg, var(--lake-blue-dark), var(--lake-blue))", borderColor: "transparent" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center text-white text-xl font-bold" style={{ background: "var(--turquoise)" }}>
              {user?.full_name?.[0] || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.full_name || "Пользователь"}</h1>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle size={13} style={{ color: "var(--turquoise-light)" }} />
                <span className="text-xs text-white/80">Верифицированный аккаунт</span>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{activeBookings.length}</div>
                <div className="text-xs text-white/70">активных</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0"
              style={{
                background: activeTab === tab.id ? "var(--lake-blue)" : "white",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                border: `1px solid ${activeTab === tab.id ? "var(--lake-blue)" : "var(--border)"}`,
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "bookings" && (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <Calendar size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Нет бронирований</p>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Забронируйте жильё на Иссык-Куле</p>
                <button onClick={() => onNavigate("search")} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "var(--lake-blue)" }}>
                  Найти жильё
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const nights = Math.max(1, Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000));
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="w-full text-left rounded-2xl border p-5 flex gap-4 items-start hover:shadow-md transition-shadow"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{propertyTitles[b.property_id] || `Объект #${b.property_id.slice(0, 8)}`}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <span><Clock size={10} className="inline mr-1" />{new Date(b.check_in).toLocaleDateString("ru-RU")} – {new Date(b.check_out).toLocaleDateString("ru-RU")}</span>
                          <span>· {nights} ночей</span>
                          <span>· {b.guest_count} гостей</span>
                        </div>
                        {b.verification_code && (
                          <div className="mt-2 font-mono text-sm tracking-wider" style={{ color: "var(--lake-blue)" }}>
                            Код: {b.verification_code}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{b.total_price.toLocaleString()} Сом</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "favorites" && (
          <FavoritesSection onNavigate={onNavigate} />
        )}

        {activeTab === "wallet" && <WalletSection />}

        {activeTab === "profile" && (
          <>
            <ProfileForm user={user} onUpdate={(u) => refresh()} />

            {(user?.role === "admin" || user?.role === "owner") && (
              <div className="max-w-xl mt-6">
                <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Shield size={16} /> Панель управления
                  </h3>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => onNavigate("admin")}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: "var(--surface)", color: "var(--text-primary)" }}
                    >
                      <span className="flex items-center gap-2">
                        <Settings size={16} /> Административная панель
                      </span>
                      <ExternalLink size={14} />
                    </button>
                  )}
                  {user?.role === "owner" && (
                    <button
                      onClick={() => onNavigate("owner-dashboard")}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: "var(--surface)", color: "var(--text-primary)" }}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard size={16} /> Панель владельца
                      </span>
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <ChangePasswordSection />
          </>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancel}
          onRebook={handleRebook}
          onNavigate={onNavigate}
          onConfirmCheckIn={handleConfirmCheckIn}
          cancelling={cancelling === selectedBooking.id}
          confirming={confirming === selectedBooking.id}
        />
      )}
    </div>
  );
}
