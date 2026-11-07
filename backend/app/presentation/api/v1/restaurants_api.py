from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.restaurant.create_profile import (
    CreateRestaurantPartnerProfileUseCase,
    GetRestaurantPartnerProfileUseCase,
    UpdateRestaurantPartnerProfileUseCase,
)
from app.application.use_cases.restaurant.manage_restaurants import (
    CreateRestaurantUseCase,
    DeleteRestaurantUseCase,
    GetPartnerDashboardUseCase,
    GetRestaurantUseCase,
    ListMyRestaurantsUseCase,
    ListRestaurantsUseCase,
    UpdateRestaurantUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.restaurant_repository import SQLAlchemyRestaurantRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["restaurants"])


class CreateRestaurantPartnerProfileRequest(BaseModel):
    restaurant_name: str
    description: str | None = None
    cuisine_type: str | None = None
    address: str | None = None
    phone: str | None = None


class UpdateRestaurantPartnerProfileRequest(BaseModel):
    restaurant_name: str | None = None
    description: str | None = None
    cuisine_type: str | None = None
    address: str | None = None
    phone: str | None = None


class CreateRestaurantRequest(BaseModel):
    name: str
    description: str | None = None
    cuisine_type: str | None = None
    address: str | None = None
    phone: str | None = None
    price_range: str | None = None
    opening_hours: str | None = None
    city_id: str | None = None


class UpdateRestaurantRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    cuisine_type: str | None = None
    address: str | None = None
    phone: str | None = None
    price_range: str | None = None
    opening_hours: str | None = None
    status: str | None = None
    is_active: bool | None = None
    city_id: str | None = None


# --- Public endpoints ---

@router.get("/restaurants")
async def list_restaurants(
    city_id: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = ListRestaurantsUseCase(repo)
    return await use_case.execute(city_id=city_id, offset=offset, limit=limit)


@router.get("/restaurants/{restaurant_id}")
async def get_restaurant(
    restaurant_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = GetRestaurantUseCase(repo)
    try:
        return await use_case.execute(restaurant_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/partner/profiles/{profile_id}")
async def get_partner_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant partner not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "restaurant_name": profile.restaurant_name,
        "description": profile.description,
        "cuisine_type": profile.cuisine_type,
        "address": profile.address,
        "phone": profile.phone,
        "is_approved": profile.is_approved,
    }


# --- Partner-only endpoints ---

@router.post("/partner/profile", status_code=status.HTTP_201_CREATED)
async def create_partner_profile(
    request: CreateRestaurantPartnerProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = CreateRestaurantPartnerProfileUseCase(repo)
    try:
        return await use_case.execute(
            user_id,
            restaurant_name=request.restaurant_name,
            description=request.description,
            cuisine_type=request.cuisine_type,
            address=request.address,
            phone=request.phone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/partner/profile")
async def get_my_partner_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = GetRestaurantPartnerProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/partner/profile")
async def update_partner_profile(
    request: UpdateRestaurantPartnerProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = UpdateRestaurantPartnerProfileUseCase(repo)
    try:
        return await use_case.execute(
            user_id,
            restaurant_name=request.restaurant_name,
            description=request.description,
            cuisine_type=request.cuisine_type,
            address=request.address,
            phone=request.phone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/partner/restaurants", status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    request: CreateRestaurantRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = CreateRestaurantUseCase(repo)
    try:
        return await use_case.execute(
            user_id=user_id,
            name=request.name,
            description=request.description,
            cuisine_type=request.cuisine_type,
            address=request.address,
            phone=request.phone,
            price_range=request.price_range,
            opening_hours=request.opening_hours,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/partner/restaurants")
async def list_my_restaurants(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = ListMyRestaurantsUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/partner/restaurants/{restaurant_id}")
async def update_restaurant(
    restaurant_id: UUID,
    request: UpdateRestaurantRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = UpdateRestaurantUseCase(repo)
    try:
        return await use_case.execute(
            restaurant_id=restaurant_id,
            user_id=user_id,
            name=request.name,
            description=request.description,
            cuisine_type=request.cuisine_type,
            address=request.address,
            phone=request.phone,
            price_range=request.price_range,
            opening_hours=request.opening_hours,
            status=request.status,
            is_active=request.is_active,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/partner/restaurants/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_restaurant(
    restaurant_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = DeleteRestaurantUseCase(repo)
    try:
        await use_case.execute(restaurant_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/partner/dashboard")
async def partner_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyRestaurantRepository(session)
    use_case = GetPartnerDashboardUseCase(repo)
    return await use_case.execute(user_id)
