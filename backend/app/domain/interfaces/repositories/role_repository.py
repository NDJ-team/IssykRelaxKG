from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.permission import Permission
from app.domain.entities.role import Role
from app.domain.entities.user_role import UserRole


class RoleRepository(ABC):
    @abstractmethod
    async def create_role(self, role: Role) -> Role: ...

    @abstractmethod
    async def get_role_by_id(self, role_id: UUID) -> Role | None: ...

    @abstractmethod
    async def get_role_by_slug(self, slug: str) -> Role | None: ...

    @abstractmethod
    async def list_roles(self) -> list[Role]: ...

    @abstractmethod
    async def add_user_role(self, user_role: UserRole) -> UserRole: ...

    @abstractmethod
    async def remove_user_role(self, user_id: UUID, role_id: UUID) -> None: ...

    @abstractmethod
    async def get_user_roles(self, user_id: UUID) -> list[Role]: ...

    @abstractmethod
    async def user_has_role(self, user_id: UUID, role_slug: str) -> bool: ...

    @abstractmethod
    async def add_permission(self, permission: Permission) -> Permission: ...

    @abstractmethod
    async def remove_permission(self, permission_id: UUID) -> None: ...

    @abstractmethod
    async def get_role_permissions(self, role_id: UUID) -> list[Permission]: ...

    @abstractmethod
    async def user_has_permission(self, user_id: UUID, permission: str) -> bool: ...
