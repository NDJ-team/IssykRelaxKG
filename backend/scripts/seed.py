from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.domain.entities.transaction import TransactionStatus, TransactionType
from app.infrastructure.database.models.activity import ActivityModel
from app.infrastructure.database.models.activity_provider_profile import ActivityProviderProfileModel
from app.infrastructure.database.models.agency_profile import AgencyProfileModel
from app.infrastructure.database.models.amenity import AmenityModel, PropertyAmenityModel
from app.infrastructure.database.models.booking import BookingModel
from app.infrastructure.database.models.category import CategoryModel
from app.infrastructure.database.models.city import CityModel
from app.infrastructure.database.models.concierge_profile import ConciergeProfileModel
from app.infrastructure.database.models.driver_profile import DriverProfileModel
from app.infrastructure.database.models.favorite import FavoriteModel
from app.infrastructure.database.models.guide_profile import GuideProfileModel
from app.infrastructure.database.models.local_experience import LocalExperienceModel
from app.infrastructure.database.models.local_host_profile import LocalHostProfileModel
from app.infrastructure.database.models.owner_profile import OwnerProfileModel
from app.infrastructure.database.models.permission import PermissionModel
from app.infrastructure.database.models.property import PropertyMediaModel, PropertyModel
from app.infrastructure.database.models.restaurant import RestaurantModel
from app.infrastructure.database.models.restaurant_partner_profile import RestaurantPartnerProfileModel
from app.infrastructure.database.models.review import ReviewModel
from app.infrastructure.database.models.role import RoleModel
from app.infrastructure.database.models.tour import TourModel
from app.infrastructure.database.models.tour_package import TourPackageModel
from app.infrastructure.database.models.transfer import TransferModel
from app.infrastructure.database.models.translator_profile import TranslatorProfileModel
from app.infrastructure.database.models.user import UserModel
from app.infrastructure.database.models.user_role import UserRoleModel
from app.infrastructure.database.models.wallet import WalletModel
from app.infrastructure.database.models.wallet_transaction import WalletTransactionModel


