import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SEO } from "./SEO";
import { Button } from "./ui/button";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import logotip from "@/assets/logo.png";

interface LoginPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Введите корректный email";
    if (password.length < 6) errs.password = "Минимум 6 символов";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      onNavigate("landing");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка входа";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--surface)" }}>
      <SEO title="Вход" description="Войдите в аккаунт IssykRelax, чтобы управлять бронированиями, избранным и настройками на крупнейшем маркетплейсе отдыха на Иссык-Куле." canonical="/login" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-8">
        <PageBreadcrumbs items={[{ name: "Главная", page: "landing" }, { name: "Вход" }]} onNavigate={onNavigate} />
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("landing")} className="inline-flex items-center gap-2 mb-4">
            <img src={logotip} alt="IssykRelax" className="h-8 w-auto" />
            <span className="font-bold text-lg" style={{ color: "var(--lake-blue)" }}>IssykRelax</span>
          </button>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Вход</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Добро пожаловать!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })); }}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: fieldErrors.email ? "#ef4444" : "var(--border)" }}
              placeholder="email@example.com"
            />
            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{ borderColor: fieldErrors.password ? "#ef4444" : "var(--border)" }}
              placeholder="Минимум 6 символов"
            />
            {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full py-3" style={{ background: submitting ? "var(--text-secondary)" : "var(--lake-blue)" }}>
            {submitting ? "Загрузка..." : "Войти"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => setShowForgot(true)} className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Забыли пароль?
          </button>
        </div>

        <p className="text-sm text-center mt-6" style={{ color: "var(--text-secondary)" }}>
          Нет аккаунта?{" "}
          <button onClick={() => onNavigate("register")} className="font-medium" style={{ color: "var(--lake-blue)" }}>
            Зарегистрироваться
          </button>
        </p>

        <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} onBack={() => setShowForgot(false)} />
      </div>
    </div>
  );
}
