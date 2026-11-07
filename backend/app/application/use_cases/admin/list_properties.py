from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.admin_dto import AdminPropertyListResponse, AdminPropertyResponse
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.models.property import PropertyModel
from app.infrastructure.database.models.user import UserModel


class AdminListPropertiesUseCase:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def execute(
        self,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> AdminPropertyListResponse:
        stmt = select(PropertyModel)
        count_stmt = select(func.count()).select_from(PropertyModel)

        if status:
            stmt = stmt.where(PropertyModel.status == status)
            count_stmt = count_stmt.where(PropertyModel.status == status)

        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        result = await self._session.execute(
            stmt.order_by(PropertyModel.created_at.desc()).offset(offset).limit(limit)
        )
        models = result.scalars().all()

        items = []
        for m in models:
            user_result = await self._session.execute(select(UserModel).where(UserModel.id == m.owner_id))
            owner = user_result.scalar_one_or_none()

            cat_result = await self._session.execute(select(CategoryModel).where(CategoryModel.id == m.category_id))
            category = cat_result.scalar_one_or_none()

            city_result = await self._session.execute(select(CityModel).where(CityModel.id == m.city_id))
            city = city_result.scalar_one_or_none()

            items.append(
                AdminPropertyResponse(
                    id=str(m.id),
                    title=m.title,
                    owner_id=str(m.owner_id),
                    owner_name=owner.full_name if owner else "",
                    category=category.name if category else "",
                    city=city.name if city else "",
                    status=m.status,
                    price_per_night=float(m.price_per_night),
                    is_active=m.is_active,
                    created_at=m.created_at.isoformat(),
                )
            )

        return AdminPropertyListResponse(items=items, total=total, offset=offset, limit=limit)
