from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.favorite_dto import AddFavoriteRequest, FavoriteResponse, PropertyFavoriteIdsResponse
from app.application.dto.property_dto import PropertyListResponse
from app.application.use_cases.favorites.add_favorite import AddFavoriteUseCase
from app.application.use_cases.favorites.get_favorite_ids import GetFavoriteIdsUseCase
from app.application.use_cases.favorites.list_favorites import ListFavoritesUseCase
from app.application.use_cases.favorites.remove_favorite import RemoveFavoriteUseCase
from app.core.database import get_db
from app.infrastructure.database.repositories.favorite_repository import SQLAlchemyFavoriteRepository
from app.infrastructure.database.repositories.property_repository import SQLAlchemyPropertyRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    request: AddFavoriteRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> FavoriteResponse:
    favorite_repo = SQLAlchemyFavoriteRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = AddFavoriteUseCase(favorite_repo, property_repo)
    try:
        return await use_case.execute(user_id, UUID(request.property_id))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    property_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    favorite_repo = SQLAlchemyFavoriteRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = RemoveFavoriteUseCase(favorite_repo, property_repo)
    await use_case.execute(user_id, property_id)


@router.get("/ids", response_model=PropertyFavoriteIdsResponse)
async def get_favorite_ids(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> PropertyFavoriteIdsResponse:
    favorite_repo = SQLAlchemyFavoriteRepository(session)
    use_case = GetFavoriteIdsUseCase(favorite_repo)
    return await use_case.execute(user_id)


@router.get("/properties", response_model=PropertyListResponse)
async def list_favorite_properties(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> PropertyListResponse:
    favorite_repo = SQLAlchemyFavoriteRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = ListFavoritesUseCase(favorite_repo, property_repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)
