from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminOwnerListResponse, AdminOwnerResponse
from app.domain.interfaces.repositories.user_repository import UserRepository
from app.infrastructure.database.models.owner_profile import OwnerProfileModel


class ListOwnersUseCase:
    def __init__(self, user_repo: UserRepository, session: AsyncSession) -> None:
        self._user_repo = user_repo
        self._session = session

    async def execute(self, approved: bool | None = None, offset: int = 0, limit: int = 20) -> AdminOwnerListResponse:
        users, total = await self._user_repo.list_owners(approved=approved, offset=offset, limit=limit)

        items = []
        for user in users:
            result = await self._session.execute(
                select(OwnerProfileModel).where(OwnerProfileModel.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            items.append(
                AdminOwnerResponse(
                    id=str(user.id),
                    email=user.email,
                    full_name=user.full_name,
                    phone=user.phone,
                    is_approved=profile.is_approved if profile else False,
                    created_at=user.created_at.isoformat(),
                )
            )

        return AdminOwnerListResponse(items=items, total=total, offset=offset, limit=limit)
