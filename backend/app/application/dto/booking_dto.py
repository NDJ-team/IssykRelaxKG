from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class CreateBookingRequest(BaseModel):
    property_id: str | None = None
    service_type: str = "property"
    service_id: str | None = None
    check_in: date | None = None
    check_out: date | None = None
    guest_count: int = 1
    special_requests: str | None = None


class BookingResponse(BaseModel):
    id: str
    service_type: str
    service_id: str | None = None
    property_id: str | None = None
    guest_id: str
    owner_id: str
    check_in: str | None = None
    check_out: str | None = None
    total_price: float
    status: str
    guest_count: int
    special_requests: str | None = None
    verification_code: str | None = None
    guest_confirmed: bool = False
    owner_confirmed: bool = False
    created_at: str

    model_config = {"from_attributes": True}


class BookingListResponse(BaseModel):
    items: list[BookingResponse]
    total: int
    offset: int
    limit: int


class CheckInRequest(BaseModel):
    verification_code: str
