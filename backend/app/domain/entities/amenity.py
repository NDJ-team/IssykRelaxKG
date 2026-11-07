from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass
class Amenity:
    id: UUID
    name: str
    slug: str
