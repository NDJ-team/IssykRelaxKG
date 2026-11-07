import { useMemo } from "react";
import { BedDouble, Utensils, Mountain, Compass, Car, Sparkles, MapPin } from "lucide-react";

export type MapPointType = "stay" | "food" | "activity" | "tour" | "transport" | "experience" | "area";

export interface MapPoint {
  id: string;
  type: MapPointType;
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  price?: number;
  image?: string;
  meta?: string;
}

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Балыкчы": { lat: 42.46, lng: 76.18 },
  "Чолпон-Ата": { lat: 42.65, lng: 77.08 },
  "Бостери": { lat: 42.63, lng: 77.18 },
  "Кара-Ой": { lat: 42.62, lng: 77.12 },
  "Чок-Тал": { lat: 42.6, lng: 77.3 },
  "Тамчы": { lat: 42.55, lng: 77.45 },
  "Каракол": { lat: 42.49, lng: 78.39 },
  "Тюп": { lat: 42.72, lng: 78.36 },
  "Иссык-Куль": { lat: 42.45, lng: 77.25 },
};

export function cityCoords(name?: string | null): { lat: number; lng: number } | null {
  if (!name) return null;
  const exact = CITY_COORDS[name];
  if (exact) return exact;
  const key = Object.keys(CITY_COORDS).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? CITY_COORDS[key] : null;
}

const BOUNDS = { minLat: 42.16, maxLat: 42.88, minLng: 75.9, maxLng: 78.62 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.max(3, Math.min(97, x)), y: Math.max(4, Math.min(96, y)) };
}

const TYPE_META: Record<MapPointType, { color: string; icon: typeof BedDouble; label: string }> = {
  stay: { color: "#14b8a6", icon: BedDouble, label: "Жильё" },
  food: { color: "#f59e0b", icon: Utensils, label: "Рестораны" },
  activity: { color: "#8b5cf6", icon: Mountain, label: "Активности" },
  tour: { color: "#3b82f6", icon: Compass, label: "Туры" },
  transport: { color: "#f97316", icon: Car, label: "Транспорт" },
  experience: { color: "#ec4899", icon: Sparkles, label: "Впечатления" },
  area: { color: "#e2e8f0", icon: MapPin, label: "Направления" },
};

const AREA_POINTS: MapPoint[] = [
  { id: "area-cholpon-ata", type: "area", title: "Чолпон-Ата", subtitle: "Курорт", ...CITY_COORDS["Чолпон-Ата"] },
  { id: "area-bosteri", type: "area", title: "Бостери", subtitle: "Пляжи", ...CITY_COORDS["Бостери"] },
  { id: "area-chok-tal", type: "area", title: "Чок-Тал", subtitle: "Тихий берег", ...CITY_COORDS["Чок-Тал"] },
  { id: "area-tamchy", type: "area", title: "Тамчы", subtitle: "Семейный отдых", ...CITY_COORDS["Тамчы"] },
  { id: "area-karakol", type: "area", title: "Каракол", subtitle: "Горы и треккинг", ...CITY_COORDS["Каракол"] },
  { id: "area-balykchy", type: "area", title: "Балыкчы", subtitle: "Западное побережье", ...CITY_COORDS["Балыкчы"] },
];

interface IssykKulMapProps {
  points?: MapPoint[];
  onSelect?: (point: MapPoint) => void;
  className?: string;
  showAreas?: boolean;
  showLegend?: boolean;
}

