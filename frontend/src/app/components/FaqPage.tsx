import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface FaqPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const FAQS = [
  {
    q: "Что такое IssykRelax?",
    a: "IssykRelax — крупнейший маркетплейс отдыха на озере Иссык-Куль, Кыргызстан. Мы помогаем путешественникам находить и бронировать жильё (отели, коттеджи, юрты, гостевые дома), туры и экскурсии, рестораны. Владельцам мы предоставляем инструменты для управления объектами и привлечения гостей.",
  },
  {
    q: "Как забронировать жильё на Иссык-Куле?",
    a: "Найдите подходящий объект через поиск по городу, категории или используйте текстовый поиск. Выберите даты и количество гостей, нажмите «Забронировать». После оплаты вы получите подтверждение на email. Бронирование можно отменить бесплатно за 48 часов до заезда.",
  },
  {
    q: "Какие способы оплаты принимаются?",
    a: "На платформе доступна оплата банковскими картами Visa, Mastercard и Элкарт. Все платежи защищены. Средства зачисляются владельцу после подтверждения заезда гостя.",
  },
  {
    q: "Как владельцу разместить объект на IssykRelax?",
    a: "Зарегистрируйтесь как владелец, заполните информацию об объекте (фото, описание, цены, удобства), укажите календарь доступности. После модерации объект появится в поиске. Доступен бесплатный тариф для начала работы.",
  },
  {
    q: "Сколько стоит размещение для владельцев?",
    a: "Мы предлагаем три тарифа: Бесплатный (1 объявление, базовые функции), Бизнес (4900 сом/мес, верификация, аналитика, приоритет) и Премиум (9900 сом/мес, реклама, персональный менеджер). Первый месяц бесплатно на любом тарифе.",
  },
  {
    q: "Как отменить бронирование?",
    a: "Отменить бронирование можно в личном кабинете в разделе «Мои бронирования». Бесплатная отмена за 48 часов до заезда. При отмене менее чем за 48 часов взимается штраф в размере одной ночи.",
  },
  {
    q: "Какие города на Иссык-Куле самые популярные?",
    a: "Самые популярные курорты на Иссык-Куле: Чолпон-Ата (центр туризма, пляжи, развлечения), Бостери (элитные коттеджи, рестораны), Кара-Ой (тихий отдых, юрты), Чок-Тал (дикая природа), Тамчы (бюджетный отдых). Также популярны: Бактуу-Долоноту, Сары-Ой и Корумды.",
  },
  {
    q: "Что можно делать на Иссык-Куле кроме пляжного отдыха?",
    a: "Иссык-Куль предлагает множество активностей: конные прогулки в Тянь-Шань, парусные прогулки по озеру, джип-сафари в ущелья, треккинг, парапланеризм, рыбалка, экскурсии к водопадам и горячим источникам, посещение древних петроглифов.",
  },
  {
    q: "Как добраться до Иссык-Куля?",
    a: "Из Бишкека до Чолпон-Аты около 4 часов на машине (270 км). Также ходят такси и автобусы от автовокзала «Западный». Международные туристы прилетают в Бишкек (аэропорт «Манас»), далее трансфер до Иссык-Куля.",
  },
  {
    q: "Когда лучше ехать на Иссык-Куль?",
    a: "Купальный сезон длится с июня по сентябрь. Пик сезона — июль и август (вода +22..+24°C). Май и сентябрь подходят для экскурсий и активного отдыха, меньше туристов и ниже цены.",
  },
];

export function FaqPage({ onNavigate }: FaqPageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <SEO
        title="Часто задаваемые вопросы — IssykRelax, Иссык-Куль"
        description="Ответы на частые вопросы об отдыхе на Иссык-Куле, Кыргызстан. Бронирование жилья, туров, ресторанов. Как зарегистрироваться, разместить объект, оплатить и отменить бронь."
        canonical="/faq"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "FAQ", url: "/faq" },
        ])}
      />
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, var(--lake-blue-dark) 0%, var(--lake-blue) 100%)" }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Часто задаваемые вопросы</h1>
          <p className="text-white/80">Всё, что нужно знать об отдыхе на Иссык-Куле и работе с IssykRelax</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-3">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "FAQ" }]} onNavigate={onNavigate} />
        {FAQS.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border overflow-hidden transition-all" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-sm pr-4" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
              <ChevronDown
                size={18}
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--text-secondary)",
                  transform: openIdx === idx ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
