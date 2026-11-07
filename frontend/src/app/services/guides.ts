import { apiRequest, buildQueryString } from "./api";
import type { GuideProfileResponse, TourListResponse, TourResponse } from "../types/api";

export async function getMyGuideProfile(): Promise<GuideProfileResponse> {
  return apiRequest<GuideProfileResponse>("/guide/profile");
}

export async function createGuideProfile(data: { bio?: string; languages?: string }): Promise<GuideProfileResponse> {
  return apiRequest<GuideProfileResponse>("/guide/profile", { method: "POST", body: data });
}

export async function updateGuideProfile(data: { bio?: string; languages?: string }): Promise<GuideProfileResponse> {
  return apiRequest<GuideProfileResponse>("/guide/profile", { method: "PATCH", body: data });
}

export async function getMyTours(offset = 0, limit = 20): Promise<TourListResponse> {
  return apiRequest<TourListResponse>(`/guide/tours${buildQueryString({ offset, limit })}`);
}

export async function createTour(data: {
  title: string; price: number; duration_days: number; max_guests?: number;
  currency?: string; description?: string; includes?: string;
  meeting_point?: string; city_id?: string;
}): Promise<TourResponse> {
  return apiRequest<TourResponse>("/guide/tours", { method: "POST", body: data });
}

export async function updateTour(id: string, data: Record<string, unknown>): Promise<TourResponse> {
  return apiRequest<TourResponse>(`/guide/tours/${id}`, { method: "PATCH", body: data });
}

export async function deleteTour(id: string): Promise<void> {
  return apiRequest<void>(`/guide/tours/${id}`, { method: "DELETE" });
}

export async function getGuideDashboard(): Promise<{ profile: GuideProfileResponse | null; tours_count: number; active_tours: number; tours: TourResponse[] }> {
  return apiRequest("/guide/dashboard");
}

export async function listTours(city_id?: string, offset = 0, limit = 20): Promise<TourListResponse> {
  return apiRequest<TourListResponse>(`/tours${buildQueryString({ city_id, offset, limit })}`);
}

export async function getTour(id: string): Promise<TourResponse> {
  return apiRequest<TourResponse>(`/tours/${id}`);
}
