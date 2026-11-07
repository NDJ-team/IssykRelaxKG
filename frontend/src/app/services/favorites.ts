import { apiRequest, buildQueryString } from "./api";
import type { FavoriteResponse, FavoriteIdsResponse, PropertyListResponse } from "../types/api";

export async function addFavorite(propertyId: string): Promise<FavoriteResponse> {
  return apiRequest<FavoriteResponse>("/favorites", {
    method: "POST",
    body: { property_id: propertyId },
  });
}

export async function removeFavorite(propertyId: string): Promise<void> {
  return apiRequest<void>(`/favorites/${propertyId}`, {
    method: "DELETE",
  });
}

export async function getFavoriteIds(): Promise<FavoriteIdsResponse> {
  return apiRequest<FavoriteIdsResponse>("/favorites/ids");
}

export async function getFavoriteProperties(params?: {
  offset?: number;
  limit?: number;
}): Promise<PropertyListResponse> {
  return apiRequest<PropertyListResponse>(`/favorites/properties${buildQueryString(params)}`);
}
