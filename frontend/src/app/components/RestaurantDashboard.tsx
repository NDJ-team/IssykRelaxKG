import { useState, useEffect } from "react";
import { Utensils, Plus, TrendingUp, Wallet, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getPartnerDashboard, getMyRestaurants, createRestaurantProfile, updateRestaurantProfile, createRestaurant, updateRestaurant, deleteRestaurant } from "../services/restaurants-service";
import { getMyWallet } from "../services/wallet";
import { getCities } from "../services/properties";
import type { RestaurantResponse, CityResponse, NewWalletResponse } from "../types/api";
import { WalletSection } from "./WalletSection";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";

interface RestaurantDashboardProps {
  onNavigate: (page: string) => void;
}

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "restaurants", label: "Рестораны" },
  { id: "wallet", label: "Кошелёк" },
] as const;

export function RestaurantDashboard({ onNavigate }: RestaurantDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState<{ profile: any; restaurants_count: number; active_restaurants: number } | null>(null);
  const [wallet, setWallet] = useState<NewWalletResponse | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const LIMIT = 10;

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", cuisine_type: "", address: "", phone: "", price_range: "", opening_hours: "", city_id: "",
  });

  const filteredRestaurants = selectedCity
    ? restaurants.filter((r) => r.city_id === selectedCity)
    : restaurants;

  const loadDashboard = async () => {
    try {
      const d = await getPartnerDashboard();
      setDashboard(d);
      if (d.profile) {
        setRestaurantName(d.profile.restaurant_name || "");
        setDescription(d.profile.description || "");
        setCuisineType(d.profile.cuisine_type || "");
        setAddress(d.profile.address || "");
        setPhone(d.profile.phone || "");
      }
    } catch {
      toast.error("Ошибка загрузки данных");
    }
  };

  const loadWalletData = async () => {
    try {
      setWallet(await getMyWallet());
    } catch { /* ignore */ }
  };

  const loadRestaurants = async (newOffset = 0) => {
    try {
      const res = await getMyRestaurants(newOffset, LIMIT);
      if (newOffset === 0) {
        setRestaurants(res.items);
      } else {
        setRestaurants((prev) => [...prev, ...res.items]);
      }
      setTotal(res.total);
      setOffset(newOffset + res.items.length);
    } catch {
      toast.error("Ошибка загрузки ресторанов");
    }
  };

  const loadCities = async () => {
    try { setCities(await getCities()); } catch { /* ignore */ }
  };

  const init = async () => {
    setLoading(true);
    await Promise.all([loadDashboard(), loadRestaurants(0), loadCities(), loadWalletData()]);
    setLoading(false);
  };

  useEffect(() => { init(); }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (dashboard?.profile) {
        await updateRestaurantProfile({ restaurant_name: restaurantName, description, cuisine_type: cuisineType, address, phone });
      } else {
        await createRestaurantProfile({ restaurant_name: restaurantName, description, cuisine_type: cuisineType, address, phone });
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
      await createRestaurant(formData);
      toast.success("Ресторан создан");
      setShowCreateForm(false);
      setFormData({ name: "", description: "", cuisine_type: "", address: "", phone: "", price_range: "", opening_hours: "", city_id: "" });
      loadRestaurants(0);
    } catch {
      toast.error("Ошибка создания ресторана");
    }
  };

  const handleUpdate = async () => {
    if (!editingRestaurant) return;
    try {
      await updateRestaurant(editingRestaurant.id, formData);
      toast.success("Ресторан обновлён");
      setEditingRestaurant(null);
      setShowCreateForm(false);
      loadRestaurants(0);
    } catch {
      toast.error("Ошибка обновления ресторана");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRestaurant(deleteId);
      toast.success("Ресторан удалён");
      setDeleteId(null);
      loadRestaurants(0);
    } catch {
      toast.error("Ошибка удаления ресторана");
    }
  };

  const handleToggleActive = async (r: RestaurantResponse) => {
    try {
      const updated = await updateRestaurant(r.id, { is_active: !r.is_active });
      setRestaurants((prev) =>
        prev.map((item) => (item.id === r.id ? updated : item))
      );
      toast.success(r.is_active ? "Деактивирован" : "Активирован");
    } catch {
      toast.error("Ошибка обновления статуса");
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadRestaurants(offset);
    setLoadingMore(false);
  };

  const openEditForm = (r: RestaurantResponse) => {
    setEditingRestaurant(r);
    setFormData({
      name: r.name, description: r.description || "", cuisine_type: r.cuisine_type || "",
      address: r.address || "", phone: r.phone || "", price_range: r.price_range || "",
      opening_hours: r.opening_hours || "", city_id: r.city_id || "",
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
    { label: "Всего ресторанов", value: String(dashboard?.restaurants_count || 0), delta: "создано", icon: Utensils, color: "var(--lake-blue)" },
    { label: "Активные", value: String(dashboard?.active_restaurants || 0), delta: "опубликовано", icon: TrendingUp, color: "var(--turquoise)" },
    { label: "Баланс кошелька", value: `${(wallet?.main_balance || 0).toLocaleString()} сом`, delta: "доступно", icon: Wallet, color: "var(--lake-blue)" },
    { label: "Доход", value: `${(wallet?.revenue_balance || 0).toLocaleString()} сом`, delta: "заработано", icon: TrendingUp, color: "var(--turquoise)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet><title>Панель ресторана | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Панель ресторана</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Управляйте ресторанами</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0"
              style={{
                background: activeTab === tab.id ? "var(--lake-blue)" : "white",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                border: `1px solid ${activeTab === tab.id ? "var(--lake-blue)" : "var(--border)"}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsCards.map((s) => (
                <div key={s.label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}><s.icon size={18} style={{ color: s.color }} /></div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>{s.delta}</span>
                  </div>
                  <div className="text-xl font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Кошелёк</h3>
              <WalletSection compact />
            </div>
          </div>
        )}

        {activeTab === "restaurants" && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={() => { setEditingRestaurant(null); setFormData({ name: "", description: "", cuisine_type: "", address: "", phone: "", price_range: "", opening_hours: "", city_id: "" }); setShowCreateForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                <Plus size={15} /> Добавить ресторан
              </button>
              <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>
                <Edit size={15} /> Профиль
              </button>
              <div className="ml-auto">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                >
                  <option value="">Все города</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Мои рестораны</h3>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{total} всего</span>
              </div>
              {filteredRestaurants.length === 0 ? (
                <div className="p-12 text-center">
                  <Utensils size={40} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-3" />
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Нет ресторанов</p>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Добавьте первый ресторан</p>
                  <button onClick={() => { setEditingRestaurant(null); setFormData({ name: "", description: "", cuisine_type: "", address: "", phone: "", price_range: "", opening_hours: "", city_id: "" }); setShowCreateForm(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--lake-blue)" }}>
                    <Plus size={15} /> Добавить ресторан
                  </button>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {filteredRestaurants.map((r) => (
                    <div key={r.id} className="p-4 flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.is_active ? "#16a34a" : "#9ca3af" }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{r.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.cuisine_type || "Разное"} · {r.address || "Адрес не указан"}</div>
                        <div className="text-xs mt-1"><span className="font-medium" style={{ color: "var(--lake-blue)" }}>{r.price_range || "—"}</span></div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(r)}
                        className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
                        style={{
                          background: r.is_active ? "var(--turquoise-light)" : "var(--surface)",
                          color: r.is_active ? "var(--turquoise-dark)" : "var(--text-secondary)",
                        }}
                        title={r.is_active ? "Деактивировать" : "Активировать"}
                      >
                        {r.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                      </button>
                      <button onClick={() => openEditForm(r)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit size={14} style={{ color: "var(--text-secondary)" }} /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} style={{ color: "#ef4444" }} /></button>
                    </div>
                  ))}
                </div>
              )}
              {total > offset && (
                <div className="p-4 text-center border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors"
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
          <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-5" style={{ color: "var(--text-primary)" }}>Кошелёк</h3>
            <WalletSection />
          </div>
        )}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {dashboard?.profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>НАЗВАНИЕ</label>
                <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ОПИСАНИЕ</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>КУХНЯ</label>
                <input value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} placeholder="Кыргызская, Европейская" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>АДРЕС</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ТЕЛЕФОН</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
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
              {editingRestaurant ? "Редактировать ресторан" : "Новый ресторан"}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(["name", "description", "cuisine_type", "address", "phone", "price_range", "opening_hours"] as const).map((f) => (
                <div key={f}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.toUpperCase()}</label>
                  <input value={formData[f] as string} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreateForm(false); setEditingRestaurant(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
              <button onClick={editingRestaurant ? handleUpdate : handleCreate} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                {editingRestaurant ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить ресторан?</AlertDialogTitle><AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
