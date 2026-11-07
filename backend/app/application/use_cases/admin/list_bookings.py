from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminBookingListResponse, AdminBookingResponse
from app.infrastructure.database.models.booking import BookingModel
from app.infrastructure.database.models.property import PropertyModel
from app.infrastructure.database.models.user import UserModel


class AdminListBookingsUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(
        self,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> AdminBookingListResponse:
        stmt = select(BookingModel)
        count_stmt = select(func.count()).select_from(BookingModel)

        if status:
            stmt = stmt.where(BookingModel.status == status)
            count_stmt = count_stmt.where(BookingModel.status == status)

        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        result = await self._session.execute(
            stmt.order_by(BookingModel.created_at.desc()).offset(offset).limit(limit)
        )
        models = result.scalars().all()

        items = []
        for m in models:
            property_result = await self._session.execute(
                select(PropertyModel).where(PropertyModel.id == m.property_id)
            )
            prop = property_result.scalar_one_or_none()

            guest_result = await self._session.execute(
                select(UserModel).where(UserModel.id == m.guest_id)
            )
            guest = guest_result.scalar_one_or_none()

            items.append(
                AdminBookingResponse(
                    id=str(m.id),
                    property_id=str(m.property_id),
                    property_title=prop.title if prop else "",
                    guest_id=str(m.guest_id),
                    guest_name=guest.full_name if guest else "",
                    owner_id=str(m.owner_id),
                    check_in=m.check_in.isoformat(),
                    check_out=m.check_out.isoformat(),
                    total_price=float(m.total_price),
                    status=m.status,
                    guest_confirmed=bool(m.guest_confirmed),
                    owner_confirmed=bool(m.owner_confirmed),
                    verification_code=m.verification_code,
                    created_at=m.created_at.isoformat(),
                )
            )

        return AdminBookingListResponse(items=items, total=total, offset=offset, limit=limit)
