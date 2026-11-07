import { useState, useEffect } from "react";
import { Dumbbell, Plus, TrendingUp, Edit, Trash2, Wallet, CircleDollarSign, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getActivityDashboard, getMyActivities, createActivityProfile, updateActivityProfile, createActivity, updateActivity, deleteActivity } from "../services/activities";
import { getMyWallet } from "../services/wallet";
import { getCities } from "../services/properties";
import type { ActivityResponse, CityResponse, NewWalletResponse } from "../types/api";
import { WalletSection } from "./WalletSection";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";

interface ActivityProviderDashboardProps {
  onNavigate: (page: string) => void;
}

const TABS = ["Обзор", "Активности", "Кошелёк"];

export function ActivityProviderDashboard({ onNavigate }: ActivityProviderDashboardProps) {
  const [tab, setTab] = useState("Обзор");
  const [dashboard, setDashboard] = useState<{ profile: any; activities_count: number; active_activities: number } | null>(null);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [wallet, setWallet] = useState<NewWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [formData, setFormData] = useState({
    title: "", price: 0, max_participants: 10, duration_minutes: 60,
    currency: "KGS", description: "", location: "", city_id: "",
  });

  const loadDashboard = async () => {
    try {
      const [d, w] = await Promise.all([getActivityDashboard(), getMyWallet()]);
      setDashboard(d);
      setActivities(d.activities || []);
      setTotalActivities(d.activities_count);
      setWallet(w);
      if (d.profile) {
        setCompanyName(d.profile.company_name || "");
        setBio(d.profile.bio || "");
      }
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { getCities().then(setCities).catch(() => {}); }, []);

  const loadMore = async () => {
    try {
      const res = await getMyActivities(activities.length, 10);
      setActivities((prev) => [...prev, ...res.items]);
      setTotalActivities(res.total);
    } catch {
      toast.error("Ошибка загрузки активностей");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateActivity(id, { is_active: !current });
      toast.success(current ? "Активность отключена" : "Активность включена");
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)));
    } catch {
      toast.error("Ошибка обновления");
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (dashboard?.profile) {
        await updateActivityProfile({ company_name: companyName, bio });
      } else {
        await createActivityProfile({ company_name: companyName, bio });
      }
      toast.success("Профиль сохранён");
      setShowProfileForm(false);
      loadDashboard();
    } catch {
      toast.error("Ошибка сохранения профиля");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createActivity(formData);
      toast.success("Активность создана");
      setShowCreateForm(false);
      setFormData({ title: "", price: 0, max_participants: 10, duration_minutes: 60, currency: "KGS", description: "", location: "", city_id: "" });
      loadDashboard();
    } catch {
      toast.error("Ошибка создания активности");
    }
  };

  const handleUpdate = async () => {
    if (!editingActivity) return;
    try {
      await updateActivity(editingActivity.id, formData);
      toast.success("Активность обновлена");
      setEditingActivity(null);
      setShowCreateForm(false);
      loadDashboard();
    } catch {
      toast.error("Ошибка обновления активности");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteActivity(deleteId);
      toast.success("Активность удалена");
      setDeleteId(null);
      loadDashboard();
    } catch {
      toast.error("Ошибка удаления активности");
    }
  };

  const openEditForm = (a: ActivityResponse) => {
    setEditingActivity(a);
    setFormData({
      title: a.title, price: a.price, max_participants: a.max_participants, duration_minutes: a.duration_minutes,
      currency: a.currency, description: a.description || "", location: a.location || "", city_id: a.city_id || "",
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setEditingActivity(null);
    setFormData({ title: "", price: 0, max_participants: 10, duration_minutes: 60, currency: "KGS", description: "", location: "", city_id: "" });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  const statsCards = [
    { label: "Всего активностей", value: String(dashboard?.activities_count || 0), delta: "создано", icon: Dumbbell, color: "var(--lake-blue)" },
    { label: "Активные", value: String(dashboard?.active_activities || 0), delta: "опубликовано", icon: TrendingUp, color: "var(--turquoise)" },
    { label: "Баланс кошелька", value: `${(wallet?.main_balance || 0).toLocaleString()} сом`, delta: "доступно", icon: Wallet, color: "#7c3aed" },
    { label: "Доход", value: `${(wallet?.revenue_balance || 0).toLocaleString()} сом`, delta: "всего", icon: CircleDollarSign, color: "#16a34a" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet>
        <title>Панель аниматора | IssykRelax</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель аниматора</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Управляйте активностями</p>
          </div>
          <div className="flex gap-2">
            {tab === "Активности" && (
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                <Plus size={15} /> Добавить активность
              </button>
            )}
            <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>
              <Edit size={15} /> Профиль
            </button>
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

        {tab === "Обзор" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsCards.map((s) => (
                <div key={s.label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                      {s.delta}
                    </span>
                  </div>
                  <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои активности</h3>
                <button onClick={() => setTab("Активности")} className="text-sm font-medium" style={{ color: "var(--lake-blue)" }}>
                  Все активности
                </button>
              </div>
              {!activities.length ? (
                <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  <Dumbbell size={32} className="mx-auto mb-2 opacity-40" />
                  Нет активностей
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {activities.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.title}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.duration_minutes} мин. · до {a.max_participants} чел.</div>
                        <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{a.price.toLocaleString()} {a.currency}</span></div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(a.id, a.is_active)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                        title={a.is_active ? "Отключить" : "Включить"}
                      >
                        {a.is_active ? <PowerOff size={14} style={{ color: "var(--text-secondary)" }} /> : <Power size={14} style={{ color: "var(--lake-blue)" }} />}
                      </button>
                      <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: a.is_active ? "var(--turquoise-light)" : "var(--surface)", color: a.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.is_active ? "#16a34a" : "#9ca3af" }} />
                        {a.is_active ? "Активно" : "Черновик"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "Активности" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои активности</h3>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Всего: {totalActivities}</span>
            </div>
            {!activities.length ? (
              <div className="p-12 text-center" style={{ color: "var(--text-secondary)" }}>
                <Dumbbell size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">Нет активностей</p>
                <p className="text-xs mb-4">Создайте первую активность, чтобы начать</p>
                <button onClick={resetForm} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                  <Plus size={15} /> Создать активность
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {activities.map((a) => (
                  <div key={a.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.title}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.duration_minutes} мин. · до {a.max_participants} чел.</div>
                      <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{a.price.toLocaleString()} {a.currency}</span></div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(a.id, a.is_active)}
                      className="p-1.5 rounded-lg hover:bg-gray-100"
                      title={a.is_active ? "Отключить" : "Включить"}
                    >
                      {a.is_active ? <PowerOff size={14} style={{ color: "var(--text-secondary)" }} /> : <Power size={14} style={{ color: "var(--lake-blue)" }} />}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: a.is_active ? "var(--turquoise-light)" : "var(--surface)", color: a.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.is_active ? "#16a34a" : "#9ca3af" }} />
                      {a.is_active ? "Активно" : "Черновик"}
                    </span>
                    <button onClick={() => openEditForm(a)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} style={{ color: "var(--text-secondary)" }} /></button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} style={{ color: "#ef4444" }} /></button>
                  </div>
                ))}
              </div>
            )}
            {activities.length > 0 && activities.length < totalActivities && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 rounded-xl text-sm font-medium border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--lake-blue)" }}
                >
                  Показать ещё
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "Кошелёк" && <WalletSection />}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {dashboard?.profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>КОМПАНИЯ</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>О КОМПАНИИ</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowProfileForm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                  {savingProfile ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {editingActivity ? "Редактировать активность" : "Новая активность"}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(["title", "description", "location"] as const).map((f) => (
                <div key={f}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.toUpperCase()}</label>
                  <input value={formData[f] as string} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ГОРОД</label>
                <select
                  value={formData.city_id}
                  onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                >
                  <option value="">Выберите город</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ЦЕНА</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ДЛИТ. (МИН)</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>МАКС. УЧАСТНИКОВ</label>
                  <input type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ВАЛЮТА</label>
                  <input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreateForm(false); setEditingActivity(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
              <button onClick={editingActivity ? handleUpdate : handleCreate} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                {editingActivity ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить активность?</AlertDialogTitle><AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
