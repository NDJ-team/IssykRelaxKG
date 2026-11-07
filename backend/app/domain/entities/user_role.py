from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class UserRole:
    user_id: UUID
    role_id: UUID
    created_at: datetime
