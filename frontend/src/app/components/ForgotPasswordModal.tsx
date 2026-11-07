import { useState } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword } from "../services/api";
import { Button } from "./ui/button";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function ForgotPasswordModal({ open, onClose, onBack }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      return;
    }
    setError("");
    setEmailError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Инструкции отправлены на email");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative custom-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
          <X size={20} />
        </button>

        {!sent ? (
          <>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--lake-blue-light)" }}>
              <Mail size={22} style={{ color: "var(--lake-blue)" }} />
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Восстановление пароля
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Введите email, мы отправим инструкции по сбросу пароля
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: emailError ? "#ef4444" : "var(--border)" }}
                  placeholder="email@example.com"
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
                style={{ background: submitting ? "var(--text-secondary)" : "var(--lake-blue)" }}
              >
                {submitting ? "Отправка..." : "Отправить"}
              </Button>
            </form>

            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm mt-4 mx-auto"
              style={{ color: "var(--lake-blue)" }}
            >
              <ArrowLeft size={14} />
              Вернуться ко входу
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#dcfce7" }}>
              <Mail size={22} style={{ color: "#16a34a" }} />
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Проверьте почту
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Если аккаунт с email <strong>{email}</strong> существует, мы отправили инструкции по восстановлению пароля.
            </p>
            <Button onClick={onClose} className="w-full" style={{ background: "var(--lake-blue)" }}>
              Понятно
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
