from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass
class City:
    id: UUID
    name: str
    slug: str
    popularity_score: int
    is_active: bool
