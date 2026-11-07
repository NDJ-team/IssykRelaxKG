from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.domain.entities.transfer import Transfer as TransferEntity
from app.domain.interfaces.repositories.driver_repository import DriverRepository


class CreateTransferUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(
        self,
        user_id: UUID,
        title: str,
        from_location: str,
        to_location: str,
        price: float,
        max_passengers: int = 4,
        currency: str = "KGS",
        description: str | None = None,
        vehicle_type: str | None = None,
        duration_minutes: int | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Driver profile not found. Create one first.")

        transfer = TransferEntity.create(
            driver_id=profile.id,
            title=title,
            from_location=from_location,
            to_location=to_location,
            price=Decimal(str(price)),
            max_passengers=max_passengers,
            currency=currency,
            description=description,
            vehicle_type=vehicle_type,
            duration_minutes=duration_minutes,
            city_id=UUID(city_id) if city_id else None,
        )
        await self._driver_repo.create_transfer(transfer)

        return _transfer_to_dict(transfer)


class UpdateTransferUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(
        self,
        transfer_id: UUID,
        user_id: UUID,
        title: str | None = None,
        from_location: str | None = None,
        to_location: str | None = None,
        price: float | None = None,
        max_passengers: int | None = None,
        currency: str | None = None,
        description: str | None = None,
        vehicle_type: str | None = None,
        duration_minutes: int | None = None,
        is_active: bool | None = None,
        city_id: str | None = None,
    ) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Driver profile not found")

        transfer = await self._driver_repo.get_transfer_by_id(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found")
        if transfer.driver_id != profile.id:
            raise PermissionError("This transfer does not belong to you")

        if title is not None:
            transfer.title = title
        if from_location is not None:
            transfer.from_location = from_location
        if to_location is not None:
            transfer.to_location = to_location
        if price is not None:
            transfer.price = Decimal(str(price))
        if max_passengers is not None:
            transfer.max_passengers = max_passengers
        if currency is not None:
            transfer.currency = currency
        if description is not None:
            transfer.description = description
        if vehicle_type is not None:
            transfer.vehicle_type = vehicle_type
        if duration_minutes is not None:
            transfer.duration_minutes = duration_minutes
        if is_active is not None:
            transfer.is_active = is_active
        if city_id is not None:
            transfer.city_id = UUID(city_id)

        transfer.updated_at = datetime.now()
        await self._driver_repo.update_transfer(transfer)

        return _transfer_to_dict(transfer)


class ListMyTransfersUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}

        items, total = await self._driver_repo.get_transfers_by_driver(profile.id, offset=offset, limit=limit)
        return {"items": [_transfer_to_dict(t) for t in items], "total": total}


class ListTransfersUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, city_id: str | None = None, offset: int = 0, limit: int = 20) -> dict:
        city_uuid = UUID(city_id) if city_id else None
        items, total = await self._driver_repo.list_transfers(city_id=city_uuid, offset=offset, limit=limit)
        return {"items": [_transfer_to_dict(t) for t in items], "total": total}


class GetTransferUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, transfer_id: UUID) -> dict:
        transfer = await self._driver_repo.get_transfer_by_id(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found")
        return _transfer_to_dict(transfer)


class DeleteTransferUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, transfer_id: UUID, user_id: UUID) -> None:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Driver profile not found")

        transfer = await self._driver_repo.get_transfer_by_id(transfer_id)
        if not transfer:
            raise ValueError("Transfer not found")
        if transfer.driver_id != profile.id:
            raise PermissionError("This transfer does not belong to you")

        await self._driver_repo.delete_transfer(transfer_id)


class GetDriverDashboardUseCase:
    def __init__(self, driver_repo: DriverRepository) -> None:
        self._driver_repo = driver_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._driver_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "transfers_count": 0, "active_transfers": 0}

        items, _ = await self._driver_repo.get_transfers_by_driver(profile.id, limit=1000)
        transfers = [_transfer_to_dict(t) for t in items]
        active = [t for t in transfers if t["is_active"]]

        return {
            "profile": {
                "id": str(profile.id),
                "bio": profile.bio,
                "license_number": profile.license_number,
                "vehicle_info": profile.vehicle_info,
                "is_approved": profile.is_approved,
            },
            "transfers_count": len(transfers),
            "active_transfers": len(active),
            "transfers": transfers,
        }

def _transfer_to_dict(t: TransferEntity) -> dict:
    return {
        "id": str(t.id),
        "driver_id": str(t.driver_id),
        "title": t.title,
        "description": t.description,
        "from_location": t.from_location,
        "to_location": t.to_location,
        "price": float(t.price),
        "currency": t.currency,
        "max_passengers": t.max_passengers,
        "vehicle_type": t.vehicle_type,
        "duration_minutes": t.duration_minutes,
        "status": t.status,
        "is_active": t.is_active,
        "city_id": str(t.city_id) if t.city_id else None,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }
