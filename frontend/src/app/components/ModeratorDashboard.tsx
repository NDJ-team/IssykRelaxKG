import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Users, DollarSign, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getModerationQueue, approveEntity, rejectEntity, listRoles, assignRole, listWithdrawals, approveWithdrawal, rejectWithdrawal } from "../services/moderation";
import type { ModerationQueueItem, RoleResponse, WalletTransactionResponse } from "../types/api";

interface ModeratorDashboardProps {
  onNavigate: (page: string) => void;
}

const TABS = ["Модерация", "Роли", "Вывод средств"];

export function ModeratorDashboard({ onNavigate }: ModeratorDashboardProps) {
  const [tab, setTab] = useState("Модерация");
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [withdrawals, setWithdrawals] = useState<WalletTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState("");
  const [assigningRole, setAssigningRole] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [q, r, w] = await Promise.all([
          getModerationQueue().catch(() => ({ items: [] })),
          listRoles().catch(() => ({ items: [] })),
          listWithdrawals("pending").catch(() => ({ items: [] })),
        ]);
        setQueue(q.items);
        setRoles(r.items);
        setWithdrawals(w.items);
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApprove = async (item: ModerationQueueItem) => {
    try {
      await approveEntity(item.service_type, item.id);
      setQueue((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Одобрено");
    } catch {
      toast.error("Ошибка при одобрении");
    }
  };

  const handleReject = async (item: ModerationQueueItem) => {
    try {
      await rejectEntity(item.service_type, item.id);
      setQueue((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Отклонено");
    } catch {
      toast.error("Ошибка при отклонении");
    }
  };

  const handleAssignRole = async () => {
    if (!assigningUser || !assigningRole) return;
    try {
      await assignRole(assigningUser, assigningRole);
      toast.success("Роль назначена");
      setAssigningUser("");
      setAssigningRole("");
    } catch {
      toast.error("Ошибка при назначении роли");
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      const res = await approveWithdrawal(id);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Вывод одобрен. Баланс: ${res.main_balance.toLocaleString()} Сом`);
    } catch {
      toast.error("Ошибка при одобрении вывода");
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      await rejectWithdrawal(id);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      toast.success("Вывод отклонён");
    } catch {
      toast.error("Ошибка при отклонении вывода");
    }
  };

  const serviceLabels: Record<string, string> = {
    transfer: "Трансфер", tour: "Тур", activity: "Активность", restaurant: "Ресторан", property: "Объявление",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet><title>Модерация | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} style={{ color: "var(--lake-blue)" }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lake-blue)" }}>Модератор</span>
        </div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель модератора</h1>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border flex-shrink-0"
              style={{
                background: tab === t ? "var(--lake-blue)" : "white",
                color: tab === t ? "white" : "var(--text-secondary)",
                borderColor: tab === t ? "var(--lake-blue)" : "var(--border)",
              }}>
              {t === "Модерация" && <CheckCircle size={14} className="inline mr-1" />}
              {t === "Роли" && <UserPlus size={14} className="inline mr-1" />}
              {t === "Вывод средств" && <Wallet size={14} className="inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === "Модерация" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                Очередь на модерацию
                {queue.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "var(--lake-blue)" }}>{queue.length}</span>}
              </h3>
            </div>
            {queue.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет элементов на модерацию</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {queue.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {serviceLabels[item.service_type] || item.service_type} · {new Date(item.created_at).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleApprove(item)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#dcfce7", color: "#16a34a" }}>
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleReject(item)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#fee2e2", color: "#ef4444" }}>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "Роли" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Users size={16} /> Назначить роль
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ID ПОЛЬЗОВАТЕЛЯ</label>
                  <input value={assigningUser} onChange={(e) => setAssigningUser(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>РОЛЬ</label>
                  <select value={assigningRole} onChange={(e) => setAssigningRole(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}>
                    <option value="">Выберите роль</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.slug}>{r.name} ({r.slug})</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAssignRole} disabled={!assigningUser || !assigningRole} className="w-full py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                  Назначить
                </button>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Доступные роли</h3>
              {roles.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Нет ролей</p>
              ) : (
                <div className="space-y-2">
                  {roles.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface)" }}>
                      <div>
                        <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.slug}{r.description ? ` · ${r.description}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Вывод средств" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <DollarSign size={16} style={{ color: "var(--lake-blue)" }} />
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Заявки на вывод средств</h3>
              {withdrawals.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "var(--lake-blue)" }}>{withdrawals.length}</span>}
            </div>
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет заявок на вывод</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {Math.abs(w.amount).toLocaleString()} Сом
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {new Date(w.created_at).toLocaleDateString("ru-RU")} · {w.note || "Нет комментария"}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleApproveWithdrawal(w.id)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#dcfce7", color: "#16a34a" }}>
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleRejectWithdrawal(w.id)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#fee2e2", color: "#ef4444" }}>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
