import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface PrivacyPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Политика конфиденциальности — IssykRelax, Иссык-Куль"
        description="Политика конфиденциальности IssykRelax — крупнейшего маркетплейса отдыха на Иссык-Куле, Кыргызстан. Как мы собираем, используем и защищаем ваши персональные данные."
        canonical="/privacy"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Политика конфиденциальности", url: "/privacy" },
        ])}
      />
      <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Политика конфиденциальности" }]} onNavigate={onNavigate} />
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Политика конфиденциальности</h1>

      <div className="prose prose-sm max-w-none space-y-6" style={{ color: "var(--text-secondary)" }}>
        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>1. Общие положения</h2>
          <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сервиса IssykRelax (далее — «Сервис»), расположенного на домене issykrelax.kg.</p>
          <p>Используя Сервис, пользователь выражает свое согласие с условиями настоящей Политики конфиденциальности. Если пользователь не согласен с условиями, он должен прекратить использование Сервиса.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>2. Собираемые данные</h2>
          <p>Мы собираем следующие категории данных:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Персональные данные: имя, номер телефона, адрес электронной почты;</li>
            <li>Данные о бронированиях: даты заезда и выезда, количество гостей, предпочтения;</li>
            <li>Технические данные: IP-адрес, тип браузера, данные cookie, страницы посещения;</li>
            <li>Для владельцев: бизнес-телефон, реквизиты, информация об объектах размещения.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>3. Цель сбора данных</h2>
          <p>Мы используем собранные данные для:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Обеспечения работы Сервиса (поиск, бронирование, оплата);</li>
            <li>Связи с пользователем по вопросам бронирования;</li>
            <li>Улучшения качества услуг и персонализации рекомендаций;</li>
            <li>Аналитики и статистики использования Сервиса;</li>
            <li>Информирования о специальных предложениях (с согласия пользователя).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>4. Защита данных</h2>
          <p>Мы принимаем необходимые организационные и технические меры для защиты персональных данных пользователей от несанкционированного доступа, изменения, раскрытия или уничтожения. Все данные передаются по защищённому протоколу HTTPS.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>5. Передача данных третьим лицам</h2>
          <p>Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Кыргызской Республики, или когда это необходимо для исполнения договора (например, передача данных владельцу объекта размещения для подтверждения бронирования).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>6. Cookie-файлы</h2>
          <p>Сервис использует cookie-файлы для обеспечения работы, аналитики и персонализации. Пользователь может отключить cookie в настройках браузера, но это может повлиять на функциональность Сервиса.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>7. Права пользователя</h2>
          <p>Пользователь имеет право:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Запросить информацию о своих персональных данных;</li>
            <li>Требовать исправления или удаления своих данных;</li>
            <li>Отозвать согласие на обработку данных;</li>
            <li>Удалить свой аккаунт через личный кабинет.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>8. Контакты</h2>
          <p>По вопросам, связанным с обработкой персональных данных, обращайтесь по адресу: hello@issyk-kul.kg</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>9. Изменения политики</h2>
          <p>Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Актуальная версия всегда доступна по адресу https://issykrelax.kg/privacy.</p>
        </section>

        <p className="text-xs mt-8" style={{ color: "var(--text-secondary)" }}>Последнее обновление: 20 июня 2026 года. г. Чолпон-Ата, Иссык-Куль, Кыргызстан.</p>
      </div>
    </div>
  );
}
