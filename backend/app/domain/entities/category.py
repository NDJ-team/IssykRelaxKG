from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass
class Category:
    id: UUID
    name: str
    slug: str
    description: str | None
    sort_order: int
