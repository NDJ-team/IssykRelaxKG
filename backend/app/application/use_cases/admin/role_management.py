from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user_role import UserRole
from app.domain.interfaces.repositories.role_repository import RoleRepository
from app.infrastructure.database.models.user import UserModel


class ListRolesUseCase:
    def __init__(self, role_repo: RoleRepository) -> None:
        self._role_repo = role_repo

    async def execute(self) -> list[dict]:
        roles = await self._role_repo.list_roles()
        return [
            {
                "id": str(r.id),
                "name": r.name,
                "slug": r.slug,
                "description": r.description,
                "created_at": str(r.created_at),
            }
            for r in roles
        ]


class AssignUserRoleUseCase:
    def __init__(self, role_repo: RoleRepository, session: AsyncSession) -> None:
        self._role_repo = role_repo
        self._session = session

    async def execute(self, user_id: UUID, role_slug: str) -> dict:
        role = await self._role_repo.get_role_by_slug(role_slug)
        if not role:
            raise ValueError(f"Role not found: {role_slug}")

        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("User not found")

        has_role = await self._role_repo.user_has_role(user_id, role_slug)
        if has_role:
            raise ValueError("User already has this role")

        user_role = UserRole(user_id=user_id, role_id=role.id, created_at=datetime.now())
        await self._role_repo.add_user_role(user_role)
        await self._session.flush()

        return {
            "user_id": str(user_id),
            "role_slug": role_slug,
            "role_name": role.name,
        }
