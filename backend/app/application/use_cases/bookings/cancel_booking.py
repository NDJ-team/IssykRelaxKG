from __future__ import annotations

from uuid import UUID

from app.application.dto.booking_dto import BookingResponse
from app.domain.entities.booking import BookingStatus
from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class CancelBookingUseCase:
    def __init__(self, booking_repo: BookingRepository, wallet_repo: WalletRepository) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo

    async def execute(self, booking_id: UUID, user_id: UUID) -> BookingResponse:
        booking = await self._booking_repo.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")

        if booking.guest_id != user_id:
            raise PermissionError("You can only cancel your own bookings")

        if booking.status not in (BookingStatus.PENDING, BookingStatus.PAID):
            raise ValueError("Can only cancel pending or paid bookings")

        booking.cancel()
        await self._booking_repo.update(booking)

        guest_wallet = await self._wallet_repo.get_by_user_id(booking.guest_id)
        if guest_wallet:
            guest_wallet.refund(booking.total_price)
            await self._wallet_repo.update(guest_wallet)

            transaction = Transaction.create(
                wallet_id=guest_wallet.id,
                amount=booking.total_price,
                tx_type=TransactionType.REFUND,
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
