import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { apiRequest } from "../services/api";
import { SEO } from "./SEO";
import { breadcrumbSchema } from "../lib/schemas";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface FeedbackPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function FeedbackPage({ onNavigate }: FeedbackPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/feedback", {
        method: "POST",
        body: { name, email, message },
      });
      setSent(true);
    } catch {
      setError("Не удалось отправить сообщение. Попробуйте позже.");
    }
  };

  const contacts = [
    { icon: Mail, label: "Email", value: "hello@issyk-kul.kg" },
    { icon: Phone, label: "Телефон", value: "+996 700 123 456" },
    { icon: MapPin, label: "Адрес", value: "г. Чолпон-Ата, ул. Советская 12" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Контакты и обратная связь — IssykRelax, Иссык-Куль"
        description="Свяжитесь с командой IssykRelax — крупнейшего маркетплейса отдыха на Иссык-Куле, Кыргызстан. Задайте вопрос, оставьте отзыв или предложение. Email, телефон, адрес в Чолпон-Ате."
        canonical="/feedback"
        jsonLd={breadcrumbSchema([
          { name: "Главная", url: "/" },
          { name: "Обратная связь", url: "/feedback" },
        ])}
      />
      <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Обратная связь" }]} onNavigate={onNavigate} />
      <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "var(--text-primary)" }}>Обратная связь</h1>
      <p className="text-center mb-12" style={{ color: "var(--text-secondary)" }}>
        Есть вопрос или предложение? Напишите нам!
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Напишите нам</h2>
          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--lake-blue-light)" }}>
                <Send size={24} style={{ color: "var(--lake-blue)" }} />
              </div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Сообщение отправлено!</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Мы ответим в ближайшее время.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Имя</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Сообщение</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none"
                  style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                  placeholder="Напишите ваш вопрос или пожелание..."
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "var(--lake-blue)" }}
              >
                <MessageSquare size={16} /> Отправить
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Контакты</h2>
          {contacts.map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--lake-blue-light)" }}>
                <c.icon size={18} style={{ color: "var(--lake-blue)" }} />
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{c.label}</div>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
