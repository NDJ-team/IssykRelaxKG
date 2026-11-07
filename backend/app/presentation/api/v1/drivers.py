from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.driver.create_profile import (
    CreateDriverProfileUseCase,
    GetDriverProfileUseCase,
    UpdateDriverProfileUseCase,
)
from app.application.use_cases.driver.manage_transfers import (
    CreateTransferUseCase,
    DeleteTransferUseCase,
    GetDriverDashboardUseCase,
    GetTransferUseCase,
    ListMyTransfersUseCase,
    ListTransfersUseCase,
    UpdateTransferUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.driver_repository import SQLAlchemyDriverRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(tags=["drivers"])


class CreateDriverProfileRequest(BaseModel):
    bio: str | None = None
    license_number: str | None = None
    vehicle_info: str | None = None


class UpdateDriverProfileRequest(BaseModel):
    bio: str | None = None
    license_number: str | None = None
    vehicle_info: str | None = None


class CreateTransferRequest(BaseModel):
    title: str
    from_location: str
    to_location: str
    price: float
    max_passengers: int = 4
    currency: str = "KGS"
    description: str | None = None
    vehicle_type: str | None = None
    duration_minutes: int | None = None
    city_id: str | None = None


class UpdateTransferRequest(BaseModel):
    title: str | None = None
    from_location: str | None = None
    to_location: str | None = None
    price: float | None = None
    max_passengers: int | None = None
    currency: str | None = None
    description: str | None = None
    vehicle_type: str | None = None
    duration_minutes: int | None = None
    is_active: bool | None = None
    city_id: str | None = None


# --- Public endpoints ---

@router.get("/transfers")
async def list_transfers(
    city_id: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = ListTransfersUseCase(repo)
    return await use_case.execute(city_id=city_id, offset=offset, limit=limit)


@router.get("/transfers/{transfer_id}")
async def get_transfer(
    transfer_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = GetTransferUseCase(repo)
    try:
        return await use_case.execute(transfer_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/drivers/{profile_id}")
async def get_driver_profile(
    profile_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    profile = await repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "bio": profile.bio,
        "vehicle_info": profile.vehicle_info,
        "is_approved": profile.is_approved,
    }


# --- Driver-only endpoints ---

@router.post("/driver/profile", status_code=status.HTTP_201_CREATED)
async def create_driver_profile(
    request: CreateDriverProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = CreateDriverProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, license_number=request.license_number, vehicle_info=request.vehicle_info)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/driver/profile")
async def get_my_driver_profile(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = GetDriverProfileUseCase(repo)
    try:
        return await use_case.execute(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/driver/profile")
async def update_driver_profile(
    request: UpdateDriverProfileRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = UpdateDriverProfileUseCase(repo)
    try:
        return await use_case.execute(user_id, bio=request.bio, license_number=request.license_number, vehicle_info=request.vehicle_info)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/driver/transfers", status_code=status.HTTP_201_CREATED)
async def create_transfer(
    request: CreateTransferRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = CreateTransferUseCase(repo)
    try:
        return await use_case.execute(
            user_id=user_id,
            title=request.title,
            from_location=request.from_location,
            to_location=request.to_location,
            price=request.price,
            max_passengers=request.max_passengers,
            currency=request.currency,
            description=request.description,
            vehicle_type=request.vehicle_type,
            duration_minutes=request.duration_minutes,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/driver/transfers")
async def list_my_transfers(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = ListMyTransfersUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/driver/transfers/{transfer_id}")
async def update_transfer(
    transfer_id: UUID,
    request: UpdateTransferRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = UpdateTransferUseCase(repo)
    try:
        return await use_case.execute(
            transfer_id=transfer_id,
            user_id=user_id,
            title=request.title,
            from_location=request.from_location,
            to_location=request.to_location,
            price=request.price,
            max_passengers=request.max_passengers,
            currency=request.currency,
            description=request.description,
            vehicle_type=request.vehicle_type,
            duration_minutes=request.duration_minutes,
            is_active=request.is_active,
            city_id=request.city_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/driver/transfers/{transfer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transfer(
    transfer_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyDriverRepository(session)
    use_case = DeleteTransferUseCase(repo)
    try:
        await use_case.execute(transfer_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/driver/dashboard")
async def driver_dashboard(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> dict:
    repo = SQLAlchemyDriverRepository(session)
    use_case = GetDriverDashboardUseCase(repo)
    return await use_case.execute(user_id)
