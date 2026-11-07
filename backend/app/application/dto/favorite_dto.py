from __future__ import annotations

from pydantic import BaseModel


class AddFavoriteRequest(BaseModel):
    property_id: str


class FavoriteResponse(BaseModel):
    id: str
    property_id: str
    created_at: str

    model_config = {"from_attributes": True}


class FavoriteListResponse(BaseModel):
    items: list[FavoriteResponse]
    total: int
    offset: int
    limit: int


class PropertyFavoriteIdsResponse(BaseModel):
    favorite_ids: list[str]
