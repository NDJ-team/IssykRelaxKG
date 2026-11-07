import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowRight, BedDouble, CalendarDays, Car, CheckCircle, Compass,
  MapPin, Mountain, RefreshCw, Save, Sparkles, Star, Utensils, Users, Wallet,
} from "lucide-react";
import { SEO } from "./SEO";
import { getCities, getProperties } from "../services/properties";
import { listTours } from "../services/guides";
import { listRestaurantsApi } from "../services/restaurants-service";
import { listActivities } from "../services/activities";
import { listTransfers } from "../services/drivers";
import { listExperiences } from "../services/experiences";
import type { LocalExperienceResponse } from "../services/experiences";
import type {
  ActivityResponse, CityResponse, PropertyResponse, RestaurantResponse,
  TourResponse, TransferResponse,
} from "../types/api";

interface TravelPlannerPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type PlanType = "stay" | "food" | "tour" | "activity" | "transport" | "experience";

interface PlanEntry {
  key: string;
  type: PlanType;
  title: string;
  subtitle: string;
  price: number;
  page?: string;
  params?: Record<string, string>;
}

interface PlanDay {
  day: number;
  title: string;
  entries: PlanEntry[];
  total: number;
}

interface PlanResult {
  days: PlanDay[];
  total: number;
  perPerson: number;
  budget: number;
  overBudget: boolean;
  nights: number;
  foodEstimate: number;
  stay: PropertyResponse | null;
}

const PREF_OPTIONS = ["Пляж", "Горы", "Гастрономия", "Культура", "Активности", "Семейный отдых"];

const PREF_KEYWORDS: Record<string, string[]> = {
  "Пляж": ["пляж", "берег", "озеро", "beach", "побереж"],
  "Горы": ["гор", "трек", "перевал", "ущел", "hiking", "поход"],
  "Гастрономия": ["гастро", "кухн", "ресторан", "еда", "кулин", "ужин"],
  "Культура": ["культур", "юрт", "музей", "истор", "ремесл", "традиц"],
  "Активности": ["актив", "конн", "рыбалк", "сплав", "adventure", "прогул"],
  "Семейный отдых": ["семей", "дет", "family", "kids"],
};

const FOOD_PER_PERSON_DAY = 1400;

function matchesPreferences(text: string, prefs: string[]): boolean {
  if (prefs.length === 0) return true;
  const lower = text.toLowerCase();
  return prefs.some((pref) => (PREF_KEYWORDS[pref] || []).some((keyword) => lower.includes(keyword)));
}

function entryIcon(type: PlanType) {
  if (type === "stay") return BedDouble;
  if (type === "food") return Utensils;
  if (type === "tour") return Compass;
  if (type === "activity") return Mountain;
  if (type === "experience") return Sparkles;
  return Car;
}

function entryColor(type: PlanType) {
  if (type === "stay") return "#14b8a6";
  if (type === "food") return "#f59e0b";
  if (type === "tour") return "#3b82f6";
  if (type === "activity") return "#8b5cf6";
  if (type === "experience") return "#0ea5a4";
  return "#f97316";
}

