import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, TrendingUp, Edit, Trash2, Wallet, Power, PowerOff, LayoutDashboard, Package, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  getAgencyDashboard, getMyAgencyProfile, createAgencyProfile, updateAgencyProfile,
  createTourPackage, updateTourPackage, deleteTourPackage, getMyTourPackages,
} from "../services/agency";
import { getMyWallet } from "../services/wallet";
import type { TourPackageResponse, NewWalletResponse } from "../types/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import { WalletSection } from "./WalletSection";

const TABS = [
  { key: "overview", label: "Обзор", icon: LayoutDashboard },
  { key: "packages", label: "Пакеты", icon: Package },
  { key: "wallet", label: "Кошелёк", icon: Wallet },
] as const;

const PAGE_LIMIT = 10;

interface AgencyDashboardProps {
  onNavigate: (page: string) => void;
}

export function AgencyDashboard({ onNavigate }: AgencyDashboardProps) {
  const [tab, setTab] = useState<"overview" | "packages" | "wallet">("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [packagesCount, setPackagesCount] = useState(0);
  const [activePackages, setActivePackages] = useState(0);
  const [walletData, setWalletData] = useState<NewWalletResponse | null>(null);
  const [allPackages, setAllPackages] = useState<TourPackageResponse[]>([]);
  const [totalPackages, setTotalPackages] = useState(0);
  const [packagesOffset, setPackagesOffset] = useState(0);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesDone, setPackagesDone] = useState(false);

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TourPackageResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", price: 0, duration_days: 1, max_guests: 10,
    currency: "KGS", description: "", includes: "", itinerary: "",
  });

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [d, w] = await Promise.all([getAgencyDashboard(), getMyWallet()]);
      setProfile(d.profile);
      setPackagesCount(d.packages_count);
      setActivePackages(d.active_packages);
      setWalletData(w);
      setAllPackages(d.packages);
      setTotalPackages(d.packages.length);
      setPackagesOffset(d.packages.length);
      if (d.packages.length < PAGE_LIMIT) setPackagesDone(true);
      if (d.profile) {
        setCompanyName(d.profile.company_name || "");
        setDescription(d.profile.description || "");
        setLicenseNumber(d.profile.license_number || "");
      }
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const loadMorePackages = async () => {
    if (packagesLoading || packagesDone) return;
    setPackagesLoading(true);
    try {
      const res = await getMyTourPackages(packagesOffset, PAGE_LIMIT);
      setAllPackages((prev) => [...prev, ...res.items]);
      setTotalPackages(res.total);
      setPackagesOffset((prev) => prev + res.items.length);
      if (packagesOffset + res.items.length >= res.total) setPackagesDone(true);
    } catch {
      toast.error("Ошибка загрузки пакетов");
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (profile) {
        await updateAgencyProfile({ company_name: companyName, description, license_number: licenseNumber });
      } else {
        await createAgencyProfile({ company_name: companyName, description, license_number: licenseNumber });
      }
      toast.success("Профиль сохранён");
      setShowProfileForm(false);
      loadInitial();
    } catch {
      toast.error("Ошибка сохранения профиля");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreate = async () => {
    try {
      const payload: any = { ...formData };
      if (payload.itinerary && typeof payload.itinerary === "string") {
        try { payload.itinerary = JSON.parse(payload.itinerary); } catch { payload.itinerary = undefined; }
      } else if (!payload.itinerary) {
        delete payload.itinerary;
      }
      await createTourPackage(payload);
      toast.success("Турпакет создан");
      setShowCreateForm(false);
      setFormData({ title: "", price: 0, duration_days: 1, max_guests: 10, currency: "KGS", description: "", includes: "", itinerary: "" });
      loadInitial();
    } catch {
      toast.error("Ошибка создания турпакета");
    }
  };

  const handleUpdate = async () => {
    if (!editingPkg) return;
    try {
      await updateTourPackage(editingPkg.id, formData);
      toast.success("Турпакет обновлён");
      setEditingPkg(null);
      setShowCreateForm(false);
      loadInitial();
    } catch {
      toast.error("Ошибка обновления турпакета");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTourPackage(deleteId);
      toast.success("Турпакет удалён");
      setDeleteId(null);
      loadInitial();
    } catch {
      toast.error("Ошибка удаления турпакета");
    }
  };

  const handleToggleActive = async (pkg: TourPackageResponse) => {
    setToggleId(pkg.id);
    try {
      await updateTourPackage(pkg.id, { is_active: !pkg.is_active });
      toast.success(pkg.is_active ? "Пакет деактивирован" : "Пакет активирован");
      loadInitial();
    } catch {
      toast.error("Ошибка изменения статуса");
    } finally {
      setToggleId(null);
    }
  };

  const openEditForm = (p: TourPackageResponse) => {
    setEditingPkg(p);
    setFormData({
      title: p.title, price: p.price, duration_days: p.duration_days, max_guests: p.max_guests,
      currency: p.currency, description: p.description || "", includes: p.includes || "",
      itinerary: p.itinerary ? JSON.stringify(p.itinerary) : "",
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
    { label: "Всего пакетов", value: String(packagesCount), color: "var(--lake-blue)" },
    { label: "Активные", value: String(activePackages), color: "var(--turquoise)" },
    { label: "Баланс кошелька", value: `${(walletData?.main_balance || 0).toLocaleString()} сом`, color: "var(--lake-blue)" },
    { label: "Доход", value: `${(walletData?.revenue_balance || 0).toLocaleString()} сом`, color: "var(--turquoise)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet><title>Панель агентства | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель агентства</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Управляйте турпакетами</p>
          </div>
          <div className="flex gap-2">
            {tab === "packages" && (
              <button
                onClick={() => {
                  setEditingPkg(null);
                  setFormData({ title: "", price: 0, duration_days: 1, max_guests: 10, currency: "KGS", description: "", includes: "", itinerary: "" });
                  setShowCreateForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                style={{ background: "var(--lake-blue)" }}
              >
                <Plus size={15} /> Добавить турпакет
              </button>
            )}
            <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>
              <Edit size={15} /> Профиль
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t.key ? "text-white" : ""
                }`}
                style={
                  tab === t.key
                    ? { background: "var(--lake-blue)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {statsCards.map((s) => (
                <div key={s.label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                      <Building2 size={18} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <WalletSection compact />
          </div>
        )}

        {tab === "packages" && (
          <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои турпакеты</h3>
            </div>
            {!allPackages.length ? (
              <div className="p-8 text-center">
                <Package size={36} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>У вас ещё нет турпакетов</p>
                <button
                  onClick={() => {
                    setEditingPkg(null);
                    setFormData({ title: "", price: 0, duration_days: 1, max_guests: 10, currency: "KGS", description: "", includes: "", itinerary: "" });
                    setShowCreateForm(true);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: "var(--lake-blue)" }}
                >
                  <Plus size={15} /> Создать первый пакет
                </button>
              </div>
            ) : (
              <div>
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {allPackages.map((p) => (
                    <div key={p.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.duration_days} дн. · до {p.max_guests} чел.</div>
                        <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{p.price.toLocaleString()} {p.currency}</span></div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg" style={{
                        background: p.is_active ? "var(--turquoise-light)" : "var(--surface)",
                        color: p.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)",
                      }}>
                        {p.is_active ? "Активно" : "Черновик"}
                      </span>
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={toggleId === p.id}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                        title={p.is_active ? "Деактивировать" : "Активировать"}
                      >
                        {p.is_active
                          ? <PowerOff size={14} style={{ color: "var(--text-secondary)" }} />
                          : <Power size={14} style={{ color: "var(--lake-blue)" }} />
                        }
                      </button>
                      <button onClick={() => openEditForm(p)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Edit size={14} style={{ color: "var(--text-secondary)" }} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
                {!packagesDone && (
                  <div className="p-4 flex justify-center">
                    <button
                      onClick={loadMorePackages}
                      disabled={packagesLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                    >
                      {packagesLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                      Показать ещё
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "wallet" && <WalletSection />}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>НАЗВАНИЕ КОМПАНИИ</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ОПИСАНИЕ</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ЛИЦЕНЗИЯ</label>
                <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
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
              {editingPkg ? "Редактировать турпакет" : "Новый турпакет"}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(["title", "description", "includes"] as const).map((f) => (
                <div key={f}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.toUpperCase()}</label>
                  <input value={formData[f] as string} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ITINERARY (JSON)</label>
                <textarea value={formData.itinerary} onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none font-mono" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ЦЕНА</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ДЛИТ. (ДНЕЙ)</label>
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
              <button onClick={() => { setShowCreateForm(false); setEditingPkg(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
              <button onClick={editingPkg ? handleUpdate : handleCreate} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                {editingPkg ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить турпакет?</AlertDialogTitle><AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
