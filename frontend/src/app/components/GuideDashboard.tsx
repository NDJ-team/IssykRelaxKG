import { useState, useEffect } from "react";
import { Compass, Plus, TrendingUp, Edit, Trash2, Wallet, CircleDollarSign, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getGuideDashboard, createGuideProfile, updateGuideProfile, getMyTours, createTour, updateTour, deleteTour } from "../services/guides";
import { getMyWallet } from "../services/wallet";
import { getCities } from "../services/properties";
import type { TourResponse, CityResponse, NewWalletResponse } from "../types/api";
import { WalletSection } from "./WalletSection";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";

interface GuideDashboardProps {
  onNavigate: (page: string) => void;
}

const TABS = ["Обзор", "Туры", "Кошелёк"];
const TOUR_PAGE_SIZE = 10;

export function GuideDashboard({ onNavigate }: GuideDashboardProps) {
  const [tab, setTab] = useState("Обзор");
  const [stats, setStats] = useState<{ profile: any; tours_count: number; active_tours: number } | null>(null);
  const [tours, setTours] = useState<TourResponse[]>([]);
  const [totalTours, setTotalTours] = useState(0);
  const [tourOffset, setTourOffset] = useState(TOUR_PAGE_SIZE);
  const [wallet, setWallet] = useState<NewWalletResponse | null>(null);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTour, setEditingTour] = useState<TourResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", price: 0, duration_days: 1, max_guests: 10,
    currency: "KGS", description: "", includes: "", meeting_point: "", city_id: "",
  });

  const loadAll = async () => {
    try {
      const [d, w, c, t] = await Promise.all([
        getGuideDashboard(),
        getMyWallet(),
        getCities(),
        getMyTours(0, TOUR_PAGE_SIZE),
      ]);
      setStats(d);
      setWallet(w);
      setCities(c);
      setTours(t.items);
      setTotalTours(t.total);
      setTourOffset(TOUR_PAGE_SIZE);
      if (d.profile) {
        setBio(d.profile.bio || "");
        setLanguages(d.profile.languages || "");
      }
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const reloadTours = async () => {
    try {
      const t = await getMyTours(0, TOUR_PAGE_SIZE);
      setTours(t.items);
      setTotalTours(t.total);
      setTourOffset(TOUR_PAGE_SIZE);
    } catch {
      toast.error("Ошибка загрузки туров");
    }
  };

  const reloadStats = async () => {
    try {
      const d = await getGuideDashboard();
      setStats(d);
      if (d.profile) {
        setBio(d.profile.bio || "");
        setLanguages(d.profile.languages || "");
      }
    } catch {
      // silent
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (stats?.profile) {
        await updateGuideProfile({ bio, languages });
      } else {
        await createGuideProfile({ bio, languages });
      }
      toast.success("Профиль сохранён");
      setShowProfileForm(false);
      reloadStats();
    } catch {
      toast.error("Ошибка сохранения профиля");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createTour(formData);
      toast.success("Тур создан");
      setShowCreateForm(false);
      setFormData({ title: "", price: 0, duration_days: 1, max_guests: 10, currency: "KGS", description: "", includes: "", meeting_point: "", city_id: "" });
      await Promise.all([reloadTours(), reloadStats()]);
    } catch {
      toast.error("Ошибка создания тура");
    }
  };

  const handleUpdate = async () => {
    if (!editingTour) return;
    try {
      await updateTour(editingTour.id, formData);
      toast.success("Тур обновлён");
      setEditingTour(null);
      setShowCreateForm(false);
      await Promise.all([reloadTours(), reloadStats()]);
    } catch {
      toast.error("Ошибка обновления тура");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTour(deleteId);
      toast.success("Тур удалён");
      setDeleteId(null);
      await Promise.all([reloadTours(), reloadStats()]);
    } catch {
      toast.error("Ошибка удаления тура");
    }
  };

  const handleToggleActive = async (tour: TourResponse) => {
    try {
      await updateTour(tour.id, { is_active: !tour.is_active });
      setTours((prev) => prev.map((t) => t.id === tour.id ? { ...t, is_active: !t.is_active } : t));
      toast.success(tour.is_active ? "Тур деактивирован" : "Тур активирован");
      reloadStats();
    } catch {
      toast.error("Ошибка обновления статуса");
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await getMyTours(tourOffset, TOUR_PAGE_SIZE);
      setTours((prev) => [...prev, ...data.items]);
      setTotalTours(data.total);
      setTourOffset((prev) => prev + TOUR_PAGE_SIZE);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoadingMore(false);
    }
  };

  const openEditForm = (t: TourResponse) => {
    setEditingTour(t);
    setFormData({
      title: t.title, price: t.price, duration_days: t.duration_days, max_guests: t.max_guests,
      currency: t.currency, description: t.description || "", includes: t.includes || "",
      meeting_point: t.meeting_point || "", city_id: t.city_id || "",
    });
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
    { label: "Всего туров", value: String(stats?.tours_count || 0), delta: "создано", icon: Compass, color: "var(--lake-blue)" },
    { label: "Активных", value: String(stats?.active_tours || 0), delta: "опубликовано", icon: TrendingUp, color: "var(--turquoise)" },
    { label: "Баланс кошелька", value: `${(wallet?.main_balance || 0).toLocaleString()} сом`, delta: "доступно", icon: Wallet, color: "var(--sand)" },
    { label: "Доход", value: `${(wallet?.revenue_balance || 0).toLocaleString()} сом`, delta: "заработано", icon: CircleDollarSign, color: "#7c3aed" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet><title>Панель гида | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель гида</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Управляйте турами</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingTour(null);
                setFormData({ title: "", price: 0, duration_days: 1, max_guests: 10, currency: "KGS", description: "", includes: "", meeting_point: "", city_id: "" });
                setShowCreateForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "var(--lake-blue)" }}
            >
              <Plus size={15} /> Добавить тур
            </button>
            <button
              onClick={() => setShowProfileForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: "var(--border)" }}
            >
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
        )}

        {tab === "Туры" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои туры</h3>
              {totalTours > 0 && (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {tours.length} из {totalTours}
                </span>
              )}
            </div>
            {tours.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                <Compass size={32} className="mx-auto mb-2 opacity-40" />
                Нет туров
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {tours.map((t) => (
                  <div key={t.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{t.title}</div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.duration_days} дн. · до {t.max_guests} чел.</div>
                      <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{t.price.toLocaleString()} {t.currency}</span></div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: t.is_active ? "var(--turquoise-light)" : "var(--surface)", color: t.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)" }}>
                      {t.is_active ? "Активно" : "Черновик"}
                    </span>
                    <button onClick={() => handleToggleActive(t)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={t.is_active ? "Деактивировать" : "Активировать"}>
                      {t.is_active ? <PowerOff size={14} style={{ color: "#ef4444" }} /> : <Power size={14} style={{ color: "var(--turquoise)" }} />}
                    </button>
                    <button onClick={() => openEditForm(t)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit size={14} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {tours.length < totalTours && (
              <div className="p-4 text-center border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  {loadingMore ? "Загрузка..." : "Показать ещё"}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "Кошелёк" && (
          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <WalletSection />
          </div>
        )}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {stats?.profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>О СЕБЕ</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ЯЗЫКИ</label>
                <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Русский, Английский" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
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
              {editingTour ? "Редактировать тур" : "Новый тур"}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(["title", "description", "includes", "meeting_point"] as const).map((f) => (
                <div key={f}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.toUpperCase()}</label>
                  <input value={formData[f] as string} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ГОРОД</label>
                <select value={formData.city_id} onChange={(e) => setFormData({ ...formData, city_id: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}>
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
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ДЛИТ. (ДНИ)</label>
                  <input type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>МАКС. ГОСТЕЙ</label>
                  <input type="number" value={formData.max_guests} onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ВАЛЮТА</label>
                  <input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreateForm(false); setEditingTour(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
              <button onClick={editingTour ? handleUpdate : handleCreate} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                {editingTour ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить тур?</AlertDialogTitle><AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
