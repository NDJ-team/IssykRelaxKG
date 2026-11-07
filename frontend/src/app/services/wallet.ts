import { apiRequest, buildQueryString } from "./api";
import type { NewWalletResponse, WalletTransactionListResponse } from "../types/api";

export async function getMyWallet(): Promise<NewWalletResponse> {
  return apiRequest<NewWalletResponse>("/wallet");
}

export async function getWalletTransactions(offset = 0, limit = 20): Promise<WalletTransactionListResponse> {
  return apiRequest<WalletTransactionListResponse>(`/wallet/transactions${buildQueryString({ offset, limit })}`);
}

export async function depositWallet(amount: number): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/wallet/deposit", { method: "POST", body: { amount } });
}

export async function withdrawWallet(amount: number): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/wallet/withdraw", { method: "POST", body: { amount } });
}
