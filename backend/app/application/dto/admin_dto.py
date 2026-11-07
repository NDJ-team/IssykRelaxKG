from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class AdminOwnerResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None = None
    is_approved: bool = False
    created_at: str


class AdminOwnerListResponse(BaseModel):
    items: list[AdminOwnerResponse]
    total: int
    offset: int
    limit: int


class AdminPropertyResponse(BaseModel):
    id: str
    title: str
    owner_id: str
    owner_name: str
    category: str
    city: str
    status: str
    price_per_night: float
    is_active: bool = True
    created_at: str


class AdminPropertyListResponse(BaseModel):
    items: list[AdminPropertyResponse]
    total: int
    offset: int
    limit: int


class AdminBookingResponse(BaseModel):
    id: str
    property_id: str
    property_title: str
    guest_id: str
    guest_name: str
    owner_id: str
    check_in: str
    check_out: str
    total_price: float
    status: str
    guest_confirmed: bool = False
    owner_confirmed: bool = False
    verification_code: str | None = None
    created_at: str


class AdminBookingListResponse(BaseModel):
    items: list[AdminBookingResponse]
    total: int
    offset: int
    limit: int


class AdminBookingDetailResponse(BaseModel):
    id: str
    property_id: str | None = None
    property_title: str | None = None
    property_category: str | None = None
    property_city: str | None = None
    property_address: str | None = None
    property_price_per_night: float | None = None
    property_max_guests: int | None = None
    property_bedrooms: int | None = None
    property_beds: int | None = None
    property_bathrooms: int | None = None
    property_amenities: list[str] = []
    property_images: list[dict] = []
    guest_id: str
    guest_name: str
    guest_email: str
    guest_phone: str | None = None
    owner_id: str
    owner_name: str
    owner_email: str
    owner_phone: str | None = None
    check_in: str
    check_out: str
    total_price: float
    status: str
    guest_count: int
    special_requests: str | None = None
    verification_code: str | None = None
    guest_confirmed: bool = False
    owner_confirmed: bool = False
    created_at: str
    updated_at: str


class AdminPropertyDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    owner_id: str
    owner_name: str
    owner_email: str
    category: str
    city: str
    address: str
    status: str
    price_per_night: float
    currency: str
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    check_in_time: str | None = None
    check_out_time: str | None = None
    amenities: list[str] = []
    images: list[dict] = []
    instagram: str | None = None
    telegram: str | None = None
    whatsapp: str | None = None
    is_active: bool = True
    booking_count: int = 0
    created_at: str
    updated_at: str


class AdminOwnerDetailResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None = None
    avatar_url: str | None = None
    is_approved: bool = False
    is_active: bool = True
    property_count: int = 0
    business_phone: str | None = None
    created_at: str
    updated_at: str


class RatingAdjustRequest(BaseModel):
    points: int


class AdminStatsRoleCount(BaseModel):
    slug: str
    name: str
    count: int


class AdminStatsResponse(BaseModel):
    total_users: int
    total_owners: int
    total_properties: int
    total_bookings: int
    total_revenue: float
    role_counts: list[AdminStatsRoleCount] = []


class AssignRoleRequest(BaseModel):
    role_slug: str


class ModerationQueueItem(BaseModel):
    id: str
    service_type: str
    title: str
    status: str
    created_at: str
    user_id: str | None = None


class ModerationQueueResponse(BaseModel):
    items: list[ModerationQueueItem]
    total: int = 0


class RoleResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    created_at: str


class ListRolesResponse(BaseModel):
    items: list[RoleResponse]


class AssignRoleResponse(BaseModel):
    user_id: str
    role_slug: str
    role_name: str


class WithdrawalResponse(BaseModel):
    id: str
    wallet_id: str
    amount: float
    type: str = "withdrawal"
    status: str
    note: str | None = None
    created_at: str


class WithdrawalListResponse(BaseModel):
    items: list[WithdrawalResponse]
    total: int = 0
