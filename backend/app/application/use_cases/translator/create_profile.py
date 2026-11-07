from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.domain.entities.translator_profile import TranslatorProfile as TranslatorProfileEntity
from app.domain.interfaces.repositories.translator_repository import TranslatorRepository


class CreateTranslatorProfileUseCase:
    def __init__(self, translator_repo: TranslatorRepository) -> None:
        self._translator_repo = translator_repo

    async def execute(self, user_id: UUID, bio: str | None = None, languages: str | None = None) -> dict:
        existing = await self._translator_repo.get_profile_by_user_id(user_id)
        if existing:
            raise ValueError("Translator profile already exists")

        profile = TranslatorProfileEntity.create(user_id=user_id, bio=bio, languages=languages)
        await self._translator_repo.create_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "languages": profile.languages,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
        }


class UpdateTranslatorProfileUseCase:
    def __init__(self, translator_repo: TranslatorRepository) -> None:
        self._translator_repo = translator_repo

    async def execute(self, user_id: UUID, bio: str | None = None, languages: str | None = None) -> dict:
        profile = await self._translator_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Translator profile not found. Create one first.")

        profile.bio = bio if bio is not None else profile.bio
        profile.languages = languages if languages is not None else profile.languages
        profile.updated_at = datetime.now()

        await self._translator_repo.update_profile(profile)

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "languages": profile.languages,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }


class GetTranslatorProfileUseCase:
    def __init__(self, translator_repo: TranslatorRepository) -> None:
        self._translator_repo = translator_repo

    async def execute(self, user_id: UUID) -> dict:
        profile = await self._translator_repo.get_profile_by_user_id(user_id)
        if not profile:
            raise ValueError("Translator profile not found")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "bio": profile.bio,
            "languages": profile.languages,
            "is_approved": profile.is_approved,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
