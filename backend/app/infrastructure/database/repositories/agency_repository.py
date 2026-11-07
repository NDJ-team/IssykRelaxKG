from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.agency_profile import AgencyProfile as AgencyProfileEntity
from app.domain.entities.tour_package import TourPackage as TourPackageEntity
from app.domain.interfaces.repositories.agency_repository import AgencyRepository
from app.infrastructure.database.models.agency_profile import AgencyProfileModel
from app.infrastructure.database.models.tour_package import TourPackageModel


class SQLAlchemyAgencyRepository(AgencyRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_profile(self, profile: AgencyProfileEntity) -> AgencyProfileEntity:
        model = AgencyProfileModel(
            id=profile.id,
            user_id=profile.user_id,
            company_name=profile.company_name,
            description=profile.description,
            license_number=profile.license_number,
            is_approved=profile.is_approved,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return profile

    async def get_profile_by_user_id(self, user_id: UUID) -> AgencyProfileEntity | None:
        result = await self._session.execute(select(AgencyProfileModel).where(AgencyProfileModel.user_id == user_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def get_profile_by_id(self, profile_id: UUID) -> AgencyProfileEntity | None:
        result = await self._session.execute(select(AgencyProfileModel).where(AgencyProfileModel.id == profile_id))
        model = result.scalar_one_or_none()
        return self._profile_to_entity(model) if model else None

    async def update_profile(self, profile: AgencyProfileEntity) -> AgencyProfileEntity:
        result = await self._session.execute(select(AgencyProfileModel).where(AgencyProfileModel.id == profile.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Agency profile not found")
        model.company_name = profile.company_name
        model.description = profile.description
        model.license_number = profile.license_number
        model.is_approved = profile.is_approved
        model.updated_at = profile.updated_at
        await self._session.flush()
        return profile

    async def create_tour_package(self, pkg: TourPackageEntity) -> TourPackageEntity:
        model = TourPackageModel(
            id=pkg.id,
            agency_id=pkg.agency_id,
            title=pkg.title,
            description=pkg.description,
            price=float(pkg.price),
            currency=pkg.currency,
            duration_days=pkg.duration_days,
            max_guests=pkg.max_guests,
            includes=pkg.includes,
            itinerary=pkg.itinerary,
            status=pkg.status,
            is_active=pkg.is_active,
            created_at=pkg.created_at,
            updated_at=pkg.updated_at,
        )
        self._session.add(model)
        await self._session.flush()
        return pkg

    async def get_tour_package_by_id(self, pkg_id: UUID) -> TourPackageEntity | None:
        result = await self._session.execute(select(TourPackageModel).where(TourPackageModel.id == pkg_id))
        model = result.scalar_one_or_none()
        return self._pkg_to_entity(model) if model else None

    async def get_tour_packages_by_agency(self, agency_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[TourPackageEntity], int]:
        base = select(TourPackageModel).where(TourPackageModel.agency_id == agency_profile_id)
        return await self._paginate_packages(base, offset, limit)

    async def list_tour_packages(self, offset: int = 0, limit: int = 20) -> tuple[list[TourPackageEntity], int]:
        base = select(TourPackageModel).where(TourPackageModel.is_active == True, TourPackageModel.status == "approved")
        return await self._paginate_packages(base, offset, limit)

    async def update_tour_package(self, pkg: TourPackageEntity) -> TourPackageEntity:
        result = await self._session.execute(select(TourPackageModel).where(TourPackageModel.id == pkg.id))
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError("Tour package not found")
        model.title = pkg.title
        model.description = pkg.description
        model.price = float(pkg.price)
        model.currency = pkg.currency
        model.duration_days = pkg.duration_days
        model.max_guests = pkg.max_guests
        model.includes = pkg.includes
        model.itinerary = pkg.itinerary
        model.status = pkg.status
        model.is_active = pkg.is_active
        model.updated_at = pkg.updated_at
        await self._session.flush()
        return pkg

    async def delete_tour_package(self, pkg_id: UUID) -> None:
        result = await self._session.execute(select(TourPackageModel).where(TourPackageModel.id == pkg_id))
        model = result.scalar_one_or_none()
        if model:
            await self._session.delete(model)
            await self._session.flush()

    async def list_agencies(self, offset: int = 0, limit: int = 20) -> tuple[list[AgencyProfileEntity], int]:
        base = select(AgencyProfileModel).where(AgencyProfileModel.is_approved == True)
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(AgencyProfileModel.created_at.desc()).offset(offset).limit(limit))
        return [self._profile_to_entity(m) for m in result.scalars().all()], total

    async def _paginate_packages(self, base, offset: int, limit: int) -> tuple[list[TourPackageEntity], int]:
        total_result = await self._session.execute(select(func.count()).select_from(base.subquery()))
        total = total_result.scalar() or 0
        result = await self._session.execute(base.order_by(TourPackageModel.created_at.desc()).offset(offset).limit(limit))
        return [self._pkg_to_entity(m) for m in result.scalars().all()], total

    def _profile_to_entity(self, model: AgencyProfileModel) -> AgencyProfileEntity:
        return AgencyProfileEntity(
            id=model.id,
            user_id=model.user_id,
            company_name=model.company_name,
            description=model.description,
            license_number=model.license_number,
            is_approved=model.is_approved,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _pkg_to_entity(self, model: TourPackageModel) -> TourPackageEntity:
        return TourPackageEntity(
            id=model.id,
            agency_id=model.agency_id,
            title=model.title,
            description=model.description,
            price=Decimal(str(model.price)),
            currency=model.currency,
            duration_days=model.duration_days,
            max_guests=model.max_guests,
            includes=model.includes,
            itinerary=model.itinerary,
            status=model.status,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