export function TravelPlannerPage({ onNavigate }: TravelPlannerPageProps) {
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [budget, setBudget] = useState(60000);
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [location, setLocation] = useState("");
  const [prefs, setPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCities().then(setCities).catch(() => setCities([]));
  }, []);

  const nights = Math.max(1, days - 1);

  const togglePref = (pref: string) => {
    setPrefs((current) => current.includes(pref) ? current.filter((item) => item !== pref) : [...current, pref]);
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setSaved(false);
    setResult(null);

    try {
      const cityId = location || undefined;
      const [propertiesResponse, toursResponse, restaurantsResponse, activitiesResponse, transfersResponse, experiencesResponse] = await Promise.all([
        getProperties({
          city_id: cityId,
          max_guests: people,
          limit: 60,
        }),
        listTours(cityId, 0, 60),
        listRestaurantsApi(cityId, 0, 40),
        listActivities(cityId, 0, 60),
        listTransfers(cityId, 0, 40),
        listExperiences({ city_id: cityId, limit: 60 }),
      ]);

      const properties = propertiesResponse.items || [];
      const tours = toursResponse.items || [];
      const restaurants = restaurantsResponse.items || [];
      const activities = activitiesResponse.items || [];
      const transfers = transfersResponse.items || [];
      const experiences = experiencesResponse.items || [];

      if (properties.length === 0 && tours.length === 0 && activities.length === 0 && experiences.length === 0) {
        setError("Для выбранных параметров пока нет предложений. Попробуйте изменить направление, бюджет или количество гостей.");
        return;
      }

      const stayBudget = budget * 0.45;
      const expBudget = budget * 0.25;
      const transportBudget = budget * 0.1;
      const foodBudget = budget * 0.2;

      const sortedStays = [...properties].sort(
        (a, b) => (b.rating_points || 0) - (a.rating_points || 0) || a.price_per_night - b.price_per_night,
      );
      const affordableStays = sortedStays.filter((property) => property.price_per_night * nights <= stayBudget);
      const stay = affordableStays[0] || sortedStays[0] || null;
      const stayCost = stay ? stay.price_per_night * nights : 0;

      type ExperienceItem =
        | ((TourResponse | ActivityResponse) & { __kind: "tour" | "activity" })
        | (LocalExperienceResponse & { __kind: "experience" });
      const experiencePool: ExperienceItem[] = [
        ...tours.map((tour) => ({ ...tour, __kind: "tour" as const })),
        ...activities.map((activity) => ({ ...activity, __kind: "activity" as const })),
        ...experiences.map((experience) => ({ ...experience, __kind: "experience" as const })),
      ]
        .filter((item) => matchesPreferences(`${item.title} ${item.description || ""}`, prefs))
        .sort((a, b) => a.price - b.price);

      const selectedExperiences: ExperienceItem[] = [];
      let experienceSpent = 0;
      for (const item of experiencePool) {
        if (selectedExperiences.length >= Math.max(1, days - 1)) break;
        if (experienceSpent + item.price <= expBudget || selectedExperiences.length === 0) {
          selectedExperiences.push(item);
          experienceSpent += item.price;
        }
      }

      const foodEstimate = Math.min(foodBudget, Math.round(FOOD_PER_PERSON_DAY * people * days));
      const transfer = [...transfers]
        .sort((a, b) => a.price - b.price)
        .find((item) => item.price <= transportBudget) || null;

      const total = stayCost + experienceSpent + foodEstimate + (transfer?.price || 0);

      const toExperienceEntry = (item: ExperienceItem): PlanEntry => {
        const isExperience = item.__kind === "experience";
        const page = isExperience ? "local-experience" : item.__kind;
        const params = isExperience
          ? { experience_id: item.id }
          : item.__kind === "tour"
            ? { tour_id: item.id }
            : { activity_id: item.id };
        const subtitle = isExperience
          ? "Местное впечатление"
          : item.__kind === "tour"
            ? "Экскурсия"
            : "Активность";
        return {
          key: `${item.__kind}-${item.id}`,
          type: item.__kind,
          title: item.title,
          subtitle,
          price: item.price,
          page,
          params,
        };
      };

      const planDays: PlanDay[] = [];
      for (let index = 0; index < days; index += 1) {
        const entries: PlanEntry[] = [];

        if (index === 0 && stay) {
          entries.push({
            key: `stay-${stay.id}`,
            type: "stay",
            title: stay.title,
            subtitle: `${stay.city?.name || "Иссык-Куль"} · ${nights} ${nights === 1 ? "ночь" : "ночей"}`,
            price: stayCost,
            page: "property",
            params: { property_id: stay.id },
          });
        }

        if (days === 1 && selectedExperiences[0]) {
          entries.push(toExperienceEntry(selectedExperiences[0]));
        } else if (index > 0 && index < days - 1) {
          const item = selectedExperiences[index - 1];
          if (item) {
            entries.push(toExperienceEntry(item));
          }
        }

        if (index === days - 1 && transfer) {
          entries.push({
            key: `transfer-${transfer.id}`,
            type: "transport",
            title: `${transfer.from_location} → ${transfer.to_location}`,
            subtitle: transfer.vehicle_type || "Трансфер",
            price: transfer.price,
            page: "transfer",
            params: { transfer_id: transfer.id },
          });
        }

        const restaurant = restaurants[index];
        if (restaurant) {
          entries.push({
            key: `food-${restaurant.id}`,
            type: "food",
            title: restaurant.name,
            subtitle: restaurant.cuisine_type || "Ресторан",
            price: 0,
            page: "restaurant",
            params: { restaurant_id: restaurant.id },
          });
        }

        planDays.push({
          day: index + 1,
          title: index === 0 ? "Заезд и знакомство" : index === days - 1 ? "Выезд" : "Впечатления и отдых",
          entries,
          total: entries.reduce((sum, entry) => sum + entry.price, 0),
        });
      }

      setResult({
        days: planDays,
        total,
        perPerson: Math.round(total / Math.max(1, people)),
        budget,
        overBudget: total > budget,
        nights,
        foodEstimate,
        stay,
      });
    } catch (e) {
      setError("Не удалось получить предложения. Проверьте, что API доступен, и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = () => {
    if (!result) return;
    try {
      window.localStorage.setItem("issykrelax.plan", JSON.stringify(result));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!result) return [];
    return [
      { label: "Итого", value: `${result.total.toLocaleString()} сом`, icon: Wallet },
      { label: "На человека", value: `${result.perPerson.toLocaleString()} сом`, icon: Users },
      { label: "Ночей", value: String(result.nights), icon: BedDouble },
      { label: "Впечатлений", value: String(result.days.reduce((sum, day) => sum + day.entries.filter((entry) => entry.type === "tour" || entry.type === "activity" || entry.type === "experience").length, 0)), icon: Compass },
    ];
  }, [result]);

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title="AI Travel Planner — маршрут по Иссык-Кулю за пару минут | IssykRelax"
        description="Укажите бюджет, даты, количество путешественников и предпочтения — алгоритм соберёт маршрут из реальных предложений IssykRelax."
        canonical="/planner"
      />

      <section style={{ background: "var(--gradient-lake)", color: "#fff", padding: "120px 20px 92px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 460, height: 460, borderRadius: 999, right: -120, top: -180, background: "radial-gradient(circle, rgba(20,184,166,0.35), transparent 65%)" }} />
        <div className="irx-container" style={{ position: "relative", zIndex: 2 }}>
          <span className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}><Sparkles size={12} /> AI Travel Planner</span>
          <h1 className="irx-display" style={{ color: "#fff", fontSize: "clamp(2.3rem, 5vw, 3.8rem)", marginBottom: 14 }}>
            Маршрут, собранный <em style={{ color: "var(--aqua-300)", fontStyle: "italic" }}>под вас</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 660, lineHeight: 1.75, margin: 0 }}>
            Бюджет, количество дней, компания и предпочтения — алгоритм подберёт жильё, питание,
            впечатления и транспорт из реальных предложений IssykRelax.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 20px 40px", marginTop: -48, position: "relative", zIndex: 4 }}>
        <div className="irx-container">
          <div style={{ background: "#fff", borderRadius: 26, border: "1px solid rgba(10,37,64,0.08)", boxShadow: "0 30px 80px rgba(6,24,43,0.16)", padding: 24 }}>
            <div className="planner-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 0.8fr auto", gap: 12, alignItems: "end" }}>
              <label style={fieldStyle}>
                <span style={labelStyle}><MapPin size={12} /> Направление</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle}>
                  <option value="">Вся Иссык-Кульская область</option>
                  {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}><Wallet size={12} /> Бюджет, сом</span>
                <input type="number" min={5000} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} style={inputStyle} />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}><CalendarDays size={12} /> Дней</span>
                <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}><Users size={12} /> Гостей</span>
                <input type="number" min={1} max={20} value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />
              </label>

              <button className="irx-btn irx-btn-primary" onClick={generate} disabled={loading} style={{ height: 50, whiteSpace: "nowrap", opacity: loading ? 0.7 : 1 }}>
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? "Собираем…" : "Собрать маршрут"}
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Предпочтения</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PREF_OPTIONS.map((pref) => {
                  const active = prefs.includes(pref);
                  return (
                    <button
                      key={pref}
                      onClick={() => togglePref(pref)}
                      style={{
                        border: `1px solid ${active ? "var(--aqua-500)" : "rgba(10,37,64,0.12)"}`,
                        background: active ? "rgba(20,184,166,0.1)" : "#fff",
                        color: active ? "var(--turquoise-dark)" : "var(--text-secondary)",
                        borderRadius: 999,
                        padding: "7px 13px",
                        fontSize: "0.78rem",
                        fontWeight: 650,
                        cursor: "pointer",
                      }}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="irx-section" style={{ paddingTop: 24 }}>
        <div className="irx-container">
          {error && (
            <div style={{ display: "flex", gap: 12, padding: "18px 20px", borderRadius: 18, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", marginBottom: 24 }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ display: "block", marginBottom: 3 }}>Не удалось собрать маршрут</strong>
                <span style={{ fontSize: "0.86rem" }}>{error}</span>
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-secondary)" }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--aqua-500)" }} />
              Подбираем жильё, впечатления и транспорт…
            </div>
          )}

          {!loading && !result && !error && (
            <div style={{ textAlign: "center", padding: "54px 20px", background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)" }}>
              <Sparkles size={32} style={{ color: "var(--aqua-500)", marginBottom: 12 }} />
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", margin: "0 0 8px", color: "var(--ink-800)" }}>Заполните параметры — и в путь</h2>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>Маршрут появится здесь через несколько секунд.</p>
            </div>
          )}

          {result && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} style={{ background: "#fff", border: "1px solid rgba(10,37,64,0.08)", borderRadius: 18, padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        <Icon size={14} style={{ color: "var(--aqua-500)" }} />
                        {card.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--ink-800)", marginTop: 8 }}>{card.value}</div>
                    </div>
                  );
                })}
              </div>

              {result.overBudget && (
                <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderRadius: 16, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", marginBottom: 20, fontSize: "0.86rem" }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  Ориентировочная стоимость немного выше бюджета. Можно уменьшить количество дней или выбрать более доступное жильё.
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <div>
                  <span className="irx-eyebrow"><Compass size={12} /> Ваш маршрут</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: 0, color: "var(--ink-800)" }}>
                    {days} {days === 1 ? "день" : "дней"} на Иссык-Куле
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="irx-btn irx-btn-ghost" onClick={savePlan}>
                    {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                    {saved ? "Сохранено" : "Сохранить"}
                  </button>
                  <button className="irx-btn irx-btn-primary" onClick={generate}>
                    <RefreshCw size={15} /> Пересобрать
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                {result.days.map((day) => (
                  <div key={day.day} style={{ background: "#fff", borderRadius: 22, border: "1px solid rgba(10,37,64,0.08)", padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--gradient-aqua)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 750 }}>
                          {day.day}
                        </span>
                        <div>
                          <strong style={{ display: "block", color: "var(--ink-800)", fontSize: "0.94rem" }}>{day.title}</strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>День {day.day} из {days}</span>
                        </div>
                      </div>
                      {day.total > 0 && <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--lake-blue)" }}>{day.total.toLocaleString()} сом</span>}
                    </div>

                    <div style={{ display: "grid", gap: 8 }}>
                      {day.entries.length === 0 ? (
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", padding: "8px 0" }}>Свободный день — можно добавить впечатление вручную.</div>
                      ) : day.entries.map((entry) => {
                        const Icon = entryIcon(entry.type);
                        const color = entryColor(entry.type);
                        return (
                          <button
                            key={entry.key}
                            onClick={() => entry.page && onNavigate(entry.page, entry.params)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              textAlign: "left",
                              border: "1px solid rgba(10,37,64,0.06)",
                              background: "var(--paper)",
                              borderRadius: 14,
                              padding: "11px 13px",
                              cursor: entry.page ? "pointer" : "default",
                            }}
                          >
                            <span style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon size={16} />
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ display: "block", fontSize: "0.82rem", color: "var(--ink-800)", lineHeight: 1.3 }}>{entry.title}</strong>
                              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 2 }}>{entry.subtitle}</span>
                            </span>
                            {entry.price > 0 && <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--lake-blue)", whiteSpace: "nowrap" }}>{entry.price.toLocaleString()} сом</span>}
                            {entry.page && <ArrowRight size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 18, background: "#f0fdfa", border: "1px solid #ccfbf1", fontSize: "0.8rem", color: "#115e59", lineHeight: 1.6 }}>
                <strong>Ориентировочный расчёт.</strong> Питание учтено как {result.foodEstimate.toLocaleString()} сом на всех гостей.
                Итоговая стоимость подтверждается при бронировании. Маршрут можно сохранить и вернуться к нему позже.
              </div>
            </>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 980px) { .planner-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 620px) { .planner-grid { grid-template-columns: 1fr !important; } }
      ` }} />
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.65rem",
  fontWeight: 750,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: "1px solid rgba(10,37,64,0.12)",
  background: "var(--paper)",
  padding: "0 12px",
  fontSize: "0.88rem",
  fontWeight: 600,
  color: "var(--ink-800)",
  outline: "none",
};
