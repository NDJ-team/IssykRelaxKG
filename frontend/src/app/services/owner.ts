import { apiRequest, buildQueryString } from "./api";
import type { PropertyResponse, PropertyListResponse, BookingListResponse, WalletResponse } from "../types/api";

export async function getOwnerProperties(params?: {
  offset?: number;
  limit?: number;
}): Promise<PropertyListResponse> {
  return apiRequest<PropertyListResponse>(`/owner/properties${buildQueryString(params)}`);
}

export async function getOwnerBookings(params?: {
  offset?: number;
  limit?: number;
}): Promise<BookingListResponse> {
  return apiRequest<BookingListResponse>(`/owner/bookings${buildQueryString(params)}`);
}

export async function getOwnerWallet(): Promise<WalletResponse> {
  return apiRequest<WalletResponse>("/owner/wallet");
}

export async function checkInBooking(verificationCode: string): Promise<void> {
  return apiRequest<void>("/owner/check-in", {
    method: "POST",
    body: { verification_code: verificationCode },
  });
}

export async function cancelOwnerBooking(bookingId: string): Promise<void> {
  return apiRequest<void>(`/owner/bookings/${bookingId}/cancel`, { method: "POST" });
}
