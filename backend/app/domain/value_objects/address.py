from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Address:
    country: str
    city: str
    district: str | None
    street: str | None
    building: str | None
    postal_code: str | None
    latitude: float | None
    longitude: float | None

    @property
    def full_address(self) -> str:
        parts = [self.country, self.city]
        if self.district:
            parts.append(self.district)
        if self.street:
            addr = self.street
            if self.building:
                addr = f"{addr}, {self.building}"
            parts.append(addr)
        return ", ".join(p for p in parts if p)