async def _get_or_create_city(session: AsyncSession, name: str, slug: str, popularity: int) -> CityModel:
    result = await session.execute(select(CityModel).where(CityModel.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    city = CityModel(id=uuid.uuid4(), name=name, slug=slug, popularity_score=popularity, is_active=True)
    session.add(city)
    await session.flush()
    return city


async def _get_or_create_category(session: AsyncSession, name: str, slug: str, desc: str, sort: int) -> CategoryModel:
    result = await session.execute(select(CategoryModel).where(CategoryModel.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    cat = CategoryModel(id=uuid.uuid4(), name=name, slug=slug, description=desc, sort_order=sort)
    session.add(cat)
    await session.flush()
    return cat


async def _get_or_create_amenity(session: AsyncSession, name: str, slug: str) -> AmenityModel:
    result = await session.execute(select(AmenityModel).where(AmenityModel.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    amenity = AmenityModel(id=uuid.uuid4(), name=name, slug=slug)
    session.add(amenity)
    await session.flush()
    return amenity


async def _get_or_create_role(session: AsyncSession, name: str, slug: str, desc: str | None = None) -> RoleModel:
    result = await session.execute(select(RoleModel).where(RoleModel.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    role = RoleModel(id=uuid.uuid4(), name=name, slug=slug, description=desc)
    session.add(role)
    await session.flush()
    return role


def _rand_price(min_v: float, max_v: float) -> float:
    import random
    return round(random.uniform(min_v, max_v), -1)


def _pick_one(items: list):
    import random
    return random.choice(items)


def _pick_n(items: list, n: int):
    import random
    return random.sample(items, min(n, len(items)))


async def seed() -> None:
    async with async_session_factory() as session:
        existing = await session.execute(select(UserModel).where(UserModel.email == "admin@issykrelax.kg"))
        if existing.scalar_one_or_none():
            print("Seed data already exists, skipping.")
            return

        now = datetime.now()
        import random
        random.seed(42)

        # ── ROLES ──
        role_slugs = {
            "tourist": "Турист",
            "owner": "Владелец жилья",
            "driver": "Водитель",
            "guide": "Гид",
            "translator": "Переводчик",
            "concierge": "Консьерж",
            "agency": "Туристическое агентство",
            "restaurant_partner": "Партнёр ресторана",
            "activity_provider": "Организатор активностей",
            "local_host": "Хозяин впечатлений",
            "admin": "Администратор",
            "moderator": "Модератор",
            "finance_manager": "Финансовый менеджер",
        }
        roles = {}
        for slug, name in role_slugs.items():
            roles[slug] = await _get_or_create_role(session, name, slug)

        # ── CITIES ──
        cities_data = [
            ("Бостери", "bosteri", 100),
            ("Чолпон-Ата", "cholpon-ata", 95),
            ("Тамчы", "tamchy", 80),
            ("Корумду", "korumdu", 60),
            ("Балыкчы", "balykchy", 50),
            ("Кара-Ой", "kara-oy", 70),
            ("Сары-Ой", "sary-oy", 55),
            ("Чок-Тал", "chok-tal", 65),
            ("Бактуу-Долоноту", "baktuu-dolonotu", 75),
        ]
        cities = {}
        for name, slug, pop in cities_data:
            cities[slug] = await _get_or_create_city(session, name, slug, pop)

        # ── CATEGORIES ──
        categories_data = [
            ("Коттедж", "cottage", "Отдельный дом для отдыха", 1),
            ("Отель", "hotel", "Гостиница с номерами", 2),
            ("Гостевой дом", "guesthouse", "Гостевой дом с услугами", 3),
            ("Юрта", "yurt", "Традиционное жильё", 4),
            ("Вилла", "villa", "Элитная вилла с бассейном", 5),
            ("Курорт", "resort", "Курортный комплекс", 6),
            ("Хостел", "hostel", "Бюджетное размещение", 7),
        ]
        categories = {}
        for name, slug, desc, sort in categories_data:
            categories[slug] = await _get_or_create_category(session, name, slug, desc, sort)

        # ── AMENITIES ──
        amenities_data = [
            "wifi", "parking", "beach", "pool", "barbecue", "kitchen",
            "washing_machine", "air_conditioner", "sauna", "baby_bed",
            "pets", "gym", "spa", "transfer", "breakfast", "tv",
            "heating", "mountain_view", "lake_view", "terrace",
        ]
        amenity_names = {
            "wifi": "WiFi", "parking": "Парковка", "beach": "Пляж",
            "pool": "Бассейн", "barbecue": "Барбекю", "kitchen": "Кухня",
            "washing_machine": "Стиральная машина", "air_conditioner": "Кондиционер",
            "sauna": "Сауна", "baby_bed": "Детская кровать", "pets": "Домашние животные",
            "gym": "Спортзал", "spa": "SPA", "transfer": "Трансфер",
            "breakfast": "Завтрак включён", "tv": "Телевизор",
            "heating": "Отопление", "mountain_view": "Вид на горы",
            "lake_view": "Вид на озеро", "terrace": "Терраса",
        }
        amenity_models = {}
        for slug in amenities_data:
            amenity_models[slug] = await _get_or_create_amenity(session, amenity_names[slug], slug)

        # ── PERMISSIONS ──
        all_permissions = [
            "properties.create", "properties.edit", "properties.delete",
            "properties.moderate", "bookings.view", "bookings.manage",
            "users.view", "users.manage", "wallet.view", "wallet.manage",
            "finance.view", "finance.manage", "reports.view",
            "moderation.view", "moderation.manage",
        ]
        admin_role = roles["admin"]
        for perm_name in all_permissions:
            perm = PermissionModel(id=uuid.uuid4(), role_id=admin_role.id, permission=perm_name)
            session.add(perm)

        moderator_role = roles["moderator"]
        for perm_name in ["properties.moderate", "moderation.view", "moderation.manage", "bookings.view", "users.view"]:
            session.add(PermissionModel(id=uuid.uuid4(), role_id=moderator_role.id, permission=perm_name))

        finance_role = roles["finance_manager"]
        for perm_name in ["finance.view", "finance.manage", "wallet.view", "reports.view"]:
            session.add(PermissionModel(id=uuid.uuid4(), role_id=finance_role.id, permission=perm_name))

        # ── USERS ──

        # Admin
        admin = UserModel(
            id=uuid.uuid4(),
            email="admin@issykrelax.kg",
            password_hash=hash_password("admin123"),
            full_name="Администратор IssykRelax",
            phone="+996 700 000 001",
            is_active=True, is_verified=True, is_superuser=True,
            created_at=now, updated_at=now,
        )
        session.add(admin)
        session.add(UserRoleModel(user_id=admin.id, role_id=roles["admin"].id))
        session.add(UserRoleModel(user_id=admin.id, role_id=roles["moderator"].id))

        # Moderator
        moderator = UserModel(
            id=uuid.uuid4(),
            email="moderator@issykrelax.kg",
            password_hash=hash_password("moderator123"),
            full_name="Модератор Платформы",
            phone="+996 700 000 002",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(moderator)
        session.add(UserRoleModel(user_id=moderator.id, role_id=roles["moderator"].id))

        # Finance Manager
        finance_mgr = UserModel(
            id=uuid.uuid4(),
            email="finance@issykrelax.kg",
            password_hash=hash_password("finance123"),
            full_name="Финансовый Менеджер",
            phone="+996 700 000 003",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(finance_mgr)
        session.add(UserRoleModel(user_id=finance_mgr.id, role_id=roles["finance_manager"].id))

        # Test Tourist
        user = UserModel(
            id=uuid.uuid4(),
            email="user@issykrelax.kg",
            password_hash=hash_password("user123"),
            full_name="Айжан Керимова",
            phone="+996 700 333 444",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(user)
        session.add(UserRoleModel(user_id=user.id, role_id=roles["tourist"].id))

        # Second tourist
        user2 = UserModel(
            id=uuid.uuid4(),
            email="user2@issykrelax.kg",
            password_hash=hash_password("user123"),
            full_name="Бакыт Асанов",
            phone="+996 701 234 567",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(user2)
        session.add(UserRoleModel(user_id=user2.id, role_id=roles["tourist"].id))

        # ── OWNER ──
        owner = UserModel(
            id=uuid.uuid4(),
            email="owner@issykrelax.kg",
            password_hash=hash_password("owner123"),
            full_name="Тестовый Владелец",
            phone="+996 700 111 222",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(owner)
        session.add(UserRoleModel(user_id=owner.id, role_id=roles["owner"].id))
        owner_profile = OwnerProfileModel(id=uuid.uuid4(), user_id=owner.id, is_approved=True, business_phone="+996 700 111 222")
        session.add(owner_profile)

        # Owner 2
        owner2_user = UserModel(
            id=uuid.uuid4(),
            email="owner2@issykrelax.kg",
            password_hash=hash_password("owner123"),
            full_name="Гульмира Ташматова",
            phone="+996 702 345 678",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(owner2_user)
        session.add(UserRoleModel(user_id=owner2_user.id, role_id=roles["owner"].id))
        owner2_profile = OwnerProfileModel(id=uuid.uuid4(), user_id=owner2_user.id, is_approved=True, business_phone="+996 702 345 678")
        session.add(owner2_profile)

        # Owner 3 (unapproved, no properties)
        owner3_user = UserModel(
            id=uuid.uuid4(),
            email="owner3@issykrelax.kg",
            password_hash=hash_password("owner123"),
            full_name="Новый Владелец",
            phone="+996 703 456 789",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(owner3_user)
        session.add(UserRoleModel(user_id=owner3_user.id, role_id=roles["owner"].id))
        owner3_profile = OwnerProfileModel(id=uuid.uuid4(), user_id=owner3_user.id, is_approved=False, business_phone="+996 703 456 789")
        session.add(owner3_profile)

        # ── DRIVER ──
        driver_user = UserModel(
            id=uuid.uuid4(),
            email="driver@issykrelax.kg",
            password_hash=hash_password("driver123"),
            full_name="Темирбек Жолдошев",
            phone="+996 704 567 890",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(driver_user)
        session.add(UserRoleModel(user_id=driver_user.id, role_id=roles["driver"].id))
        driver_profile = DriverProfileModel(
            id=uuid.uuid4(), user_id=driver_user.id, is_approved=True,
            bio="Водитель с 10-летним стажем. Комфортные авто, встречи в аэропорту.",
            license_number="KG 1234567", vehicle_info="Toyota Camry 2023, 4 места",
        )
        session.add(driver_profile)

        driver2_user = UserModel(
            id=uuid.uuid4(),
            email="driver2@issykrelax.kg",
            password_hash=hash_password("driver123"),
            full_name="Асан Усенов",
            phone="+996 705 678 901",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(driver2_user)
        session.add(UserRoleModel(user_id=driver2_user.id, role_id=roles["driver"].id))
        driver2_profile = DriverProfileModel(
            id=uuid.uuid4(), user_id=driver2_user.id, is_approved=True,
            bio="Минивэн для групп до 7 человек. Детские кресла.",
            license_number="KG 2345678", vehicle_info="Hiace 2022, 7 мест",
        )
        session.add(driver2_profile)

        # ── GUIDE ──
        guide_user = UserModel(
            id=uuid.uuid4(),
            email="guide@issykrelax.kg",
            password_hash=hash_password("guide123"),
            full_name="Айбек Шаршенов",
            phone="+996 706 789 012",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(guide_user)
        session.add(UserRoleModel(user_id=guide_user.id, role_id=roles["guide"].id))
        guide_profile = GuideProfileModel(
            id=uuid.uuid4(), user_id=guide_user.id, is_approved=True,
            bio="Гид-инструктор по Тянь-Шаню. Походы, конные туры, альпинизм.",
            languages="Русский, Кыргызский, Английский",
        )
        session.add(guide_profile)

        guide2_user = UserModel(
            id=uuid.uuid4(),
            email="guide2@issykrelax.kg",
            password_hash=hash_password("guide123"),
            full_name="Нуржан Кыдыров",
            phone="+996 707 890 123",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(guide2_user)
        session.add(UserRoleModel(user_id=guide2_user.id, role_id=roles["guide"].id))
        guide2_profile = GuideProfileModel(
            id=uuid.uuid4(), user_id=guide2_user.id, is_approved=True,
            bio="Экскурсовод по Иссык-Кульской области. Знаю каждый уголок!",
            languages="Русский, Кыргызский, Английский, Немецкий",
        )
        session.add(guide2_profile)

        # ── TRANSLATOR ──
        translator_user = UserModel(
            id=uuid.uuid4(),
            email="translator@issykrelax.kg",
            password_hash=hash_password("translator123"),
            full_name="Диана Чолпонбаева",
            phone="+996 708 901 234",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(translator_user)
        session.add(UserRoleModel(user_id=translator_user.id, role_id=roles["translator"].id))
        session.add(TranslatorProfileModel(
            id=uuid.uuid4(), user_id=translator_user.id, is_approved=True,
            bio="Профессиональный переводчик. Устный и письменный перевод.",
            languages="Английский, Русский, Кыргызский, Турецкий",
        ))
        await session.flush()

        # ── CONCIERGE ──
        concierge_user = UserModel(
            id=uuid.uuid4(),
            email="concierge@issykrelax.kg",
            password_hash=hash_password("concierge123"),
            full_name="Елена Власова",
            phone="+996 709 012 345",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(concierge_user)
        session.add(UserRoleModel(user_id=concierge_user.id, role_id=roles["concierge"].id))
        session.add(ConciergeProfileModel(
            id=uuid.uuid4(), user_id=concierge_user.id, is_approved=True,
            bio="Организация отдыха «под ключ». Помогу с выбором жилья, трансфера, досуга.",
            service_areas="Чолпон-Ата, Бостери, Кара-Ой",
        ))
        await session.flush()

        # ── AGENCY ──
        agency_user = UserModel(
            id=uuid.uuid4(),
            email="agency@issykrelax.kg",
            password_hash=hash_password("agency123"),
            full_name="Туристическое агентство «Иссык-Куль Трэвел»",
            phone="+996 710 123 456",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(agency_user)
        session.add(UserRoleModel(user_id=agency_user.id, role_id=roles["agency"].id))
        agency_profile = AgencyProfileModel(
            id=uuid.uuid4(), user_id=agency_user.id, is_approved=True,
            company_name="Иссык-Куль Трэвел",
            description="Организуем туры любой сложности на Иссык-Куле. Корпоративы, свадьбы, семейный отдых.",
            license_number="TUR-2024-0056",
        )
        session.add(agency_profile)

        # ── RESTAURANT PARTNER ──
        rest_partner_user = UserModel(
            id=uuid.uuid4(),
            email="restaurant@issykrelax.kg",
            password_hash=hash_password("rest123"),
            full_name="Усон Абдырахманов",
            phone="+996 711 234 567",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(rest_partner_user)
        session.add(UserRoleModel(user_id=rest_partner_user.id, role_id=roles["restaurant_partner"].id))
        rest_partner = RestaurantPartnerProfileModel(
            id=uuid.uuid4(), user_id=rest_partner_user.id, is_approved=True,
            restaurant_name="Вкусы Иссык-Куля",
            description="Сеть ресторанов национальной кухни",
            cuisine_type="Кыргызская", address="Чолпон-Ата, ул. Советская 15",
            phone="+996 711 234 567",
        )
        session.add(rest_partner)

        rest_partner2_user = UserModel(
            id=uuid.uuid4(),
            email="restaurant2@issykrelax.kg",
            password_hash=hash_password("rest123"),
            full_name="Михаил Ким",
            phone="+996 712 345 678",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(rest_partner2_user)
        session.add(UserRoleModel(user_id=rest_partner2_user.id, role_id=roles["restaurant_partner"].id))
        rest_partner2 = RestaurantPartnerProfileModel(
            id=uuid.uuid4(), user_id=rest_partner2_user.id, is_approved=True,
            restaurant_name="Морской Бриз",
            description="Ресторан морепродуктов на берегу озера",
            cuisine_type="Морская", address="Бостери, ул. Прибрежная 7",
            phone="+996 712 345 678",
        )
        session.add(rest_partner2)

        # ── ACTIVITY PROVIDER ──
        activity_provider_user = UserModel(
            id=uuid.uuid4(),
            email="activity@issykrelax.kg",
            password_hash=hash_password("activity123"),
            full_name="Активный Отдых Иссык-Куль",
            phone="+996 713 456 789",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(activity_provider_user)
        session.add(UserRoleModel(user_id=activity_provider_user.id, role_id=roles["activity_provider"].id))
        activity_provider = ActivityProviderProfileModel(
            id=uuid.uuid4(), user_id=activity_provider_user.id, is_approved=True,
            company_name="ISSYK-KUL ADVENTURE",
            bio="Организуем экстремальные и водные виды спорта на Иссык-Куле.",
        )
        session.add(activity_provider)

        # ── LOCAL HOST ──
        local_host_user = UserModel(
            id=uuid.uuid4(),
            email="local@issykrelax.kg",
            password_hash=hash_password("local123"),
            full_name="Айгуль Мамбетова",
            phone="+996 714 567 890",
            is_active=True, is_verified=True, is_superuser=False,
            created_at=now, updated_at=now,
        )
        session.add(local_host_user)
        session.add(UserRoleModel(user_id=local_host_user.id, role_id=roles["local_host"].id))
        local_host_profile = LocalHostProfileModel(
            id=uuid.uuid4(), user_id=local_host_user.id, is_approved=True,
            bio="Живу на Иссык-Куле всю жизнь. Провожу кулинарные мастер-классы, конные прогулки и знакомлю гостей с культурой кыргызов.",
            experience_years=8,
            languages="Русский, кыргызский, английский",
        )
        session.add(local_host_profile)

        # ── WALLETS ──
        wallet_admin = WalletModel(id=uuid.uuid4(), user_id=admin.id, main_balance=0, revenue_balance=0)
        session.add(wallet_admin)
        wallet_owner = WalletModel(id=uuid.uuid4(), user_id=owner.id, main_balance=50000, revenue_balance=12000)
        session.add(wallet_owner)
        wallet_owner2 = WalletModel(id=uuid.uuid4(), user_id=owner2_user.id, main_balance=25000, revenue_balance=8000)
        session.add(wallet_owner2)
        wallet_owner3 = WalletModel(id=uuid.uuid4(), user_id=owner3_user.id, main_balance=0, revenue_balance=0)
        session.add(wallet_owner3)
        wallet_user = WalletModel(id=uuid.uuid4(), user_id=user.id, main_balance=30000, revenue_balance=0)
        session.add(wallet_user)
        wallet_user2 = WalletModel(id=uuid.uuid4(), user_id=user2.id, main_balance=15000, revenue_balance=0)
        session.add(wallet_user2)
        wallet_driver = WalletModel(id=uuid.uuid4(), user_id=driver_user.id, main_balance=8000, revenue_balance=3000)
        session.add(wallet_driver)
        wallet_guide = WalletModel(id=uuid.uuid4(), user_id=guide_user.id, main_balance=10000, revenue_balance=5000)
        session.add(wallet_guide)
        wallet_agency = WalletModel(id=uuid.uuid4(), user_id=agency_user.id, main_balance=20000, revenue_balance=15000)
        session.add(wallet_agency)
        wallet_rest_partner = WalletModel(id=uuid.uuid4(), user_id=rest_partner_user.id, main_balance=15000, revenue_balance=6000)
        session.add(wallet_rest_partner)
        wallet_activity = WalletModel(id=uuid.uuid4(), user_id=activity_provider_user.id, main_balance=12000, revenue_balance=4000)
        session.add(wallet_activity)
        wallet_local_host = WalletModel(id=uuid.uuid4(), user_id=local_host_user.id, main_balance=10000, revenue_balance=3500)
        session.add(wallet_local_host)
        wallet_driver2 = WalletModel(id=uuid.uuid4(), user_id=driver2_user.id, main_balance=5000, revenue_balance=2000)
        session.add(wallet_driver2)
        wallet_guide2 = WalletModel(id=uuid.uuid4(), user_id=guide2_user.id, main_balance=7000, revenue_balance=3500)
        session.add(wallet_guide2)

        # ── PROPERTIES ──
        property_defs = [
            {
                "title": "Уютный коттедж на берегу Иссык-Куля",
                "desc": "Прекрасный коттедж с видом на озеро, собственный пляж и зона барбекю. 3 спальни, гостиная с камином, полностью оборудованная кухня. Идеально подходит для семейного отдыха или компании друзей. Рядом магазины и рестораны.",
                "cat": "cottage", "city": "bosteri", "price": 8500, "guests": 8, "beds": 5, "baths": 2,
                "amenities": ["wifi", "parking", "beach", "barbecue", "kitchen", "air_conditioner", "lake_view"],
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                ],
                "rating": 45, "stages": 12,
            },
            {
                "title": "Гостевой дом «Айнура»",
                "desc": "Уютный гостевой дом в центре Чолпон-Аты. Рядом рестораны, магазины и пляж (5 мин пешком). Завтрак включён. Приветливые хозяева и домашняя атмосфера. Беседка во дворе, мангал.",
                "cat": "guesthouse", "city": "cholpon-ata", "price": 3500, "guests": 4, "beds": 3, "baths": 1,
                "amenities": ["wifi", "parking", "breakfast", "kitchen", "transfer", "tv", "heating"],
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
                ],
                "rating": 38, "stages": 8,
            },
            {
                "title": "Юрт-кемп «Көчмөн»",
                "desc": "Аутентичный юрточный лагерь прямо на берегу озера. 5 юрт, общая столовая, баня, вечерние программы с национальной музыкой и танцами. Конные прогулки, рыбалка. Незабываемый опыт погружения в культуру кочевников!",
                "cat": "yurt", "city": "tamchy", "price": 5000, "guests": 6, "beds": 6, "baths": 1,
                "amenities": ["beach", "parking", "barbecue", "sauna", "transfer", "terrace", "lake_view"],
                "images": [
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&h=600&fit=crop",
                ],
                "rating": 42, "stages": 15,
            },
            {
                "title": "Отель «Royal Beach»",
                "desc": "Современный 4-звёздочный отель с собственным пляжем, открытым бассейном и SPA-центром. Ресторан шведской линии, бар, фитнес-зал. Конференц-зал для деловых встреч. Всё включено.",
                "cat": "hotel", "city": "bosteri", "price": 12000, "guests": 2, "beds": 1, "baths": 1,
                "amenities": ["wifi", "parking", "beach", "pool", "air_conditioner", "sauna", "gym", "spa", "breakfast", "lake_view"],
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                ],
                "rating": 48, "stages": 20,
            },
            {
                "title": "Коттедж с сауной у озера",
                "desc": "Двухэтажный коттедж с панорамными окнами, сауной и прямым выходом к озеру. Современный ремонт, камин, терраса с мангалом. 4 спальни, 2 гостиные. Подходит для большого семейного торжества.",
                "cat": "cottage", "city": "balykchy", "price": 9500, "guests": 10, "beds": 6, "baths": 3,
                "amenities": ["wifi", "parking", "beach", "sauna", "barbecue", "kitchen", "washing_machine", "pets", "lake_view", "terrace"],
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
                ],
                "rating": 44, "stages": 10,
            },
            {
                "title": "Гостевой дом «Бостери»",
                "desc": "Недорогой, но чистый и уютный гостевой дом. Отлично подходит для бюджетных путешественников. Есть общая кухня, зона отдыха и мангал. До пляжа 10 минут пешком. Рядом продуктовый магазин.",
                "cat": "guesthouse", "city": "kara-oy", "price": 1500, "guests": 3, "beds": 2, "baths": 1,
                "amenities": ["wifi", "kitchen", "parking", "tv", "heating"],
                "images": [
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
                ],
                "rating": 30, "stages": 5,
            },
            {
                "title": "Вилла «Иссык-Куль Премиум»",
                "desc": "Роскошная вилла с частным бассейном, сауной, бильярдом и кинозалом. 5 спален, большая гостиная, полностью оборудованная кухня. Собственный пляж с шезлонгами и зонтами. Идеально для VIP-отдыха.",
                "cat": "villa", "city": "bosteri", "price": 25000, "guests": 14, "beds": 8, "baths": 4,
                "amenities": ["wifi", "parking", "beach", "pool", "air_conditioner", "sauna", "barbecue", "gym", "spa", "lake_view", "terrace", "kitchen"],
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
                ],
                "rating": 50, "stages": 25,
            },
            {
                "title": "Курорт «Caprice»",
                "desc": "Большой курортный комплекс с развитой инфраструктурой: 2 бассейна (один подогреваемый), SPA, 3 ресторана, анимация для детей и взрослых, спортивные площадки. Концерты и шоу-программы каждый вечер.",
                "cat": "resort", "city": "baktuu-dolonotu", "price": 18000, "guests": 2, "beds": 1, "baths": 1,
                "amenities": ["wifi", "parking", "beach", "pool", "air_conditioner", "sauna", "gym", "spa", "breakfast", "baby_bed", "lake_view", "tv"],
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
                ],
                "rating": 46, "stages": 18,
            },
            {
                "title": "Отель «Тамчы Плаза»",
                "desc": "Небольшой уютный отель в центре Тамчы. 10 номеров с ванными комнатами. Терраса с видом на горы, ресторан домашней кухни, бесплатный WiFi и парковка.",
                "cat": "hotel", "city": "tamchy", "price": 4000, "guests": 3, "beds": 2, "baths": 1,
                "amenities": ["wifi", "parking", "restaurant", "terrace", "mountain_view", "heating"],
                "images": [
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
                ],
                "rating": 35, "stages": 7,
            },
            {
                "title": "Хостел «Тянь-Шань»",
                "desc": "Бюджетный хостел для тревел-блогеров и самостоятельных путешественников. Общие и приватные комнаты, большая кухня, лаунж-зона, настольные игры. Экскурсионное бюро.",
                "cat": "hostel", "city": "cholpon-ata", "price": 800, "guests": 1, "beds": 1, "baths": 0,
                "amenities": ["wifi", "kitchen", "parking", "heating", "washing_machine"],
                "images": [
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
                ],
                "rating": 28, "stages": 4,
            },
            {
                "title": "Юрта на берегу «Көл Көчмөн»",
                "desc": "Романтичный юрточный лагерь для пар. 3 юрты с видом на озеро и горы. Ужин при свечах, звёздное небо, конные прогулки на закате. Завтрак в юрту.",
                "cat": "yurt", "city": "sary-oy", "price": 6500, "guests": 2, "beds": 1, "baths": 1,
                "amenities": ["beach", "parking", "barbecue", "lake_view", "terrace", "breakfast"],
                "images": [
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&h=600&fit=crop",
                ],
                "rating": 40, "stages": 9,
            },
            {
                "title": "Курорт «Золотые Пески»",
                "desc": "Семейный курорт на первой береговой линии. Мелкий песок, пологий вход в воду, детские аниматоры. Всё включено: питание, напитки, развлечения.",
                "cat": "resort", "city": "chok-tal", "price": 14000, "guests": 3, "beds": 2, "baths": 1,
                "amenities": ["wifi", "parking", "beach", "pool", "air_conditioner", "baby_bed", "breakfast", "tv", "lake_view"],
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                ],
                "rating": 43, "stages": 14,
            },
        ]

        all_properties = []
        owners_list = [owner.id, owner2_user.id]
        for i, pd in enumerate(property_defs):
            owner_id = owners_list[i % 2]
            prop = PropertyModel(
                id=uuid.uuid4(),
                owner_id=owner_id,
                category_id=categories[pd["cat"]].id,
                city_id=cities[pd["city"]].id,
                title=pd["title"],
                description=pd["desc"],
                status="published",
                price_per_night=pd["price"],
                max_guests=pd["guests"],
                bedrooms=max(1, pd["guests"] // 2),
                beds=pd["beds"],
                bathrooms=pd["baths"],
                is_active=True,
                rating_points=pd["rating"],
                stages=pd["stages"],
                latitude=42.0 + random.uniform(-0.3, 0.3),
                longitude=77.0 + random.uniform(-0.3, 0.3),
                check_in_time="14:00",
                check_out_time="12:00",
                created_at=now - timedelta(days=random.randint(30, 180)),
                updated_at=now,
            )
            session.add(prop)
            all_properties.append(prop)

            for order, url in enumerate(pd["images"]):
                session.add(PropertyMediaModel(
                    id=uuid.uuid4(),
                    property_id=prop.id,
                    url=url,
                    is_primary=order == 0,
                    order=order,
                ))

            with session.no_autoflush:
                result = await session.execute(
                    select(AmenityModel).where(AmenityModel.slug.in_(pd["amenities"]))
                )
            for am in result.scalars().all():
                session.add(PropertyAmenityModel(property_id=prop.id, amenity_id=am.id))

        # ── BOOKINGS ──
        booking_defs = [
            {"property": 0, "guest": user.id, "owner": owners_list[0], "check_in": "2026-07-01", "check_out": "2026-07-05", "status": "confirmed", "price": 34000, "guests": 4, "code": "BK-001", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 1, "guest": user2.id, "owner": owners_list[1], "check_in": "2026-07-10", "check_out": "2026-07-12", "status": "confirmed", "price": 7000, "guests": 2, "code": "BK-002", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 2, "guest": user.id, "owner": owners_list[0], "check_in": "2026-08-01", "check_out": "2026-08-04", "status": "confirmed", "price": 15000, "guests": 5, "code": "BK-003", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 3, "guest": user2.id, "owner": owners_list[0], "check_in": "2026-06-15", "check_out": "2026-06-18", "status": "completed", "price": 36000, "guests": 2, "code": "BK-004", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 4, "guest": user.id, "owner": owners_list[1], "check_in": "2026-07-20", "check_out": "2026-07-25", "status": "pending", "price": 47500, "guests": 8, "code": "BK-005", "guest_confirmed": False, "owner_confirmed": False},
            {"property": 5, "guest": user2.id, "owner": owners_list[1], "check_in": "2026-06-20", "check_out": "2026-06-22", "status": "cancelled", "price": 3000, "guests": 2, "code": "BK-006", "guest_confirmed": False, "owner_confirmed": False},
            {"property": 6, "guest": user.id, "owner": owners_list[0], "check_in": "2026-08-15", "check_out": "2026-08-20", "status": "confirmed", "price": 125000, "guests": 10, "code": "BK-007", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 0, "guest": user2.id, "owner": owners_list[0], "check_in": "2026-07-05", "check_out": "2026-07-08", "status": "pending", "price": 25500, "guests": 6, "code": "BK-008", "guest_confirmed": False, "owner_confirmed": False},
            {"property": 7, "guest": user.id, "owner": owners_list[1], "check_in": "2026-07-25", "check_out": "2026-07-30", "status": "confirmed", "price": 90000, "guests": 2, "code": "BK-009", "guest_confirmed": True, "owner_confirmed": True},
            {"property": 8, "guest": user2.id, "owner": owners_list[0], "check_in": "2026-06-10", "check_out": "2026-06-12", "status": "completed", "price": 8000, "guests": 2, "code": "BK-010", "guest_confirmed": True, "owner_confirmed": True},
        ]
        all_bookings = []
        for bd in booking_defs:
            check_in = datetime.fromisoformat(bd["check_in"])
            check_out = datetime.fromisoformat(bd["check_out"])
            booking = BookingModel(
                id=uuid.uuid4(),
                service_type="property",
                service_id=all_properties[bd["property"]].id,
                property_id=all_properties[bd["property"]].id,
                guest_id=bd["guest"],
                owner_id=bd["owner"],
                check_in=check_in,
                check_out=check_out,
                total_price=bd["price"],
                status=bd["status"],
                guest_count=bd["guests"],
                verification_code=bd["code"],
                guest_confirmed=bd["guest_confirmed"],
                owner_confirmed=bd["owner_confirmed"],
                created_at=now - timedelta(days=random.randint(5, 60)),
                updated_at=now,
            )
            session.add(booking)
            all_bookings.append(booking)
        await session.flush()

        # ── REVIEWS ──
        reviews_data = [
            {"booking": 0, "rating": 5, "comment": "Отличный коттедж! Всё чисто, уютно, прекрасный вид на озеро. Обязательно вернёмся!"},
            {"booking": 1, "rating": 4, "comment": "Уютный гостевой дом, приветливые хозяева. Вкусный завтрак. Не хватило кондиционера в жару."},
            {"booking": 2, "rating": 5, "comment": "Юрт-кемп — это невероятно! Звёздное небо, вечерняя программа, баня. Лучший опыт на Иссык-Куле!"},
            {"booking": 3, "rating": 5, "comment": "Шикарный отель. Пляж чистый, бассейн большой, еда разнообразная. Рекомендую!"},
            {"booking": 8, "rating": 4, "comment": "Прекрасный курорт, много развлечений для детей. Единственный минус — дороговато."},
            {"booking": 9, "rating": 5, "comment": "Прекрасное место! Вид на горы с террасы — сказка. Обязательно приедем ещё."},
        ]
        for rd in reviews_data:
            b = all_bookings[rd["booking"]]
            review = ReviewModel(
                id=uuid.uuid4(),
                property_id=b.property_id,
                user_id=b.guest_id,
                booking_id=b.id,
                rating=rd["rating"],
                comment=rd["comment"],
                created_at=now - timedelta(days=random.randint(1, 20)),
                updated_at=now,
            )
            session.add(review)
        await session.flush()

        # ── FAVORITES ──
        favs = [(user.id, 0), (user.id, 2), (user.id, 6), (user2.id, 3), (user2.id, 7), (user2.id, 0)]
        with session.no_autoflush:
            for uid, pidx in favs:
                existing_fav = await session.execute(
                    select(FavoriteModel).where(
                        FavoriteModel.user_id == uid,
                        FavoriteModel.property_id == all_properties[pidx].id,
                    )
                )
                if not existing_fav.scalar_one_or_none():
                    session.add(FavoriteModel(id=uuid.uuid4(), user_id=uid, property_id=all_properties[pidx].id))

        await session.flush()

        # ── WALLET TRANSACTIONS (legacy table) ──
        tx_data = [
            (wallet_user.id, 30000, "deposit", "completed", "Пополнение кошелька через карту"),
            (wallet_owner.id, 50000, "deposit", "completed", "Пополнение кошелька через карту"),
            (wallet_owner.id, 12000, "release", "completed", "Выручка от брони BK-004"),
            (wallet_owner.id, -8500, "withdrawal", "completed", "Вывод на карту"),
            (wallet_owner.id, -1500, "withdrawal", "completed", "Вывод на карту"),
            (wallet_owner.id, -2000, "withdrawal", "pending", "Вывод на карту — ожидает подтверждения"),
            (wallet_user.id, -5000, "withdrawal", "completed", "Вывод на карту"),
            (wallet_user.id, -3000, "withdrawal", "failed", "Вывод отклонён — недостаточно средств"),
            (wallet_owner2.id, 25000, "deposit", "completed", "Пополнение кошелька"),
            (wallet_owner2.id, 8000, "release", "completed", "Выручка от брони BK-001"),
            (wallet_driver.id, 8000, "deposit", "completed", "Пополнение кошелька"),
            (wallet_driver.id, 3000, "release", "completed", "Выручка от трансфера"),
            (wallet_guide.id, 10000, "deposit", "completed", "Пополнение кошелька"),
            (wallet_guide.id, 5000, "release", "completed", "Выручка от тура"),
            (wallet_agency.id, 20000, "deposit", "completed", "Пополнение кошелька"),
            (wallet_agency.id, 15000, "release", "completed", "Выручка от пакетного тура"),
        ]
        for wid, amount, tx_type, status, note in tx_data:
            session.add(WalletTransactionModel(
                id=uuid.uuid4(),
                wallet_id=wid,
                amount=amount,
                type=tx_type,
                status=status,
                note=note,
                created_at=now - timedelta(days=random.randint(1, 60)),
            ))

        # ── TRANSACTIONS (booking-linked) ──
        txn_map = [
            (wallet_user.id, all_bookings[0].id, 34000, "hold"),
            (wallet_owner.id, all_bookings[0].id, 34000, "release"),
            (wallet_user2.id, all_bookings[1].id, 7000, "hold"),
            (wallet_owner2.id, all_bookings[1].id, 7000, "release"),
            (wallet_user.id, all_bookings[2].id, 15000, "hold"),
            (wallet_owner.id, all_bookings[2].id, 15000, "release"),
            (wallet_user2.id, all_bookings[3].id, 36000, "hold"),
            (wallet_owner.id, all_bookings[3].id, 36000, "release"),
            (wallet_user.id, all_bookings[6].id, 125000, "hold"),
            (wallet_owner.id, all_bookings[6].id, 125000, "release"),
            (wallet_user.id, all_bookings[8].id, 90000, "hold"),
            (wallet_owner2.id, all_bookings[8].id, 90000, "release"),
        ]
        for wid, bid, amount, tx_type in txn_map:
            session.add(WalletTransactionModel(
                id=uuid.uuid4(),
                wallet_id=wid,
                booking_id=bid,
                amount=amount,
                type=tx_type,
                status="completed",
                note=f"{'Холд' if tx_type == 'hold' else 'Выручка'} по бронированию",
                created_at=now - timedelta(days=random.randint(1, 30)),
            ))

        # ── RESTAURANTS ──
        restaurants_data = [
            {"partner": rest_partner.id, "name": "Дасторкон", "cuisine": "Кыргызская", "address": "Чолпон-Ата, ул. Советская 10", "phone": "+996 711 111 111", "price": "$$", "hours": "10:00-23:00", "city": "cholpon-ata"},
            {"partner": rest_partner.id, "name": "Беш Бармак Хаус", "cuisine": "Кыргызская", "address": "Чолпон-Ата, пр. Чынгыза Айтматова 5", "phone": "+996 711 111 112", "price": "$", "hours": "09:00-22:00", "city": "cholpon-ata"},
            {"partner": rest_partner2.id, "name": "Fish & Sea", "cuisine": "Морская", "address": "Бостери, ул. Прибрежная 7", "phone": "+996 712 222 222", "price": "$$$", "hours": "12:00-01:00", "city": "bosteri"},
            {"partner": rest_partner2.id, "name": "У Мишеля", "cuisine": "Европейская", "address": "Бостери, ул. Центральная 3", "phone": "+996 712 222 223", "price": "$$", "hours": "10:00-23:00", "city": "bosteri"},
            {"partner": rest_partner.id, "name": "Чайхана «Бахор»", "cuisine": "Восточная", "address": "Кара-Ой, ул. Озёрная 8", "phone": "+996 711 111 113", "price": "$", "hours": "08:00-22:00", "city": "kara-oy"},
            {"partner": rest_partner2.id, "name": "Steak House", "cuisine": "Мясная", "address": "Чолпон-Ата, ул. Спортивная 2", "phone": "+996 712 222 224", "price": "$$$", "hours": "11:00-00:00", "city": "cholpon-ata"},
            {"partner": rest_partner.id, "name": "Vegan Paradise", "cuisine": "Веган", "address": "Тамчы, ул. Пляжная 1", "phone": "+996 711 111 114", "price": "$$", "hours": "09:00-21:00", "city": "tamchy"},
        ]
        for rd in restaurants_data:
            session.add(RestaurantModel(
                id=uuid.uuid4(),
                partner_id=rd["partner"],
                name=rd["name"],
                description=f"Ресторан «{rd['name']}» — лучшее место на Иссык-Куле. {rd['cuisine']} кухня, уютная атмосфера, приветливый персонал.",
                cuisine_type=rd["cuisine"],
                address=rd["address"],
                phone=rd["phone"],
                price_range=rd["price"],
                opening_hours=rd["hours"],
                city_id=cities[rd["city"]].id,
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(60, 180)),
                updated_at=now,
            ))

        # ── TOURS ──
        tours_data = [
            {"guide": guide_profile.id, "title": "Конный тур в ущелье Джеты-Огуз", "desc": "Верхом на лошадях через живописные ущелья к семи быкам Джеты-Огуза. Остановка на обед в юрте, купание в горной реке.", "price": 4500, "days": 1, "guests": 8, "includes": "Лошадь, гид, обед, страховка", "meeting": "Чолпон-Ата, Центральная площадь", "city": "cholpon-ata"},
            {"guide": guide_profile.id, "title": "Треккинг к водопадам Барскоон", "desc": "Пеший поход к знаменитым водопадам ущелья Барскоон. Увидите три уровня водопадов, искупаетесь в горном озере.", "price": 3500, "days": 1, "guests": 12, "includes": "Гид, обед, трансфер", "meeting": "Чолпон-Ата, автовокзал", "city": "cholpon-ata"},
            {"guide": guide2_profile.id, "title": "Джип-тур по южному берегу", "desc": "Полный день на джипах по южному берегу Иссык-Куля. Посёлки, пляжи, смотровые площадки, горячие источники.", "price": 7000, "days": 1, "guests": 6, "includes": "Джип, водитель, гид, обед, вода", "meeting": "Балыкчы, въезд в город", "city": "balykchy"},
            {"guide": guide2_profile.id, "title": "Многодневный тур «Вокруг Иссык-Куля»", "desc": "5 дней путешествия вокруг всего озера. Ночевки в юртах и гостевых домах. Конные прогулки, треккинг, баня, рыбалка.", "price": 35000, "days": 5, "guests": 8, "includes": "Проживание, питание, гид, транспорт, экскурсии", "meeting": "Чолпон-Ата, офис гида", "city": "cholpon-ata"},
            {"guide": guide_profile.id, "title": "Экскурсия на солёное озеро", "desc": "Поездка к уникальному солёному озеру Кызыл-Туз. Лечебная грязь, розовая вода, фотосессия на белых кристаллах.", "price": 4000, "days": 1, "guests": 10, "includes": "Трансфер, гид, обед", "meeting": "Чолпон-Ата, гостиница Royal Beach", "city": "cholpon-ata"},
            {"guide": guide2_profile.id, "title": "Ночной джип-тур с ужином у костра", "desc": "Романтичный ночной тур с закатом на горе, ужином у костра с национальной музыкой и звёздным небом.", "price": 6000, "days": 1, "guests": 6, "includes": "Джип, ужин, напитки, гид-вожатый", "meeting": "Чолпон-Ата, центральный пляж", "city": "cholpon-ata"},
        ]
        for td in tours_data:
            session.add(TourModel(
                id=uuid.uuid4(),
                guide_id=td["guide"],
                title=td["title"],
                description=td["desc"],
                price=td["price"],
                duration_days=td["days"],
                max_guests=td["guests"],
                includes=td["includes"],
                meeting_point=td["meeting"],
                city_id=cities[td["city"]].id,
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(30, 120)),
                updated_at=now,
            ))

        # ── TOUR PACKAGES ──
        packages_data = [
            {"agency": agency_profile.id, "title": "Уикенд на Иссык-Куле", "desc": "2 дня отдыха с проживанием в отеле, обедом в ресторане, конной прогулкой и экскурсией в ущелье. Всё включено!", "price": 15000, "days": 2, "guests": 4, "includes": "Проживание, завтрак, обед, экскурсия, трансфер", "itinerary": {"day1": "Заезд, обед, конная прогулка, ужин", "day2": "Завтрак, экскурсия к водопаду, обед, отъезд"}},
            {"agency": agency_profile.id, "title": "Семейный отдых 5 дней", "desc": "5 дней для всей семьи: отель с бассейном, детская анимация, поездка на водопад, рыбалка, катание на лодках, пикник на горе.", "price": 65000, "days": 5, "guests": 4, "includes": "Проживание, 3-разовое питание, экскурсии, анимация, трансфер", "itinerary": {"day1": "Заезд, обед, пляж, детская программа", "day2": "Экскурсия к водопадам, пикник", "day3": "Рыбалка, баня, ужин у костра", "day4": "Катание на лодках, свободное время", "day5": "Завтрак, сувениры, отъезд"}},
            {"agency": agency_profile.id, "title": "Медовый месяц на Иссык-Куле", "desc": "Романтический 3-дневный тур для молодожёнов. Юрта на берегу, ужин при свечах, спа-процедуры, фотосессия на закате.", "price": 45000, "days": 3, "guests": 2, "includes": "Юрта, спа, завтрак в номер, ужин при свечах, фотосессия", "itinerary": {"day1": "Заезд, спа, романтический ужин", "day2": "Конная прогулка, пикник, баня", "day3": "Фотосессия на рассвете, завтрак, отъезд"}},
            {"agency": agency_profile.id, "title": "Экстрим-тур 3 дня", "desc": "Для любителей активного отдыха: рафтинг, джип-тур, парапланеризм, ночёвка в палатках в горах.", "price": 28000, "days": 3, "guests": 6, "includes": "Снаряжение, инструктор, питание, трансфер", "itinerary": {"day1": "Рафтинг, обед, джип-тур в горы", "day2": "Парапланеризм, обед, треккинг, ночёвка в палатках", "day3": "Завтрак в горах, спуск, отъезд"}},
        ]
        for pkgd in packages_data:
            session.add(TourPackageModel(
                id=uuid.uuid4(),
                agency_id=pkgd["agency"],
                title=pkgd["title"],
                description=pkgd["desc"],
                price=pkgd["price"],
                duration_days=pkgd["days"],
                max_guests=pkgd["guests"],
                includes=pkgd["includes"],
                itinerary=pkgd["itinerary"],
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(30, 120)),
                updated_at=now,
            ))

        # ── TRANSFERS ──
        transfers_data = [
            {"driver": driver_profile.id, "title": "Аэропорт Манас — Чолпон-Ата", "desc": "Комфортный трансфер из аэропорта Бишкека до Чолпон-Аты. Встреча с табличкой, помощь с багажом.", "from_loc": "Аэропорт Манас (Бишкек)", "to_loc": "Чолпон-Ата", "price": 8000, "passengers": 4, "vehicle": "sedan", "duration": 240, "city": "cholpon-ata"},
            {"driver": driver_profile.id, "title": "Чолпон-Ата — Бостери", "desc": "Быстрый трансфер между курортами. Удобный седан, кондиционер.", "from_loc": "Чолпон-Ата", "to_loc": "Бостери", "price": 1500, "passengers": 4, "vehicle": "sedan", "duration": 20, "city": "bosteri"},
            {"driver": driver2_profile.id, "title": "Бишкек — Иссык-Куль (минивэн)", "desc": "Просторный минивэн для компании до 7 человек. Из Бишкека в любой курорт Иссык-Куля. Детские кресла по запросу.", "from_loc": "Бишкек", "to_loc": "Любой курорт Иссык-Куля", "price": 12000, "passengers": 7, "vehicle": "minivan", "duration": 240, "city": "cholpon-ata"},
            {"driver": driver2_profile.id, "title": "Трансфер по побережью", "desc": "Трансфер между любыми точками побережья Иссык-Куля. Комфортабельный минивэн, кондиционер, музыка.", "from_loc": "Чолпон-Ата", "to_loc": "Кара-Ой", "price": 4000, "passengers": 7, "vehicle": "minivan", "duration": 60, "city": "kara-oy"},
            {"driver": driver_profile.id, "title": "Экскурсионный тур на авто", "desc": "Индивидуальная экскурсия на комфортабельном авто с водителем-гидом по южному берегу Иссык-Куля.", "from_loc": "Чолпон-Ата", "to_loc": "Южный берег", "price": 6000, "passengers": 3, "vehicle": "sedan", "duration": 360, "city": "cholpon-ata"},
            {"driver": driver2_profile.id, "title": "Групповой трансфер аэропорт — курорт", "desc": "Экономичный групповой трансфер из аэропорта до курортов Иссык-Куля. Фиксированное время отправления.", "from_loc": "Аэропорт Манас", "to_loc": "Бостери", "price": 5000, "passengers": 7, "vehicle": "minivan", "duration": 240, "city": "bosteri"},
        ]
        for td in transfers_data:
            session.add(TransferModel(
                id=uuid.uuid4(),
                driver_id=td["driver"],
                title=td["title"],
                description=td["desc"],
                from_location=td["from_loc"],
                to_location=td["to_loc"],
                price=td["price"],
                max_passengers=td["passengers"],
                vehicle_type=td["vehicle"],
                duration_minutes=td["duration"],
                city_id=cities[td["city"]].id,
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(30, 120)),
                updated_at=now,
            ))

        # ── ACTIVITIES ──
        activities_data = [
            {"provider": activity_provider.id, "title": "Виндсёрфинг на Иссык-Куле", "desc": "Обучение виндсёрфингу с инструктором. Всё снаряжение предоставляется. 2 часа теории + 4 часа практики на воде.", "price": 3500, "participants": 6, "duration": 360, "location": "Бостери, центральный пляж", "city": "bosteri"},
            {"provider": activity_provider.id, "title": "Парапланеризм над озером", "desc": "Парный полёт на параплане с инструктором над Иссык-Кулем. Вид на озеро и горы Тянь-Шаня. Фото и видео в подарок.", "price": 8000, "participants": 2, "duration": 60, "location": "Чолпон-Ата, гора","city": "cholpon-ata"},
            {"provider": activity_provider.id, "title": "Рафтинг по горной реке", "desc": "Спуск по порогам реки Чу. 3 часа активного рафтинга, инструктаж, снаряжение. Уровень сложности: средний.", "price": 5000, "participants": 8, "duration": 240, "location": "Ущелье Боом", "city": "balykchy"},
            {"provider": activity_provider.id, "title": "Катание на гидроциклах", "desc": "Аренда гидроцикла на 30 минут. Скорость, адреналин и брызги Иссык-Куля. Инструктаж перед стартом.", "price": 3000, "participants": 2, "duration": 30, "location": "Чолпон-Ата, пляж Royal Beach", "city": "cholpon-ata"},
            {"provider": activity_provider.id, "title": "Дайвинг на Иссык-Куле", "desc": "Погружение с аквалангом в водах Иссык-Куля. Видимость до 15 метров. Инструктор, снаряжение, сертификат.", "price": 6000, "participants": 4, "duration": 180, "location": "Бостери, дайв-центр", "city": "bosteri"},
            {"provider": activity_provider.id, "title": "Конная прогулка по побережью", "desc": "2-часовая конная прогулка вдоль побережья Иссык-Куля. Лошади для любого уровня подготовки, инструктор.", "price": 2500, "participants": 10, "duration": 120, "location": "Кара-Ой, конный двор", "city": "kara-oy"},
        ]
        for ad in activities_data:
            session.add(ActivityModel(
                id=uuid.uuid4(),
                provider_id=ad["provider"],
                title=ad["title"],
                description=ad["desc"],
                price=ad["price"],
                max_participants=ad["participants"],
                duration_minutes=ad["duration"],
                location=ad["location"],
                city_id=cities[ad["city"]].id,
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(30, 120)),
                updated_at=now,
            ))

        # ── LOCAL EXPERIENCES ──
        experiences_data = [
            {
                "title": "Ужин в юрте у озера",
                "desc": "Тёплый вечер в настоящей юрте на берегу Иссык-Куля. Готовим вместе боорсоки, пробуем традиционные блюда и слушаем истории о кочевой культуре.",
                "category": "Кулинария", "price": 3200, "duration": 120, "guests": 8,
                "city": "bosteri", "address": "Бостери, этно-комплекс у озера",
                "lat": 42.628600, "lng": 77.169400,
                "includes": "Ужин из трёх блюд, чай, мастер-класс по приготовлению боорсоков",
                "languages": "Русский, кыргызский",
                "image": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
            },
            {
                "title": "Мастер-класс по войлоку",
                "desc": "Создайте собственное войлочное изделие под руководством мастерицы. Узнайте о символике кыргызских орнаментов и заберите работу с собой.",
                "category": "Ремёсла", "price": 1800, "duration": 90, "guests": 6,
                "city": "kara-oy", "address": "Кара-Ой, ремесленная мастерская",
                "lat": 42.633300, "lng": 76.950000,
                "includes": "Материалы, инструменты, готовое изделие, чай",
                "languages": "Русский, кыргызский, английский",
                "image": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600&fit=crop",
            },
            {
                "title": "Конная прогулка к водопаду",
                "desc": "Неспешная прогулка на лошадях вдоль побережья и в горы к небольшому водопаду. Подходит для новичков — инструктор поможет с посадкой.",
                "category": "Конные прогулки", "price": 2800, "duration": 180, "guests": 6,
                "city": "cholpon-ata", "address": "Чолпон-Ата, конный двор",
                "lat": 42.648600, "lng": 77.083300,
                "includes": "Лошадь, инструктор, шлем, чай у водопада",
                "languages": "Русский, кыргызский",
                "image": "https://images.unsplash.com/photo-1534773728080-33d31da27ae5?w=800&h=600&fit=crop",
            },
            {
                "title": "Рыбалка на рассвете",
                "desc": "Встречайте рассвет на озере с местным рыбаком. Узнайте секреты ловли, а пойманную рыбу приготовим вместе на берегу.",
                "category": "Рыбалка", "price": 2500, "duration": 240, "guests": 4,
                "city": "balykchy", "address": "Балыкчы, лодочная станция",
                "lat": 42.460000, "lng": 76.187000,
                "includes": "Лодка, снасти, завтрак из свежей рыбы",
                "languages": "Русский, кыргызский",
                "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
            },
            {
                "title": "Легенды Иссык-Куля",
                "desc": "Прогулка по местам древних легенд с рассказчиком. Узнайте о Чолпон, хане и подводном городе, увидите петроглифы.",
                "category": "Культура", "price": 1500, "duration": 120, "guests": 12,
                "city": "chok-tal", "address": "Чок-Тал, музей под открытым небом",
                "lat": 42.600000, "lng": 77.250000,
                "includes": "Экскурсия с гидом, входные билеты",
                "languages": "Русский, кыргызский, английский",
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            },
            {
                "title": "Сбор трав и чайная церемония",
                "desc": "Прогулка по горным склонам с травницей. Соберите душистые травы и приготовьте традиционный чай на костре.",
                "category": "Природа", "price": 2000, "duration": 150, "guests": 8,
                "city": "baktuu-dolonotu", "address": "Бактуу-Долоноту, горная тропа",
                "lat": 42.583300, "lng": 77.333300,
                "includes": "Сбор трав, чайная церемония, угощение",
                "languages": "Русский, кыргызский",
                "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop",
            },
        ]
        for ed in experiences_data:
            session.add(LocalExperienceModel(
                id=uuid.uuid4(),
                host_id=local_host_profile.id,
                title=ed["title"],
                description=ed["desc"],
                category=ed["category"],
                price=ed["price"],
                duration_minutes=ed["duration"],
                max_guests=ed["guests"],
                city_id=cities[ed["city"]].id,
                address=ed["address"],
                latitude=ed["lat"],
                longitude=ed["lng"],
                images=[ed["image"]],
                includes=ed["includes"],
                languages=ed["languages"],
                status="approved",
                is_active=True,
                created_at=now - timedelta(days=random.randint(10, 90)),
                updated_at=now,
            ))

        await session.commit()
        print("=== Seed data created successfully! ===")
        print()
        print("🛠️  Admin accounts:")
        print(f"   admin@issykrelax.kg / admin123  (суперадмин)")
        print(f"   moderator@issykrelax.kg / moderator123  (модератор)")
        print(f"   finance@issykrelax.kg / finance123  (финансы)")
        print()
        print("👤 Test accounts:")
        print(f"   user@issykrelax.kg / user123  (турист Айжан)")
        print(f"   user2@issykrelax.kg / user123  (турист Бакыт)")
        print(f"   owner@issykrelax.kg / owner123  (владелец)")
        print(f"   owner2@issykrelax.kg / owner123  (владелец №2)")
        print(f"   owner3@issykrelax.kg / owner123  (владелец неподтверждённый)")
        print(f"   driver@issykrelax.kg / driver123  (водитель)")
        print(f"   driver2@issykrelax.kg / driver123  (водитель №2)")
        print(f"   guide@issykrelax.kg / guide123  (гид)")
        print(f"   guide2@issykrelax.kg / guide123  (гид №2)")
        print(f"   translator@issykrelax.kg / translator123  (переводчик)")
        print(f"   concierge@issykrelax.kg / concierge123  (консьерж)")
        print(f"   agency@issykrelax.kg / agency123  (агентство)")
        print(f"   restaurant@issykrelax.kg / rest123  (ресторан)")
        print(f"   restaurant2@issykrelax.kg / rest123  (ресторан №2)")
        print(f"   activity@issykrelax.kg / activity123  (активный отдых)")
        print(f"   local@issykrelax.kg / local123  (хозяин впечатлений)")
        print()
        print("📊 Stats:")
        print(f"   {len(cities)} городов")
        print(f"   {len(categories)} категорий")
        print(f"   {len(amenities_data)} удобств")
        print(f"   {len(roles)} ролей")
        print(f"   {len(all_properties)} объектов жилья")
        print(f"   {len(all_bookings)} бронирований")
        print(f"   {len(reviews_data)} отзывов")
        print(f"   {len(restaurants_data)} ресторанов")
        print(f"   {len(tours_data)} туров")
        print(f"   {len(packages_data)} пакетных туров")
        print(f"   {len(transfers_data)} трансферов")
        print(f"   {len(activities_data)} активностей")
        print(f"   {len(favs)} избранных")
        print(f"   {len(tx_data)} wallet-транзакций")
        print(f"   {len(txn_map)} booking-транзакций")
        print()


if __name__ == "__main__":
    asyncio.run(seed())
