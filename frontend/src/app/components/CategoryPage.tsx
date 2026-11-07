import { useState, useEffect } from "react";
import { MapPin, ArrowLeft, Star, Home, Search, Utensils, Compass, Mountain, Users, Bed } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { getCategories, getProperties } from "../services/properties";
import type { CategoryResponse, PropertyResponse } from "../types/api";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  cottage: "Уютные коттеджи на берегу Иссык-Куля — идеальный выбор для семьи или компании друзей. Собственная территория, мангал, парковка и все удобства для незабываемого отдыха.",
  guesthouse: "Гостевые дома с домашней атмосферой и радушным приёмом. Вкусная еда, уютные номера и близость к пляжу — то, что нужно для спокойного отпуска.",
  hotel: "Отели и гостиницы любого уровня — от бюджетных до люксовых. Полный спектр услуг: рестораны, бассейны, спа, конференц-залы.",
  yurt: "Жизнь в настоящей юрте — уникальный опыт погружения в кочевую культуру кыргызов. Комфорт внутри, звёздное небо снаружи.",
  hostel: "Бюджетное размещение для путешественников. Общие и приватные комнаты, кухня, общая гостиная — всё для комфортного отдыха без лишних трат.",
  villa: "Элитные виллы с частным бассейном, сауной и собственной территорией. Премиальный отдых на Иссык-Куле для самых взыскательных гостей.",
  "resort": "Курортные комплексы с развитой инфраструктурой: бассейны, рестораны, анимация, спа-центры. Всё включено для беззаботного отпуска.",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cottage: <Home size={24} />,
  guesthouse: <Home size={24} />,
  hotel: <Star size={24} />,
  yurt: <Compass size={24} />,
  hostel: <Users size={24} />,
  villa: <Star size={24} />,
  resort: <Mountain size={24} />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  cottage: "linear-gradient(135deg, #065f46, #10b981)",
  guesthouse: "linear-gradient(135deg, #b45309, #f59e0b)",
  hotel: "linear-gradient(135deg, #1e3a5f, #3b82f6)",
  yurt: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  hostel: "linear-gradient(135deg, #0e7490, #22d3ee)",
  villa: "linear-gradient(135deg, #be123c, #fb7185)",
  resort: "linear-gradient(135deg, #047857, #34d399)",
};

interface CategoryPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  categorySlug?: string;
  initialCategory?: CategoryResponse | null;
  initialProperties?: PropertyResponse[];
}

export function CategoryPage({ onNavigate, categorySlug, initialCategory, initialProperties }: CategoryPageProps) {
  const [category, setCategory] = useState<CategoryResponse | null>(initialCategory ?? null);
  const [properties, setProperties] = useState<PropertyResponse[]>(initialProperties || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const catName = category?.name || categorySlug || "Категория";
  const slug = categorySlug || "";
  const description = CATEGORY_DESCRIPTIONS[slug] || category?.description || `Лучшие ${catName.toLowerCase()} на Иссык-Куле, Кыргызстан`;

  const gradient = CATEGORY_GRADIENTS[slug] || "linear-gradient(135deg, #0c4a6e 0%, var(--turquoise) 100%)";
  const categoryIcon = CATEGORY_ICONS[slug] || <Home size={24} />;

  useEffect(() => {
    if (!slug) return;
    if (initialCategory && initialProperties) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const cats = await getCategories();
        const matched = cats.find((c) => c.slug === slug);
        if (matched) {
          setCategory(matched);
          const res = await getProperties({ category_id: matched.id, limit: "50" });
          setProperties(res.items);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const filtered = search
    ? properties.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.city?.name || "").toLowerCase().includes(search.toLowerCase())
      )
    : properties;

  const avgPrice = properties.length > 0
    ? Math.round(properties.reduce((s, p) => s + p.price_per_night, 0) / properties.length)
    : 0;

  const cities = [...new Set(properties.map((p) => p.city?.name).filter(Boolean))];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title={`${catName} на Иссык-Куле — бронирование, цены, отзывы`}
        description={`${description.slice(0, 160)} ${properties.length > 0 ? `${properties.length} вариантов. Средняя цена: ${avgPrice} сом/ночь.` : ""} Бронируйте онлайн на IssykRelax.`}
        canonical={`/category/${slug}`}
        image={properties[0]?.images?.[0]}
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: catName, url: `/category/${slug}` },
        ])}
      />

      <div className="py-14 px-4" style={{ background: gradient }}>
        <div className="max-w-7xl mx-auto text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white/80">{categoryIcon}</span>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {catName}
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">{description}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            {properties.length > 0 && (
              <>
                <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-white/70">ВАРИАНТОВ</div>
                  <div className="font-bold">{properties.length}</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-white/70">СРЕДНЯЯ ЦЕНА</div>
                  <div className="font-bold">{avgPrice.toLocaleString()} сом/ночь</div>
                </div>
                {cities.length > 0 && (
                  <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
                    <div className="text-xs font-semibold text-white/70">ГОРОДА</div>
                    <div className="font-bold">{cities.length}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: `${catName}` }]} onNavigate={onNavigate} />

        {properties.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <Search size={18} style={{ color: "var(--lake-blue)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Поиск среди ${catName.toLowerCase()}...`}
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <Home size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Нет объявлений в этой категории</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {search ? "Попробуйте изменить поиск" : "Попробуйте поискать в других категориях."}
            </p>
            <button onClick={() => onNavigate("search")} className="text-sm font-medium" style={{ color: "var(--lake-blue)" }}>
              Поискать всё жильё
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Найдено {filtered.length} {catName.toLowerCase()}
              {cities.length > 0 && ` в ${cities.length} городах`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing) => (
                <button
                  key={listing.id}
                  onClick={() => onNavigate("property", { property_id: listing.id })}
                  className="group text-left rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="relative overflow-hidden" style={{ height: 200 }}>
                    <ImgWithFallback src={listing.images?.[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90">
                      {listing.price_per_night.toLocaleString()} Сом / ночь
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-snug mb-1" style={{ color: "var(--text-primary)" }}>{listing.title}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin size={12} style={{ color: "var(--text-secondary)" }} />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{listing.city?.name || "Иссык-Куль"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span><Bed size={11} className="inline mr-1" />{listing.bedrooms} спальни</span>
                      <span><Users size={11} className="inline mr-1" />до {listing.max_guests} гостей</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
