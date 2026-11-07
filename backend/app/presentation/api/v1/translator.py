from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.translator.create_profile import (
    CreateTranslatorProfileUseCase,
    GetTranslatorProfileUseCase,
    UpdateTranslatorProfileUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.translator_repository import SQLAlchemyTranslatorRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["translator"])


class CreateTranslatorProfileRequest(BaseModel):
    bio: str | None = None
    languages: str | None = None


class UpdateTranslatorProfileRequest(BaseModel):
    bio: str | None = None
    languages: str | None = None


# --- Public endpoints ---

@router.get("/translators/{profile_id}")
async def get_translator_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyTranslatorRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Translator not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "bio": profile.bio,
        "languages": profile.languages,
        "is_approved": profile.is_approved,
    }


# --- Translator-only endpoints ---

@router.post("/translator/profile", status_code=status.HTTP_201_CREATED)
async def create_translator_profile(
    request: CreateTranslatorProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyTranslatorRepository(session)
    use_case = CreateTranslatorProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, languages=request.languages)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/translator/profile")
async def get_my_translator_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyTranslatorRepository(session)
    use_case = GetTranslatorProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/translator/profile")
async def update_translator_profile(
    request: UpdateTranslatorProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyTranslatorRepository(session)
    use_case = UpdateTranslatorProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, languages=request.languages)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
