from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class Permission:
    id: UUID
    role_id: UUID
    permission: str
    created_at: datetime

    @classmethod
    def create(cls, role_id: UUID, permission: str) -> Permission:
        return cls(id=uuid4(), role_id=role_id, permission=permission, created_at=datetime.now())
