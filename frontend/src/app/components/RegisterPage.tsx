import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SEO } from "./SEO";
import { Button } from "./ui/button";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import logotip from "@/assets/logo.png";
import { Home, Car, Compass, Languages, User, Users, Utensils, Mountain, Building2, Bell } from "lucide-react";

interface RegisterPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ROLES = [
  { slug: "tourist", label: "Турист", desc: "Бронировать жильё, туры и услуги", icon: User },
  { slug: "owner", label: "Владелец жилья", desc: "Сдавать недвижимость", icon: Home },
  { slug: "driver", label: "Водитель", desc: "Предоставлять трансферы", icon: Car },
  { slug: "guide", label: "Гид", desc: "Проводить экскурсии и туры", icon: Compass },
  { slug: "translator", label: "Переводчик", desc: "Услуги перевода", icon: Languages },
  { slug: "activity_provider", label: "Организатор активностей", desc: "Развлечения и активный отдых", icon: Mountain },
  { slug: "restaurant_partner", label: "Ресторан", desc: "Партнёр ресторана/кафе", icon: Utensils },
  { slug: "agency", label: "Турагентство", desc: "Пакетные туры", icon: Building2 },
  { slug: "concierge", label: "Консьерж", desc: "Консьерж-сервис", icon: Bell },
];

type RoleSlug = (typeof ROLES)[number]["slug"];

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { registerUser, registerOwner, registerProvider } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleSlug | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Введите имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Введите корректный email";
    if (password.length < 6) errs.password = "Минимум 6 символов";
    if (selectedRole === "owner" && !businessPhone.trim()) errs.businessPhone = "Введите телефон для бизнеса";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setSubmitting(true);
    try {
      if (selectedRole === "tourist") {
        await registerUser({ email, password, full_name: fullName, phone });
      } else if (selectedRole === "owner") {
        await registerOwner({ email, password, full_name: fullName, phone, business_phone: businessPhone });
      } else {
        await registerProvider({ email, password, full_name: fullName, phone, role_slug: selectedRole! });
      }
      onNavigate("landing");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка регистрации";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const roleDescription = ROLES.find((r) => r.slug === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--surface)" }}>
      <SEO title="Регистрация" description="Создайте аккаунт на IssykRelax — крупнейшем маркетплейсе отдыха на Иссык-Куле, Кыргызстан." canonical="/register" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto p-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Регистрация" }]} onNavigate={onNavigate} />
        <div className="text-center mb-6">
          <button onClick={() => onNavigate("landing")} className="inline-flex items-center gap-2 mb-4">
            <img src={logotip} alt="IssykRelax" className="h-8 w-auto" />
            <span className="font-bold text-lg" style={{ color: "var(--lake-blue)" }}>IssykRelax</span>
          </button>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Регистрация</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Выберите роль и создайте аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const selected = selectedRole === role.slug;
              return (
                <button
                  key={role.slug}
                  type="button"
                  onClick={() => { setSelectedRole(role.slug); setFieldErrors({}); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all"
                  style={{
                    borderColor: selected ? "var(--lake-blue)" : "var(--border)",
                    background: selected ? "var(--lake-blue-light)" : "white",
                  }}
                >
                  <Icon size={20} style={{ color: selected ? "var(--lake-blue)" : "var(--text-secondary)" }} />
                  <span className="text-xs font-medium" style={{ color: selected ? "var(--lake-blue)" : "var(--text-primary)" }}>{role.label}</span>
                </button>
              );
            })}
          </div>

          {selectedRole && (
            <p className="text-xs text-center -mt-2 mb-2" style={{ color: "var(--text-secondary)" }}>
              {roleDescription?.desc}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Имя</label>
            <input type="text" required value={fullName} onChange={(e) => { setFullName(e.target.value); setFieldErrors((prev) => ({ ...prev, fullName: "" })); }} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: fieldErrors.fullName ? "#ef4444" : "var(--border)" }} placeholder="Ваше имя" />
            {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Телефон</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "var(--border)" }} placeholder="+996 XXX XXX XXX" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Email</label>
            <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })); }} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: fieldErrors.email ? "#ef4444" : "var(--border)" }} placeholder="email@example.com" />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Пароль</label>
            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: fieldErrors.password ? "#ef4444" : "var(--border)" }} placeholder="Минимум 6 символов" />
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          {selectedRole === "owner" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Телефон для бизнеса</label>
              <input type="tel" required value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "var(--border)" }} placeholder="+996 XXX XXX XXX" />
              {fieldErrors.businessPhone && <p className="text-xs text-red-500 mt-1">{fieldErrors.businessPhone}</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={submitting || !selectedRole} className="w-full py-3" style={{ background: submitting || !selectedRole ? "var(--text-secondary)" : "var(--lake-blue)" }}>
            {submitting ? "Загрузка..." : "Зарегистрироваться"}
          </Button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--text-secondary)" }}>
          Уже есть аккаунт?{" "}
          <button onClick={() => onNavigate("login")} className="font-medium" style={{ color: "var(--lake-blue)" }}>
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}
