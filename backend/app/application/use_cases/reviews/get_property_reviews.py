from __future__ import annotations

from uuid import UUID

from app.application.dto.review_dto import ReviewListResponse, ReviewResponse
from app.domain.interfaces.repositories.review_repository import ReviewRepository


class GetPropertyReviewsUseCase:
    def __init__(self, review_repo: ReviewRepository) -> None:
        self._review_repo = review_repo

    async def execute(
        self, property_id: UUID, offset: int = 0, limit: int = 20
    ) -> ReviewListResponse:
        items, total = await self._review_repo.get_by_property(property_id, offset=offset, limit=limit)

        return ReviewListResponse(
            items=[
                ReviewResponse(
                    id=str(r.id),
                    property_id=str(r.property_id),
                    user_id=str(r.user_id),
                    booking_id=str(r.booking_id),
                    rating=r.rating,
                    comment=r.comment,
                    created_at=r.created_at.isoformat(),
                )
                for r in items
            ],
            total=total,
            offset=offset,
            limit=limit,
        )
