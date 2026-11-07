from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.activity.create_profile import (
    CreateActivityProviderProfileUseCase,
    GetActivityProviderProfileUseCase,
    UpdateActivityProviderProfileUseCase,
)
from app.application.use_cases.activity.manage_activities import (
    CreateActivityUseCase,
    DeleteActivityUseCase,
    GetActivityDashboardUseCase,
    GetActivityUseCase,
    ListActivitiesUseCase,
    ListMyActivitiesUseCase,
    UpdateActivityUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.activity_repository import SQLAlchemyActivityRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["activities"])


class CreateActivityProviderProfileRequest(BaseModel):
    company_name: str | None = None
    bio: str | None = None


class UpdateActivityProviderProfileRequest(BaseModel):
    company_name: str | None = None
    bio: str | None = None


class CreateActivityRequest(BaseModel):
    title: str
    price: float
    max_participants: int = 10
    currency: str = "KGS"
    description: str | None = None
    duration_minutes: int | None = None
    location: str = ""
    city_id: str | None = None


class UpdateActivityRequest(BaseModel):
    title: str | None = None
    price: float | None = None
    max_participants: int | None = None
    currency: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    location: str | None = None
    is_active: bool | None = None
    city_id: str | None = None


# --- Public endpoints ---

@router.get("/activities")
async def list_activities(
    city_id: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = ListActivitiesUseCase(repo)
    return await use_case.execute(city_id=city_id, offset=offset, limit=limit)


@router.get("/activities/{activity_id}")
async def get_activity(
    activity_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = GetActivityUseCase(repo)
    try:
        return await use_case.execute(activity_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/activity-providers/{profile_id}")
async def get_activity_provider_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity provider not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "company_name": profile.company_name,
        "bio": profile.bio,
        "is_approved": profile.is_approved,
    }


# --- Provider-only endpoints ---

@router.post("/activity-provider/profile", status_code=status.HTTP_201_CREATED)
async def create_activity_provider_profile(
    request: CreateActivityProviderProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = CreateActivityProviderProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, company_name=request.company_name, bio=request.bio)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/activity-provider/profile")
async def get_my_activity_provider_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = GetActivityProviderProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/activity-provider/profile")
async def update_activity_provider_profile(
    request: UpdateActivityProviderProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = UpdateActivityProviderProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, company_name=request.company_name, bio=request.bio)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/activity-provider/activities", status_code=status.HTTP_201_CREATED)
async def create_activity(
    request: CreateActivityRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = CreateActivityUseCase(repo)
    try:
        return await use_case.execute(
            user_id=user_id,
            title=request.title,
            price=request.price,
            max_participants=request.max_participants,
            currency=request.currency,
            description=request.description,
            duration_minutes=request.duration_minutes,
            location=request.location,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/activity-provider/activities")
async def list_my_activities(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = ListMyActivitiesUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/activity-provider/activities/{activity_id}")
async def update_activity(
    activity_id: UUID,
    request: UpdateActivityRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = UpdateActivityUseCase(repo)
    try:
        return await use_case.execute(
            activity_id=activity_id,
            user_id=user_id,
            title=request.title,
            price=request.price,
            max_participants=request.max_participants,
            currency=request.currency,
            description=request.description,
            duration_minutes=request.duration_minutes,
            location=request.location,
            is_active=request.is_active,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/activity-provider/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyActivityRepository(session)
    use_case = DeleteActivityUseCase(repo)
    try:
        await use_case.execute(activity_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/activity-provider/dashboard")
async def activity_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyActivityRepository(session)
    use_case = GetActivityDashboardUseCase(repo)
    return await use_case.execute(user_id)
