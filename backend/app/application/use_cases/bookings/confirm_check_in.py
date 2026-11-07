from __future__ import annotations

from uuid import UUID

from app.application.dto.booking_dto import BookingResponse
from app.domain.entities.booking import BookingStatus
from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class GuestCheckInUseCase:
    def __init__(
        self,
        booking_repo: BookingRepository,
        wallet_repo: WalletRepository,
        property_repo: PropertyRepository,
    ) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo
        self._property_repo = property_repo

    async def execute(self, booking_id: UUID, guest_id: UUID) -> BookingResponse:
        booking = await self._booking_repo.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")

        if booking.guest_id != guest_id:
            raise PermissionError("This booking does not belong to you")

        if booking.status != BookingStatus.PAID:
            raise ValueError("Booking cannot be checked in")

        booking.confirm_guest()

        both_confirmed = booking.guest_confirmed and booking.owner_confirmed
        if both_confirmed:
            booking.mark_checked_in()
            await self._property_repo.add_rating_points(booking.property_id, 1)

            guest_wallet = await self._wallet_repo.get_by_user_id(booking.guest_id)
            if guest_wallet:
                guest_wallet.settle(booking.total_price)
                await self._wallet_repo.update(guest_wallet)

            provider_wallet = await self._wallet_repo.get_by_user_id(booking.owner_id)
            if not provider_wallet:
                provider_wallet = await self._wallet_repo.create_for_user(booking.owner_id)
            provider_wallet.receive(booking.total_price)
            await self._wallet_repo.update(provider_wallet)

            transaction = Transaction.create(
                wallet_id=provider_wallet.id,
                amount=booking.total_price,
                tx_type=TransactionType.RELEASE,
                booking_id=booking.id,
            )
            await self._wallet_repo.add_transaction(transaction)

        await self._booking_repo.update(booking)

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
