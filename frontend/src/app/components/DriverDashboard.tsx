import { useState, useEffect } from "react";
import {
  Car, Plus, TrendingUp, Edit, Trash2, LayoutDashboard, List,
  Wallet, Power, PowerOff, CircleDollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  getDriverDashboard, createDriverProfile, updateDriverProfile,
  createTransfer, updateTransfer, deleteTransfer, getMyTransfers,
} from "../services/drivers";
import { getMyWallet } from "../services/wallet";
import { getCities } from "../services/properties";
import type { DriverDashboardResponse, TransferResponse, NewWalletResponse, CityResponse } from "../types/api";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { WalletSection } from "./WalletSection";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";

interface DriverDashboardProps {
  onNavigate: (page: string) => void;
}

const TABS = [
  { key: "overview", label: "Обзор", icon: LayoutDashboard },
  { key: "transfers", label: "Трансферы", icon: List },
  { key: "wallet", label: "Кошелёк", icon: Wallet },
] as const;

export function DriverDashboard({ onNavigate }: DriverDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<DriverDashboardResponse | null>(null);
  const [wallet, setWallet] = useState<NewWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<CityResponse[]>([]);

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [bio, setBio] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<TransferResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", from_location: "", to_location: "", price: 0,
    max_passengers: 4, currency: "KGS", description: "",
    vehicle_type: "", duration_minutes: 0, city_id: "",
  });

  const [transfers, setTransfers] = useState<TransferResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadDashboard = async () => {
    try {
      const d = await getDriverDashboard();
      setData(d);
      if (d.profile) {
        setBio(d.profile.bio || "");
        setLicenseNumber(d.profile.license_number || "");
        setVehicleInfo(d.profile.vehicle_info || "");
      }
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const loadWalletData = async () => {
    try {
      const w = await getMyWallet();
      setWallet(w);
    } catch { /* silent */ }
  };

  const loadCitiesList = async () => {
    try {
      const c = await getCities();
      setCities(c);
    } catch { /* silent */ }
  };

  const loadTransfersList = async (append = false) => {
    try {
      setLoadingMore(true);
      const res = await getMyTransfers(append ? offset : 0, 10);
      if (append) {
        setTransfers(prev => [...prev, ...res.items]);
      } else {
        setTransfers(res.items);
      }
      setHasMore(res.items.length === 10);
      setOffset(append ? offset + 10 : 10);
    } catch {
      toast.error("Ошибка загрузки трансферов");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadWalletData();
    loadCitiesList();
  }, []);

  useEffect(() => {
    if (activeTab === "transfers" && transfers.length === 0 && !loading) {
      loadTransfersList();
    }
  }, [activeTab]);

  const refreshAll = () => {
    loadDashboard();
    loadWalletData();
    if (activeTab === "transfers") {
      setTransfers([]);
      setOffset(0);
      setHasMore(true);
      loadTransfersList();
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (data?.profile) {
        await updateDriverProfile({ bio, license_number: licenseNumber, vehicle_info: vehicleInfo });
      } else {
        await createDriverProfile({ bio, license_number: licenseNumber, vehicle_info: vehicleInfo });
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

  const handleCreateTransfer = async () => {
    try {
      await createTransfer(formData);
      toast.success("Трансфер создан");
      setShowCreateForm(false);
      setFormData({ title: "", from_location: "", to_location: "", price: 0, max_passengers: 4, currency: "KGS", description: "", vehicle_type: "", duration_minutes: 0, city_id: "" });
      refreshAll();
    } catch {
      toast.error("Ошибка создания трансфера");
    }
  };

  const handleUpdateTransfer = async () => {
    if (!editingTransfer) return;
    try {
      await updateTransfer(editingTransfer.id, formData as unknown as Record<string, unknown>);
      toast.success("Трансфер обновлён");
      setEditingTransfer(null);
      setShowCreateForm(false);
      refreshAll();
    } catch {
      toast.error("Ошибка обновления трансфера");
    }
  };

  const handleDeleteTransfer = async () => {
    if (!deleteId) return;
    try {
      await deleteTransfer(deleteId);
      toast.success("Трансфер удалён");
      setDeleteId(null);
      refreshAll();
    } catch {
      toast.error("Ошибка удаления трансфера");
    }
  };

  const handleToggleActive = async (t: TransferResponse) => {
    try {
      await updateTransfer(t.id, { is_active: !t.is_active });
      toast.success(t.is_active ? "Трансфер скрыт" : "Трансфер активирован");
      refreshAll();
    } catch {
      toast.error("Ошибка обновления статуса");
    }
  };

  const openEditForm = (t: TransferResponse) => {
    setEditingTransfer(t);
    setFormData({
      title: t.title, from_location: t.from_location, to_location: t.to_location, price: t.price,
      max_passengers: t.max_passengers, currency: t.currency, description: t.description || "",
      vehicle_type: t.vehicle_type || "", duration_minutes: t.duration_minutes || 0, city_id: t.city_id || "",
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
    { label: "Всего трансферов", value: String(data?.transfers_count || 0), delta: "создано", icon: Car, color: "var(--lake-blue)" },
    { label: "Активных", value: String(data?.active_transfers || 0), delta: "опубликовано", icon: TrendingUp, color: "var(--turquoise)" },
    { label: "Баланс кошелька", value: `${(wallet?.main_balance || 0).toLocaleString()} сом`, delta: "доступно", icon: Wallet, color: "var(--lake-blue)" },
    { label: "Доход", value: `${(wallet?.revenue_balance || 0).toLocaleString()} сом`, delta: "заработано", icon: CircleDollarSign, color: "var(--turquoise)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet><title>Панель водителя | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: "linear-gradient(135deg, var(--lake-blue), #0891b2)" }}>
          <PageBreadcrumbs items={[{ name: "Главная", page: "home" }, { name: "Панель водителя" }]} onNavigate={onNavigate} />
          <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)" }}>Панель водителя</h1>
          <p className="text-sm text-white/80">Управляйте трансферами и кошельком</p>
        </div>

        <div className="flex gap-1 mb-6 rounded-xl p-1 shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key ? "var(--lake-blue)" : "transparent",
                color: activeTab === tab.key ? "white" : "var(--text-secondary)",
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {statsCards.map((s) => (
                <div key={s.label} className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>{s.delta}</span>
                  </div>
                  <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "transfers" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Мои трансферы</h3>
              <button
                onClick={() => {
                  setEditingTransfer(null);
                  setFormData({ title: "", from_location: "", to_location: "", price: 0, max_passengers: 4, currency: "KGS", description: "", vehicle_type: "", duration_minutes: 0, city_id: "" });
                  setShowCreateForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "var(--lake-blue)" }}
              >
                <Plus size={15} /> Добавить трансфер
              </button>
            </div>

            <div className="rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              {transfers.length === 0 && !loadingMore ? (
                <div className="p-12 text-center">
                  <Car size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>У вас пока нет трансферов</p>
                  <button
                    onClick={() => {
                      setEditingTransfer(null);
                      setFormData({ title: "", from_location: "", to_location: "", price: 0, max_passengers: 4, currency: "KGS", description: "", vehicle_type: "", duration_minutes: 0, city_id: "" });
                      setShowCreateForm(true);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "var(--lake-blue)" }}
                  >
                    Создать первый трансфер
                  </button>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {transfers.map((t) => (
                    <div key={t.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.is_active ? "#16a34a" : "#9ca3af" }} />
                          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{t.title}</span>
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.from_location} → {t.to_location} · {t.max_passengers} пасс.</div>
                        <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{t.price.toLocaleString()} {t.currency}</span></div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`p-1.5 rounded-lg transition-all ${t.is_active ? "hover:bg-green-100" : "hover:bg-gray-200"}`}
                        style={{ background: t.is_active ? "rgba(34,197,94,0.1)" : "var(--surface)" }}
                        title={t.is_active ? "Деактивировать" : "Активировать"}
                      >
                        {t.is_active ? (
                          <Power size={14} style={{ color: "#16a34a" }} />
                        ) : (
                          <PowerOff size={14} style={{ color: "#9ca3af" }} />
                        )}
                      </button>
                      <span className="text-xs px-2 py-1 rounded-lg" style={{
                        background: t.is_active ? "rgba(34,197,94,0.1)" : "var(--surface)",
                        color: t.is_active ? "#16a34a" : "var(--text-secondary)",
                      }}>
                        {t.is_active ? "Активно" : "Черновик"}
                      </span>
                      <button onClick={() => openEditForm(t)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Edit size={14} style={{ color: "var(--text-secondary)" }} />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {hasMore && transfers.length > 0 && (
                <div className="p-4 text-center border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => loadTransfersList(true)}
                    disabled={loadingMore}
                    className="px-6 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                    style={{ borderColor: "var(--border)", color: "var(--lake-blue)" }}
                  >
                    {loadingMore ? "Загрузка..." : "Показать ещё"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <WalletSection />
          </div>
        )}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {data?.profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>О СЕБЕ</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>НОМЕР ЛИЦЕНЗИИ</label>
                <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ТРАНСПОРТ</label>
                <input value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} placeholder="Toyota Alphard, 8 мест" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
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
          <div className="w-full max-w-lg rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {editingTransfer ? "Редактировать трансфер" : "Новый трансфер"}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(["title", "from_location", "to_location", "description", "vehicle_type"] as const).map((f) => (
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
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ПАССАЖИРЫ</label>
                  <input type="number" value={formData.max_passengers} onChange={(e) => setFormData({ ...formData, max_passengers: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ВАЛЮТА</label>
                  <input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ДЛИТ. (МИН)</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreateForm(false); setEditingTransfer(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
              <button onClick={editingTransfer ? handleUpdateTransfer : handleCreateTransfer} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                {editingTransfer ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить трансфер?</AlertDialogTitle><AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransfer}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
