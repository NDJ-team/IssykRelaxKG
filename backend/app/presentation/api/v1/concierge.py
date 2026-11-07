from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.concierge.create_profile import (
    CreateConciergeProfileUseCase,
    GetConciergeProfileUseCase,
    UpdateConciergeProfileUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.concierge_repository import SQLAlchemyConciergeRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["concierge"])


class CreateConciergeProfileRequest(BaseModel):
    bio: str | None = None
    service_areas: str | None = None


class UpdateConciergeProfileRequest(BaseModel):
    bio: str | None = None
    service_areas: str | None = None


# --- Public endpoints ---

@router.get("/concierges/{profile_id}")
async def get_concierge_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyConciergeRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concierge not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "bio": profile.bio,
        "service_areas": profile.service_areas,
        "is_approved": profile.is_approved,
    }


# --- Concierge-only endpoints ---

@router.post("/concierge/profile", status_code=status.HTTP_201_CREATED)
async def create_concierge_profile(
    request: CreateConciergeProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyConciergeRepository(session)
    use_case = CreateConciergeProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, service_areas=request.service_areas)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/concierge/profile")
async def get_my_concierge_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyConciergeRepository(session)
    use_case = GetConciergeProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/concierge/profile")
async def update_concierge_profile(
    request: UpdateConciergeProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyConciergeRepository(session)
    use_case = UpdateConciergeProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, service_areas=request.service_areas)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
