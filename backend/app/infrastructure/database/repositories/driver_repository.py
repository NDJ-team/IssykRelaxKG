from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.driver_profile import DriverProfile as DriverProfileEntity
from app.domain.entities.transfer import Transfer as TransferEntity
from app.domain.interfaces.repositories.driver_repository import DriverRepository
from app.infrastructure.database.models.driver_profile import DriverProfileModel
from app.infrastructure.database.models.transfer import TransferModel


class SQLAlchemyDriverRepository(DriverRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: DriverProfileEntity) -> DriverProfileEntity:
        model = DriverProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            bio=profile.bio,
            license_number=profile.license_number,
            vehicle_info=profile.vehicle_info,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> DriverProfileEntity | None:
        result = await self._session.execute(select(DriverProfileModel).where(DriverProfileModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> DriverProfileEntity | None:
        result = await self._session.execute(select(DriverProfileModel).where(DriverProfileModel.id == profile_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def update_profile(self, profile: DriverProfileEntity) -> DriverProfileEntity:
        result = await self._session.execute(select(DriverProfileModel).where(DriverProfileModel.id == profile.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Driver profile not found")
        model.bio = profile.bio
        model.license_number = profile.license_number
        model.vehicle_info = profile.vehicle_info
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def create_transfer(self, transfer: TransferEntity) -> TransferEntity:
        model = TransferModel(
            id=transfer.id,
            driver_id=transfer.driver_id,
            title=transfer.title,
            description=transfer.description,
            from_location=transfer.from_location,
            to_location=transfer.to_location,
            price=float(transfer.price),
            currency=transfer.currency,
            max_passengers=transfer.max_passengers,
            vehicle_type=transfer.vehicle_type,
            duration_minutes=transfer.duration_minutes,
            status=transfer.status,
            is_active=transfer.is_active,
            city_id=transfer.city_id,
            created_at=transfer.created_at,
            updated_at=transfer.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return transfer

    async def get_transfer_by_id(self, transfer_id: UUID) -> TransferEntity | None:
        result = await self._session.execute(select(TransferModel).where(TransferModel.id == transfer_id))
        model = result.scalar_one_or_none()
        return self._transfer_to_entity(model) if model else None

    async def get_transfers_by_driver(self, driver_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[TransferEntity], int]:
        base = select(TransferModel).where(TransferModel.driver_id == driver_profile_id)
        return await self._paginate_transfers(base, offset, limit)

    async def list_transfers(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[TransferEntity], int]:
        base = select(TransferModel).where(TransferModel.is_active == True, TransferModel.status == "approved")
        if city_id:
            base = base.where(TransferModel.city_id == city_id)
        return await self._paginate_transfers(base, offset, limit)

    async def update_transfer(self, transfer: TransferEntity) -> TransferEntity:
        result = await self._session.execute(select(TransferModel).where(TransferModel.id == transfer.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Transfer not found")
        model.title = transfer.title
        model.description = transfer.description
        model.from_location = transfer.from_location
        model.to_location = transfer.to_location
        model.price = float(transfer.price)
        model.currency = transfer.currency
        model.max_passengers = transfer.max_passengers
        model.vehicle_type = transfer.vehicle_type
        model.duration_minutes = transfer.duration_minutes
        model.status = transfer.status
        model.is_active = transfer.is_active
        model.city_id = transfer.city_id
        model.updated_at = transfer.updated_at
        await self._session.flush()
        return transfer

    async def delete_transfer(self, transfer_id: UUID) -> None:
        result = await self._session.execute(select(TransferModel).where(TransferModel.id == transfer_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def list_drivers(self, offset: int = 0, limit: int = 20) -> tuple[list[DriverProfileEntity], int]:
        base = select(DriverProfileModel).where(DriverProfileModel.is_approved == True)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(DriverProfileModel.created_at.desc()).offset(offset).limit(limit))
        return [self._profile_to_entity(m) for m in result.scalars().all()], total

    async def _paginate_transfers(self, base, offset: int, limit: int) -> tuple[list[TransferEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(TransferModel.created_at.desc()).offset(offset).limit(limit))
        return [self._transfer_to_entity(m) for m in result.scalars().all()], total

    def _profile_to_entity(self, model: DriverProfileModel) -> DriverProfileEntity:
        return DriverProfileEntity(
            id=model.id,
            user_id=model.user_id,
            bio=model.bio,
            license_number=model.license_number,
            vehicle_info=model.vehicle_info,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _transfer_to_entity(self, model: TransferModel) -> TransferEntity:
        return TransferEntity(
            id=model.id,
            driver_id=model.driver_id,
            title=model.title,
            description=model.description,
            from_location=model.from_location,
            to_location=model.to_location,
            price=Decimal(str(model.price)),
            currency=model.currency,
            max_passengers=model.max_passengers,
            vehicle_type=model.vehicle_type,
            duration_minutes=model.duration_minutes,
            status=model.status,
            is_active=model.is_active,
            city_id=model.city_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
