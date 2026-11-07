from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.agency.create_profile import (
    CreateAgencyProfileUseCase,
    GetAgencyProfileUseCase,
    UpdateAgencyProfileUseCase,
)
from app.application.use_cases.agency.manage_packages import (
    CreateTourPackageUseCase,
    DeleteTourPackageUseCase,
    GetAgencyDashboardUseCase,
    GetTourPackageUseCase,
    ListMyTourPackagesUseCase,
    ListTourPackagesUseCase,
    UpdateTourPackageUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.agency_repository import SQLAlchemyAgencyRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["agency"])


class CreateAgencyProfileRequest(BaseModel):
    company_name: str
    description: str | None = None
    license_number: str | None = None


class UpdateAgencyProfileRequest(BaseModel):
    company_name: str | None = None
    description: str | None = None
    license_number: str | None = None


class CreateTourPackageRequest(BaseModel):
    title: str
    price: float
    duration_days: int
    max_guests: int = 10
    currency: str = "KGS"
    description: str | None = None
    includes: str | None = None
    itinerary: dict | None = None


class UpdateTourPackageRequest(BaseModel):
    title: str | None = None
    price: float | None = None
    duration_days: int | None = None
    max_guests: int | None = None
    currency: str | None = None
    description: str | None = None
    includes: str | None = None
    itinerary: dict | None = None
    is_active: bool | None = None


# --- Public endpoints ---

@router.get("/tour-packages")
async def list_tour_packages(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = ListTourPackagesUseCase(repo)
    return await use_case.execute(offset=offset, limit=limit)


@router.get("/tour-packages/{pkg_id}")
async def get_tour_package(
    pkg_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = GetTourPackageUseCase(repo)
    try:
        return await use_case.execute(pkg_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/agencies/{profile_id}")
async def get_agency_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "company_name": profile.company_name,
        "description": profile.description,
        "license_number": profile.license_number,
        "is_approved": profile.is_approved,
    }


# --- Agency-only endpoints ---

@router.post("/agency/profile", status_code=status.HTTP_201_CREATED)
async def create_agency_profile(
    request: CreateAgencyProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = CreateAgencyProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, company_name=request.company_name, description=request.description, license_number=request.license_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/agency/profile")
async def get_my_agency_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = GetAgencyProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/agency/profile")
async def update_agency_profile(
    request: UpdateAgencyProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = UpdateAgencyProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, company_name=request.company_name, description=request.description, license_number=request.license_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/agency/tour-packages", status_code=status.HTTP_201_CREATED)
async def create_tour_package(
    request: CreateTourPackageRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = CreateTourPackageUseCase(repo)
    try:
        return await use_case.execute(
            user_id=user_id,
            title=request.title,
            price=request.price,
            duration_days=request.duration_days,
            max_guests=request.max_guests,
            currency=request.currency,
            description=request.description,
            includes=request.includes,
            itinerary=request.itinerary,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/agency/tour-packages")
async def list_my_tour_packages(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = ListMyTourPackagesUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/agency/tour-packages/{pkg_id}")
async def update_tour_package(
    pkg_id: UUID,
    request: UpdateTourPackageRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = UpdateTourPackageUseCase(repo)
    try:
        return await use_case.execute(
            pkg_id=pkg_id,
            user_id=user_id,
            title=request.title,
            price=request.price,
            duration_days=request.duration_days,
            max_guests=request.max_guests,
            currency=request.currency,
            description=request.description,
            includes=request.includes,
            itinerary=request.itinerary,
            is_active=request.is_active,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/agency/tour-packages/{pkg_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tour_package(
    pkg_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = DeleteTourPackageUseCase(repo)
    try:
        await use_case.execute(pkg_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/agency/dashboard")
async def agency_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyAgencyRepository(session)
    use_case = GetAgencyDashboardUseCase(repo)
    return await use_case.execute(user_id)
