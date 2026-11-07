from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dto.review_dto import CreateReviewRequest, ReviewListResponse, ReviewResponse
from app.application.use_cases.reviews.create_review import CreateReviewUseCase
from app.application.use_cases.reviews.get_property_reviews import GetPropertyReviewsUseCase
from app.core.database import get_db
from app.infrastructure.database.repositories.booking_repository import SQLAlchemyBookingRepository
from app.infrastructure.database.repositories.property_repository import SQLAlchemyPropertyRepository
from app.infrastructure.database.repositories.review_repository import SQLAlchemyReviewRepository
from app.presentation.api.deps import get_current_user_id

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    request: CreateReviewRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
) -> ReviewResponse:
    review_repo = SQLAlchemyReviewRepository(session)
    booking_repo = SQLAlchemyBookingRepository(session)
    property_repo = SQLAlchemyPropertyRepository(session)
    use_case = CreateReviewUseCase(review_repo, booking_repo, property_repo)
    try:
        return await use_case.execute(request, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/property/{property_id}", response_model=ReviewListResponse)
async def get_property_reviews(
    property_id: UUID,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> ReviewListResponse:
    review_repo = SQLAlchemyReviewRepository(session)
    use_case = GetPropertyReviewsUseCase(review_repo)
    return await use_case.execute(property_id, offset=offset, limit=limit)
