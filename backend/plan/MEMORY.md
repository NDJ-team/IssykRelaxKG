# IssykRelax — Backend Memory

## Architecture
Clean Architecture (DDD) layers:
- `domain/entities/` — Pure Python dataclasses
- `domain/interfaces/repositories/` — Abstract repository interfaces
- `domain/value_objects/` — Frozen dataclasses (Address, Money, Image)
- `application/use_cases/` — Single-responsibility use cases
- `application/dto/` — Pydantic request/response models
- `infrastructure/database/models/` — SQLAlchemy 2.0 ORM models
- `infrastructure/database/repositories/` — SQLAlchemy repository implementations
- `infrastructure/services/` — Email, payment service implementations
- `infrastructure/cache/` — Redis cache
- `infrastructure/external/` — S3 storage
- `infrastructure/tasks/` — Celery async tasks
- `presentation/api/v1/` — FastAPI routers
- `presentation/api/deps.py` — FastAPI dependencies (auth guards)
- `presentation/exceptions/` — Exception handlers
- `presentation/middlewares/` — Custom middlewares

## Tech Stack
- Python 3.12+, FastAPI (async), SQLAlchemy 2.0+ (asyncpg), Alembic
- Pydantic v2, JWT (python-jose), bcrypt (passlib)
- Celery + Redis, PostgreSQL

## Current State (pre-migration)
- Single `User.role` derived from `is_superuser` (ADMIN/USER)
- Ownership via `OwnerProfile` existence check
- Wallet: `available_balance` + `pending_balance` per owner
- Booking statuses: pending → paid → checked_in → cancelled
- Dual confirmation guest/owner fields exist but wallet integration not complete
- Only Property is a dynamic service; Tours, Restaurants are hardcoded in frontend
- Auth: token-based, auto-refresh on 401

## Migration Target
Multi-sided travel OS with:
- Many-to-many roles via `user_roles` table
- Wallet per user (main + revenue balance), booking escrow flow
- Dual confirmation (guest + provider) before revenue release
- Dynamic entities per role: Driver, Guide, ActivityProvider, RestaurantPartner, Agency, Concierge, Translator
- Moderation system: status-based approval for all entities
- Service bookings: polymorphic `service_bookings` table

## Key Design Decisions
1. Roles are M:N — one person can be Driver + Guide + Owner simultaneously
2. Each user gets a wallet on registration (main + revenue balance)
3. Booking flow: create → hold funds → guest confirms arrival → provider confirms delivery → revenue unlocked
4. Withdrawals require Finance Manager role (admin sub-role)
5. All created entities get `status: pending | approved | rejected`
6. No hardcoded data — Tours, Restaurants, Transfers come from API/database
