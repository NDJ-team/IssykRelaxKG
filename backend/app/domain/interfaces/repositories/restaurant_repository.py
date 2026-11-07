from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.restaurant import Restaurant
from app.domain.entities.restaurant_partner_profile import RestaurantPartnerProfile


class RestaurantRepository(ABC):
    @abstractmethod
    async def create_profile(self, profile: RestaurantPartnerProfile) -> RestaurantPartnerProfile: ...

    @abstractmethod
    async def get_profile_by_user_id(self, user_id: UUID) -> RestaurantPartnerProfile | None: ...

    @abstractmethod
    async def get_profile_by_id(self, profile_id: UUID) -> RestaurantPartnerProfile | None: ...

    @abstractmethod
    async def update_profile(self, profile: RestaurantPartnerProfile) -> RestaurantPartnerProfile: ...

    @abstractmethod
    async def create_restaurant(self, restaurant: Restaurant) -> Restaurant: ...

    @abstractmethod
    async def get_restaurant_by_id(self, restaurant_id: UUID) -> Restaurant | None: ...

    @abstractmethod
    async def get_restaurants_by_partner(self, partner_profile_id: UUID, offset: int = 0, limit: int = 20) -> tuple[list[Restaurant], int]: ...

    @abstractmethod
    async def list_restaurants(self, city_id: UUID | None = None, offset: int = 0, limit: int = 20) -> tuple[list[Restaurant], int]: ...

    @abstractmethod
    async def update_restaurant(self, restaurant: Restaurant) -> Restaurant: ...

    @abstractmethod
    async def delete_restaurant(self, restaurant_id: UUID) -> None: ...
