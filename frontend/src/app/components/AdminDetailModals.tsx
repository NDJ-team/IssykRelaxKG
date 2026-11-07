import { useState, useEffect } from "react";
import { X, Calendar, Clock, Home, Users, Bed, Bath, Instagram, MessageCircle, Send, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { getAdminBookingDetail, getAdminPropertyDetail, getAdminOwnerDetail } from "../services/admin";
import type { AdminBookingDetailResponse, AdminPropertyDetailResponse, AdminOwnerDetailResponse } from "../types/api";

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative custom-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white hover:bg-gray-100 shadow-sm">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b text-sm" style={{ borderColor: "var(--border)" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="font-medium text-right max-w-[60%]" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef3c7", color: "#f59e0b" },
    paid: { bg: "#dcfce7", color: "#16a34a" },
    checked_in: { bg: "#dbeafe", color: "#2563eb" },
    cancelled: { bg: "#fee2e2", color: "#ef4444" },
    draft: { bg: "#fef3c7", color: "#f59e0b" },
    published: { bg: "#dcfce7", color: "#16a34a" },
  };
  const c = colors[status] || { bg: "var(--surface)", color: "var(--text-secondary)" };
  const labels: Record<string, string> = {
    pending: "Ожидание", paid: "Оплачено", checked_in: "Заселён",
    cancelled: "Отменён", draft: "Черновик", published: "Опубликовано",
  };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.color }}>
      {labels[status] || status}
    </span>
  );
}

