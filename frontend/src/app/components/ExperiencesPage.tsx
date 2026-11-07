import { useEffect, useState } from "react";
import { ArrowRight, Clock, MapPin, Sparkles, Utensils, Mountain, Users, Star } from "lucide-react";
import { SEO } from "./SEO";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { listRestaurantsApi } from "../services/restaurants-service";
import { listActivities } from "../services/activities";
import { listExperiences } from "../services/experiences";
import type { LocalExperienceResponse } from "../services/experiences";
import type { ActivityResponse, RestaurantResponse } from "../types/api";

interface ExperiencesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type Tab = "all" | "experiences" | "restaurants" | "activities";

export function ExperiencesPage({ onNavigate }: ExperiencesPageProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [experiences, setExperiences] = useState<LocalExperienceResponse[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listExperiences({ limit: 12 }).catch(() => ({ items: [] as LocalExperienceResponse[], total: 0 })),
      listRestaurantsApi(undefined, 0, 12).catch(() => ({ items: [] as RestaurantResponse[], total: 0 })),
      listActivities(undefined, 0, 12).catch(() => ({ items: [] as ActivityResponse[], total: 0 })),
    ])
      .then(([exp, rest, act]) => {
        if (!alive) return;
        setExperiences(exp.items);
        setRestaurants(rest.items);
        setActivities(act.items);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "Все" },
    { key: "experiences", label: "Местные впечатления", count: experiences.length },
    { key: "restaurants", label: "Рестораны", count: restaurants.length },
    { key: "activities", label: "Активности", count: activities.length },
  ];

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title="Впечатления на Иссык-Куле — местные мастер-классы, рестораны и активности | IssykRelax"
        description="Кулинарные мастер-классы, конные прогулки, рыбалка, рестораны и активности на Иссык-Куле. Бронируйте впечатления от местных жителей и проверенных партнёров."
        canonical="/experiences"
      />

      <section style={{ background: "var(--gradient-lake)", color: "#fff", padding: "120px 20px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 460, height: 460, borderRadius: 999, right: -120, top: -180, background: "radial-gradient(circle, rgba(20,184,166,0.34), transparent 65%)" }} />
        <div className="irx-container" style={{ position: "relative", zIndex: 2 }}>
          <span className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}>
            <Sparkles size={12} /> Впечатления
          </span>
          <h1 className="irx-display" style={{ color: "#fff", fontSize: "clamp(2.3rem, 5vw, 3.8rem)", marginBottom: 14 }}>
            Не просто поездка — <em style={{ color: "var(--aqua-300)", fontStyle: "italic" }}>впечатления</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 640, lineHeight: 1.75, margin: 0 }}>
            Рестораны, активности и местные впечатления от людей, которые живут на Иссык-Куле.
            Всё можно забронировать в одном месте.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            {tabs.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  style={{
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: active ? "#fff" : "rgba(255,255,255,0.08)",
                    color: active ? "var(--ink-800)" : "rgba(255,255,255,0.82)",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                  {item.count != null && <span style={{ opacity: 0.55, marginLeft: 6 }}>{item.count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="irx-section">
        <div className="irx-container">
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>Загружаем впечатления…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {(tab === "all" || tab === "experiences") && experiences.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => onNavigate("local-experience", { experience_id: exp.id })}
                  style={cardStyle}
                >
                  <div style={imageWrapStyle}>
                    <ImgWithFallback
                      src={exp.images?.[0] || "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=700&q=80&auto=format&fit=crop"}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                    <span style={badgeStyle}>{exp.category}</span>
                  </div>
                  <div style={bodyStyle}>
                    <strong style={titleStyle}>{exp.title}</strong>
                    <div style={metaStyle}>
                      <span><MapPin size={12} />{exp.city?.name || exp.address || "Иссык-Куль"}</span>
                      {exp.duration_minutes && <span><Clock size={12} />{exp.duration_minutes} мин</span>}
                    </div>
                    <div style={priceStyle}>{exp.price.toLocaleString()} сом <small style={{ color: "var(--text-secondary)", fontWeight: 500 }}>/ чел.</small></div>
                  </div>
                </button>
              ))}

              {(tab === "all" || tab === "restaurants") && restaurants.map((rest) => (
                <button
                  key={rest.id}
                  onClick={() => onNavigate("restaurant", { restaurant_id: rest.id })}
                  style={cardStyle}
                >
                  <div style={imageWrapStyle}>
                    <ImgWithFallback
                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80&auto=format&fit=crop"
                      alt={rest.name}
                      className="w-full h-full object-cover"
                    />
                    <span style={badgeStyle}>{rest.cuisine_type || "Ресторан"}</span>
                  </div>
                  <div style={bodyStyle}>
                    <strong style={titleStyle}>{rest.name}</strong>
                    <div style={metaStyle}>
                      <span><MapPin size={12} />{rest.city?.name || rest.address || "Иссык-Куль"}</span>
                      {rest.price_range && <span><Star size={12} />{rest.price_range}</span>}
                    </div>
                    <div style={{ ...priceStyle, color: "var(--lake-blue)" }}>Смотреть меню и отзывы <ArrowRight size={13} style={{ display: "inline", verticalAlign: -2 }} /></div>
                  </div>
                </button>
              ))}

              {(tab === "all" || tab === "activities") && activities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => onNavigate("activity", { activity_id: act.id })}
                  style={cardStyle}
                >
                  <div style={imageWrapStyle}>
                    <ImgWithFallback
                      src="https://images.unsplash.com/photo-1530866495561-507c9fa053fc?w=700&q=80&auto=format&fit=crop"
                      alt={act.title}
                      className="w-full h-full object-cover"
                    />
                    <span style={badgeStyle}>Активность</span>
                  </div>
                  <div style={bodyStyle}>
                    <strong style={titleStyle}>{act.title}</strong>
                    <div style={metaStyle}>
                      {act.location && <span><MapPin size={12} />{act.location}</span>}
                      {act.duration_minutes && <span><Clock size={12} />{act.duration_minutes} мин</span>}
                      <span><Users size={12} />до {act.max_participants}</span>
                    </div>
                    <div style={priceStyle}>{act.price.toLocaleString()} сом</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && tab === "experiences" && experiences.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 20px", background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)" }}>
              <Sparkles size={30} style={{ color: "var(--aqua-500)", marginBottom: 12 }} />
              <h3 style={{ margin: "0 0 8px", color: "var(--ink-800)" }}>Местные впечатления уже готовятся</h3>
              <p style={{ margin: "0 0 20px", color: "var(--text-secondary)" }}>Хотите стать первым хозяином впечатления на IssykRelax?</p>
              <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("local-host-dashboard")}>
                Стать хозяином <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: "0 20px 88px" }}>
        <div className="irx-container">
          <div style={{ borderRadius: 28, padding: "40px 32px", background: "linear-gradient(135deg, #06182b, #0e5c8a)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 620 }}>
              <div className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}><Mountain size={12} /> Local Experience</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 10px" }}>Вы живёте на Иссык-Куле?</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.7 }}>
                Размещайте кулинарные мастер-классы, конные прогулки, рыбалку и культурные впечатления.
                Мы берём на себя модерацию, бронирования и оплату.
              </p>
            </div>
            <button className="irx-btn irx-btn-sand" onClick={() => onNavigate("local-host-dashboard")}>
              Разместить впечатление <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  padding: 0,
  background: "#fff",
  border: "1px solid rgba(10,37,64,0.08)",
  borderRadius: 22,
  overflow: "hidden",
  cursor: "pointer",
};

const imageWrapStyle: React.CSSProperties = {
  position: "relative",
  height: 190,
  overflow: "hidden",
  background: "var(--surface)",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  padding: "4px 9px",
  borderRadius: 999,
  fontSize: "0.66rem",
  fontWeight: 750,
  color: "#fff",
  background: "rgba(6,24,43,0.78)",
  backdropFilter: "blur(8px)",
};

const bodyStyle: React.CSSProperties = {
  padding: "15px 16px 17px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "var(--ink-800)",
  lineHeight: 1.35,
};

const metaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  fontSize: "0.72rem",
  color: "var(--text-secondary)",
};

const priceStyle: React.CSSProperties = {
  marginTop: "auto",
  paddingTop: 6,
  fontSize: "0.95rem",
  fontWeight: 750,
  color: "var(--lake-blue)",
};
