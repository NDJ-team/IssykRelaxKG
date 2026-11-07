# IssykRelax — Database Schema Design

## Tables

### users (existing — extended)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | |
| full_name | VARCHAR(255) | |
| phone | VARCHAR(50) nullable | |
| avatar_url | VARCHAR(500) nullable | |
| is_active | BOOLEAN | default true |
| is_verified | BOOLEAN | default false |
| is_superuser | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### roles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(100) | e.g. "Водитель" |
| slug | VARCHAR(100) UNIQUE | e.g. "driver" |
| description | TEXT nullable | |
| created_at | TIMESTAMP | |

### user_roles (new)
| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID FK → users | Composite PK |
| role_id | UUID FK → roles | Composite PK |
| created_at | TIMESTAMP | |

### permissions (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| role_id | UUID FK → roles | |
| permission | VARCHAR(100) | e.g. "create_transfers" |
| created_at | TIMESTAMP | |
| UNIQUE(role_id, permission) | | |

### wallets (new — per user, replaces owner-only wallet)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | Each user has one wallet |
| main_balance | NUMERIC(12,2) | Available for withdrawal |
| revenue_balance | NUMERIC(12,2) | Locked until dual confirmation |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### wallet_transactions (new — replaces transactions)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| wallet_id | UUID FK → wallets | |
| booking_id | UUID FK → service_bookings nullable | |
| amount | NUMERIC(12,2) | Positive for deposits, negative for withdrawals/holds |
| type | VARCHAR(20) | deposit | hold | release | refund | withdrawal |
| status | VARCHAR(20) | pending | completed | failed |
| note | TEXT nullable | |
| created_at | TIMESTAMP | |

### service_bookings (replaces bookings — polymorphic)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| guest_id | UUID FK → users | |
| provider_id | UUID FK → users | The service provider |
| service_type | VARCHAR(50) | property | transfer | tour | activity | restaurant | package |
| service_id | UUID | Polymorphic FK to the specific service |
| status | VARCHAR(20) | pending | paid | checked_in | completed | cancelled |
| total_price | NUMERIC(12,2) | |
| guest_count | INTEGER | |
| special_requests | TEXT nullable | |
| verification_code | VARCHAR(10) UNIQUE nullable | |
| guest_confirmed | BOOLEAN | default false |
| provider_confirmed | BOOLEAN | default false |
| check_in_at | TIMESTAMP nullable | |
| check_out_at | TIMESTAMP nullable | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### owner_profiles (existing)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| is_approved | BOOLEAN | default false |
| business_phone | VARCHAR(50) nullable | |
| created_at | TIMESTAMP | |

### driver_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| bio | TEXT nullable | |
| license_number | VARCHAR(100) nullable | |
| vehicle_info | VARCHAR(255) nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### transfers (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| driver_id | UUID FK → driver_profiles | |
| title | VARCHAR(255) | |
| description | TEXT nullable | |
| from_location | VARCHAR(255) | |
| to_location | VARCHAR(255) | |
| price | NUMERIC(12,2) | |
| currency | VARCHAR(3) | default KGS |
| max_passengers | INTEGER | |
| vehicle_type | VARCHAR(50) nullable | |
| duration_minutes | INTEGER nullable | |
| status | VARCHAR(20) | pending | approved | rejected |
| is_active | BOOLEAN | default true |
| city_id | UUID FK → cities nullable | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### guide_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| bio | TEXT nullable | |
| languages | TEXT nullable | Comma-separated |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### tours (new — replaces hardcoded)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| guide_id | UUID FK → guide_profiles | |
| title | VARCHAR(255) | |
| description | TEXT nullable | |
| price | NUMERIC(12,2) | |
| currency | VARCHAR(3) | default KGS |
| duration_days | INTEGER | |
| max_guests | INTEGER | |
| includes | TEXT nullable | |
| meeting_point | VARCHAR(255) nullable | |
| city_id | UUID FK → cities nullable | |
| status | VARCHAR(20) | pending | approved | rejected |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### activity_provider_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| company_name | VARCHAR(255) nullable | |
| bio | TEXT nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### activities (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| provider_id | UUID FK → activity_provider_profiles | |
| title | VARCHAR(255) | |
| description | TEXT nullable | |
| price | NUMERIC(12,2) | |
| currency | VARCHAR(3) | default KGS |
| max_participants | INTEGER | |
| duration_minutes | INTEGER | |
| location | VARCHAR(255) nullable | |
| city_id | UUID FK → cities nullable | |
| status | VARCHAR(20) | pending | approved | rejected |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### restaurant_partner_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| restaurant_name | VARCHAR(255) | |
| description | TEXT nullable | |
| cuisine_type | VARCHAR(100) nullable | |
| address | TEXT nullable | |
| phone | VARCHAR(50) nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### agency_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| company_name | VARCHAR(255) | |
| description | TEXT nullable | |
| license_number | VARCHAR(100) nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### tour_packages (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| agency_id | UUID FK → agency_profiles | |
| title | VARCHAR(255) | |
| description | TEXT nullable | |
| price | NUMERIC(12,2) | |
| currency | VARCHAR(3) | default KGS |
| duration_days | INTEGER | |
| max_guests | INTEGER | |
| includes | TEXT nullable | |
| itinerary | JSONB nullable | |
| status | VARCHAR(20) | pending | approved | rejected |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### concierge_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| bio | TEXT nullable | |
| service_areas | TEXT nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### translator_profiles (new)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users UNIQUE | |
| bio | TEXT nullable | |
| languages | TEXT nullable | |
| is_approved | BOOLEAN | default false |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Entity Relationship Diagram (text)

```
users 1---* user_roles *---1 roles 1---* permissions
  |
  1---1 wallets 1---* wallet_transactions
  |
  1---0..1 owner_profiles
  |
  1---0..1 driver_profiles 1---* transfers
  |
  1---0..1 guide_profiles 1---* tours
  |
  1---0..1 activity_provider_profiles 1---* activities
  |
  1---0..1 restaurant_partner_profiles
  |
  1---0..1 agency_profiles 1---* tour_packages
  |
  1---0..1 concierge_profiles
  |
  1---0..1 translator_profiles
  |
  1---* service_bookings (as guest)
  1---* service_bookings (as provider)
```

## Indexes
- user_roles: composite PK (user_id, role_id), index on user_id, index on role_id
- permissions: UNIQUE(role_id, permission)
- wallets: UNIQUE(user_id)
- wallet_transactions: index on wallet_id, index on (type, status)
- service_bookings: index on guest_id, index on provider_id, index on (service_type, service_id)
- All profile tables: UNIQUE(user_id)
- All service tables: index on city_id, index on status, index on provider_id
