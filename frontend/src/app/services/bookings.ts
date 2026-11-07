import { apiRequest, buildQueryString } from "./api";
import type { BookingResponse, BookingListResponse } from "../types/api";

export async function createBooking(data: {
  property_id?: string;
  service_type?: string;
  service_id?: string;
  check_in?: string;
  check_out?: string;
  guest_count: number;
  special_requests?: string;
}): Promise<BookingResponse> {
  return apiRequest<BookingResponse>("/bookings", {
    method: "POST",
    body: data,
  });
}

export async function getMyBookings(params?: {
  offset?: number;
  limit?: number;
}): Promise<BookingListResponse> {
  return apiRequest<BookingListResponse>(`/bookings/my-bookings${buildQueryString(params)}`);
}

export async function cancelBooking(id: string): Promise<BookingResponse> {
  return apiRequest<BookingResponse>(`/bookings/${id}/cancel`, { method: "POST" });
}

export async function confirmGuestCheckIn(bookingId: string): Promise<BookingResponse> {
  return apiRequest<BookingResponse>(`/bookings/${bookingId}/confirm-check-in`, { method: "POST" });
}
