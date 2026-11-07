from __future__ import annotations

import secrets
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.application.dto.booking_dto import BookingResponse, CreateBookingRequest
from app.domain.entities.booking import Booking
from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class CreateBookingUseCase:
    def __init__(self, booking_repo: BookingRepository, wallet_repo: WalletRepository) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo

    async def execute(
        self,
        request: CreateBookingRequest,
        guest_id: UUID,
        owner_id: UUID,
        total_price: Decimal,
    ) -> BookingResponse:
        check_in = datetime.combine(request.check_in, datetime.min.time())
        check_out = datetime.combine(request.check_out, datetime.min.time())

        available = await self._booking_repo.check_availability(
            UUID(request.property_id),
            check_in,
            check_out,
        )
        if not available:
            raise ValueError("Property is not available for selected dates")

        verification_code = secrets.token_hex(3).upper()

        booking = Booking.create(
            guest_id=guest_id,
            owner_id=owner_id,
            total_price=total_price,
            service_type="property",
            property_id=UUID(request.property_id) if request.property_id else None,
            check_in=check_in,
            check_out=check_out,
            guest_count=request.guest_count,
            verification_code=verification_code,
            special_requests=request.special_requests,
        )
        booking.pay()

        await self._booking_repo.create(booking)

        guest_wallet = await self._wallet_repo.get_by_user_id(guest_id)
        if not guest_wallet:
            guest_wallet = await self._wallet_repo.create_for_user(guest_id)
        guest_wallet.hold(total_price)
        await self._wallet_repo.update(guest_wallet)

        transaction = Transaction.create(
            wallet_id=guest_wallet.id,
            amount=total_price,
            tx_type=TransactionType.HOLD,
            booking_id=booking.id,
        )
        await self._wallet_repo.add_transaction(transaction)

        return BookingResponse(
            id=str(booking.id),
            service_type=booking.service_type,
            service_id=str(booking.service_id) if booking.service_id else None,
            property_id=str(booking.property_id) if booking.property_id else None,
            guest_id=str(booking.guest_id),
            owner_id=str(booking.owner_id),
            check_in=booking.check_in.isoformat() if booking.check_in else None,
            check_out=booking.check_out.isoformat() if booking.check_out else None,
            total_price=float(booking.total_price),
            status=booking.status,
            guest_count=booking.guest_count,
            special_requests=booking.special_requests,
            verification_code=booking.verification_code,
            guest_confirmed=booking.guest_confirmed,
            owner_confirmed=booking.owner_confirmed,
            created_at=booking.created_at.isoformat(),
        )
