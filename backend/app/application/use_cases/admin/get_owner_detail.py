from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminOwnerDetailResponse
from app.infrastructure.database.models.owner_profile import OwnerProfileModel
from app.infrastructure.database.models.property import PropertyModel
from app.infrastructure.database.models.user import UserModel


class AdminGetOwnerDetailUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self, owner_id: UUID) -> AdminOwnerDetailResponse:
        user_result = await self._session.execute(
            select(UserModel).where(UserModel.id == owner_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            raise ValueError("Owner not found")

        profile_result = await self._session.execute(
            select(OwnerProfileModel).where(OwnerProfileModel.user_id == owner_id)
        )
        profile = profile_result.scalar_one_or_none()

        prop_count_result = await self._session.execute(
            select(func.count()).select_from(PropertyModel).where(PropertyModel.owner_id == owner_id)
        )
        prop_count = prop_count_result.scalar() or 0

        return AdminOwnerDetailResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            is_approved=profile.is_approved if profile else False,
            is_active=user.is_active,
            property_count=prop_count,
            business_phone=profile.business_phone if profile else None,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
        )
