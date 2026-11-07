import { apiRequest, buildQueryString } from "./api";
import type { RestaurantListResponse, RestaurantPartnerProfileResponse, RestaurantResponse } from "../types/api";

export async function getMyRestaurantProfile(): Promise<RestaurantPartnerProfileResponse> {
  return apiRequest<RestaurantPartnerProfileResponse>("/partner/profile");
}

export async function createRestaurantProfile(data: { restaurant_name?: string; description?: string; cuisine_type?: string; address?: string; phone?: string }): Promise<RestaurantPartnerProfileResponse> {
  return apiRequest<RestaurantPartnerProfileResponse>("/partner/profile", { method: "POST", body: data });
}

export async function updateRestaurantProfile(data: { restaurant_name?: string; description?: string; cuisine_type?: string; address?: string; phone?: string }): Promise<RestaurantPartnerProfileResponse> {
  return apiRequest<RestaurantPartnerProfileResponse>("/partner/profile", { method: "PATCH", body: data });
}

export async function getMyRestaurants(offset = 0, limit = 20): Promise<RestaurantListResponse> {
  return apiRequest<RestaurantListResponse>(`/partner/restaurants${buildQueryString({ offset, limit })}`);
}

export async function createRestaurant(data: {
  name: string; description?: string; cuisine_type?: string;
  address?: string; phone?: string; price_range?: string;
  opening_hours?: string; city_id?: string;
}): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>("/partner/restaurants", { method: "POST", body: data });
}

export async function updateRestaurant(id: string, data: Record<string, unknown>): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>(`/partner/restaurants/${id}`, { method: "PATCH", body: data });
}

export async function deleteRestaurant(id: string): Promise<void> {
  return apiRequest<void>(`/partner/restaurants/${id}`, { method: "DELETE" });
}

export async function getPartnerDashboard(): Promise<{ profile: RestaurantPartnerProfileResponse | null; restaurants_count: number; active_restaurants: number; restaurants: RestaurantResponse[] }> {
  return apiRequest("/partner/dashboard");
}

export async function listRestaurantsApi(city_id?: string, offset = 0, limit = 20): Promise<RestaurantListResponse> {
  return apiRequest<RestaurantListResponse>(`/restaurants${buildQueryString({ city_id, offset, limit })}`);
}

export async function getRestaurantApi(id: string): Promise<RestaurantResponse> {
  return apiRequest<RestaurantResponse>(`/restaurants/${id}`);
}
