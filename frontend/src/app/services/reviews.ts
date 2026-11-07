import { apiRequest } from "./api";
import type { ReviewResponse, ReviewListResponse } from "../types/api";

export async function createReview(data: {
  booking_id: string;
  rating: number;
  comment?: string;
}): Promise<ReviewResponse> {
  return apiRequest<ReviewResponse>("/reviews", {
    method: "POST",
    body: data,
  });
}

export async function getPropertyReviews(
  propertyId: string,
  params?: { offset?: number; limit?: number }
): Promise<ReviewListResponse> {
  const search = new URLSearchParams();
  if (params?.offset !== undefined) search.set("offset", String(params.offset));
  if (params?.limit !== undefined) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiRequest<ReviewListResponse>(
    `/reviews/property/${propertyId}${qs ? `?${qs}` : ""}`
  );
}
