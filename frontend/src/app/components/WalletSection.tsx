import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowDown, ArrowUp, RefreshCw, CircleDollarSign, History } from "lucide-react";
import { toast } from "sonner";
import { getMyWallet, getWalletTransactions, depositWallet, withdrawWallet } from "../services/wallet";
import type { NewWalletResponse, WalletTransactionResponse } from "../types/api";
import { Button } from "./ui/button";

interface WalletSectionProps {
  compact?: boolean;
}

export function WalletSection({ compact }: WalletSectionProps) {
  const [wallet, setWallet] = useState<NewWalletResponse | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadWallet = async () => {
    try {
      const [w, txs] = await Promise.all([getMyWallet(), getWalletTransactions(0, 20)]);
      setWallet(w);
      setTransactions(txs.items);
    } catch {
      toast.error("Ошибка загрузки кошелька");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWallet(); }, []);

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) { toast.error("Введите сумму"); return; }
    setProcessing(true);
    try {
      await depositWallet(amt);
      toast.success("Счёт пополнен!");
      setShowDeposit(false);
      setDepositAmount("");
      loadWallet();
    } catch { toast.error("Ошибка пополнения"); } finally { setProcessing(false); }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { toast.error("Введите сумму"); return; }
    if (wallet && amt > wallet.main_balance) { toast.error("Недостаточно средств"); return; }
    setProcessing(true);
    try {
      await withdrawWallet(amt);
      toast.success("Запрос на вывод отправлен!");
      setShowWithdraw(false);
      setWithdrawAmount("");
      loadWallet();
    } catch { toast.error("Ошибка вывода"); } finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--lake-blue)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-5 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--lake-blue), #0891b2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-white/80" />
            <span className="text-sm text-white/80">Основной счёт</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(wallet?.main_balance || 0).toLocaleString()} сом
          </div>
        </div>
        <div className="p-5 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="flex items-center gap-2 mb-2">
            <CircleDollarSign size={18} style={{ color: "var(--turquoise)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Доход от продаж</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {(wallet?.revenue_balance || 0).toLocaleString()} сом
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex gap-2 mb-5">
          <Button onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }} size="sm" style={{ background: "var(--lake-blue)" }}>
            <ArrowDownLeft size={14} className="mr-1" /> Пополнить
          </Button>
          <Button onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }} size="sm" variant="outline" style={{ borderColor: "var(--border)" }}>
            <ArrowUpRight size={14} className="mr-1" /> Вывести
          </Button>
        </div>
      )}

      {showDeposit && (
        <div className="p-4 rounded-xl border mb-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Пополнить счёт</div>
          <div className="flex items-center gap-3">
            <input
              type="number" min="1" step="100"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Сумма в сомах"
              className="flex-1 px-4 py-2 rounded-xl border text-sm outline-none bg-white"
              style={{ borderColor: "var(--border)" }}
            />
            <Button onClick={handleDeposit} disabled={processing} style={{ background: "var(--lake-blue)" }}>
              {processing ? "..." : "Пополнить"}
            </Button>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="p-4 rounded-xl border mb-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Вывести средства</div>
          <div className="flex items-center gap-3">
            <input
              type="number" min="1" step="100"
              max={wallet?.main_balance || 0}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={`Доступно: ${(wallet?.main_balance || 0).toLocaleString()} сом`}
              className="flex-1 px-4 py-2 rounded-xl border text-sm outline-none bg-white"
              style={{ borderColor: "var(--border)" }}
            />
            <Button onClick={handleWithdraw} disabled={processing} variant="outline" style={{ borderColor: "var(--border)" }}>
              {processing ? "..." : "Вывести"}
            </Button>
          </div>
        </div>
      )}

      {!compact && transactions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} style={{ color: "var(--text-secondary)" }} />
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>История операций</h3>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                    background: tx.type === "deposit" ? "var(--lake-blue-light)" : tx.type === "withdrawal" ? "#fef2f2" : "var(--surface)",
                  }}>
                    {tx.type === "deposit" ? <ArrowDown size={16} style={{ color: "var(--lake-blue)" }} />
                      : tx.type === "withdrawal" ? <ArrowUp size={16} style={{ color: "#ef4444" }} />
                      : <RefreshCw size={16} style={{ color: "var(--turquoise)" }} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {tx.type === "deposit" ? "Пополнение" : tx.type === "withdrawal" ? "Вывод" : tx.type === "payment" ? "Оплата" : tx.type === "refund" ? "Возврат" : tx.type === "revenue" ? "Доход" : tx.type}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {new Date(tx.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm" style={{
                    color: tx.amount > 0 ? "var(--turquoise)" : "#ef4444",
                  }}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} сом
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {tx.status === "completed" ? "Завершён" : tx.status === "pending" ? "В обработке" : tx.status === "failed" ? "Ошибка" : tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!compact && transactions.length === 0 && (
        <div className="text-center py-6 rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <History size={28} style={{ color: "var(--text-secondary)" }} className="mx-auto mb-2" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>История операций пуста</p>
        </div>
      )}
    </div>
  );
}
