import { apiRequest, buildQueryString } from "./api";
import type {
  AdminOwnerListResponse,
  AdminPropertyListResponse,
  AdminBookingListResponse,
  AdminBookingDetailResponse,
  AdminPropertyDetailResponse,
  AdminOwnerDetailResponse,
  AdminStatsResponse,
  WithdrawalListResponse,
  WithdrawalResponse,
} from "../types/api";

export async function getAdminOwners(params?: {
  approved?: boolean;
  offset?: number;
  limit?: number;
}): Promise<AdminOwnerListResponse> {
  return apiRequest<AdminOwnerListResponse>(`/admin/owners${buildQueryString(params)}`);
}

export async function approveOwner(id: string): Promise<void> {
  return apiRequest<void>(`/admin/owners/${id}/approve`, { method: "PATCH" });
}

export async function getAdminProperties(params?: {
  status?: string;
  offset?: number;
  limit?: number;
}): Promise<AdminPropertyListResponse> {
  return apiRequest<AdminPropertyListResponse>(`/admin/properties${buildQueryString(params)}`);
}

export async function approveProperty(id: string): Promise<void> {
  return apiRequest<void>(`/admin/properties/${id}/approve`, { method: "PATCH" });
}

export async function getAdminBookings(params?: {
  status?: string;
  offset?: number;
  limit?: number;
}): Promise<AdminBookingListResponse> {
  return apiRequest<AdminBookingListResponse>(`/admin/bookings${buildQueryString(params)}`);
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiRequest<AdminStatsResponse>("/admin/stats");
}

export async function getAdminBookingDetail(id: string): Promise<AdminBookingDetailResponse> {
  return apiRequest<AdminBookingDetailResponse>(`/admin/bookings/${id}`);
}

export async function getAdminPropertyDetail(id: string): Promise<AdminPropertyDetailResponse> {
  return apiRequest<AdminPropertyDetailResponse>(`/admin/properties/${id}`);
}

export async function getAdminOwnerDetail(id: string): Promise<AdminOwnerDetailResponse> {
  return apiRequest<AdminOwnerDetailResponse>(`/admin/owners/${id}`);
}

export async function getWithdrawals(status?: string): Promise<WithdrawalListResponse> {
  const search = status ? `?status=${status}` : "";
  return apiRequest<WithdrawalListResponse>(`/admin/wallet/withdrawals${search}`);
}

export async function approveWithdrawal(id: string): Promise<WithdrawalResponse> {
  return apiRequest<WithdrawalResponse>(`/admin/wallet/withdrawals/${id}/approve`, { method: "PATCH" });
}

export async function rejectWithdrawal(id: string): Promise<WithdrawalResponse> {
  return apiRequest<WithdrawalResponse>(`/admin/wallet/withdrawals/${id}/reject`, { method: "PATCH" });
}
