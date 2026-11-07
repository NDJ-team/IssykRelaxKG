import { apiRequest, buildQueryString } from "./api";
import type { ListRolesResponse, ModerationQueueResponse, RoleResponse, WithdrawalListResponse } from "../types/api";

export async function getModerationQueue(): Promise<ModerationQueueResponse> {
  return apiRequest<ModerationQueueResponse>("/admin/moderation/queue");
}

export async function approveEntity(service_type: string, entity_id: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/admin/moderation/${service_type}/${entity_id}/approve`, { method: "PATCH" });
}

export async function rejectEntity(service_type: string, entity_id: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/admin/moderation/${service_type}/${entity_id}/reject`, { method: "PATCH" });
}

export async function listRoles(): Promise<ListRolesResponse> {
  return apiRequest<ListRolesResponse>("/admin/roles");
}

export async function assignRole(user_id: string, role_slug: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/admin/users/${user_id}/roles`, { method: "PATCH", body: { role_slug } });
}

export async function listWithdrawals(status?: string): Promise<WithdrawalListResponse> {
  return apiRequest<WithdrawalListResponse>(`/admin/wallet/withdrawals${buildQueryString({ status })}`);
}

export async function approveWithdrawal(transaction_id: string): Promise<{ status: string; main_balance: number }> {
  return apiRequest<{ status: string; main_balance: number }>(`/admin/wallet/withdrawals/${transaction_id}/approve`, { method: "PATCH" });
}

export async function rejectWithdrawal(transaction_id: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/admin/wallet/withdrawals/${transaction_id}/reject`, { method: "PATCH" });
}
