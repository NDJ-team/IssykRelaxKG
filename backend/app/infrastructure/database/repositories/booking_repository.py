from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.booking import Booking as BookingEntity
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.infrastructure.database.models.booking import BookingModel


class SQLAlchemyBookingRepository(BookingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, booking: BookingEntity) -> BookingEntity:
        model = BookingModel(
            id=booking.id,
            service_type=booking.service_type,
            service_id=booking.service_id,
            property_id=booking.property_id,
            guest_id=booking.guest_id,
            owner_id=booking.owner_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            total_price=float(booking.total_price),
            status=booking.status,
            guest_count=booking.guest_count,
            special_requests=booking.special_requests,
            verification_code=booking.verification_code,
            guest_confirmed=booking.guest_confirmed,
            owner_confirmed=booking.owner_confirmed,
            created_at=booking.created_at,
            updated_at=booking.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return booking

    async def get_by_id(self, booking_id: UUID) -> BookingEntity | None:
        result = await self._session.execute(select(BookingModel).where(BookingModel.id == booking_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_guest(self, guest_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[BookingEntity], int]:
        base = select(BookingModel).where(BookingModel.guest_id == guest_id)
        return await self._paginate(base, offset, limit)

    async def get_by_owner(self, owner_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[BookingEntity], int]:
        base = select(BookingModel).where(BookingModel.owner_id == owner_id)
        return await self._paginate(base, offset, limit)

    async def get_by_property(self, property_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[BookingEntity], int]:
        base = select(BookingModel).where(BookingModel.property_id == property_id)
        return await self._paginate(base, offset, limit)

    async def get_by_service(self, service_type: str, service_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[BookingEntity], int]:
        base = select(BookingModel).where(
            BookingModel.service_type == service_type, BookingModel.service_id == service_id
        )
        return await self._paginate(base, offset, limit)

    async def get_by_verification_code(self, code: str) -> BookingEntity | None:
        result = await self._session.execute(
            select(BookingModel).where(BookingModel.verification_code == code)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def check_availability(self, property_id: UUID, check_in: datetime, check_out: datetime) -> bool:
        stmt = select(func.count()).select_from(BookingModel).where(
            BookingModel.property_id == property_id,
            BookingModel.status.in_(["pending", "paid", "checked_in"]),
            and_(
                BookingModel.check_in < check_out,
                BookingModel.check_out > check_in,
            ),
        )
        result = await self._session.execute(stmt)
        count = result.scalar() or 0
        return count == 0

    async def update(self, booking: BookingEntity) -> BookingEntity:
        result = await self._session.execute(select(BookingModel).where(BookingModel.id == booking.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Booking not found")

        model.service_type = booking.service_type
        model.service_id = booking.service_id
        model.property_id = booking.property_id
        model.check_in = booking.check_in
        model.check_out = booking.check_out
        model.total_price = float(booking.total_price)
        model.status = booking.status
        model.guest_count = booking.guest_count
        model.special_requests = booking.special_requests
        model.verification_code = booking.verification_code
        model.guest_confirmed = booking.guest_confirmed
        model.owner_confirmed = booking.owner_confirmed
        model.updated_at = booking.updated_at
        await self._session.flush()
        return booking

    async def delete(self, booking_id: UUID) -> None:
        result = await self._session.execute(select(BookingModel).where(BookingModel.id == booking_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def _paginate(self, base, offset: int, limit: int) -> tuple[list[BookingEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(
            base.order_by(BookingModel.created_at.desc()).offset(offset).limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()], total

    def _to_entity(self, model: BookingModel) -> BookingEntity:
        return BookingEntity(
            id=model.id,
            service_type=model.service_type,
            service_id=model.service_id,
            property_id=model.property_id,
            guest_id=model.guest_id,
            owner_id=model.owner_id,
            check_in=model.check_in,
            check_out=model.check_out,
            total_price=Decimal(model.total_price),
            status=model.status,
            guest_count=model.guest_count,
            special_requests=model.special_requests,
            verification_code=model.verification_code,
            guest_confirmed=model.guest_confirmed,
            owner_confirmed=model.owner_confirmed,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
