import { apiRequest, buildQueryString } from "./api";
import type { AgencyProfileResponse, TourPackageListResponse, TourPackageResponse, AgencyDashboardResponse } from "../types/api";

export async function getMyAgencyProfile(): Promise<AgencyProfileResponse> {
  return apiRequest<AgencyProfileResponse>("/agency/profile");
}

export async function createAgencyProfile(data: { company_name: string; description?: string; license_number?: string }): Promise<AgencyProfileResponse> {
  return apiRequest<AgencyProfileResponse>("/agency/profile", { method: "POST", body: data });
}

export async function updateAgencyProfile(data: { company_name?: string; description?: string; license_number?: string }): Promise<AgencyProfileResponse> {
  return apiRequest<AgencyProfileResponse>("/agency/profile", { method: "PATCH", body: data });
}

export async function getMyTourPackages(offset = 0, limit = 20): Promise<TourPackageListResponse> {
  return apiRequest<TourPackageListResponse>(`/agency/tour-packages${buildQueryString({ offset, limit })}`);
}

export async function createTourPackage(data: {
  title: string; price: number; duration_days: number; max_guests?: number;
  currency?: string; description?: string; includes?: string; itinerary?: Record<string, unknown>;
}): Promise<TourPackageResponse> {
  return apiRequest<TourPackageResponse>("/agency/tour-packages", { method: "POST", body: data });
}

export async function updateTourPackage(id: string, data: Record<string, unknown>): Promise<TourPackageResponse> {
  return apiRequest<TourPackageResponse>(`/agency/tour-packages/${id}`, { method: "PATCH", body: data });
}

export async function deleteTourPackage(id: string): Promise<void> {
  return apiRequest<void>(`/agency/tour-packages/${id}`, { method: "DELETE" });
}

export async function getAgencyDashboard(): Promise<AgencyDashboardResponse> {
  return apiRequest<AgencyDashboardResponse>("/agency/dashboard");
}

export async function listTourPackages(offset = 0, limit = 20): Promise<TourPackageListResponse> {
  return apiRequest<TourPackageListResponse>(`/tour-packages${buildQueryString({ offset, limit })}`);
}

export async function getTourPackage(id: string): Promise<TourPackageResponse> {
  return apiRequest<TourPackageResponse>(`/tour-packages/${id}`);
}
