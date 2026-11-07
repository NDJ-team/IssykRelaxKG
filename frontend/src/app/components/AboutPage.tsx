import { Heart, Shield, Users, Globe } from "lucide-react";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface AboutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const values = [
    { icon: Heart, title: "Забота о каждом", desc: "Мы лично проверяем каждое жильё, чтобы вы чувствовали себя как дома." },
    { icon: Shield, title: "Безопасная бронь", desc: "Все платежи защищены, а подтверждение бронирования происходит в один клик." },
    { icon: Users, title: "Для всех", desc: "От семей с детьми до больших компаний — у нас есть жильё на любой вкус." },
    { icon: Globe, title: "Иссык-Куль — ближе", desc: "Мы объединяем путешественников и владельцев жилья на одном озере." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="О компании IssykRelax — маркетплейс отдыха на Иссык-Куле"
        description="IssykRelax — крупнейший маркетплейс отдыха на Иссык-Куле, Кыргызстан. Узнайте, как мы помогаем путешественникам находить лучшие варианты жилья, туров, ресторанов и бронировать онлайн."
        canonical="/about"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "О нас", url: "/about" },
        ])}
      />
      <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "О нас" }]} onNavigate={onNavigate} />
      <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "var(--text-primary)" }}>О нас</h1>
      <p className="text-center mb-12" style={{ color: "var(--text-secondary)" }}>
        IssykRelax — это ваш проводник в мир отдыха на озере Иссык-Куль
      </p>

      <div className="rounded-2xl border overflow-hidden mb-12" style={{ borderColor: "var(--border)" }}>
        <div className="p-6 sm:p-10" style={{ background: "var(--card)" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Кто мы</h2>
          <div className="space-y-4" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
            <p>
              IssykRelax — это современная платформа для бронирования жилья на побережье озера Иссык-Куль.
              Мы объединяем отели, курорты, коттеджи и юрт-кемпинги в одном месте, чтобы вы могли легко
              найти идеальный вариант для отдыха.
            </p>
            <p>
              Наша команда состоит из местных экспертов, которые знают каждый уголок побережья.
              Мы помогаем владельцам жилья находить гостей, а путешественникам — наслаждаться
              лучшим сервисом без лишних хлопот.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-center mb-6" style={{ color: "var(--text-primary)" }}>Наши ценности</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {values.map((v) => (
          <div key={v.title} className="rounded-xl border p-5 transition-colors hover:shadow-md" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--lake-blue-light)" }}>
              <v.icon size={20} style={{ color: "var(--lake-blue)" }} />
            </div>
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{v.title}</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>Готовы найти идеальное жильё?</p>
        <button
          onClick={() => onNavigate("search")}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "var(--lake-blue)" }}
        >
          Начать поиск
        </button>
      </div>
    </div>
  );
}
