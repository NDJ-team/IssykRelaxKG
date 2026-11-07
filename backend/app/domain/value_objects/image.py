from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class Image:
    id: UUID
    url: str
    alt_text: str | None
    width: int | None
    height: int | None
    size_bytes: int | None
