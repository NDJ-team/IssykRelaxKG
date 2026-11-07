from __future__ import annotations

from fastapi import APIRouter

from app.presentation.api.v1.activities import router as activities_router
from app.presentation.api.v1.admin import router as admin_router
from app.presentation.api.v1.agency import router as agency_router
from app.presentation.api.v1.auth import router as auth_router
from app.presentation.api.v1.bookings import router as bookings_router
from app.presentation.api.v1.concierge import router as concierge_router
from app.presentation.api.v1.drivers import router as drivers_router
from app.presentation.api.v1.experiences import router as experiences_router
from app.presentation.api.v1.favorites import router as favorites_router
from app.presentation.api.v1.guides import router as guides_router
from app.presentation.api.v1.feedback import router as feedback_router
from app.presentation.api.v1.owner import router as owner_router
from app.presentation.api.v1.properties import router as properties_router
from app.presentation.api.v1.restaurants_api import router as restaurants_api_router
from app.presentation.api.v1.reviews import router as reviews_router
from app.presentation.api.v1.translator import router as translator_router
from app.presentation.api.v1.wallet import router as wallet_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(properties_router)
router.include_router(bookings_router)
router.include_router(owner_router)
router.include_router(admin_router)
router.include_router(favorites_router)
router.include_router(reviews_router)
router.include_router(wallet_router)
router.include_router(drivers_router)
router.include_router(feedback_router)
router.include_router(guides_router)
router.include_router(restaurants_api_router)
router.include_router(activities_router)
router.include_router(experiences_router)
router.include_router(agency_router)
router.include_router(concierge_router)
router.include_router(translator_router)
