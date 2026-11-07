"""Seed script: создаёт базовые роли и назначает admin/superadmin."""
from __future__ import annotations

import asyncio

from app.core.database import async_session_factory
from app.domain.entities.permission import Permission as PermissionEntity
from app.domain.entities.role import Role as RoleEntity
from app.infrastructure.database.repositories.role_repository import SQLAlchemyRoleRepository

ROLES = [
    ("Турист", "tourist", "Обычный пользователь, ищущий жильё, трансферы, туры и услуги"),
    ("Владелец", "owner", "Владелец недвижимости, сдающий жильё в аренду"),
    ("Водитель", "driver", "Водитель, предоставляющий трансферы"),
    ("Гид", "guide", "Гид, проводящий экскурсии и туры"),
    ("Организатор активностей", "activity_provider", "Организатор развлечений и активного отдыха"),
    ("Ресторан", "restaurant_partner", "Партнёр ресторана или кафе"),
    ("Турагентство", "agency", "Туристическое агентство, собирающее пакетные туры"),
    ("Консьерж", "concierge", "Консьерж-сервис для гостей"),
    ("Переводчик", "translator", "Переводчик и сопровождающий"),
    ("Хозяин впечатлений", "local_host", "Местный житель, который проводит впечатления и мастер-классы"),
    ("Администратор", "admin", "Полный доступ к системе"),
    ("Модератор", "moderator", "Модерация контента и пользователей"),
    ("Финансовый менеджер", "finance_manager", "Управление финансами и выводами средств"),
]

PERMISSIONS: dict[str, list[str]] = {
    "admin": [
        "users.manage",
        "roles.manage",
        "moderation.approve",
        "moderation.reject",
        "finance.withdrawals.approve",
        "settings.manage",
        "stats.view",
    ],
    "moderator": [
        "moderation.approve",
        "moderation.reject",
        "content.view_pending",
    ],
    "finance_manager": [
        "finance.withdrawals.view",
        "finance.withdrawals.approve",
        "finance.withdrawals.reject",
        "finance.stats.view",
    ],
}


async def seed() -> None:
    async with async_session_factory() as session:
        repo = SQLAlchemyRoleRepository(session)

        existing = await repo.list_roles()
        existing_slugs = {r.slug for r in existing}

        created_roles: dict[str, RoleEntity] = {}

        for name, slug, description in ROLES:
            if slug in existing_slugs:
                role = await repo.get_role_by_slug(slug)
                if role:
                    created_roles[slug] = role
                print(f"  [skip] role '{slug}' already exists")
                continue

            role = RoleEntity.create(name=name, slug=slug, description=description)
            await repo.create_role(role)
            created_roles[slug] = role
            print(f"  [ok] role '{slug}' created")

        for slug, permissions in PERMISSIONS.items():
            role = created_roles.get(slug)
            if not role:
                existing_role = await repo.get_role_by_slug(slug)
                if not existing_role:
                    print(f"  [warn] role '{slug}' not found for permissions")
                    continue
                role = existing_role

            existing_perms = await repo.get_role_permissions(role.id)
            existing_perm_names = {p.permission for p in existing_perms}

            for perm in permissions:
                if perm in existing_perm_names:
                    continue
                permission = PermissionEntity.create(role_id=role.id, permission=perm)
                await repo.add_permission(permission)
                print(f"  [ok] permission '{perm}' added to '{slug}'")

        await session.commit()
        print("\nSeed completed successfully!")


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
