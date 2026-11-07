import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface TermsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Условия использования — IssykRelax, Иссык-Куль"
        description="Условия использования сервиса IssykRelax — крупнейшего маркетплейса отдыха на Иссык-Куле, Кыргызстан. Правила бронирования, отмены, размещения объектов и ответственности сторон."
        canonical="/terms"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Условия использования", url: "/terms" },
        ])}
      />
      <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Условия использования" }]} onNavigate={onNavigate} />
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Условия использования</h1>

      <div className="prose prose-sm max-w-none space-y-6" style={{ color: "var(--text-secondary)" }}>
        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>1. Термины и определения</h2>
          <p>IssykRelax — онлайн-платформа для поиска и бронирования объектов размещения, туров, экскурсий и ресторанов на озере Иссык-Куль, Кыргызстан.</p>
          <p>Пользователь — физическое лицо, использующее Сервис для поиска и бронирования.</p>
          <p>Владелец — пользователь, размещающий объекты размещения на платформе.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>2. Предмет соглашения</h2>
          <p>Настоящее Соглашение регулирует отношения между IssykRelax и пользователем по поводу использования платформы. IssykRelax выступает как посредник между гостями и владельцами объектов размещения.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>3. Регистрация и аккаунт</h2>
          <p>Для бронирования и размещения объектов необходима регистрация. Пользователь обязуется предоставлять достоверную информацию. Аккаунт не может быть передан третьим лицам. Владелец аккаунта несёт ответственность за все действия, совершённые под его учётной записью.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>4. Бронирование и оплата</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Бронирование считается подтверждённым после оплаты и получения подтверждения;</li>
            <li>Цены указываются в сомах (KGS) и включают НДС, если не указано иное;</li>
            <li>Сервисный сбор платформы составляет 5% от стоимости бронирования;</li>
            <li>Отмена бронирования возможна за 48 часов до заезда без штрафа;</li>
            <li>При отмене менее чем за 48 часов взимается штраф в размере одной ночи.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>5. Размещение объектов</h2>
          <p>Владельцы объектов обязуются:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Предоставлять точную информацию об объекте (фото, описание, удобства);</li>
            <li>Поддерживать актуальность календаря и цен;</li>
            <li>Подтверждать бронирования в течение 24 часов;</li>
            <li>Обеспечивать гостей качественным сервисом согласно описанию.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>6. Ответственность</h2>
          <p>IssykRelax не несёт ответственности за:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Качество услуг, предоставляемых владельцами объектов;</li>
            <li>Несоответствие описания объекта реальному состоянию;</li>
            <li>Убытки, связанные с форс-мажорными обстоятельствами;</li>
            <li>Действия третьих лиц.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>7. Интеллектуальная собственность</h2>
          <p>Все материалы платформы (тексты, изображения, дизайн, логотипы) являются интеллектуальной собственностью IssykRelax. Использование материалов без письменного согласия запрещено.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>8. Заключительные положения</h2>
          <p>Споры решаются в соответствии с законодательством Кыргызской Республики по месту нахождения платформы (г. Чолпон-Ата). Признание недействительным какого-либо положения не влечёт недействительность остальных положений.</p>
        </section>

        <p className="text-xs mt-8" style={{ color: "var(--text-secondary)" }}>Последнее обновление: 20 июня 2026 года. IssykRelax, Иссык-Куль, Кыргызстан.</p>
      </div>
    </div>
  );
}
