import { apiRequest, buildQueryString } from "./api";
import type { ActivityListResponse, ActivityProviderProfileResponse, ActivityResponse } from "../types/api";

export async function getMyActivityProfile(): Promise<ActivityProviderProfileResponse> {
  return apiRequest<ActivityProviderProfileResponse>("/activity-provider/profile");
}

export async function createActivityProfile(data: { company_name?: string; bio?: string }): Promise<ActivityProviderProfileResponse> {
  return apiRequest<ActivityProviderProfileResponse>("/activity-provider/profile", { method: "POST", body: data });
}

export async function updateActivityProfile(data: { company_name?: string; bio?: string }): Promise<ActivityProviderProfileResponse> {
  return apiRequest<ActivityProviderProfileResponse>("/activity-provider/profile", { method: "PATCH", body: data });
}

export async function getMyActivities(offset = 0, limit = 20): Promise<ActivityListResponse> {
  return apiRequest<ActivityListResponse>(`/activity-provider/activities${buildQueryString({ offset, limit })}`);
}

export async function createActivity(data: {
  title: string; price: number; max_participants: number; duration_minutes: number;
  currency?: string; description?: string; location?: string; city_id?: string;
}): Promise<ActivityResponse> {
  return apiRequest<ActivityResponse>("/activity-provider/activities", { method: "POST", body: data });
}

export async function updateActivity(id: string, data: Record<string, unknown>): Promise<ActivityResponse> {
  return apiRequest<ActivityResponse>(`/activity-provider/activities/${id}`, { method: "PATCH", body: data });
}

export async function deleteActivity(id: string): Promise<void> {
  return apiRequest<void>(`/activity-provider/activities/${id}`, { method: "DELETE" });
}

export async function getActivityDashboard(): Promise<{ profile: ActivityProviderProfileResponse | null; activities_count: number; active_activities: number; activities: ActivityResponse[] }> {
  return apiRequest("/activity-provider/dashboard");
}

export async function listActivities(city_id?: string, offset = 0, limit = 20): Promise<ActivityListResponse> {
  return apiRequest<ActivityListResponse>(`/activities${buildQueryString({ city_id, offset, limit })}`);
}

export async function getActivity(id: string): Promise<ActivityResponse> {
  return apiRequest<ActivityResponse>(`/activities/${id}`);
}
