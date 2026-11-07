import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Clock, MapPin, Plus, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { useAuth } from "../context/AuthContext";
import { getCities } from "../services/properties";
import { createExperience, getMyExperiences } from "../services/experiences";
import type { LocalExperienceResponse } from "../services/experiences";
import type { CityResponse } from "../types/api";

interface LocalHostDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const CATEGORIES = ["Кулинария", "Конные прогулки", "Рыбалка", "Культура", "Ремёсла", "Природа"];

export function LocalHostDashboard({ onNavigate }: LocalHostDashboardProps) {
  const { user } = useAuth();
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [experiences, setExperiences] = useState<LocalExperienceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState(3500);
  const [duration, setDuration] = useState(120);
  const [maxGuests, setMaxGuests] = useState(6);
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    getCities().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMyExperiences()
      .then((data) => setExperiences(data.items))
      .catch(() => setExperiences([]))
      .finally(() => setLoading(false));
  }, [user]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setPrice(3500);
    setDuration(120);
    setMaxGuests(6);
    setCityId("");
    setAddress("");
    setImage("");
  };

  const submit = async () => {
    if (!user) {
      onNavigate("login");
      return;
    }
    if (!title.trim()) {
      toast.error("Укажите название впечатления");
      return;
    }
    if (price <= 0) {
      toast.error("Укажите цену");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createExperience({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        price,
        duration_minutes: duration,
        max_guests: maxGuests,
        city_id: cityId || undefined,
        address: address.trim() || undefined,
        images: image.trim() ? [image.trim()] : undefined,
      });
      setExperiences((current) => [created, ...current]);
      toast.success("Впечатление отправлено на модерацию");
      resetForm();
    } catch (e) {
      toast.error("Не удалось создать впечатление. Проверьте соединение с API.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: "40px 28px" }}>
          <Sparkles size={34} style={{ color: "var(--aqua-500)", marginBottom: 14 }} />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--ink-800)", margin: "0 0 10px" }}>Кабинет хозяина впечатлений</h1>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 22 }}>
            Войдите или зарегистрируйтесь, чтобы размещать кулинарные мастер-классы, конные прогулки и другие местные впечатления.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("login")}>Войти</button>
            <button className="irx-btn irx-btn-ghost" onClick={() => onNavigate("register")}>Регистрация</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title="Кабинет хозяина впечатлений — IssykRelax"
        description="Размещайте местные впечатления на Иссык-Куле: кулинарные мастер-классы, конные прогулки, рыбалку и культуру."
        canonical="/local-host-dashboard"
      />

      <section style={{ background: "var(--gradient-lake)", color: "#fff", padding: "120px 20px 44px" }}>
        <div className="irx-container">
          <span className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}><Sparkles size={12} /> Local Experience</span>
          <h1 className="irx-display" style={{ color: "#fff", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 10 }}>Кабинет хозяина впечатлений</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 620, margin: 0, lineHeight: 1.7 }}>
            Размещайте впечатления, управляйте заявками и получайте доход. Мы берём на себя модерацию, бронирования и оплату.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px 20px 72px" }}>
        <div className="irx-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { icon: Sparkles, label: "Впечатлений", value: experiences.length },
              { icon: CheckCircle, label: "Активных", value: experiences.filter((item) => item.status === "approved").length },
              { icon: Clock, label: "На модерации", value: experiences.filter((item) => item.status !== "approved" && item.status !== "rejected").length },
              { icon: MapPin, label: "Городов", value: new Set(experiences.map((item) => item.city_id).filter(Boolean)).size },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{ background: "#fff", border: "1px solid rgba(10,37,64,0.08)", borderRadius: 18, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    <Icon size={14} style={{ color: "var(--aqua-500)" }} />
                    {stat.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--ink-800)", marginTop: 8 }}>{stat.value}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }} className="host-grid">
            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--gradient-aqua)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={19} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.05rem", color: "var(--ink-800)" }}>Новое впечатление</h2>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>После модерации появится в каталоге</span>
                </div>
              </div>

              <label style={fieldStyle}>
                <span style={labelStyle}>Название</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, ужин в юрте у озера" style={inputStyle} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Категория</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Цена, сом / чел.</span>
                  <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} style={inputStyle} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Длительность, мин</span>
                  <input type="number" min={30} step={30} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 0)} style={inputStyle} />
                </label>
                <label style={fieldStyle}>
                  <span style={labelStyle}>До гостей</span>
                  <input type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value) || 1)} style={inputStyle} />
                </label>
              </div>

              <label style={fieldStyle}>
                <span style={labelStyle}>Город</span>
                <select value={cityId} onChange={(e) => setCityId(e.target.value)} style={inputStyle}>
                  <option value="">Выберите город</option>
                  {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Адрес / место встречи</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Например, с. Бостери, ул. Береговая" style={inputStyle} />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Ссылка на фото</span>
                <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" style={inputStyle} />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Описание</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Расскажите, что ждёт гостей" style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }} />
              </label>

              <button className="irx-btn irx-btn-primary" style={{ width: "100%", marginTop: 6 }} onClick={submit} disabled={submitting}>
                {submitting ? "Отправляем…" : "Отправить на модерацию"}
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={17} style={{ color: "var(--aqua-500)" }} />
                  <h2 style={{ margin: 0, fontSize: "1.05rem", color: "var(--ink-800)" }}>Мои впечатления</h2>
                </div>
                <button className="irl-link" onClick={() => onNavigate("experiences")} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "none", color: "var(--lake-blue)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
                  В каталог <ArrowRight size={14} />
                </button>
              </div>

              {loading ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem", padding: "20px 0" }}>Загружаем…</div>
              ) : experiences.length === 0 ? (
                <div style={{ border: "1px dashed rgba(10,37,64,0.16)", borderRadius: 16, padding: "28px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
                  <Sparkles size={24} style={{ color: "var(--aqua-500)", marginBottom: 10 }} />
                  <div style={{ fontSize: "0.88rem", color: "var(--ink-800)", fontWeight: 650, marginBottom: 4 }}>Пока нет впечатлений</div>
                  <div style={{ fontSize: "0.78rem" }}>Создайте первое — оно появится здесь после модерации.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {experiences.map((exp) => (
                    <div key={exp.id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(10,37,64,0.07)", borderRadius: 14, padding: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--aqua-500)", flexShrink: 0 }}>
                        <Sparkles size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: "block", fontSize: "0.84rem", color: "var(--ink-800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{exp.title}</strong>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 3 }}>
                          <MapPin size={11} />{exp.city?.name || exp.address || "Иссык-Куль"}
                          <Clock size={11} />{exp.duration_minutes || 60} мин
                        </span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--lake-blue)" }}>{exp.price.toLocaleString()} сом</div>
                        <div style={{ fontSize: "0.66rem", color: exp.status === "approved" ? "#0f766e" : exp.status === "rejected" ? "#b91c1c" : "#b45309", marginTop: 2 }}>
                          {exp.status === "approved" ? "Активно" : exp.status === "rejected" ? "Отклонено" : "На модерации"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 16, background: "var(--paper)", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--ink-800)" }}>Как это работает.</strong> Вы создаёте впечатление, модератор проверяет его,
                после чего оно появляется в каталоге. Бронирование проходит с двойным подтверждением.
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px) { .host-grid { grid-template-columns: 1fr !important; } }` }} />
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.66rem",
  fontWeight: 750,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  marginBottom: 6,
};

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
  fontFamily: "inherit",
};
