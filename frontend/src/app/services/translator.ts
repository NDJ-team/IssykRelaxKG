import { apiRequest } from "./api";
import type { TranslatorProfileResponse } from "../types/api";

export async function getMyTranslatorProfile(): Promise<TranslatorProfileResponse> {
  return apiRequest<TranslatorProfileResponse>("/translator/profile");
}

export async function createTranslatorProfile(data: { bio?: string; languages?: string }): Promise<TranslatorProfileResponse> {
  return apiRequest<TranslatorProfileResponse>("/translator/profile", { method: "POST", body: data });
}

export async function updateTranslatorProfile(data: { bio?: string; languages?: string }): Promise<TranslatorProfileResponse> {
  return apiRequest<TranslatorProfileResponse>("/translator/profile", { method: "PATCH", body: data });
}