export function IssykKulMap({
  points = [],
  onSelect,
  className = "",
  showAreas = false,
  showLegend = true,
}: IssykKulMapProps) {
  const visiblePoints = useMemo(
    () => (points.length > 0 ? points : showAreas ? AREA_POINTS : []),
    [points, showAreas],
  );

  const usedTypes = useMemo(() => {
    const set = new Set<MapPointType>();
    visiblePoints.forEach((p) => set.add(p.type));
    return Array.from(set);
  }, [visiblePoints]);

  return (
    <div
      className={`issyk-map ${className}`}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        minHeight: 240,
        borderRadius: 24,
        overflow: "hidden",
        background: "radial-gradient(circle at 30% 20%, #123a5c 0%, #071b2f 55%, #04111f 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        isolation: "isolate",
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
        <defs>
          <linearGradient id="issyk-lake" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0e5c8a" />
            <stop offset="55%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="issyk-ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(148,163,184,0.18)" />
            <stop offset="100%" stopColor="rgba(148,163,184,0)" />
          </linearGradient>
        </defs>

        {/* subtle grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 12.5} y1={0} x2={i * 12.5} y2={100} stroke="rgba(255,255,255,0.045)" strokeWidth="0.2" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 16.6} x2={100} y2={i * 16.6} stroke="rgba(255,255,255,0.045)" strokeWidth="0.2" />
        ))}

        {/* mountain ridges */}
        <path d="M0 12 L14 6 L26 14 L38 4 L52 12 L66 5 L80 13 L92 7 L100 12 L100 0 L0 0 Z" fill="url(#issyk-ridge)" />
        <path d="M0 84 L12 78 L26 86 L40 76 L54 85 L70 76 L84 85 L100 79 L100 100 L0 100 Z" fill="url(#issyk-ridge)" />

        {/* lake */}
        <path
          d="M4 46 C10 38 20 35 30 38 C40 41 48 35 58 37 C68 39 78 33 90 37 C97 40 98 47 92 52 C82 60 70 63 58 65 C45 67 32 68 20 63 C11 59 1 54 4 46 Z"
          fill="url(#issyk-lake)"
          opacity="0.92"
        />
        <path
          d="M4 46 C10 38 20 35 30 38 C40 41 48 35 58 37 C68 39 78 33 90 37 C97 40 98 47 92 52 C82 60 70 63 58 65 C45 67 32 68 20 63 C11 59 1 54 4 46 Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.45"
        />
        <text x="50" y="52" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="2.4" fontWeight="700" letterSpacing="0.6">
          ИССЫК-КУЛЬ
        </text>
        <text x="50" y="55.5" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="1.4" letterSpacing="0.4">
          6 236 км² · 1 607 м
        </text>
      </svg>

      {/* pins */}
      {visiblePoints.map((point) => {
        const { x, y } = project(point.lat, point.lng);
        const meta = TYPE_META[point.type];
        const Icon = meta.icon;
        const isArea = point.type === "area";
        return (
          <button
            key={point.id}
            type="button"
            title={`${point.title}${point.subtitle ? ` · ${point.subtitle}` : ""}`}
            aria-label={point.title}
            onClick={() => onSelect?.(point)}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isArea ? 2 : 3,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: isArea ? "4px 8px" : 0,
              border: "none",
              background: "transparent",
              cursor: onSelect ? "pointer" : "default",
              color: "#fff",
            }}
          >
            <span
              style={{
                width: isArea ? 10 : 30,
                height: isArea ? 10 : 30,
                borderRadius: 999,
                background: meta.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: isArea ? "1px solid rgba(255,255,255,0.6)" : "2px solid rgba(255,255,255,0.92)",
                boxShadow: isArea ? "0 0 0 4px rgba(226,232,240,0.12)" : "0 6px 16px rgba(0,0,0,0.35)",
                flexShrink: 0,
              }}
            >
              {!isArea && <Icon size={15} color="#fff" />}
            </span>
            {isArea && (
              <span style={{ fontSize: 11, fontWeight: 650, textShadow: "0 1px 6px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
                {point.title}
              </span>
            )}
            {!isArea && point.price != null && (
              <span
                style={{
                  background: "rgba(6,24,43,0.82)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 6px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(6px)",
                }}
              >
                {point.price.toLocaleString()} сом
              </span>
            )}
          </button>
        );
      })}

      {/* compass */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 14,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(6,24,43,0.5)",
          color: "rgba(255,255,255,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          backdropFilter: "blur(8px)",
        }}
      >
        N
      </div>

      {showLegend && usedTypes.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            maxWidth: "calc(100% - 28px)",
          }}
        >
          {usedTypes.map((type) => {
            const meta = TYPE_META[type];
            return (
              <span
                key={type}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(6,24,43,0.62)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 10,
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: meta.color }} />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { TYPE_META as MAP_TYPE_META };
