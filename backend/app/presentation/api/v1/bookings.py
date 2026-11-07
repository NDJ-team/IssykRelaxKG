from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.booking_dto import (
    BookingListResponse,
    BookingResponse,
    CreateBookingRequest,
)
from app.application.use_cases.bookings.cancel_booking import CancelBookingUseCase
from app.application.use_cases.bookings.confirm_dual import GuestConfirmUseCase, ProviderConfirmUseCase
from app.application.use_cases.bookings.create_service_booking import CreateServiceBookingUseCase
from app.core.database import get_db
from app.infrastructure.database.repositories.booking_repository import SQLAlchemyBookingRepository
from app.infrastructure.database.repositories.local_experience_repository import SQLAlchemyLocalExperienceRepository
from app.infrastructure.database.repositories.property_repository import SQLAlchemyPropertyRepository
from app.infrastructure.database.repositories.wallet_repository import SQLAlchemyWalletRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    request: CreateBookingRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    local_experience_repo = SQLAlchemyLocalExperienceRepository(session)

    use_case = CreateServiceBookingUseCase(booking_repo, wallet_repo, property_repo, local_experience_repo)
    try:
        return await use_case.execute(request, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/my-bookings", response_model=BookingListResponse)
async def get_my_bookings(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingListResponse:
    repo = SQLAlchemyBookingRepository(session)
    items, total = await repo.get_by_guest(user_id, offset=offset, limit=limit)
    return BookingListResponse(
        items=[
            BookingResponse(
                id=str(b.id),
                service_type=b.service_type,
                service_id=str(b.service_id) if b.service_id else None,
                property_id=str(b.property_id) if b.property_id else None,
                guest_id=str(b.guest_id),
                owner_id=str(b.owner_id),
                check_in=b.check_in.isoformat() if b.check_in else None,
                check_out=b.check_out.isoformat() if b.check_out else None,
                total_price=float(b.total_price),
                status=b.status,
                guest_count=b.guest_count,
                special_requests=b.special_requests,
                verification_code=b.verification_code,
                guest_confirmed=b.guest_confirmed,
                owner_confirmed=b.owner_confirmed,
                created_at=b.created_at.isoformat(),
            )
            for b in items
        ],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    use_case = CancelBookingUseCase(booking_repo, wallet_repo)
    try:
        return await use_case.execute(booking_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/{booking_id}/confirm-guest", response_model=BookingResponse)
async def confirm_guest(
    booking_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    use_case = GuestConfirmUseCase(booking_repo, wallet_repo)
    try:
        return await use_case.execute(booking_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/{booking_id}/confirm-provider", response_model=BookingResponse)
async def confirm_provider(
    booking_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking_repo = SQLAlchemyBookingRepository(session)
    wallet_repo = SQLAlchemyWalletRepository(session)
    use_case = ProviderConfirmUseCase(booking_repo, wallet_repo)
    try:
        return await use_case.execute(booking_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
