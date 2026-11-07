from __future__ import annotations

from pydantic import BaseModel


class CreateReviewRequest(BaseModel):
    booking_id: str
    rating: int
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: str
    property_id: str
    user_id: str
    booking_id: str
    rating: int
    comment: str | None = None
    created_at: str

    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    items: list[ReviewResponse]
    total: int
    offset: int
    limit: int
