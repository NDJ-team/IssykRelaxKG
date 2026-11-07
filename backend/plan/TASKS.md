# IssykRelax — Task Tracking

Legend: [x] done, [ ] pending, [-] blocked, [~] in progress

## Phase 0: Foundation — RBAC + Wallet

### 0.1 Role Models & User Roles

- [x] 1. Create `RoleModel` (id, name, slug, description)
- [x] 2. Create `UserRoleModel` (user_id, role_id — composite PK)
- [x] 3. Create `PermissionModel` (id, role_id, permission)
- [x] 4. Add to `models/__init__.py` + create alembic migration
- [x] 5. Create Domain Entity: `Role`, `UserRole`, `Permission`
- [x] 6. Create Repository Interface: `RoleRepository`
- [x] 7. Create Repository Impl: `SQLAlchemyRoleRepository`
- [x] 8. Seed: базовые роли (tourist, owner, driver, guide, activity_provider, restaurant_partner, agency, concierge, translator, admin, moderator, finance_manager)

### 0.2 Unified Wallet System

- [x] 9. Create `WalletModel` per user (user_id UNIQUE FK, main_balance, revenue_balance)
- [x] 10. Create `WalletTransactionModel` (wallet_id, booking_id, amount, type, status, note)
- [x] 11. Wallet Domain Entity: hold/release/refund/deposit/withdraw с main + revenue
- [x] 12. Transaction Domain Entity: расширить типы HOLD/RELEASE/REFUND/DEPOSIT/WITHDRAW
- [x] 13. WalletRepository: create_for_user, get_by_user_id, get_transactions_with_filters
- [x] 14. Use Case: DepositUseCase — пополнение основного счёта (вебхук)
- [x] 15. Use Case: HoldUseCase — холдирование средств при бронировании
- [x] 16. Use Case: ReleaseUseCase — перевод revenue → main после dual confirm
- [x] 17. Use Case: RefundUseCase — возврат при отмене
- [x] 18. Use Case: WithdrawUseCase — вывод средств (Finance Manager)
- [x] 19. API: POST /wallet/deposit — вебхук от агрегатора
- [x] 20. API: POST /wallet/withdraw — запрос на вывод
- [x] 21. API: GET /wallet — баланс + транзакции
- [x] 22. API: GET /wallet/transactions — фильтрация
- [x] 23. API: POST /admin/wallet/approve-withdrawal/:id — Finance Manager (отложено до Фазы 6)

### 0.3 Dual Confirmation + Service Bookings

- [x] 24. Extend BookingModel (service_type, service_id, nullable dates) — полиморфная
- [x] 25. Use Case: CreateServiceBooking — универсальное бронирование
- [x] 26. Use Case: GuestConfirmCheckIn — гость подтверждает
- [x] 27. Use Case: ProviderConfirmCheckIn — провайдер подтверждает
- [x] 28. Use Case: AutoReleaseRevenue — после dual confirm → revenue → main
- [x] 29. API: POST /bookings + /{id}/confirm-guest + /{id}/confirm-provider

## Phase 1: Role — Driver

- [x] 30. DriverProfile entity + model + repository + migration
- [x] 31. Transfer entity + model + repository + migration
- [x] 32. CRUD Use Cases: create/update/get/list/delete transfer
- [x] 33. API: GET /drivers/:id, PATCH /driver/profile
- [x] 34. API: GET /transfers, GET /transfers/:id, POST /driver/transfers, PATCH /driver/transfers/:id, DELETE /driver/transfers/:id
- [x] 35. API: GET /driver/transfers — листинг своих трансферов
- [x] 36. API: GET /driver/dashboard — сводка для водителя
- [x] 37. Frontend: DriverDashboard.tsx
- [x] 38. Frontend: DriverListingForm.tsx (встроена в DriverDashboard)
- [x] 39. Frontend: TransferCard.tsx (встроена в DriverDashboard)
- [x] 40. Frontend: TransferDetailPage.tsx (встроена в DriverDashboard)
- [x] 41. Frontend: DriverProfilePage.tsx (встроена в DriverDashboard)
- [x] 42. Frontend: App.tsx — добавить роуты

## Phase 2: Role — Guide

- [x] 43. GuideProfile entity + model + repository + migration
- [x] 44. Tour entity + model + repository + migration
- [x] 45. CRUD Use Cases для туров
- [x] 46. API: Guide endpoints
- [x] 47. Frontend: GuideDashboard.tsx
- [x] 48. Frontend: TourForm.tsx (встроена в GuideDashboard)
- [x] 49. Frontend: TourDetailPage.tsx (встроена в GuideDashboard)
- [x] 50. Frontend: обновить ToursPage.tsx — динамические данные из API

## Phase 3: Role — Activity Provider

- [x] 51. ActivityProviderProfile + Activity модели (backend)
- [x] 52. CRUD + API (backend)
- [x] 53. Frontend: ActivityProviderDashboard.tsx
- [x] 54. Frontend: ActivityForm.tsx, ActivityDetailPage.tsx (встроены в Dashboard)

## Phase 4: Role — Restaurant Partner

- [x] 55. RestaurantPartnerProfile + Restaurant модели (backend)
- [x] 56. CRUD + API (backend)
- [x] 57. Frontend: RestaurantDashboard.tsx
- [x] 58. Frontend: RestaurantForm.tsx (встроена в Dashboard)
- [x] 59. Frontend: обновить RestaurantsPage.tsx — динамические данные

## Phase 5: Moderation / Admin Console

- [x] 60. API: GET /admin/moderation/queue — очередь на модерацию
- [x] 61. API: PATCH /admin/moderation/:service_type/:id/approve
- [x] 62. API: PATCH /admin/moderation/:service_type/:id/reject
- [x] 63. API: GET /admin/moderation/:service_type/:id — детали (через queue)
- [x] 64. API: GET /admin/roles — список ролей
- [x] 65. API: PATCH /admin/users/:id/roles — назначить роль
- [x] 66. Frontend: ModeratorDashboard.tsx
- [x] 67. Frontend: AdminRolesManager.tsx (встроена в AdminPanel)

## Phase 6: Finance Manager

- [x] 68. API: GET /admin/wallet/withdrawals — заявки на вывод
- [x] 69. API: PATCH /admin/wallet/withdrawals/:id/approve
- [x] 70. API: PATCH /admin/wallet/withdrawals/:id/reject
- [x] 71. API: GET /admin/stats — расширить (по ролям)
- [ ] 72. Frontend: FinancePanel.tsx
- [x] 73. Frontend: AdminStatsEnhanced (добавлено в AdminPanel)

## Phase 7: Remaining Roles

- [ ] 74-80. Property Manager: Profile + CRUD + Dashboard (не требуется — уже Owner)
- [x] 81-86. Agency: Profile entities/models (backend only)
- [x] 87-91. Concierge: Profile entities/models (backend only)
- [x] 92-96. Translator: Profile entities/models (backend only)
- [x] 97-102. Full CRUD + API + Dashboard for Agency, Concierge, Translator

## Phase 8: SEO + Content

- [ ] 100. Blog/guides — BlogPage.tsx, ArticlePage.tsx
- [ ] 101. Dynamic sitemap (backend) — GET /sitemap.xml
- [ ] 102. Open Graph dynamic images for /property/:id
- [ ] 103. React.lazy + Suspense for all dashboard pages
- [ ] 104. Nginx: Cache-Control headers
- [ ] 105. Breadcrumbs UI on all pages
