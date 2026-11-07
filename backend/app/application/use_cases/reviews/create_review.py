from __future__ import annotations

from uuid import UUID

from app.application.dto.review_dto import CreateReviewRequest, ReviewResponse
from app.domain.entities.booking import BookingStatus
from app.domain.entities.review import Review
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.interfaces.repositories.review_repository import ReviewRepository

RATING_POINTS_MAP = {1: -2, 2: -1, 3: 1, 4: 2, 5: 3}


class CreateReviewUseCase:
    def __init__(
        self,
        review_repo: ReviewRepository,
        booking_repo: BookingRepository,
        property_repo: PropertyRepository,
    ) -> None:
        self._review_repo = review_repo
        self._booking_repo = booking_repo
        self._property_repo = property_repo

    async def execute(self, request: CreateReviewRequest, user_id: UUID) -> ReviewResponse:
        booking = await self._booking_repo.get_by_id(UUID(request.booking_id))
        if not booking:
            raise ValueError("Booking not found")

        if booking.guest_id != user_id:
            raise PermissionError("You can only review your own bookings")

        if booking.status != BookingStatus.CHECKED_IN:
            raise ValueError("Can only review completed (checked-in) bookings")

        existing = await self._review_repo.get_by_booking(UUID(request.booking_id))
        if existing:
            raise ValueError("You have already reviewed this booking")

        if not (1 <= request.rating <= 5):
            raise ValueError("Rating must be between 1 and 5")

        delta = RATING_POINTS_MAP.get(request.rating, 0)
        await self._property_repo.add_rating_points(booking.property_id, delta)

        review = Review.create(
            property_id=booking.property_id,
            user_id=user_id,
            booking_id=UUID(request.booking_id),
            rating=request.rating,
            comment=request.comment,
        )
        await self._review_repo.create(review)

        return ReviewResponse(
            id=str(review.id),
            property_id=str(review.property_id),
            user_id=str(review.user_id),
            booking_id=str(review.booking_id),
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at.isoformat(),
        )
