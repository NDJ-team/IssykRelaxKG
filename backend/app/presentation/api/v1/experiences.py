from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.experiences.manage_experiences import (
    CreateLocalExperienceUseCase,
    CreateLocalHostProfileUseCase,
    GetLocalExperienceUseCase,
    GetLocalHostDashboardUseCase,
    GetLocalHostProfileUseCase,
    ListLocalExperiencesUseCase,
    ListMyExperiencesUseCase,
    UpdateLocalExperienceUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.local_experience_repository import (
    SQLAlchemyLocalExperienceRepository,
)
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["experiences"])


class CreateLocalHostProfileRequest(BaseModel):
    bio: str | None = None
    experience_years: int | None = None
    languages: str | None = None


class CreateLocalExperienceRequest(BaseModel):
    title: str
    category: str
    price: float
    description: str | None = None
    currency: str = "KGS"
    duration_minutes: int | None = None
    max_guests: int = 6
    city_id: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    images: list[str] | None = None
    includes: str | None = None
    languages: str | None = None


class UpdateLocalExperienceRequest(BaseModel):
    title: str | None = None
    category: str | None = None
    price: float | None = None
    description: str | None = None
    duration_minutes: int | None = None
    max_guests: int | None = None
    city_id: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    images: list[str] | None = None
    includes: str | None = None
    languages: str | None = None
    is_active: bool | None = None


# --- Public endpoints ---

@router.get("/experiences")
async def list_experiences(
    city_id: str | None = Query(None),
    category: str | None = Query(None),
    query: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = ListLocalExperiencesUseCase(repo)
    return await use_case.execute(
        city_id=city_id,
        category=category,
        query=query,
        offset=offset,
        limit=limit,
    )


@router.get("/experiences/{experience_id}")
async def get_experience(
    experience_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = GetLocalExperienceUseCase(repo)
    try:
        return await use_case.execute(experience_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Local host endpoints ---

@router.post("/local-host/profile", status_code=status.HTTP_201_CREATED)
async def create_local_host_profile(
    request: CreateLocalHostProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = CreateLocalHostProfileUseCase(repo)
    return await use_case.execute(
        user_id,
        bio=request.bio,
        experience_years=request.experience_years,
        languages=request.languages,
    )


@router.get("/local-host/profile")
async def get_my_local_host_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = GetLocalHostProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/local-host/experiences", status_code=status.HTTP_201_CREATED)
async def create_local_experience(
    request: CreateLocalExperienceRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = CreateLocalExperienceUseCase(repo)
    try:
        return await use_case.execute(
            user_id=user_id,
            title=request.title,
            category=request.category,
            price=request.price,
            description=request.description,
            currency=request.currency,
            duration_minutes=request.duration_minutes,
            max_guests=request.max_guests,
            city_id=request.city_id,
            address=request.address,
            latitude=request.latitude,
            longitude=request.longitude,
            images=request.images,
            includes=request.includes,
            languages=request.languages,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/local-host/experiences")
async def list_my_experiences(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = ListMyExperiencesUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/local-host/experiences/{experience_id}")
async def update_local_experience(
    experience_id: UUID,
    request: UpdateLocalExperienceRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = UpdateLocalExperienceUseCase(repo)
    try:
        return await use_case.execute(
            experience_id=experience_id,
            user_id=user_id,
            title=request.title,
            category=request.category,
            price=request.price,
            description=request.description,
            duration_minutes=request.duration_minutes,
            max_guests=request.max_guests,
            city_id=request.city_id,
            address=request.address,
            latitude=request.latitude,
            longitude=request.longitude,
            images=request.images,
            includes=request.includes,
            languages=request.languages,
            is_active=request.is_active,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/local-host/dashboard")
async def local_host_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyLocalExperienceRepository(session)
    use_case = GetLocalHostDashboardUseCase(repo)
    return await use_case.execute(user_id)