/* ─── Booking Detail Modal ─── */
export function AdminBookingDetailModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const [data, setData] = useState<AdminBookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBookingDetail(bookingId).then(setData).catch(() => toast.error("Ошибка загрузки бронирования")).finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <ModalOverlay onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} /></div>
      ) : !data ? (
        <div className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Ошибка загрузки</div>
      ) : (
        <div>
          <div className="p-6 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: "var(--lake-blue)" }} />
                <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Бронирование #{data.id.slice(0, 8)}</h2>
              </div>
              <StatusBadge status={data.status} />
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Clock size={12} /> {new Date(data.created_at).toLocaleString("ru-RU")}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Property info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Home size={13} /> Объект
              </h3>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
                <h4 className="font-bold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{data.property_title}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {data.property_category && <span>Категория: {data.property_category}</span>}
                  {data.property_city && <span>Город: {data.property_city}</span>}
                  {data.property_address && <span className="col-span-2">Адрес: {data.property_address}</span>}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-1"><Users size={12} /> {data.property_max_guests}</span>
                  <span className="flex items-center gap-1"><Bed size={12} /> {data.property_bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> {data.property_bathrooms}</span>
                </div>
                {data.property_amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.property_amenities.map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>{a}</span>
                    ))}
                  </div>
                )}
                {data.property_images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {data.property_images.slice(0, 4).map((img, i) => (
                      <ImgWithFallback key={i} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={13} /> Детали
              </h3>
              <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
                <InfoRow label="Заезд" value={new Date(data.check_in).toLocaleDateString("ru-RU")} />
                <InfoRow label="Выезд" value={new Date(data.check_out).toLocaleDateString("ru-RU")} />
                <InfoRow label="Гостей" value={data.guest_count} />
                <InfoRow label="Цена" value={`${data.total_price.toLocaleString()} Сом`} />
                <InfoRow label="Статус" value={<StatusBadge status={data.status} />} />
                <InfoRow label="Гость подтвердил" value={data.guest_confirmed ? "✅ Да" : "⏳ Нет"} />
                <InfoRow label="Владелец подтвердил" value={data.owner_confirmed ? "✅ Да" : "⏳ Нет"} />
                {data.special_requests && <InfoRow label="Особые пожелания" value={data.special_requests} />}
                {data.verification_code && <InfoRow label="Код проверки" value={<span className="font-mono">{data.verification_code}</span>} />}
              </div>
            </div>

            {/* Guest info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <User size={13} /> Гость
              </h3>
              <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
                <InfoRow label="Имя" value={data.guest_name} />
                <InfoRow label="Email" value={data.guest_email} />
                {data.guest_phone && <InfoRow label="Телефон" value={data.guest_phone} />}
              </div>
            </div>

            {/* Owner info */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Shield size={13} /> Владелец
              </h3>
              <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
                <InfoRow label="Имя" value={data.owner_name} />
                <InfoRow label="Email" value={data.owner_email} />
                {data.owner_phone && <InfoRow label="Телефон" value={data.owner_phone} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalOverlay>
  );
}

/* ─── Property Detail Modal ─── */
export function AdminPropertyDetailModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [data, setData] = useState<AdminPropertyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPropertyDetail(propertyId).then(setData).catch(() => toast.error("Ошибка загрузки объявления")).finally(() => setLoading(false));
  }, [propertyId]);

  return (
    <ModalOverlay onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} /></div>
      ) : !data ? (
        <div className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Ошибка загрузки</div>
      ) : (
        <div>
          <div className="p-6 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{data.title}</h2>
              <StatusBadge status={data.status} />
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {data.category} · {data.city} · {data.price_per_night.toLocaleString()} {data.currency}/ночь
            </div>
          </div>

          <div className="p-6 space-y-6">
            {data.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {data.images.map((img, i) => (
                  <ImgWithFallback key={i} src={img.url} alt="" className={`w-24 h-24 rounded-xl object-cover flex-shrink-0 ${img.is_primary ? "ring-2 ring-lake-blue" : ""}`} />
                ))}
              </div>
            )}

            <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <InfoRow label="Владелец" value={data.owner_name} />
              <InfoRow label="Email" value={data.owner_email} />
              <InfoRow label="Категория" value={data.category} />
              <InfoRow label="Город" value={data.city} />
              <InfoRow label="Адрес" value={data.address || "—"} />
              <InfoRow label="Цена" value={`${data.price_per_night.toLocaleString()} ${data.currency}`} />
              <InfoRow label="Гости" value={data.max_guests} />
              <InfoRow label="Спальни" value={data.bedrooms} />
              <InfoRow label="Кровати" value={data.beds} />
              <InfoRow label="Ванные" value={data.bathrooms} />
              <InfoRow label="Статус" value={<StatusBadge status={data.status} />} />
              <InfoRow label="Активно" value={data.is_active ? "✅ Да" : "❌ Нет"} />
              <InfoRow label="Бронирований" value={data.booking_count} />
              {data.check_in_time && <InfoRow label="Заезд" value={data.check_in_time} />}
              {data.check_out_time && <InfoRow label="Выезд" value={data.check_out_time} />}
            </div>

            {data.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Описание</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{data.description}</p>
              </div>
            )}

            {data.amenities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Удобства</h3>
                <div className="flex flex-wrap gap-1">
                  {data.amenities.map((a) => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {(data.instagram || data.telegram || data.whatsapp) && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Контакты</h3>
                <div className="flex gap-2">
                  {data.instagram && (
                    <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--surface)", color: "var(--text-primary)" }}>
                      <Instagram size={13} /> Instagram
                    </a>
                  )}
                  {data.telegram && (
                    <a href={`https://t.me/${data.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--surface)", color: "var(--text-primary)" }}>
                      <MessageCircle size={13} /> Telegram
                    </a>
                  )}
                  {data.whatsapp && (
                    <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--surface)", color: "var(--text-primary)" }}>
                      <Send size={13} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalOverlay>
  );
}

/* ─── Owner Detail Modal ─── */
export function AdminOwnerDetailModal({ ownerId, onClose }: { ownerId: string; onClose: () => void }) {
  const [data, setData] = useState<AdminOwnerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOwnerDetail(ownerId).then(setData).catch(() => toast.error("Ошибка загрузки владельца")).finally(() => setLoading(false));
  }, [ownerId]);

  return (
    <ModalOverlay onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} /></div>
      ) : !data ? (
        <div className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Ошибка загрузки</div>
      ) : (
        <div>
          <div className="p-6 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: data.is_approved ? "var(--turquoise)" : "#f59e0b" }}>
                {data.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{data.full_name}</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{data.email}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={data.is_approved ? "published" : "draft"} />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Телефон" value={data.phone || "—"} />
              <InfoRow label="Бизнес телефон" value={data.business_phone || "—"} />
              <InfoRow label="Статус" value={data.is_approved ? "✅ Одобрен" : "⏳ На проверке"} />
              <InfoRow label="Активен" value={data.is_active ? "✅ Да" : "❌ Нет"} />
              <InfoRow label="Объявлений" value={data.property_count} />
              <InfoRow label="Зарегистрирован" value={new Date(data.created_at).toLocaleDateString("ru-RU")} />
            </div>

            {data.avatar_url && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Аватар</h3>
                <ImgWithFallback src={data.avatar_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalOverlay>
  );
}
