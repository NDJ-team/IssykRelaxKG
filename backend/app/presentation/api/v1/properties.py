from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.property_dto import (
    AmenityResponse,
    CategoryResponse,
    CityResponse,
    CreatePropertyRequest,
    PropertyListResponse,
    PropertyResponse,
)
from app.application.use_cases.properties.create_property import CreatePropertyUseCase
from app.application.use_cases.properties.get_property import GetPropertyUseCase
from app.application.use_cases.properties.search_properties import SearchPropertiesUseCase
from app.core.database import get_db
from app.infrastructure.database.models.amenity import AmenityModel
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.repositories.property_repository import (
    SQLAlchemyPropertyRepository,
)
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db)) -> list[CategoryResponse]:
    result = await session.execute(
        select(CategoryModel).order_by(CategoryModel.sort_order)
    )
    categories = result.scalars().all()
    return [
        CategoryResponse(
            id=str(c.id),
            name=c.name,
            slug=c.slug,
            description=c.description,
            sort_order=c.sort_order,
        )
        for c in categories
    ]


@router.get("/cities", response_model=list[CityResponse])
async def list_cities(session: AsyncSession = Depends(get_db)) -> list[CityResponse]:
    result = await session.execute(
        select(CityModel).where(CityModel.is_active).order_by(CityModel.popularity_score.desc())
    )
    cities = result.scalars().all()
    return [
        CityResponse(
            id=str(c.id),
            name=c.name,
            slug=c.slug,
            popularity_score=c.popularity_score,
        )
        for c in cities
    ]


@router.get("/amenities", response_model=list[AmenityResponse])
async def list_amenities(session: AsyncSession = Depends(get_db)) -> list[AmenityResponse]:
    result = await session.execute(select(AmenityModel).order_by(AmenityModel.name))
    amenities = result.scalars().all()
    return [
        AmenityResponse(id=str(a.id), name=a.name, slug=a.slug)
        for a in amenities
    ]


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    request: CreatePropertyRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = CreatePropertyUseCase(repo)
    try:
        return await use_case.execute(request, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=PropertyListResponse)
async def search_properties(
    query: str | None = Query(None),
    category_id: str | None = Query(None),
    city_id: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    max_guests: int | None = Query(None),
    amenities: str | None = Query(None),
    sort_by: str = Query("rating_points"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> PropertyListResponse:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = SearchPropertiesUseCase(repo)

    amenity_slugs = amenities.split(",") if amenities else None
    category_uuid = UUID(category_id) if category_id else None
    city_uuid = UUID(city_id) if city_id else None

    return await use_case.execute(
        query=query,
        category_id=category_uuid,
        city_id=city_uuid,
        min_price=min_price,
        max_price=max_price,
        max_guests=max_guests,
        amenity_slugs=amenity_slugs,
        sort_by=sort_by,
        offset=offset,
        limit=limit,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    repo = SQLAlchemyPropertyRepository(session)
    use_case = GetPropertyUseCase(repo)
    try:
        return await use_case.execute(property_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
