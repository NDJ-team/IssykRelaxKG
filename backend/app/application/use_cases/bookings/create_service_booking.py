from __future__ import annotations

import secrets
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.application.dto.booking_dto import BookingResponse, CreateBookingRequest
from app.application.use_cases.bookings._utils import booking_to_response
from app.domain.entities.booking import Booking
from app.domain.entities.transaction import Transaction, TransactionType
from app.domain.interfaces.repositories.booking_repository import BookingRepository
from app.domain.interfaces.repositories.local_experience_repository import LocalExperienceRepository
from app.domain.interfaces.repositories.property_repository import PropertyRepository
from app.domain.interfaces.repositories.wallet_repository import WalletRepository


class CreateServiceBookingUseCase:
    def __init__(
        self,
        booking_repo: BookingRepository,
        wallet_repo: WalletRepository,
        property_repo: PropertyRepository | None = None,
        local_experience_repo: LocalExperienceRepository | None = None,
    ) -> None:
        self._booking_repo = booking_repo
        self._wallet_repo = wallet_repo
        self._property_repo = property_repo
        self._local_experience_repo = local_experience_repo

    async def execute(
        self,
        request: CreateBookingRequest,
        guest_id: UUID,
    ) -> BookingResponse:
        check_in: datetime | None = None
        check_out: datetime | None = None
        property_id: UUID | None = None
        service_id: UUID | None = None
        owner_id: UUID | None = None
        total_price: Decimal | None = None

        if request.check_in:
            check_in = datetime.combine(request.check_in, datetime.min.time())
        if request.check_out:
            check_out = datetime.combine(request.check_out, datetime.min.time())
        if request.property_id:
            property_id = UUID(request.property_id)
        if request.service_id:
            service_id = UUID(request.service_id)

        if request.service_type == "property":
            if not property_id:
                raise ValueError("property_id required for property bookings")
            if not check_in or not check_out:
                raise ValueError("check_in and check_out required for property bookings")
            if not self._property_repo:
                raise ValueError("PropertyRepository required for property bookings")

            property = await self._property_repo.get_by_id(property_id)
            if not property:
                raise ValueError("Property not found")
            owner_id = property.owner_id
            nights = max(1, (check_out - check_in).days)
            total_price = Decimal(str(property.price_per_night.amount)) * Decimal(nights)

            available = await self._booking_repo.check_availability(property_id, check_in, check_out)
            if not available:
                raise ValueError("Property is not available for selected dates")
        elif request.service_type == "experience":
            if not service_id:
                raise ValueError("service_id required for experience bookings")
            if not self._local_experience_repo:
                raise ValueError("LocalExperienceRepository required for experience bookings")

            experience = await self._local_experience_repo.get_experience_by_id(service_id)
            if not experience or not experience.is_active or experience.status != "approved":
                raise ValueError("Experience is not available")

            host_profile = await self._local_experience_repo.get_profile_by_id(experience.host_id)
            if not host_profile:
                raise ValueError("Experience host not found")

            if experience.max_guests and request.guest_count > experience.max_guests:
                raise ValueError(f"Experience accepts up to {experience.max_guests} guests")

            owner_id = host_profile.user_id
            total_price = Decimal(str(experience.price)) * Decimal(max(1, request.guest_count))

            if not check_in:
                check_in = datetime.now()
            if not check_out:
                check_out = check_in
        else:
            if not request.service_id:
                raise ValueError("service_id required")
            raise ValueError(f"Service type '{request.service_type}' not yet implemented")

        if not owner_id or total_price is None:
            raise ValueError("Could not determine owner or total price")

        verification_code = secrets.token_hex(3).upper()

        booking = Booking.create(
            guest_id=guest_id,
            owner_id=owner_id,
            total_price=total_price,
            service_type=request.service_type,
            service_id=service_id,
            property_id=property_id,
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

        return booking_to_response(booking)
