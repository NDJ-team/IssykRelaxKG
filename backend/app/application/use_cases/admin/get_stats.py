from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminStatsResponse, AdminStatsRoleCount
from app.domain.entities.booking import BookingStatus
from app.infrastructure.database.models.booking import BookingModel
from app.infrastructure.database.models.owner_profile import OwnerProfileModel
from app.infrastructure.database.models.property import PropertyModel
from app.infrastructure.database.models.role import RoleModel
from app.infrastructure.database.models.user import UserModel
from app.infrastructure.database.models.user_role import UserRoleModel


class GetAdminStatsUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(self) -> AdminStatsResponse:
        user_count = await self._session.execute(select(func.count()).select_from(UserModel))
        total_users = user_count.scalar() or 0

        owner_count = await self._session.execute(
            select(func.count()).select_from(OwnerProfileModel)
        )
        total_owners = owner_count.scalar() or 0

        property_count = await self._session.execute(
            select(func.count()).select_from(PropertyModel)
        )
        total_properties = property_count.scalar() or 0

        booking_count = await self._session.execute(
            select(func.count()).select_from(BookingModel)
        )
        total_bookings = booking_count.scalar() or 0

        revenue_result = await self._session.execute(
            select(func.coalesce(func.sum(BookingModel.total_price), 0)).where(
                BookingModel.status == BookingStatus.CHECKED_IN
            )
        )
        total_revenue = float(revenue_result.scalar() or 0)

        roles_result = await self._session.execute(
            select(RoleModel.slug, RoleModel.name, func.count(UserRoleModel.user_id).label("count"))
            .join(UserRoleModel, RoleModel.id == UserRoleModel.role_id, isouter=True)
            .group_by(RoleModel.id, RoleModel.slug, RoleModel.name)
            .order_by(RoleModel.name)
        )
        role_counts = [
            AdminStatsRoleCount(slug=slug, name=name, count=count)
            for slug, name, count in roles_result.all()
        ]

        return AdminStatsResponse(
            total_users=total_users,
            total_owners=total_owners,
            total_properties=total_properties,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            role_counts=role_counts,
        )
