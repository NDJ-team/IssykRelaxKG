import { useEffect, useState } from "react";
import { ArrowRight, Clock, Compass, Map, Route as RouteIcon, Sparkles, Users, Backpack, MapPin } from "lucide-react";
import { SEO } from "./SEO";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { listTours } from "../services/guides";
import { listTourPackages } from "../services/agency";
import type { TourResponse, TourPackageResponse } from "../types/api";

interface RoutesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function RoutesPage({ onNavigate }: RoutesPageProps) {
  const [tours, setTours] = useState<TourResponse[]>([]);
  const [packages, setPackages] = useState<TourPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listTours(undefined, 0, 6).catch(() => ({ items: [] as TourResponse[], total: 0 })),
      listTourPackages(0, 6).catch(() => ({ items: [] as TourPackageResponse[], total: 0 })),
    ])
      .then(([t, p]) => {
        if (!alive) return;
        setTours(t.items);
        setPackages(p.items);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title="Маршруты и туры по Иссык-Кулю — AI-планировщик и интерактивная карта | IssykRelax"
        description="Готовые туры, пакетные предложения, AI-планировщик путешествий и интерактивная карта Иссык-Куля. Составьте маршрут по реальным предложениям."
        canonical="/routes"
      />

      <section style={{ background: "var(--gradient-lake)", color: "#fff", padding: "120px 20px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 460, height: 460, borderRadius: 999, right: -120, top: -180, background: "radial-gradient(circle, rgba(217,168,92,0.3), transparent 65%)" }} />
        <div className="irx-container" style={{ position: "relative", zIndex: 2 }}>
          <span className="irx-eyebrow" style={{ color: "var(--sand-300)" }}>
            <RouteIcon size={12} /> Маршруты
          </span>
          <h1 className="irx-display" style={{ color: "#fff", fontSize: "clamp(2.3rem, 5vw, 3.8rem)", marginBottom: 14 }}>
            Ваш маршрут по <em style={{ color: "var(--sand-300)", fontStyle: "italic" }}>Иссык-Кулю</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 640, lineHeight: 1.75, margin: 0 }}>
            Начните с AI-планировщика, изучите карту или выберите готовый тур.
            Все предложения — от проверенных партнёров и местных экспертов.
          </p>
        </div>
      </section>

      <section className="irx-section">
        <div className="irx-container">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 56 }} className="routes-feature-grid">
            <button
              onClick={() => onNavigate("planner")}
              style={{
                textAlign: "left",
                border: "1px solid rgba(94,234,212,0.22)",
                borderRadius: 28,
                padding: "34px 30px",
                background: "linear-gradient(135deg, #06182b 0%, #0a2540 50%, #0e5c8a 100%)",
                color: "#fff",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", width: 280, height: 280, borderRadius: 999, right: -80, top: -120, background: "radial-gradient(circle, rgba(20,184,166,0.4), transparent 65%)" }} />
              <div className="irx-eyebrow" style={{ color: "var(--aqua-300)", position: "relative" }}><Sparkles size={12} /> AI Travel Planner</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.3rem)", margin: "0 0 10px", position: "relative" }}>
                Соберите маршрут за пару минут
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: "0 0 22px", maxWidth: 460, position: "relative" }}>
                Бюджет, даты, компания и предпочтения — алгоритм подберёт жильё, питание, впечатления и транспорт из реальных предложений.
              </p>
              <span className="irx-btn irx-btn-sand" style={{ position: "relative" }}>
                Открыть планировщик <ArrowRight size={15} />
              </span>
            </button>

            <button
              onClick={() => onNavigate("map")}
              style={{
                textAlign: "left",
                border: "1px solid rgba(10,37,64,0.08)",
                borderRadius: 28,
                padding: "34px 30px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg, #e6f2f9, #e6faf7)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lake-blue)", marginBottom: 18 }}>
                <Map size={24} />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", margin: "0 0 10px", color: "var(--ink-800)" }}>
                Интерактивная карта
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 22px" }}>
                Жильё, рестораны, активности, туры и транспорт на одной карте — с ценами и переходом к бронированию.
              </p>
              <span className="irl-link" style={{ color: "var(--lake-blue)" }}>
                Открыть карту <ArrowRight size={15} />
              </span>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
            <div>
              <span className="irx-eyebrow"><Compass size={12} /> Туры</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: 0, color: "var(--ink-800)" }}>Готовые маршруты</h2>
            </div>
            <button className="irl-link" onClick={() => onNavigate("tours")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", color: "var(--lake-blue)", fontWeight: 700, cursor: "pointer" }}>
              Все туры <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 36, textAlign: "center", color: "var(--text-secondary)" }}>Загружаем туры…</div>
          ) : tours.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(10,37,64,0.16)", borderRadius: 20 }}>
              Туры скоро появятся
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {tours.map((tour) => (
                <button key={tour.id} onClick={() => onNavigate("tour", { tour_id: tour.id })} style={cardStyle}>
                  <div style={imageWrapStyle}>
                    <ImgWithFallback
                      src="https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=700&q=80&auto=format&fit=crop"
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                    <span style={priceBadgeStyle}>{tour.price.toLocaleString()} сом</span>
                  </div>
                  <div style={bodyStyle}>
                    <strong style={titleStyle}>{tour.title}</strong>
                    <div style={metaStyle}>
                      <span><Clock size={12} />{tour.duration_days} {tour.duration_days === 1 ? "день" : "дней"}</span>
                      <span><Users size={12} />до {tour.max_guests} чел.</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {packages.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", margin: "56px 0 24px" }}>
                <div>
                  <span className="irx-eyebrow"><Backpack size={12} /> Пакеты</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: 0, color: "var(--ink-800)" }}>Пакетные туры</h2>
                </div>
                <button className="irl-link" onClick={() => onNavigate("tour-packages")} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", color: "var(--lake-blue)", fontWeight: 700, cursor: "pointer" }}>
                  Все пакеты <ArrowRight size={15} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {packages.map((pkg) => (
                  <button key={pkg.id} onClick={() => onNavigate("tour-package", { pkg_id: pkg.id })} style={cardStyle}>
                    <div style={imageWrapStyle}>
                      <ImgWithFallback
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80&auto=format&fit=crop"
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                      <span style={priceBadgeStyle}>{pkg.price.toLocaleString()} сом</span>
                    </div>
                    <div style={bodyStyle}>
                      <strong style={titleStyle}>{pkg.title}</strong>
                      <div style={metaStyle}>
                        <span><Clock size={12} />{pkg.duration_days} дней</span>
                        <span><Users size={12} />до {pkg.max_guests} чел.</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section style={{ padding: "0 20px 88px" }}>
        <div className="irx-container">
          <div style={{ borderRadius: 28, padding: "38px 32px", background: "#fff", border: "1px solid rgba(10,37,64,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 620 }}>
              <div className="irx-eyebrow"><MapPin size={12} /> Направления</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.8vw, 2rem)", margin: "0 0 8px", color: "var(--ink-800)" }}>Не знаете, с чего начать?</h2>
              <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>Выберите направление — мы покажем жильё, впечатления и транспорт рядом.</p>
            </div>
            <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("search")}>
              Смотреть направления <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px) { .routes-feature-grid { grid-template-columns: 1fr !important; } }` }} />
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

const priceBadgeStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "22px 14px 11px",
  color: "#fff",
  fontSize: "0.92rem",
  fontWeight: 750,
  background: "linear-gradient(to top, rgba(6,24,43,0.82), transparent)",
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
