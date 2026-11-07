from __future__ import annotations

from uuid import UUID

from app.application.dto.booking_dto import BookingResponse
from app.domain.entities.booking import BookingStatus
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.wallet_repository import WalletRepository
from app.application.use_cases.bookings._utils import booking_to_response, settle_if_both_confirmed


class GuestConfirmUseCase:
    def __init__(self, booking_repo: BookingRepository, wallet_repo: WalletRepository) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo

    async def execute(self, booking_id: UUID, guest_id: UUID) -> BookingResponse:
        booking = await self._booking_repo.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        if booking.guest_id != guest_id:
            raise PermissionError("This booking does not belong to you")
        if booking.status != BookingStatus.PAID:
            raise ValueError("Booking cannot be confirmed")

        booking.confirm_guest()
        await settle_if_both_confirmed(booking, self._wallet_repo)
        await self._booking_repo.update(booking)

        return booking_to_response(booking)


class ProviderConfirmUseCase:
    def __init__(self, booking_repo: BookingRepository, wallet_repo: WalletRepository) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo

    async def execute(self, booking_id: UUID, provider_id: UUID) -> BookingResponse:
        booking = await self._booking_repo.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        if booking.owner_id != provider_id:
            raise PermissionError("This booking does not belong to your service")
        if booking.status != BookingStatus.PAID:
            raise ValueError("Booking cannot be confirmed")

        booking.confirm_owner()
        await settle_if_both_confirmed(booking, self._wallet_repo)
        await self._booking_repo.update(booking)

        return booking_to_response(booking)
