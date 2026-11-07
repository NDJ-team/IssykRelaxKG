import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { toast } from "sonner";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../services/admin";
import type { WithdrawalResponse } from "../types/api";

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Ожидание" },
  completed: { color: "#22c55e", bg: "#dcfce7", label: "Одобрено" },
  failed: { color: "#ef4444", bg: "#fee2e2", label: "Отклонено" },
};

export function FinancePanel() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  async function load() {
    try {
      const data = await getWithdrawals(filter);
      setWithdrawals(data.items);
    } catch {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await approveWithdrawal(id);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      toast.success("Вывод одобрен");
    } catch {
      toast.error("Ошибка при одобрении");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectWithdrawal(id);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      toast.success("Вывод отклонён");
    } catch {
      toast.error("Ошибка при отклонении");
    }
  };

  const totalPending = withdrawals.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ожидают", value: totalPending, color: "#f59e0b" },
          { label: "Всего заявок", value: withdrawals.length, color: "var(--lake-blue)" },
          { label: "Сумма ожидает", value: `${withdrawals.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0).toLocaleString()} Сом`, color: "var(--turquoise)" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={14} style={{ color: s.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {["pending", "completed", "failed"].map((s) => {
          const st = STATUS_STYLES[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
              style={{
                background: filter === s ? st.color : "white",
                color: filter === s ? "white" : st.color,
                borderColor: filter === s ? st.color : st.color,
              }}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-sm" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--text-secondary)" }}>
          Нет заявок на вывод
        </div>
      ) : (
        <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--surface)" }}>
                {["ID", "Кошелёк", "Сумма", "Статус", "Дата", "Действия"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const sc = STATUS_STYLES[w.status] || { color: "var(--text-secondary)", bg: "var(--surface)", label: w.status };
                return (
                  <tr key={w.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-4 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>#{w.id.slice(0, 8)}</td>
                    <td className="p-4 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{w.wallet_id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{w.amount.toLocaleString()} Сом</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td className="p-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(w.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-4">
                      {w.status === "pending" && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleApprove(w.id)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#dcfce7", color: "#16a34a" }} title="Одобрить">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => handleReject(w.id)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#fee2e2", color: "#ef4444" }} title="Отклонить">
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
