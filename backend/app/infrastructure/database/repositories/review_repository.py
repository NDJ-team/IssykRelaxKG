from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.review import Review as ReviewEntity
from app.domain.interfaces.repositories.review_repository import ReviewRepository
from app.infrastructure.database.models.review import ReviewModel


class SQLAlchemyReviewRepository(ReviewRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, review: ReviewEntity) -> ReviewEntity:
        model = ReviewModel(
            id=review.id,
            property_id=review.property_id,
            user_id=review.user_id,
            booking_id=review.booking_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return review

    async def get_by_id(self, review_id: UUID) -> ReviewEntity | None:
        result = await self._session.execute(
            select(ReviewModel).where(ReviewModel.id == review_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_booking(self, booking_id: UUID) -> ReviewEntity | None:
        result = await self._session.execute(
            select(ReviewModel).where(ReviewModel.booking_id == booking_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_property(
        self, property_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[ReviewEntity], int]:
        count_result = await self._session.execute(
            select(func.count()).select_from(ReviewModel).where(ReviewModel.property_id == property_id)
        )
        total = count_result.scalar() or 0

        result = await self._session.execute(
            select(ReviewModel)
            .where(ReviewModel.property_id == property_id)
            .order_by(ReviewModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    async def update(self, review: ReviewEntity) -> ReviewEntity:
        result = await self._session.execute(
            select(ReviewModel).where(ReviewModel.id == review.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Review not found")

        model.rating = review.rating
        model.comment = review.comment
        model.updated_at = review.updated_at
        await self._session.flush()
        return review

    async def delete(self, review_id: UUID) -> None:
        result = await self._session.execute(
            select(ReviewModel).where(ReviewModel.id == review_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    def _to_entity(self, model: ReviewModel) -> ReviewEntity:
        return ReviewEntity(
            id=model.id,
            property_id=model.property_id,
            user_id=model.user_id,
            booking_id=model.booking_id,
            rating=model.rating,
            comment=model.comment,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
