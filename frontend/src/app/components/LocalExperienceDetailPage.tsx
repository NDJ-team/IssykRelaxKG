import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle, Clock, Globe, MapPin, Shield, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { useAuth } from "../context/AuthContext";
import { getExperience } from "../services/experiences";
import type { LocalExperienceResponse } from "../services/experiences";
import { createBooking } from "../services/bookings";

interface LocalExperienceDetailPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  experienceId?: string;
}

export function LocalExperienceDetailPage({ onNavigate, experienceId }: LocalExperienceDetailPageProps) {
  const { user } = useAuth();
  const [experience, setExperience] = useState<LocalExperienceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!experienceId) {
      setLoading(false);
      setError("Впечатление не найдено");
      return;
    }
    getExperience(experienceId)
      .then(setExperience)
      .catch(() => setError("Не удалось загрузить впечатление. Возможно, оно снято с публикации."))
      .finally(() => setLoading(false));
  }, [experienceId]);

  const submitBooking = async () => {
    if (!experience) return;
    if (!user) {
      onNavigate("login");
      return;
    }
    if (!date) {
      toast.error("Выберите дату");
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        service_type: "experience",
        service_id: experience.id,
        check_in: date,
        check_out: date,
        guest_count: guests,
        special_requests: requests || undefined,
      });
      toast.success("Заявка отправлена. Хозяин впечатления подтвердит бронирование.");
      setRequests("");
    } catch (e) {
      toast.error("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", color: "var(--text-secondary)" }}>
        Загружаем впечатление…
      </div>
    );
  }

  if (!experience) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", padding: "120px 20px 80px" }}>
        <div className="irx-container" style={{ maxWidth: 560, textAlign: "center" }}>
          <Sparkles size={34} style={{ color: "var(--aqua-500)", marginBottom: 14 }} />
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--ink-800)", margin: "0 0 10px" }}>Впечатление недоступно</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 22 }}>{error}</p>
          <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("experiences")}>
            <ArrowLeft size={15} /> Все впечатления
          </button>
        </div>
      </div>
    );
  }

  const heroImage = experience.images?.[0] || "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1400&q=80&auto=format&fit=crop";

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title={`${experience.title} — местное впечатление на Иссык-Куле | IssykRelax`}
        description={experience.description || `Забронируйте местное впечатление «${experience.title}» на Иссык-Куле.`}
        canonical={`/local-experience/${experience.id}`}
      />

      <section style={{ position: "relative", minHeight: 420, display: "flex", alignItems: "flex-end", padding: "120px 20px 42px", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <ImgWithFallback src={heroImage} alt={experience.title} className="w-full h-full object-cover" priority />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,24,43,0.92) 0%, rgba(6,24,43,0.35) 60%, rgba(6,24,43,0.5) 100%)" }} />
        <div className="irx-container" style={{ position: "relative", zIndex: 2 }}>
          <button onClick={() => onNavigate("experiences")} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", borderRadius: 999, padding: "7px 12px", fontSize: "0.78rem", fontWeight: 650, cursor: "pointer", marginBottom: 16 }}>
            <ArrowLeft size={14} /> Все впечатления
          </button>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(20,184,166,0.9)", fontSize: "0.7rem", fontWeight: 750, marginBottom: 12 }}>
            <Sparkles size={12} /> {experience.category}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4.6vw, 3.4rem)", lineHeight: 1.1, margin: "0 0 12px" }}>{experience.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: "rgba(255,255,255,0.78)", fontSize: "0.84rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><MapPin size={14} />{experience.city?.name || experience.address || "Иссык-Куль"}</span>
            {experience.duration_minutes && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Clock size={14} />{experience.duration_minutes} мин</span>}
            {experience.max_guests && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Users size={14} />до {experience.max_guests} гостей</span>}
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 20px 80px" }}>
        <div className="irx-container experience-layout" style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr", gap: 28, alignItems: "start" }}>
          <div>
            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: 24, marginBottom: 18 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--ink-800)", margin: "0 0 12px" }}>О впечатлении</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, margin: 0, fontSize: "0.92rem" }}>
                {experience.description || "Хозяин впечатления скоро добавит подробное описание. Вы можете отправить заявку и уточнить детали напрямую."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(10,37,64,0.08)", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--lake-blue)", fontWeight: 700, fontSize: "0.86rem", marginBottom: 8 }}>
                  <CheckCircle size={16} /> Что включено
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.65, margin: 0 }}>
                  {experience.includes || "Уточняется у хозяина впечатления"}
                </p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(10,37,64,0.08)", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--lake-blue)", fontWeight: 700, fontSize: "0.86rem", marginBottom: 8 }}>
                  <Globe size={16} /> Языки
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", lineHeight: 1.65, margin: 0 }}>
                  {experience.languages || "Русский, кыргызский"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderRadius: 18, background: "#f0fdfa", border: "1px solid #ccfbf1", color: "#115e59", fontSize: "0.82rem", lineHeight: 1.6, marginTop: 18 }}>
              <Shield size={18} style={{ flexShrink: 0 }} />
              Бронирование с двойным подтверждением: вы отправляете заявку, хозяин впечатления подтверждает участие.
            </div>
          </div>

          <aside style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: 22, position: "sticky", top: 96 }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 750, color: "var(--lake-blue)", marginBottom: 4 }}>
              {experience.price.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>сом / чел.</span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: 18 }}>
              {experience.duration_minutes ? `${experience.duration_minutes} минут` : "Длительность уточняется"}
            </div>

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.66rem", fontWeight: 750, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                <CalendarDays size={12} /> Дата
              </span>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.66rem", fontWeight: 750, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                <Users size={12} /> Гостей
              </span>
              <input type="number" min={1} max={experience.max_guests || 20} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: "0.66rem", fontWeight: 750, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                Пожелания
              </span>
              <textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={3} placeholder="Например, удобное время" style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }} />
            </label>

            <button className="irx-btn irx-btn-primary" style={{ width: "100%" }} onClick={submitBooking} disabled={submitting}>
              {submitting ? "Отправляем…" : user ? "Отправить заявку" : "Войти и забронировать"}
            </button>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>
              Оплата — после подтверждения хозяином
            </p>
          </aside>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px) { .experience-layout { grid-template-columns: 1fr !important; } }` }} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 11,
  border: "1px solid rgba(10,37,64,0.12)",
  background: "var(--paper)",
  padding: "0 12px",
  fontSize: "0.86rem",
  fontWeight: 600,
  color: "var(--ink-800)",
  outline: "none",
};
