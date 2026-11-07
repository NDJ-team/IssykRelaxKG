import { useState, useEffect } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Home, DollarSign, Shield, TrendingUp, AlertCircle, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getAdminStats, getAdminOwners, getAdminProperties, getAdminBookings, approveOwner, approveProperty } from "../services/admin";
import type { AdminStatsResponse, AdminOwnerResponse, AdminPropertyResponse, AdminBookingResponse } from "../types/api";
import { AdminBookingDetailModal, AdminPropertyDetailModal, AdminOwnerDetailModal } from "./AdminDetailModals";
import { FinancePanel } from "./FinancePanel";

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

const TABS = ["Дашборд", "Владельцы", "Объявления", "Бронирования", "Финансы"];

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#f59e0b", bg: "#fef3c7", label: "Ожидание" },
  paid: { color: "#22c55e", bg: "#dcfce7", label: "Оплачено" },
  checked_in: { color: "var(--lake-blue)", bg: "var(--lake-blue-light)", label: "Заселён" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", label: "Отменён" },
};

function computePieData(properties: AdminPropertyResponse[]) {
  const total = properties.length || 1;
  const active = properties.filter((p) => p.status === "published" && p.is_active).length;
  const pending = properties.filter((p) => p.status === "draft").length;
  const inactive = total - active - pending;
  return [
    { name: "Активные", value: Math.round((active / total) * 100), color: "var(--lake-blue)" },
    { name: "На проверке", value: Math.round((pending / total) * 100), color: "#f59e0b" },
    { name: "Неактивные", value: Math.round((inactive / total) * 100), color: "#64748b" },
  ];
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [tab, setTab] = useState("Дашборд");
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [owners, setOwners] = useState<AdminOwnerResponse[]>([]);
  const [properties, setProperties] = useState<AdminPropertyResponse[]>([]);
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
  const [detailPropertyId, setDetailPropertyId] = useState<string | null>(null);
  const [detailOwnerId, setDetailOwnerId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, o, p, b] = await Promise.all([
          getAdminStats(),
          getAdminOwners({ limit: 50 }),
          getAdminProperties({ limit: 50 }),
          getAdminBookings({ limit: 50 }),
        ]);
        setStats(s);
        setOwners(o.items);
        setProperties(p.items);
        setBookings(b.items);
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApproveOwner = async (id: string) => {
    try {
      await approveOwner(id);
      setOwners((prev) => prev.map((o) => (o.id === id ? { ...o, is_approved: true } : o)));
      toast.success("Владелец одобрен");
    } catch {
      toast.error("Ошибка при одобрении владельца");
    }
  };

  const handleApproveProperty = async (id: string) => {
    try {
      await approveProperty(id);
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status: "published" } : p)));
      toast.success("Объявление опубликовано");
    } catch {
      toast.error("Ошибка при публикации объявления");
    }
  };

  const pendingProperties = properties.filter((p) => p.status === "draft");
  const pendingOwners = owners.filter((o) => !o.is_approved);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  const statsCards = [
    { label: "Всего пользователей", value: stats?.total_users.toLocaleString() || "—", delta: "в системе", icon: Users, color: "var(--lake-blue)" },
    { label: "Владельцев", value: stats?.total_owners.toLocaleString() || "—", delta: "зарегистрировано", icon: Shield, color: "var(--turquoise)" },
    { label: "Объявлений", value: stats?.total_properties.toLocaleString() || "—", delta: "всего", icon: Home, color: "#7c3aed" },
    { label: "Доход платформы", value: stats ? `${stats.total_revenue.toLocaleString()} Сом` : "—", delta: "комиссии", icon: DollarSign, color: "var(--sand)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet>
        <title>Панель администратора | IssykRelax</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} style={{ color: "var(--lake-blue)" }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lake-blue)" }}>Администратор</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель администратора</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#ef4444" }}>
                {pendingProperties.length + pendingOwners.length}
              </div>
              <button className="p-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "white" }}>
                <AlertCircle size={18} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 border"
              style={{
                background: tab === t ? "var(--lake-blue)" : "white",
                color: tab === t ? "white" : "var(--text-secondary)",
                borderColor: tab === t ? "var(--lake-blue)" : "var(--border)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((s) => (
            <div key={s.label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <TrendingUp size={14} style={{ color: "#22c55e" }} />
              </div>
              <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
              <div className="text-xs mt-1" style={{ color: "#22c55e" }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {tab === "Дашборд" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Общая статистика</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Бронирований", value: stats?.total_bookings || 0 },
                    { label: "Пользователей", value: stats?.total_users || 0 },
                    { label: "Владельцев", value: stats?.total_owners || 0 },
                    { label: "Объектов", value: stats?.total_properties || 0 },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                      <div className="text-2xl font-bold" style={{ color: "var(--lake-blue)" }}>{s.value}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Объявления по статусу</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={computePieData(properties)} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}%`}>
                      {computePieData(properties).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {(pendingProperties.length > 0 || pendingOwners.length > 0) && (
              <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                  <AlertCircle size={16} style={{ color: "#f59e0b" }} />
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Ожидают одобрения</h3>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "var(--lake-blue)" }}>
                    {pendingProperties.length + pendingOwners.length}
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {pendingOwners.map((o) => (
                    <div key={o.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{o.full_name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{o.email} · Владелец (ожидает подтверждения)</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleApproveOwner(o.id); }} className="p-1.5 rounded-lg transition-colors" style={{ background: "#dcfce7", color: "#16a34a" }}>
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingProperties.map((p) => (
                    <div key={p.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.owner_name} · {p.category} · {p.city}</div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApproveProperty(p.id)} className="p-1.5 rounded-lg transition-colors" style={{ background: "#dcfce7", color: "#16a34a" }}>
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats?.role_counts && stats.role_counts.length > 0 && (
              <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Распределение по ролям</h3>
                </div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {stats.role_counts.map((r) => (
                    <div key={r.slug} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.slug}</div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "var(--lake-blue)" }}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Владельцы" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Владельцы</h3>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <Search size={14} style={{ color: "var(--text-secondary)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." className="flex-1 outline-none bg-transparent text-sm" style={{ color: "var(--text-primary)" }} />
              </div>
            </div>
            {owners.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет владельцев</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface)" }}>
                    {["Имя", "Email", "Телефон", "Статус", "Действия"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {owners.filter((o) => !search || o.full_name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase())).map((o) => (
                    <tr key={o.id} className="border-t hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: "var(--border)" }} onClick={() => setDetailOwnerId(o.id)}>
                      <td className="p-4"><div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{o.full_name}</div></td>
                      <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{o.email}</td>
                      <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{o.phone || "—"}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                          background: o.is_approved ? "#dcfce7" : "#fef3c7",
                          color: o.is_approved ? "#16a34a" : "#f59e0b",
                        }}>
                          {o.is_approved ? "Одобрен" : "На проверке"}
                        </span>
                      </td>
                      <td className="p-4">
                        {!o.is_approved && (
                          <button onClick={(e) => { e.stopPropagation(); handleApproveOwner(o.id); }} className="p-1.5 rounded-lg" style={{ background: "#dcfce7", color: "#16a34a" }}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "Объявления" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Объявления</h3>
            </div>
            {properties.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет объявлений</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface)" }}>
                    {["Название", "Владелец", "Категория", "Город", "Цена", "Статус", "Действия"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: "var(--border)" }} onClick={() => setDetailPropertyId(p.id)}>
                      <td className="p-4"><div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</div></td>
                      <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.owner_name}</td>
                      <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.category}</td>
                      <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{p.city}</td>
                      <td className="p-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.price_per_night.toLocaleString()} Сом</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                          background: p.status === "draft" ? "#fef3c7" : "#dcfce7",
                          color: p.status === "draft" ? "#f59e0b" : "#16a34a",
                        }}>
                          {p.status === "draft" ? "На проверке" : p.status === "published" ? "Опубликовано" : p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.status === "draft" && (
                          <button onClick={(e) => { e.stopPropagation(); handleApproveProperty(p.id); }} className="p-1.5 rounded-lg" style={{ background: "#dcfce7", color: "#16a34a" }}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "Финансы" && <FinancePanel />}

        {tab === "Бронирования" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Бронирования</h3>
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Нет бронирований</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--surface)" }}>
                    {["ID", "Объект", "Гость", "Даты", "Сумма", "Статус"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => {
                    const sc = STATUS_COLORS[b.status] || { label: b.status, color: "var(--text-secondary)", bg: "var(--surface)" };
                    return (
                      <tr key={b.id} className="border-t hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderColor: "var(--border)" }} onClick={() => setDetailBookingId(b.id)}>
                        <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>#{b.id.slice(0, 8)}</td>
                        <td className="p-4"><div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{b.property_title || b.property_id.slice(0, 8)}</div></td>
                        <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{b.guest_name || b.guest_id.slice(0, 8)}</td>
                        <td className="p-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                          {new Date(b.check_in).toLocaleDateString("ru-RU")} – {new Date(b.check_out).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="p-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{b.total_price.toLocaleString()} Сом</td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {detailBookingId && (
        <AdminBookingDetailModal
          bookingId={detailBookingId}
          onClose={() => setDetailBookingId(null)}
        />
      )}
      {detailPropertyId && (
        <AdminPropertyDetailModal
          propertyId={detailPropertyId}
          onClose={() => setDetailPropertyId(null)}
        />
      )}
      {detailOwnerId && (
        <AdminOwnerDetailModal
          ownerId={detailOwnerId}
          onClose={() => setDetailOwnerId(null)}
        />
      )}
    </div>
  );
}
