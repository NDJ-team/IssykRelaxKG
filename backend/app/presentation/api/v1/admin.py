from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import (
    AdminBookingDetailResponse,
    AdminBookingListResponse,
    AdminOwnerDetailResponse,
    AdminOwnerListResponse,
    AdminPropertyDetailResponse,
    AdminPropertyListResponse,
    AdminStatsResponse,
    AssignRoleRequest,
    AssignRoleResponse,
    ListRolesResponse,
    ModerationQueueResponse,
    RatingAdjustRequest,
    WithdrawalListResponse,
    WithdrawalResponse,
)
from app.application.use_cases.admin.adjust_rating import AdminAdjustRatingUseCase
from app.application.use_cases.admin.approve_owner import ApproveOwnerUseCase
from app.application.use_cases.admin.approve_property import ApprovePropertyUseCase
from app.application.use_cases.admin.get_booking_detail import AdminGetBookingDetailUseCase
from app.application.use_cases.admin.get_owner_detail import AdminGetOwnerDetailUseCase
from app.application.use_cases.admin.get_property_detail import AdminGetPropertyDetailUseCase
from app.application.use_cases.admin.get_stats import GetAdminStatsUseCase
from app.application.use_cases.admin.list_bookings import AdminListBookingsUseCase
from app.application.use_cases.admin.list_owners import ListOwnersUseCase
from app.application.use_cases.admin.list_properties import AdminListPropertiesUseCase
from app.application.use_cases.admin.moderation import ApproveEntityUseCase, ModerationQueueUseCase, RejectEntityUseCase
from app.application.use_cases.admin.role_management import AssignUserRoleUseCase, ListRolesUseCase
from app.application.use_cases.admin.withdrawal_management import (
    AdminApproveWithdrawalUseCase,
    AdminListWithdrawalsUseCase,
    AdminRejectWithdrawalUseCase,
)
from app.core.database import get_db
from app.infrastructure.database.repositories.property_repository import SQLAlchemyPropertyRepository
from app.infrastructure.database.repositories.role_repository import SQLAlchemyRoleRepository
from app.infrastructure.database.repositories.user_repository import SQLAlchemyUserRepository
from app.presentation.api.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/owners", response_model=AdminOwnerListResponse)
async def list_owners(
    approved: bool | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminOwnerListResponse:
    repo = SQLAlchemyUserRepository(session)
    use_case = ListOwnersUseCase(repo, session)
    return await use_case.execute(approved=approved, offset=offset, limit=limit)


@router.patch("/owners/{owner_id}/approve")
async def approve_owner(
    owner_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    use_case = ApproveOwnerUseCase(session)
    try:
        return await use_case.execute(owner_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/properties", response_model=AdminPropertyListResponse)
async def list_properties(
    status: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminPropertyListResponse:
    use_case = AdminListPropertiesUseCase(session)
    return await use_case.execute(status=status, offset=offset, limit=limit)


@router.patch("/properties/{property_id}/approve")
async def approve_property(
    property_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = ApprovePropertyUseCase(property_repo)
    try:
        return await use_case.execute(property_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminStatsResponse:
    use_case = GetAdminStatsUseCase(session)
    return await use_case.execute()


@router.get("/bookings", response_model=AdminBookingListResponse)
async def list_bookings(
    status: str | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminBookingListResponse:
    use_case = AdminListBookingsUseCase(session)
    return await use_case.execute(status=status, offset=offset, limit=limit)


@router.get("/bookings/{booking_id}", response_model=AdminBookingDetailResponse)
async def get_booking_detail(
    booking_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminBookingDetailResponse:
    use_case = AdminGetBookingDetailUseCase(session)
    try:
        return await use_case.execute(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/properties/{property_id}", response_model=AdminPropertyDetailResponse)
async def get_property_detail(
    property_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminPropertyDetailResponse:
    use_case = AdminGetPropertyDetailUseCase(session)
    try:
        return await use_case.execute(property_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/properties/{property_id}/adjust-rating")
async def adjust_rating(
    property_id: UUID,
    request: RatingAdjustRequest,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = AdminAdjustRatingUseCase(property_repo)
    try:
        return await use_case.execute(property_id, request.points)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/owners/{owner_id}", response_model=AdminOwnerDetailResponse)
async def get_owner_detail(
    owner_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AdminOwnerDetailResponse:
    use_case = AdminGetOwnerDetailUseCase(session)
    try:
        return await use_case.execute(owner_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Moderation ---


@router.get("/moderation/queue", response_model=ModerationQueueResponse)
async def moderation_queue(
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> ModerationQueueResponse:
    use_case = ModerationQueueUseCase(session)
    items = await use_case.execute()
    return ModerationQueueResponse(items=items, total=len(items))


@router.patch("/moderation/{service_type}/{entity_id}/approve")
async def approve_entity(
    service_type: str,
    entity_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    use_case = ApproveEntityUseCase(session)
    try:
        return await use_case.execute(service_type, entity_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/moderation/{service_type}/{entity_id}/reject")
async def reject_entity(
    service_type: str,
    entity_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    use_case = RejectEntityUseCase(session)
    try:
        return await use_case.execute(service_type, entity_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Role Management ---


@router.get("/roles", response_model=ListRolesResponse)
async def list_roles(
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> ListRolesResponse:
    role_repo = SQLAlchemyRoleRepository(session)
    use_case = ListRolesUseCase(role_repo)
    roles = await use_case.execute()
    return ListRolesResponse(items=roles)


@router.patch("/users/{user_id}/roles", response_model=AssignRoleResponse)
async def assign_role(
    user_id: UUID,
    request: AssignRoleRequest,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> AssignRoleResponse:
    role_repo = SQLAlchemyRoleRepository(session)
    use_case = AssignUserRoleUseCase(role_repo, session)
    try:
        return await use_case.execute(user_id, request.role_slug)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Finance / Withdrawals ---


@router.get("/wallet/withdrawals", response_model=WithdrawalListResponse)
async def list_withdrawals(
    status: str | None = Query("pending"),
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> WithdrawalListResponse:
    use_case = AdminListWithdrawalsUseCase(session)
    return await use_case.execute(status=status)


@router.patch("/wallet/withdrawals/{transaction_id}/approve", response_model=WithdrawalResponse)
async def approve_withdrawal(
    transaction_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> WithdrawalResponse:
    use_case = AdminApproveWithdrawalUseCase(session)
    try:
        return await use_case.execute(transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/wallet/withdrawals/{transaction_id}/reject", response_model=WithdrawalResponse)
async def reject_withdrawal(
    transaction_id: UUID,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> WithdrawalResponse:
    use_case = AdminRejectWithdrawalUseCase(session)
    try:
        return await use_case.execute(transaction_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
