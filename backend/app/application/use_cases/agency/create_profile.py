from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.agency_profile import AgencyProfile as AgencyProfileEntity
from app.domain.interfaces.repositories.agency_repository import AgencyRepository


class CreateAgencyProfileUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, user_id: UUID, company_name: str, description: str | None = None, license_number: str | None = None) -> dict:
        existing = await self._agency_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Agency profile already exists")

        profile = AgencyProfileEntity.create(user_id=user_id, company_name=company_name, description=description, license_number=license_number)
        await self._agency_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "description": profile.description,
            "license_number": profile.license_number,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateAgencyProfileUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, user_id: UUID, company_name: str | None = None, description: str | None = None, license_number: str | None = None) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Agency profile not found. Create one first.")

        profile.company_name = company_name if company_name is not None else profile.company_name
        profile.description = description if description is not None else profile.description
        profile.license_number = license_number if license_number is not None else profile.license_number
        profile.updated_at = datetime.now()

        await self._agency_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "description": profile.description,
            "license_number": profile.license_number,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetAgencyProfileUseCase:
    def __init__(self, agency_repo: AgencyRepository) -> None:
        self._agency_repo = agency_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._agency_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Agency profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "company_name": profile.company_name,
            "description": profile.description,
            "license_number": profile.license_number,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
