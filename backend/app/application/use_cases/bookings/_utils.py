from app.application.dto.booking_dto import BookingResponse
from app.domain.entities.booking import Booking
from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


def booking_to_response(booking: Booking) -> BookingResponse:
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


async def settle_if_both_confirmed(booking: Booking, wallet_repo: WalletRepository) -> None:
    if not (booking.guest_confirmed and booking.owner_confirmed):
        return

    guest_wallet = await wallet_repo.get_by_user_id(booking.guest_id)
    if guest_wallet:
        guest_wallet.settle(booking.total_price)
        await wallet_repo.update(guest_wallet)

    provider_wallet = await wallet_repo.get_by_user_id(booking.owner_id)
    if not provider_wallet:
        provider_wallet = await wallet_repo.create_for_user(booking.owner_id)
    provider_wallet.receive(booking.total_price)
    await wallet_repo.update(provider_wallet)

    transaction = Transaction.create(
        wallet_id=provider_wallet.id,
        amount=booking.total_price,
        tx_type=TransactionType.RELEASE,
        booking_id=booking.id,
        note=f"Settled for {booking.service_type}",
    )
    await wallet_repo.add_transaction(transaction)
