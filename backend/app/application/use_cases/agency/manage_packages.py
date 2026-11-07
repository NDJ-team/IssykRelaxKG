from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.domain.entities.tour_package import TourPackage as TourPackageEntity
from app.domain.interfaces.repositories.agency_repository import AgencyRepository


class CreateTourPackageUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(
        self,
        user_id: UUID,
        title: str,
        price: float,
        duration_days: int,
        max_guests: int = 10,
        currency: str = "KGS",
        description: str | None = None,
        includes: str | None = None,
        itinerary: dict | None = None,
    ) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Agency profile not found. Create one first.")

        pkg = TourPackageEntity.create(
            agency_id=profile.id,
            title=title,
            price=Decimal(str(price)),
            duration_days=duration_days,
            max_guests=max_guests,
            currency=currency,
            description=description,
            includes=includes,
            itinerary=itinerary,
        )
        await self._agency_repo.create_tour_package(pkg)

        return _pkg_to_dict(pkg)


class UpdateTourPackageUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(
        self,
        pkg_id: UUID,
        user_id: UUID,
        title: str | None = None,
        price: float | None = None,
        duration_days: int | None = None,
        max_guests: int | None = None,
        currency: str | None = None,
        description: str | None = None,
        includes: str | None = None,
        itinerary: dict | None = None,
        is_active: bool | None = None,
    ) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Agency profile not found")

        pkg = await self._agency_repo.get_tour_package_by_id(pkg_id)
        if not pkg:
            raise ValueError("Tour package not found")
        if pkg.agency_id != profile.id:
            raise PermissionError("This tour package does not belong to you")

        if title is not None:
            pkg.title = title
        if price is not None:
            pkg.price = Decimal(str(price))
        if duration_days is not None:
            pkg.duration_days = duration_days
        if max_guests is not None:
            pkg.max_guests = max_guests
        if currency is not None:
            pkg.currency = currency
        if description is not None:
            pkg.description = description
        if includes is not None:
            pkg.includes = includes
        if itinerary is not None:
            pkg.itinerary = itinerary
        if is_active is not None:
            pkg.is_active = is_active

        pkg.updated_at = datetime.now()
        await self._agency_repo.update_tour_package(pkg)

        return _pkg_to_dict(pkg)


class ListMyTourPackagesUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, user_id: UUID, offset: int = 0, limit: int = 20) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"items": [], "total": 0}

        items, total = await self._agency_repo.get_tour_packages_by_agency(profile.id, offset=offset, limit=limit)
        return {"items": [_pkg_to_dict(t) for t in items], "total": total}


class ListTourPackagesUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, offset: int = 0, limit: int = 20) -> dict:
        items, total = await self._agency_repo.list_tour_packages(offset=offset, limit=limit)
        return {"items": [_pkg_to_dict(t) for t in items], "total": total}


class GetTourPackageUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, pkg_id: UUID) -> dict:
        pkg = await self._agency_repo.get_tour_package_by_id(pkg_id)
        if not pkg:
            raise ValueError("Tour package not found")
        return _pkg_to_dict(pkg)


class DeleteTourPackageUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, pkg_id: UUID, user_id: UUID) -> None:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Agency profile not found")

        pkg = await self._agency_repo.get_tour_package_by_id(pkg_id)
        if not pkg:
            raise ValueError("Tour package not found")
        if pkg.agency_id != profile.id:
            raise PermissionError("This tour package does not belong to you")

        await self._agency_repo.delete_tour_package(pkg_id)


class GetAgencyDashboardUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            return {"profile": None, "packages_count": 0, "active_packages": 0}

        items, _ = await self._agency_repo.get_tour_packages_by_agency(profile.id, limit=1000)
        packages = [_pkg_to_dict(t) for t in items]
        active = [t for t in packages if t["is_active"]]

        return {
            "profile": {
                "id": str(profile.id),
                "company_name": profile.company_name,
                "description": profile.description,
                "license_number": profile.license_number,
                "is_approved": profile.is_approved,
            },
            "packages_count": len(packages),
            "active_packages": len(active),
            "packages": packages,
        }

def _pkg_to_dict(p: TourPackageEntity) -> dict:
    return {
        "id": str(p.id),
        "agency_id": str(p.agency_id),
        "title": p.title,
        "description": p.description,
        "price": float(p.price),
        "currency": p.currency,
        "duration_days": p.duration_days,
        "max_guests": p.max_guests,
        "includes": p.includes,
        "itinerary": p.itinerary,
        "status": p.status,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
    }
