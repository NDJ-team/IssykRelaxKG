import { apiRequest, buildQueryString } from "./api";
import type { DriverDashboardResponse, DriverProfileResponse, TransferListResponse, TransferResponse } from "../types/api";

export async function getMyDriverProfile(): Promise<DriverProfileResponse> {
  return apiRequest<DriverProfileResponse>("/driver/profile");
}

export async function createDriverProfile(data: { bio?: string; license_number?: string; vehicle_info?: string }): Promise<DriverProfileResponse> {
  return apiRequest<DriverProfileResponse>("/driver/profile", { method: "POST", body: data });
}

export async function updateDriverProfile(data: { bio?: string; license_number?: string; vehicle_info?: string }): Promise<DriverProfileResponse> {
  return apiRequest<DriverProfileResponse>("/driver/profile", { method: "PATCH", body: data });
}

export async function getMyTransfers(offset = 0, limit = 20): Promise<TransferListResponse> {
  return apiRequest<TransferListResponse>(`/driver/transfers${buildQueryString({ offset, limit })}`);
}

export async function createTransfer(data: {
  title: string; from_location: string; to_location: string; price: number;
  max_passengers?: number; currency?: string; description?: string;
  vehicle_type?: string; duration_minutes?: number; city_id?: string;
}): Promise<TransferResponse> {
  return apiRequest<TransferResponse>("/driver/transfers", { method: "POST", body: data });
}

export async function updateTransfer(id: string, data: Record<string, unknown>): Promise<TransferResponse> {
  return apiRequest<TransferResponse>(`/driver/transfers/${id}`, { method: "PATCH", body: data });
}

export async function deleteTransfer(id: string): Promise<void> {
  return apiRequest<void>(`/driver/transfers/${id}`, { method: "DELETE" });
}

export async function getDriverDashboard(): Promise<DriverDashboardResponse> {
  return apiRequest<DriverDashboardResponse>("/driver/dashboard");
}

export async function listTransfers(city_id?: string, offset = 0, limit = 20): Promise<TransferListResponse> {
  return apiRequest<TransferListResponse>(`/transfers${buildQueryString({ city_id, offset, limit })}`);
}

export async function getTransfer(id: string): Promise<TransferResponse> {
  return apiRequest<TransferResponse>(`/transfers/${id}`);
}
