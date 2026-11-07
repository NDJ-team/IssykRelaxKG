import { useState, useEffect } from "react";
import { ConciergeBell, Edit, Wallet, User, BarChart3, CheckCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getMyConciergeProfile, createConciergeProfile, updateConciergeProfile } from "../services/concierge";
import { getMyWallet } from "../services/wallet";
import { WalletSection } from "./WalletSection";

interface ConciergeDashboardProps {
  onNavigate: (page: string) => void;
}

export function ConciergeDashboard({ onNavigate }: ConciergeDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bio, setBio] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "wallet">("overview");
  const [walletData, setWalletData] = useState<any>(null);

  const load = async () => {
    try {
      const [p, w] = await Promise.all([
        getMyConciergeProfile().catch(() => null),
        getMyWallet().catch(() => null),
      ]);
      setProfile(p);
      setWalletData(w);
      if (p) { setBio(p.bio || ""); setServiceAreas(p.service_areas || ""); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) { await updateConciergeProfile({ bio, service_areas: serviceAreas }); }
      else { await createConciergeProfile({ bio, service_areas: serviceAreas }); }
      toast.success("Профиль сохранён");
      setShowForm(false);
      load();
    } catch { toast.error("Ошибка сохранения профиля"); } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Helmet><title>Панель консьержа | IssykRelax</title><meta name="robots" content="noindex, nofollow" /></Helmet>

      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <ConciergeBell size={28} className="text-white/80" />
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Панель консьержа</h1>
          </div>
          <p className="text-white/70 text-sm">Управление профилем и финансами</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "overview" as const, label: "Обзор", icon: <BarChart3 size={16} /> },
            { key: "wallet" as const, label: "Кошелёк", icon: <Wallet size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={{
                background: activeTab === tab.key ? "var(--lake-blue)" : "white",
                color: activeTab === tab.key ? "white" : "var(--text-secondary)",
                borderColor: activeTab === tab.key ? "var(--lake-blue)" : "var(--border)",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} style={{ color: "var(--lake-blue)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>СТАТУС</span>
                </div>
                <div className="text-sm font-bold" style={{ color: profile?.is_approved ? "var(--turquoise)" : "#f59e0b" }}>
                  {profile?.is_approved ? "Одобрено" : "На проверке"}
                </div>
              </div>
              <div className="p-4 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} style={{ color: "var(--lake-blue)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>БАЛАНС</span>
                </div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {(walletData?.main_balance || 0).toLocaleString()} сом
                </div>
              </div>
              <div className="p-4 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} style={{ color: "var(--lake-blue)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ДОХОД</span>
                </div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {(walletData?.revenue_balance || 0).toLocaleString()} сом
                </div>
              </div>
            </div>

            {profile && (
              <div className="rounded-2xl border p-6 mb-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Профиль</h2>
                  <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    <Edit size={13} /> Редактировать
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>О СЕБЕ</span>
                    <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>{profile.bio || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>ЗОНЫ ОБСЛУЖИВАНИЯ</span>
                    <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>{profile.service_areas || "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {!profile && (
              <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <ConciergeBell size={48} className="mx-auto mb-3" style={{ color: "var(--text-secondary)" }} />
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Профиль не создан</p>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Создайте профиль, чтобы начать предоставлять услуги</p>
                <button onClick={() => setShowForm(true)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                  Создать профиль
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "wallet" && <WalletSection />}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 custom-modal" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
              {profile ? "Редактировать профиль" : "Создать профиль"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>О СЕБЕ</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>ЗОНЫ ОБСЛУЖИВАНИЯ</label>
                <input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)" }}>Отмена</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--lake-blue)" }}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
