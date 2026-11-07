import { CheckCircle, X, Zap, Shield, Crown, HelpCircle } from "lucide-react";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

const PLANS = [
  {
    id: "free",
    name: "Бесплатный",
    price: 0,
    period: "",
    icon: Zap,
    color: "var(--text-secondary)",
    description: "Для начала — разместите объект без вложений",
    popular: false,
    features: [
      { text: "1 объявление", included: true },
      { text: "До 10 фото", included: true },
      { text: "Email поддержка", included: true },
      { text: "Базовые фильтры поиска", included: true },
      { text: "Аналитика просмотров", included: false },
      { text: "Верифицированный бейдж", included: false },
      { text: "Приоритет в выдаче", included: false },
      { text: "Реклама на главной", included: false },
      { text: "Рекламные кампании", included: false },
      { text: "Персональный менеджер", included: false },
    ],
  },
  {
    id: "business",
    name: "Бизнес",
    price: 4900,
    period: "/ мес",
    icon: Shield,
    color: "var(--lake-blue)",
    description: "Для активных хозяев, которые хотят больше брони",
    popular: true,
    features: [
      { text: "До 5 объявлений", included: true },
      { text: "До 30 фото на объект", included: true },
      { text: "Приоритетная поддержка 24/7", included: true },
      { text: "Верифицированный бейдж ✓", included: true },
      { text: "Аналитика и статистика", included: true },
      { text: "Приоритет в выдаче", included: true },
      { text: "Показ в топ-10 результатов", included: true },
      { text: "Реклама на главной", included: false },
      { text: "Рекламные кампании", included: false },
      { text: "Персональный менеджер", included: false },
    ],
  },
  {
    id: "premium",
    name: "Премиум",
    price: 9900,
    period: "/ мес",
    icon: Crown,
    color: "var(--sand)",
    description: "Максимальная видимость и все инструменты роста",
    popular: false,
    features: [
      { text: "Неограниченные объявления", included: true },
      { text: "Неограниченные фото", included: true },
      { text: "Поддержка 24/7 + WhatsApp", included: true },
      { text: "Верифицированный бейдж ✓", included: true },
      { text: "Расширенная аналитика + API", included: true },
      { text: "Топ-1 в результатах поиска", included: true },
      { text: "Показ на главной странице", included: true },
      { text: "Баннерные рекламные кампании", included: true },
      { text: "Email и SMS маркетинг", included: true },
      { text: "Персональный менеджер", included: true },
    ],
  },
];

const FAQ = [
  { q: "Можно ли сменить тариф?", a: "Да, вы можете сменить тариф в любой момент. При повышении вы платите разницу пропорционально, при понижении — изменения вступают со следующего месяца." },
  { q: "Есть ли скрытые комиссии?", a: "Нет. Платформа берёт 5% сервисный сбор с каждого бронирования с туриста. Для владельцев — только абонентская плата по тарифу." },
  { q: "Как работает верификация бизнеса?", a: "После оплаты тарифа Бизнес или Премиум наш менеджер свяжется с вами для проверки документов. Процесс занимает 1–3 рабочих дня." },
  { q: "Что будет если я не продлю тариф?", a: "Ваши объявления перейдут на бесплатный тариф с сохранением всех данных. Верифицированный бейдж и приоритет в выдаче будут отключены." },
];

export function PricingPage({ onNavigate }: PricingPageProps) {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Тарифы для владельцев жилья — разместите объект на IssykRelax"
        description="Разместите отель, коттедж, гостевой дом или юрту на IssykRelax — крупнейшем маркетплейсе Иссык-Куля. Бесплатный тариф. Премиум с аналитикой, приоритетом в выдаче, верификацией и продвижением."
        canonical="/pricing"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Тарифы", url: "/pricing" },
        ])}
      />
      {/* Header */}
      <div className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--lake-blue-dark) 0%, var(--lake-blue) 100%)" }}>
        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Тарифы для владельцев</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">
          Разместите объект и начните принимать гостей со всего мира. Первый месяц — бесплатно на любом тарифе.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
          <span className="text-white text-sm">🎉 Специальное предложение: первые 3 месяца на Бизнес — со скидкой 40%</span>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Тарифы" }]} onNavigate={onNavigate} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border p-6 relative flex flex-col"
              style={{
                borderColor: plan.popular ? "var(--lake-blue)" : "var(--border)",
                background: plan.popular ? "var(--lake-blue-light)" : "var(--card)",
                boxShadow: plan.popular ? "0 8px 32px rgba(26,111,168,0.15)" : "none",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: "var(--lake-blue)" }}>
                  Самый популярный
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}20` }}>
                  <plan.icon size={20} style={{ color: plan.color }} />
                </div>
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>{plan.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{plan.description}</div>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {plan.price === 0 ? "Бесплатно" : `${plan.price.toLocaleString()} Сом`}
                </span>
                {plan.period && <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{plan.period}</span>}
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm" style={{ color: f.included ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {f.included ? (
                      <CheckCircle size={15} style={{ color: "var(--turquoise)", flexShrink: 0 }} />
                    ) : (
                      <X size={15} style={{ color: "var(--border)", flexShrink: 0 }} />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate("add-listing")}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{
                  background: plan.popular ? "var(--lake-blue)" : "transparent",
                  color: plan.popular ? "white" : "var(--lake-blue)",
                  border: `1.5px solid var(--lake-blue)`,
                }}
              >
                {plan.price === 0 ? "Начать бесплатно" : "Выбрать план"}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            Подробное сравнение
          </h2>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--surface)" }}>
                  <th className="text-left p-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Функция</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className="p-4 text-center text-sm font-semibold" style={{ color: p.popular ? "var(--lake-blue)" : "var(--text-primary)" }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Количество объявлений", values: ["1", "До 5", "∞"] },
                  { feature: "Фото на объект", values: ["10", "30", "∞"] },
                  { feature: "Комиссия с бронирования", values: ["0%", "0%", "0%"] },
                  { feature: "Приоритет в выдаче", values: ["❌", "✅", "⭐ Топ-1"] },
                  { feature: "Верификация бизнеса", values: ["❌", "✅", "✅"] },
                  { feature: "Аналитика", values: ["Базовая", "Расширенная", "Premium + API"] },
                  { feature: "Поддержка", values: ["Email", "24/7", "Персональный менеджер"] },
                  { feature: "Реклама на главной", values: ["❌", "❌", "✅"] },
                ].map((row, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-4 text-sm" style={{ color: "var(--text-primary)" }}>{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="p-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            Почему владельцы выбирают IssykRelax
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { emoji: "📈", title: "+40% бронирований", desc: "Средний прирост брони у хозяев с тарифом Бизнес по сравнению с бесплатным" },
              { emoji: "🌍", title: "12+ стран", desc: "Туристы из Казахстана, России, Узбекистана и 12 других стран ищут жильё на IssykRelax" },
              { emoji: "💳", title: "Безопасные платежи", desc: "Все транзакции защищены. Деньги поступают на счёт после заезда гостя" },
              { emoji: "📱", title: "Мобильное приложение", desc: "Управляйте бронированиями и получайте уведомления прямо на смартфоне" },
              { emoji: "🛡️", title: "Верификация объекта", desc: "Верифицированный бейдж повышает доверие туристов и увеличивает конверсию на 28%" },
              { emoji: "🎯", title: "Таргетированная реклама", desc: "На Premium тарифе ваш объект показывается целевой аудитории из ваших лучших регионов" },
            ].map((b) => (
              <div key={b.title} className="p-5 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{b.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="p-5 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} style={{ color: "var(--lake-blue)", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>{f.q}</div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{f.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
