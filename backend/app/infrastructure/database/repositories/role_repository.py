from __future__ import annotations

from uuid import UUID

from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.permission import Permission as PermissionEntity
from app.domain.entities.role import Role as RoleEntity
from app.domain.entities.user_role import UserRole as UserRoleEntity
from app.domain.interfaces.repositories.role_repository import RoleRepository
from app.infrastructure.database.models.permission import PermissionModel
from app.infrastructure.database.models.role import RoleModel
from app.infrastructure.database.models.user_role import UserRoleModel


class SQLAlchemyRoleRepository(RoleRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_role(self, role: RoleEntity) -> RoleEntity:
        model = RoleModel(id=role.id, name=role.name, slug=role.slug, description=role.description, created_at=role.created_at)
        self._session.add(model)
        await self._session.flush()
        return role

    async def get_role_by_id(self, role_id: UUID) -> RoleEntity | None:
        result = await self._session.execute(select(RoleModel).where(RoleModel.id == role_id))
        model = result.scalar_one_or_none()
        return self._role_to_entity(model) if model else None

    async def get_role_by_slug(self, slug: str) -> RoleEntity | None:
        result = await self._session.execute(select(RoleModel).where(RoleModel.slug == slug))
        model = result.scalar_one_or_none()
        return self._role_to_entity(model) if model else None

    async def list_roles(self) -> list[RoleEntity]:
        result = await self._session.execute(select(RoleModel).order_by(RoleModel.name))
        models = result.scalars().all()
        return [self._role_to_entity(m) for m in models]

    async def add_user_role(self, user_role: UserRoleEntity) -> UserRoleEntity:
        model = UserRoleModel(user_id=user_role.user_id, role_id=user_role.role_id, created_at=user_role.created_at)
        self._session.add(model)
        await self._session.flush()
        return user_role

    async def remove_user_role(self, user_id: UUID, role_id: UUID) -> None:
        result = await self._session.execute(
            select(UserRoleModel).where(UserRoleModel.user_id == user_id, UserRoleModel.role_id == role_id)
        )
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def get_user_roles(self, user_id: UUID) -> list[RoleEntity]:
        result = await self._session.execute(
            select(RoleModel).join(UserRoleModel, RoleModel.id == UserRoleModel.role_id).where(UserRoleModel.user_id == user_id)
        )
        models = result.scalars().all()
        return [self._role_to_entity(m) for m in models]

    async def user_has_role(self, user_id: UUID, role_slug: str) -> bool:
        result = await self._session.execute(
            select(
                exists(
                    select(UserRoleModel)
                    .join(RoleModel, UserRoleModel.role_id == RoleModel.id)
                    .where(UserRoleModel.user_id == user_id, RoleModel.slug == role_slug)
                )
            )
        )
        return result.scalar() or False

    async def add_permission(self, permission: PermissionEntity) -> PermissionEntity:
        model = PermissionModel(id=permission.id, role_id=permission.role_id, permission=permission.permission, created_at=permission.created_at)
        self._session.add(model)
        await self._session.flush()
        return permission

    async def remove_permission(self, permission_id: UUID) -> None:
        result = await self._session.execute(select(PermissionModel).where(PermissionModel.id == permission_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def get_role_permissions(self, role_id: UUID) -> list[PermissionEntity]:
        result = await self._session.execute(
            select(PermissionModel).where(PermissionModel.role_id == role_id).order_by(PermissionModel.permission)
        )
        models = result.scalars().all()
        return [self._permission_to_entity(m) for m in models]

    async def user_has_permission(self, user_id: UUID, permission: str) -> bool:
        result = await self._session.execute(
            select(
                exists(
                    select(UserRoleModel)
                    .join(PermissionModel, UserRoleModel.role_id == PermissionModel.role_id)
                    .where(UserRoleModel.user_id == user_id, PermissionModel.permission == permission)
                )
            )
        )
        return result.scalar() or False

    def _role_to_entity(self, model: RoleModel) -> RoleEntity:
        return RoleEntity(id=model.id, name=model.name, slug=model.slug, description=model.description, created_at=model.created_at)

    def _permission_to_entity(self, model: PermissionModel) -> PermissionEntity:
        return PermissionEntity(id=model.id, role_id=model.role_id, permission=model.permission, created_at=model.created_at)
