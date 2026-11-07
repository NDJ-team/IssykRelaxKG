from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models.owner_profile import OwnerProfileModel


class ApproveOwnerUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, owner_id: UUID) -> dict[str, Any]:
        result = await self._session.execute(
            select(OwnerProfileModel).where(OwnerProfileModel.user_id == owner_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError("Owner profile not found")

        profile.is_approved = True
        await self._session.flush()

        return {"id": str(owner_id), "is_approved": True}
