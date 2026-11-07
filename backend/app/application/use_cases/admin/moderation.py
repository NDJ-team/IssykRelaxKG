from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.activity import ActivityModel
from app.infrastructure.database.models.local_experience import LocalExperienceModel
from app.infrastructure.database.models.property import PropertyModel
from app.infrastructure.database.models.tour import TourModel
from app.infrastructure.database.models.transfer import TransferModel

SERVICE_MODELS: dict[str, type] = {
    "property": PropertyModel,
    "transfer": TransferModel,
    "tour": TourModel,
    "activity": ActivityModel,
    "experience": LocalExperienceModel,
}

SERVICE_USER_FIELDS: dict[str, str] = {
    "property": "owner_id",
    "transfer": "driver_id",
    "tour": "guide_id",
    "activity": "provider_id",
    "experience": "host_id",
}


class ModerationQueueUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        for service_type, model_cls in SERVICE_MODELS.items():
            result = await self._session.execute(
                select(model_cls)
                .where(model_cls.status == "pending")
                .order_by(model_cls.created_at.desc())
            )
            user_field = SERVICE_USER_FIELDS[service_type]
            for row in result.scalars().all():
                user_id_val = str(getattr(row, user_field, "")) if hasattr(row, user_field) else None
                items.append({
                    "id": str(row.id),
                    "service_type": service_type,
                    "title": row.title,
                    "status": row.status,
                    "created_at": row.created_at.isoformat() if row.created_at else "",
                    "user_id": user_id_val,
                })
        items.sort(key=lambda x: x["created_at"], reverse=True)
        return items


class ApproveEntityUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, service_type: str, entity_id: UUID) -> dict[str, Any]:
        model_cls = SERVICE_MODELS.get(service_type)
        if not model_cls:
            raise ValueError(f"Unknown service type: {service_type}")

        result = await self._session.execute(
            select(model_cls).where(model_cls.id == entity_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"{service_type} not found")

        model.status = "approved"
        await self._session.flush()

        return {"id": str(entity_id), "service_type": service_type, "status": "approved"}


class RejectEntityUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, service_type: str, entity_id: UUID) -> dict[str, Any]:
        model_cls = SERVICE_MODELS.get(service_type)
        if not model_cls:
            raise ValueError(f"Unknown service type: {service_type}")

        result = await self._session.execute(
            select(model_cls).where(model_cls.id == entity_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"{service_type} not found")

        model.status = "rejected"
        await self._session.flush()

        return {"id": str(entity_id), "service_type": service_type, "status": "rejected"}
