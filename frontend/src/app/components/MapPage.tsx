import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, RefreshCw, Sparkles } from "lucide-react";
import { SEO } from "./SEO";
import { IssykKulMap, cityCoords, MAP_TYPE_META } from "./IssykKulMap";
import type { MapPoint, MapPointType } from "./IssykKulMap";
import { getCities, getProperties } from "../services/properties";
import { listRestaurantsApi } from "../services/restaurants-service";
import { listTours } from "../services/guides";
import { listActivities } from "../services/activities";
import { listTransfers } from "../services/drivers";
import { listExperiences } from "../services/experiences";
import type { CityResponse } from "../types/api";

interface MapPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

interface MapSource {
  page: string;
  params: Record<string, string>;
  description: string;
  image?: string;
}

type FilterKey = "all" | Exclude<MapPointType, "area">;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "stay", label: "Жильё" },
  { key: "food", label: "Рестораны" },
  { key: "activity", label: "Активности" },
  { key: "tour", label: "Туры" },
  { key: "transport", label: "Транспорт" },
  { key: "experience", label: "Впечатления" },
];

export function MapPage({ onNavigate }: MapPageProps) {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [sources, setSources] = useState<Record<string, MapSource>>({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([
      getCities().catch(() => [] as CityResponse[]),
      getProperties({ limit: 80 }).catch(() => ({ items: [] as any[] })),
      listRestaurantsApi(undefined, 0, 60).catch(() => ({ items: [] as any[] })),
      listTours(undefined, 0, 60).catch(() => ({ items: [] as any[] })),
      listActivities(undefined, 0, 60).catch(() => ({ items: [] as any[] })),
      listTransfers(undefined, 0, 60).catch(() => ({ items: [] as any[] })),
      listExperiences({ limit: 60 }).catch(() => ({ items: [] as any[] })),
    ])
      .then(([cities, properties, restaurants, tours, activities, transfers, experiences]) => {
        if (!alive) return;

        const cityById = new Map<string, CityResponse>((cities as CityResponse[]).map((city) => [city.id, city]));
        const nextPoints: MapPoint[] = [];
        const nextSources: Record<string, MapSource> = {};

        const coordsFor = (cityId?: string | null, cityName?: string | null, index = 0) => {
          const city = cityId ? cityById.get(cityId) : null;
          const base = cityCoords(cityName || city?.name) || { lat: 42.5, lng: 77.2 };
          return {
            lat: base.lat + ((index % 5) - 2) * 0.012,
            lng: base.lng + ((index % 7) - 3) * 0.018,
          };
        };

        (properties.items || []).forEach((property: any, index: number) => {
          const coords = coordsFor(property.city?.id || property.city_id, property.city?.name, index);
          const id = `stay-${property.id}`;
          nextPoints.push({
            id,
            type: "stay",
            title: property.title,
            subtitle: property.city?.name || "Иссык-Куль",
            price: property.price_per_night,
            image: property.images?.[0],
            ...coords,
          });
          nextSources[id] = {
            page: "property",
            params: { property_id: property.id },
            description: `${property.category?.name || "Жильё"} · до ${property.max_guests} гостей`,
            image: property.images?.[0],
          };
        });

        (restaurants.items || []).forEach((restaurant: any, index: number) => {
          const coords = coordsFor(restaurant.city_id, restaurant.city?.name, index);
          const id = `food-${restaurant.id}`;
          nextPoints.push({
            id,
            type: "food",
            title: restaurant.name,
            subtitle: restaurant.cuisine_type || "Ресторан",
            ...coords,
          });
          nextSources[id] = {
            page: "restaurant",
            params: { restaurant_id: restaurant.id },
            description: `${restaurant.cuisine_type || "Ресторан"} · ${restaurant.city?.name || "Иссык-Куль"}`,
          };
        });

        (tours.items || []).forEach((tour: any, index: number) => {
          const coords = coordsFor(tour.city_id, null, index);
          const id = `tour-${tour.id}`;
          nextPoints.push({
            id,
            type: "tour",
            title: tour.title,
            subtitle: `${tour.duration_days} дн.`,
            price: tour.price,
            ...coords,
          });
          nextSources[id] = {
            page: "tour",
            params: { tour_id: tour.id },
            description: `${tour.duration_days} дней · до ${tour.max_guests} гостей`,
          };
        });

        (activities.items || []).forEach((activity: any, index: number) => {
          const coords = coordsFor(activity.city_id, activity.location, index);
          const id = `activity-${activity.id}`;
          nextPoints.push({
            id,
            type: "activity",
            title: activity.title,
            subtitle: activity.location || "Активность",
            price: activity.price,
            ...coords,
          });
          nextSources[id] = {
            page: "activity",
            params: { activity_id: activity.id },
            description: `${activity.duration_minutes || 60} мин · до ${activity.max_participants} человек`,
          };
        });

        (transfers.items || []).forEach((transfer: any, index: number) => {
          const coords = coordsFor(transfer.city_id, null, index);
          const id = `transport-${transfer.id}`;
          nextPoints.push({
            id,
            type: "transport",
            title: `${transfer.from_location} → ${transfer.to_location}`,
            subtitle: transfer.vehicle_type || "Трансфер",
            price: transfer.price,
            ...coords,
          });
          nextSources[id] = {
            page: "transfer",
            params: { transfer_id: transfer.id },
            description: `${transfer.vehicle_type || "Транспорт"} · до ${transfer.max_passengers} пассажиров`,
          };
        });

        (experiences.items || []).forEach((experience: any, index: number) => {
          const coords = experience.latitude && experience.longitude
            ? { lat: experience.latitude, lng: experience.longitude }
            : coordsFor(experience.city_id, experience.city?.name, index);
          const id = `experience-${experience.id}`;
          nextPoints.push({
            id,
            type: "experience",
            title: experience.title,
            subtitle: experience.category,
            price: experience.price,
            image: experience.images?.[0],
            ...coords,
          });
          nextSources[id] = {
            page: "local-experience",
            params: { experience_id: experience.id },
            description: `${experience.category} · ${experience.duration_minutes || 60} мин`,
            image: experience.images?.[0],
          };
        });

        setPoints(nextPoints);
        setSources(nextSources);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? points : points.filter((point) => point.type === filter)),
    [points, filter],
  );

  const selected = points.find((point) => point.id === selectedId) || null;
  const selectedSource = selectedId ? sources[selectedId] : null;

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: points.length };
    points.forEach((point) => {
      result[point.type] = (result[point.type] || 0) + 1;
    });
    return result;
  }, [points]);

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SEO
        title="Интерактивная карта Иссык-Куля — жильё, рестораны, туры и транспорт | IssykRelax"
        description="Все объекты IssykRelax на одной карте: жильё, рестораны, активности, туры и трансферы. Цены и переход к бронированию."
        canonical="/map"
      />

      <section style={{ background: "var(--gradient-lake)", color: "#fff", padding: "120px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 460, height: 460, borderRadius: 999, right: -120, top: -180, background: "radial-gradient(circle, rgba(20,184,166,0.34), transparent 65%)" }} />
        <div className="irx-container" style={{ position: "relative", zIndex: 2 }}>
          <span className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}><MapPin size={12} /> Карта</span>
          <h1 className="irx-display" style={{ color: "#fff", fontSize: "clamp(2.2rem, 4.6vw, 3.4rem)", marginBottom: 12 }}>
            Вся экосистема <em style={{ color: "var(--aqua-300)", fontStyle: "italic" }}>на одной карте</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", maxWidth: 640, lineHeight: 1.75, margin: 0 }}>
            Жильё, рестораны, активности, туры и транспорт. Выберите категорию или нажмите на точку,
            чтобы посмотреть детали и перейти к бронированию.
          </p>
        </div>
      </section>

      <section style={{ padding: "24px 20px 72px", overflow: "hidden" }}>
        <div className="irx-container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {FILTERS.map((item) => {
              const active = filter === item.key;
              const count = counts[item.key] || 0;
              return (
                <button
                  key={item.key}
                  onClick={() => { setFilter(item.key); setSelectedId(null); }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    border: `1px solid ${active ? "var(--lake-blue)" : "rgba(10,37,64,0.1)"}`,
                    background: active ? "var(--lake-blue)" : "#fff",
                    color: active ? "#fff" : "var(--ink-800)",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontSize: "0.78rem",
                    fontWeight: 650,
                    cursor: "pointer",
                  }}
                >
                  {item.key !== "all" && (
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: MAP_TYPE_META[item.key].color }} />
                  )}
                  {item.label}
                  <span style={{ opacity: 0.55 }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.65fr 0.85fr", gap: 18, alignItems: "start", minWidth: 0, width: "100%" }} className="map-layout">
            <div style={{ minWidth: 0 }}>
              <IssykKulMap
                points={filtered}
                onSelect={(point) => setSelectedId(point.id)}
                showAreas={filtered.length === 0}
                showLegend={false}
              />
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                  <RefreshCw size={14} className="animate-spin" /> Загружаем объекты…
                </div>
              )}
              {!loading && points.length === 0 && (
                <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 16, background: "#fff", border: "1px solid rgba(10,37,64,0.08)", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                  Объекты с координатами появятся после наполнения каталога. Пока на карте отмечены основные направления Иссык-Куля.
                </div>
              )}
            </div>

            <aside style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(10,37,64,0.08)", padding: 20, position: "sticky", top: 96, minWidth: 0, overflow: "hidden" }}>
              {selected ? (
                <>
                  {selected.image && (
                    <img
                      src={selected.image}
                      alt={selected.title}
                      style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 16, marginBottom: 14 }}
                    />
                  )}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: `${MAP_TYPE_META[selected.type].color}18`, color: MAP_TYPE_META[selected.type].color, fontSize: "0.68rem", fontWeight: 750, marginBottom: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: MAP_TYPE_META[selected.type].color }} />
                    {MAP_TYPE_META[selected.type].label}
                  </div>
                  <h3 style={{ fontSize: "1rem", color: "var(--ink-800)", margin: "0 0 6px", lineHeight: 1.35 }}>{selected.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 6px" }}>{selected.subtitle}</p>
                  {selectedSource && <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "0 0 14px" }}>{selectedSource.description}</p>}
                  {selected.price != null && (
                    <div style={{ fontSize: "1.1rem", fontWeight: 750, color: "var(--lake-blue)", marginBottom: 14 }}>
                      {selected.price.toLocaleString()} сом
                    </div>
                  )}
                  {selectedSource ? (
                    <button className="irx-btn irx-btn-primary" style={{ width: "100%" }} onClick={() => onNavigate(selectedSource.page, selectedSource.params)}>
                      Подробнее <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button className="irx-btn irx-btn-primary" style={{ width: "100%" }} onClick={() => onNavigate("search", { query: selected.title })}>
                      Смотреть предложения <ArrowRight size={15} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #e6f2f9, #e6faf7)", color: "var(--lake-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Sparkles size={22} />
                  </div>
                  <h3 style={{ fontSize: "1rem", color: "var(--ink-800)", margin: "0 0 6px" }}>Выберите точку на карте</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
                    Нажмите на маркер, чтобы увидеть название, цену и перейти к объекту.
                  </p>
                  <div style={{ display: "grid", gap: 7 }}>
                    {FILTERS.filter((item) => item.key !== "all" && (counts[item.key] || 0) > 0).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setFilter(item.key)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "none", background: "var(--paper)", borderRadius: 10, padding: "8px 10px", cursor: "pointer", fontSize: "0.78rem", color: "var(--ink-800)" }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: MAP_TYPE_META[item.key as Exclude<MapPointType, "area">].color }} />
                          {item.label}
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>{counts[item.key]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px) { .map-layout { grid-template-columns: 1fr !important; } }` }} />
    </div>
  );
}
