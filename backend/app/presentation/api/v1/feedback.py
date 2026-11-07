from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


@router.post("", status_code=201)
async def submit_feedback(request: FeedbackRequest) -> dict[str, Any]:
    logger.info("Feedback received: name=%s, email=%s, message=%s", request.name, request.email, request.message)
    return {"message": "Спасибо за обратную связь! Мы ответим в ближайшее время."}
