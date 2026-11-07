import { apiRequest } from "./api";
import type { ConciergeProfileResponse } from "../types/api";

export async function getMyConciergeProfile(): Promise<ConciergeProfileResponse> {
  return apiRequest<ConciergeProfileResponse>("/concierge/profile");
}

export async function createConciergeProfile(data: { bio?: string; service_areas?: string }): Promise<ConciergeProfileResponse> {
  return apiRequest<ConciergeProfileResponse>("/concierge/profile", { method: "POST", body: data });
}

export async function updateConciergeProfile(data: { bio?: string; service_areas?: string }): Promise<ConciergeProfileResponse> {
  return apiRequest<ConciergeProfileResponse>("/concierge/profile", { method: "PATCH", body: data });
}
