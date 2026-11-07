from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.guide.create_profile import (
    CreateGuideProfileUseCase,
    GetGuideProfileUseCase,
    UpdateGuideProfileUseCase,
)
from app.application.use_cases.guide.manage_tours import (
    CreateTourUseCase,
    DeleteTourUseCase,
    GetGuideDashboardUseCase,
    GetTourUseCase,
    ListMyToursUseCase,
    ListToursUseCase,
    UpdateTourUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.guide_repository import SQLAlchemyGuideRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["guides"])


class CreateGuideProfileRequest(BaseModel):
    bio: str | None = None
    languages: str | None = None


class UpdateGuideProfileRequest(BaseModel):
    bio: str | None = None
    languages: str | None = None


class CreateTourRequest(BaseModel):
    title: str
    price: float
    duration_days: int
    max_guests: int = 10
    currency: str = "KGS"
    description: str | None = None
    includes: str | None = None
    meeting_point: str | None = None
    city_id: str | None = None


class UpdateTourRequest(BaseModel):
    title: str | None = None
    price: float | None = None
    duration_days: int | None = None
    max_guests: int | None = None
    currency: str | None = None
    description: str | None = None
    includes: str | None = None
    meeting_point: str | None = None
    is_active: bool | None = None
    city_id: str | None = None


# --- Public endpoints ---

@router.get("/tours")
async def list_tours(
    city_id: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = ListToursUseCase(repo)
    return await use_case.execute(city_id=city_id, offset=offset, limit=limit)


@router.get("/tours/{tour_id}")
async def get_tour(
    tour_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = GetTourUseCase(repo)
    try:
        return await use_case.execute(tour_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/guides/{profile_id}")
async def get_guide_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guide not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "bio": profile.bio,
        "languages": profile.languages,
        "is_approved": profile.is_approved,
    }


# --- Guide-only endpoints ---

@router.post("/guide/profile", status_code=status.HTTP_201_CREATED)
async def create_guide_profile(
    request: CreateGuideProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = CreateGuideProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, languages=request.languages)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/guide/profile")
async def get_my_guide_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = GetGuideProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/guide/profile")
async def update_guide_profile(
    request: UpdateGuideProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = UpdateGuideProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, languages=request.languages)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/guide/tours", status_code=status.HTTP_201_CREATED)
async def create_tour(
    request: CreateTourRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = CreateTourUseCase(repo)
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
            meeting_point=request.meeting_point,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/guide/tours")
async def list_my_tours(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = ListMyToursUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/guide/tours/{tour_id}")
async def update_tour(
    tour_id: UUID,
    request: UpdateTourRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = UpdateTourUseCase(repo)
    try:
        return await use_case.execute(
            tour_id=tour_id,
            user_id=user_id,
            title=request.title,
            price=request.price,
            duration_days=request.duration_days,
            max_guests=request.max_guests,
            currency=request.currency,
            description=request.description,
            includes=request.includes,
            meeting_point=request.meeting_point,
            is_active=request.is_active,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/guide/tours/{tour_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tour(
    tour_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyGuideRepository(session)
    use_case = DeleteTourUseCase(repo)
    try:
        await use_case.execute(tour_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/guide/dashboard")
async def guide_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyGuideRepository(session)
    use_case = GetGuideDashboardUseCase(repo)
    return await use_case.execute(user_id)
