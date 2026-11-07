import { useState, useEffect } from "react";
import { Star, MapPin, ChevronLeft, ChevronRight, CheckCircle, Users, Bed, Bath, Calendar, Instagram, MessageCircle, Phone, Heart, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { vacationRentalSchema, breadcrumbSchema } from "../lib/schemas";
import { Button } from "./ui/button";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { getProperty, getProperties } from "../services/properties";
import { getPropertyReviews, createReview } from "../services/reviews";
import { createBooking } from "../services/bookings";
import { addFavorite, removeFavorite, getFavoriteIds } from "../services/favorites";
import { useAuth } from "../context/AuthContext";
import type { PropertyResponse, ReviewResponse } from "../types/api";

interface PropertyDetailsProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  propertyId?: string;
  initialProperty?: PropertyResponse | null;
  initialReviews?: ReviewResponse[];
}

export function PropertyDetails({ onNavigate, propertyId, initialProperty, initialReviews }: PropertyDetailsProps) {
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyResponse | null>(initialProperty ?? null);
  const [reviews, setReviews] = useState<ReviewResponse[]>(initialReviews || []);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [similar, setSimilar] = useState<PropertyResponse[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasInitialData = initialProperty !== undefined;

  useEffect(() => {
    if (!propertyId) return;
    if (hasInitialData && initialProperty) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const [prop, revs] = await Promise.all([
          getProperty(propertyId),
          getPropertyReviews(propertyId, { limit: 10 }),
        ]);
        setProperty(prop);
        setReviews(revs.items);
        if (prop.city?.id) {
          getProperties({ city_id: prop.city.id, limit: "4" }).then((res) => {
            setSimilar(res.items.filter((p) => p.id !== prop.id).slice(0, 3));
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Failed to load property", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  useEffect(() => {
    if (!user || !propertyId) { setSaved(false); return; }
    getFavoriteIds().then((res) => setSaved(res.favorite_ids.includes(propertyId))).catch(() => {});
  }, [user, propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p>Объект не найден</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 3;
  const total = property.price_per_night * nights;
  const serviceFee = Math.round(total * 0.12);

  const handleBooking = async () => {
    if (!user) {
      setBookingError("Войдите в аккаунт для бронирования");
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError("Укажите даты заезда и выезда");
      return;
    }
    setSubmitting(true);
    setBookingError("");
    try {
      const result = await createBooking({
        property_id: property.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_count: guests,
      });
      setBookingId(result.id);
      setBookingSuccess(true);
      toast.success("Бронирование подтверждено!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка бронирования";
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async () => {
    if (!bookingId) return;
    setSubmittingReview(true);
    try {
      await createReview({
        booking_id: bookingId,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      setReviewComment("");
      setReviewRating(5);
      toast.success("Спасибо за отзыв!");
    } catch {
      toast.error("Ошибка при отправке отзыва");
    } finally {
      setSubmittingReview(false);
    }
  };

  const photos = property.images?.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop"];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={property.title}
        description={`${property.title} — ${property.city?.name || "Иссык-Куль"}. ${property.price_per_night} сом/ночь. ${property.description?.slice(0, 150) || "Забронируйте жильё на Иссык-Куле."}`}
        canonical={`/property/${property.id}`}
        image={property.images?.[0]}
        jsonLd={[
          vacationRentalSchema({
            id: property.id,
            title: property.title,
            description: property.description || `${property.title} на Иссык-Куле`,
            image: property.images?.[0],
            price: property.price_per_night,
            city: property.city?.name,
            rating: avgRating ? parseFloat(avgRating) : undefined,
          }),
          breadcrumbSchema([
            { name: "Главная", url: "/" },
            { name: "Поиск жилья", url: "/search" },
            { name: property.title, url: `/property/${property.id}` },
          ]),
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageBreadcrumbs items={[
          { name: "Главная", page: "landing" },
          { name: "Поиск жилья", page: "search" },
          { name: property?.title || "" },
        ]} onNavigate={onNavigate} />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              {property.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={14} fill="var(--sand)" stroke="var(--sand)" />
                <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{avgRating || "—"}</span>
                <span className="text-sm underline cursor-pointer" style={{ color: "var(--text-secondary)" }}>· {reviews.length} отзывов</span>
                {property.rating_points > 0 && (
                  <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: "var(--lake-blue-light)", color: "var(--lake-blue)" }}>
                    {property.rating_points} баллов
                  </span>
                )}
              </div>
              {property.is_active && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} style={{ color: "var(--turquoise)" }} />
                  <span className="text-sm" style={{ color: "var(--turquoise)" }}>Верифицирован</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin size={14} style={{ color: "var(--text-secondary)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{property.city?.name || "Иссык-Куль"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={async () => {
                if (!user) { toast.error("Войдите в аккаунт, чтобы сохранять"); return; }
                if (saved) {
                  const prev = saved;
                  setSaved(false);
                  try { await removeFavorite(propertyId!); } catch { setSaved(prev); toast.error("Ошибка"); }
                } else {
                  const prev = saved;
                  setSaved(true);
                  try { await addFavorite(propertyId!); } catch { setSaved(prev); toast.error("Ошибка"); }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors"
              style={{ borderColor: saved ? "#ef4444" : "var(--border)", color: saved ? "#ef4444" : "var(--text-secondary)" }}
            >
              <Heart size={14} fill={saved ? "#ef4444" : "none"} /> {saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex gap-2 overflow-x-auto snap-x snap-mandatory mb-8" style={{ scrollbarWidth: "none" }}>
          {photos.slice(0, 5).map((photo, i) => (
            <div key={i} className="snap-start shrink-0 w-full" style={{ height: 300 }}>
              <ImgWithFallback src={photo} alt={`Фото ${i + 1}`} className="w-full h-full object-cover rounded-2xl" />
            </div>
          ))}
        </div>
        {/* Desktop: grid layout */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-8" style={{ height: 460 }}>
          <div className="col-span-2 row-span-2 relative">
            <ImgWithFallback src={photos[0]} alt={property.title} className="w-full h-full object-cover" />
          </div>
          {photos.slice(1, 5).map((photo, i) => (
            <div key={i} className="relative overflow-hidden">
              <ImgWithFallback src={photo} alt={`Фото ${i + 2}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="pb-6 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Расположение</h2>
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                <MapPin size={20} style={{ color: "var(--lake-blue)" }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{property.full_address}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {property.city?.name && `г. ${property.city.name}`}
                    {property.city?.name && property.category?.name ? " · " : ""}
                    {property.category?.name && property.category.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-6 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Характеристики</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                  <Users size={18} style={{ color: "var(--lake-blue)" }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ГОСТЕЙ</div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>До {property.max_guests}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                  <Bed size={18} style={{ color: "var(--lake-blue)" }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>СПАЛЬНИ</div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{property.bedrooms}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                  <Bed size={18} style={{ color: "var(--lake-blue)" }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>КРОВАТИ</div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{property.beds}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                  <Bath size={18} style={{ color: "var(--lake-blue)" }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ВАННЫЕ</div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{property.bathrooms}</div>
                  </div>
                </div>
              </div>
              {property.check_in_time && property.check_out_time && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Calendar size={14} /> Заезд с {property.check_in_time}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Calendar size={14} /> Выезд до {property.check_out_time}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Описание</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{property.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Удобства</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities?.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                    <CheckCircle size={18} style={{ color: "var(--turquoise)" }} />
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {(property.instagram || property.telegram || property.whatsapp) && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Связь с владельцем</h2>
                <div className="flex flex-wrap gap-3">
                  {property.instagram && (
                    <a
                      href={`https://instagram.com/${property.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                      style={{ background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)", color: "white" }}
                    >
                      <Instagram size={16} /> Instagram
                    </a>
                  )}
                  {property.telegram && (
                    <a
                      href={`https://t.me/${property.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                      style={{ background: "var(--lake-blue)", color: "white" }}
                    >
                      <MessageCircle size={16} /> Telegram
                    </a>
                  )}
                  {property.whatsapp && (
                    <a
                      href={`https://wa.me/${property.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md"
                      style={{ background: "#25D366", color: "white" }}
                    >
                      <Phone size={16} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Отзывы</h2>
              <div className="flex items-center gap-3 mb-6">
                <Star size={20} fill="var(--sand)" stroke="var(--sand)" />
                <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{avgRating || "—"}</span>
                <span style={{ color: "var(--text-secondary)" }}>· {reviews.length} отзывов</span>
              </div>
              <div className="space-y-5">
                {reviews.map((r) => (
                  <div key={r.id} className="pb-5 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full" style={{ background: "var(--lake-blue-light)" }} />
                      <div>
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{r.user_id.slice(0, 8)}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(r.created_at).toLocaleDateString("ru-RU")}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="var(--sand)" stroke="var(--sand)" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {similar.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Похожие объекты</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similar.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { onNavigate("property", { property_id: s.id }); }}
                      className="group text-left rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      <div className="overflow-hidden" style={{ height: 140 }}>
                        <ImgWithFallback src={s.images?.[0]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <div className="font-semibold text-xs leading-snug mb-1" style={{ color: "var(--text-primary)" }}>{s.title}</div>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin size={10} style={{ color: "var(--text-secondary)" }} />
                          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{s.city?.name || "Иссык-Куль"}</span>
                        </div>
                        <div className="font-bold text-sm" style={{ color: "var(--lake-blue)" }}>
                          {s.price_per_night.toLocaleString()} Сом / ночь
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border shadow-lg p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{property.price_per_night.toLocaleString()} Сом</span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>/ ночь</span>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} style={{ color: "var(--turquoise)" }} className="mx-auto mb-2" />
                  <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Бронирование подтверждено!</p>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Проверьте статус в личном кабинете.</p>
                  <Button onClick={() => onNavigate("dashboard")} style={{ background: "var(--lake-blue)" }}>
                    Перейти к бронированиям
                  </Button>

                  <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Оставьте отзыв</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setReviewRating(n)}>
                          <Star size={20} fill={n <= reviewRating ? "var(--sand)" : "none"} stroke="var(--sand)" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Ваш отзыв..."
                      rows={3}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none mb-3"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <Button onClick={handleReview} disabled={submittingReview} className="w-full" style={{ background: "var(--lake-blue)" }}>
                      {submittingReview ? "Отправка..." : "Отправить отзыв"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border rounded-xl overflow-hidden mb-3" style={{ borderColor: "var(--border)" }}>
                    <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--border)" }}>
                      <div className="p-3">
                        <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>ЗАЕЗД</div>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full text-sm outline-none bg-transparent" style={{ color: "var(--text-primary)" }} />
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>ВЫЕЗД</div>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full text-sm outline-none bg-transparent" style={{ color: "var(--text-primary)" }} />
                      </div>
                    </div>
                    <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>ГОСТИ</div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: "var(--border)" }}>−</button>
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{guests} гостей</span>
                        <button onClick={() => setGuests(Math.min(property.max_guests || 10, guests + 1))} className="w-6 h-6 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: "var(--border)" }}>+</button>
                      </div>
                    </div>
                  </div>

                  {bookingError && <p className="text-sm text-red-500 mb-2">{bookingError}</p>}

                  <button
                    onClick={handleBooking}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl font-semibold text-white mb-4 transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: submitting ? "var(--text-secondary)" : "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
                  >
                    {submitting ? "Бронирование..." : "Забронировать"}
                  </button>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>{property.price_per_night.toLocaleString()} Сом × {nights} ночей</span>
                      <span style={{ color: "var(--text-primary)" }}>{total.toLocaleString()} Сом</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Сервисный сбор</span>
                      <span style={{ color: "var(--text-primary)" }}>{serviceFee.toLocaleString()} Сом</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: "var(--border)" }}>
                      <span style={{ color: "var(--text-primary)" }}>Итого</span>
                      <span style={{ color: "var(--lake-blue)" }}>{(total + serviceFee).toLocaleString()} Сом</span>
                    </div>
                  </div>

                  <p className="text-xs text-center mt-3" style={{ color: "var(--text-secondary)" }}>Списание средств только после подтверждения хозяином</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
