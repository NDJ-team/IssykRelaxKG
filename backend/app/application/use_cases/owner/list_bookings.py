from __future__ import annotations

from uuid import UUID

from app.application.dto.booking_dto import BookingListResponse, BookingResponse
from app.domain.interfaces.repositories.booking_repository import BookingRepository


class ListOwnerBookingsUseCase:
    def __init__(self, booking_repo: BookingRepository) -> None:
        self._booking_repo = booking_repo

    async def execute(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> BookingListResponse:
        items, total = await self._booking_repo.get_by_owner(owner_id, offset=offset, limit=limit)

        return BookingListResponse(
            items=[
                BookingResponse(
                    id=str(b.id),
                    property_id=str(b.property_id),
                    guest_id=str(b.guest_id),
                    owner_id=str(b.owner_id),
                    check_in=b.check_in.isoformat(),
                    check_out=b.check_out.isoformat(),
                    total_price=float(b.total_price),
                    status=b.status,
                    guest_count=b.guest_count,
                    special_requests=b.special_requests,
                    verification_code=b.verification_code,
                    guest_confirmed=b.guest_confirmed,
                    owner_confirmed=b.owner_confirmed,
                    created_at=b.created_at.isoformat(),
                )
                for b in items
            ],
            total=total,
            offset=offset,
            limit=limit,
        )
