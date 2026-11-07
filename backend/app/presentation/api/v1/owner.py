from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.booking_dto import BookingListResponse, BookingResponse, CheckInRequest
from app.application.dto.owner_dto import WalletResponse
from app.application.dto.property_dto import (
    PropertyListResponse,
    PropertyResponse,
    UpdatePropertyRequest,
)
from app.application.use_cases.owner.cancel_booking import CancelOwnerBookingUseCase
from app.application.use_cases.owner.check_in import CheckInUseCase
from app.application.use_cases.owner.delete_property import DeletePropertyUseCase
from app.application.use_cases.owner.get_wallet import GetWalletUseCase
from app.application.use_cases.owner.list_bookings import ListOwnerBookingsUseCase
from app.application.use_cases.owner.list_properties import ListOwnerPropertiesUseCase
from app.application.use_cases.owner.update_property import UpdatePropertyUseCase
from app.core.database import get_db
from app.infrastructure.database.repositories.booking_repository import SQLAlchemyBookingRepository
from app.infrastructure.database.repositories.property_repository import (
    SQLAlchemyPropertyRepository,
)
from app.infrastructure.database.repositories.wallet_repository import SQLAlchemyWalletRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/owner", tags=["owner"])


@router.get("/properties", response_model=PropertyListResponse)
async def list_properties(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> PropertyListResponse:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = ListOwnerPropertiesUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.patch("/properties/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    request: UpdatePropertyRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = UpdatePropertyUseCase(repo)
    try:
        return await use_case.execute(property_id, user_id, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.delete("/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> None:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = DeletePropertyUseCase(repo)
    try:
        await use_case.execute(property_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/bookings", response_model=BookingListResponse)
async def list_bookings(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingListResponse:
    repo = SQLAlchemyBookingRepository(session)
    use_case = ListOwnerBookingsUseCase(repo)
    return await use_case.execute(user_id, offset=offset, limit=limit)


@router.post("/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    use_case = CancelOwnerBookingUseCase(booking_repo, wallet_repo)
    try:
        return await use_case.execute(booking_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/check-in", response_model=BookingResponse)
async def check_in(
    request: CheckInRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    use_case = CheckInUseCase(booking_repo, property_repo, wallet_repo)
    try:
        return await use_case.execute(request.verification_code, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/wallet", response_model=WalletResponse)
async def get_wallet(
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> WalletResponse:
    repo = SQLAlchemyWalletRepository(session)
    use_case = GetWalletUseCase(repo)
    return await use_case.execute(user_id)
