from __future__ import annotations

from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class CityResponse(BaseModel):
    id: str
    name: str
    slug: str
    popularity_score: int = 0

    model_config = {"from_attributes": True}


class AmenityResponse(BaseModel):
    id: str
    name: str
    slug: str

    model_config = {"from_attributes": True}


class CreatePropertyRequest(BaseModel):
    title: str
    description: str
    category_id: str
    city_id: str
    country: str = "Кыргызстан"
    district: str | None = None
    street: str | None = None
    building: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: float
    currency: str = "KGS"
    max_guests: int
    bedrooms: int = 1
    beds: int = 1
    bathrooms: int = 1
    check_in_time: str | None = None
    check_out_time: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    whatsapp: str | None = None
    amenities: list[str] | None = None
    images: list[str] | None = None


class UpdatePropertyRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: str | None = None
    city_id: str | None = None
    country: str | None = None
    district: str | None = None
    street: str | None = None
    building: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: float | None = None
    currency: str | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: int | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    whatsapp: str | None = None
    amenities: list[str] | None = None
    is_active: bool | None = None


class PropertyResponse(BaseModel):
    id: str
    title: str
    description: str
    category: CategoryResponse | None = None
    city: CityResponse | None = None
    status: str
    full_address: str = ""
    price_per_night: float
    currency: str
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    check_in_time: str | None = None
    check_out_time: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    whatsapp: str | None = None
    rating_points: int = 0
    stages: int = 0
    amenities: list[str] = []
    images: list[str] = []
    owner_id: str
    is_active: bool = True
    created_at: str

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    items: list[PropertyResponse]
    total: int
    offset: int
    limit: int
