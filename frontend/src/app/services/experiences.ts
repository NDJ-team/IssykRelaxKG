import { apiRequest, buildQueryString } from "./api";

export interface LocalExperienceResponse {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  duration_minutes: number | null;
  max_guests: number | null;
  city_id: string | null;
  city?: { id: string; name: string; slug?: string } | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  includes: string | null;
  languages: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalExperienceListResponse {
  items: LocalExperienceResponse[];
  total: number;
}

export async function listExperiences(params?: {
  city_id?: string;
  category?: string;
  query?: string;
  offset?: number;
  limit?: number;
}): Promise<LocalExperienceListResponse> {
  return apiRequest<LocalExperienceListResponse>(
    `/experiences${buildQueryString(params)}`,
    { auth: false },
  );
}

export async function getExperience(id: string): Promise<LocalExperienceResponse> {
  return apiRequest<LocalExperienceResponse>(`/experiences/${id}`, { auth: false });
}

export async function getMyExperiences(): Promise<LocalExperienceListResponse> {
  return apiRequest<LocalExperienceListResponse>("/local-host/experiences");
}

export async function createExperience(data: {
  title: string;
  description?: string;
  category: string;
  price: number;
  duration_minutes?: number;
  max_guests?: number;
  city_id?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  includes?: string;
  languages?: string;
}): Promise<LocalExperienceResponse> {
  return apiRequest<LocalExperienceResponse>("/local-host/experiences", {
    method: "POST",
    body: data,
  });
}
