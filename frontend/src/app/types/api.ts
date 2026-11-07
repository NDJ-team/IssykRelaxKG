export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface CityResponse {
  id: string;
  name: string;
  slug: string;
  popularity_score: number;
}

export interface AmenityResponse {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  category: CategoryResponse | null;
  city: CityResponse | null;
  status: string;
  full_address: string;
  price_per_night: number;
  currency: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  check_in_time: string | null;
  check_out_time: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  amenities: string[];
  images: string[];
  owner_id: string;
  is_active: boolean;
  rating_points: number;
  stages: number;
  created_at: string;
}

export interface FavoriteResponse {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface FavoriteIdsResponse {
  favorite_ids: string[];
}

export interface PropertyListResponse {
  items: PropertyResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface BookingResponse {
  id: string;
  service_type: string;
  service_id: string | null;
  property_id: string | null;
  guest_id: string;
  owner_id: string;
  check_in: string | null;
  check_out: string | null;
  total_price: number;
  status: string;
  guest_count: number;
  special_requests: string | null;
  verification_code: string | null;
  guest_confirmed: boolean;
  owner_confirmed: boolean;
  created_at: string;
}

export interface BookingListResponse {
  items: BookingResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface ReviewResponse {
  id: string;
  property_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewListResponse {
  items: ReviewResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface WalletResponse {
  available_balance: number;
  pending_balance: number;
  transactions: TransactionResponse[];
}

export interface TransactionResponse {
  id: string;
  booking_id: string;
  amount: number;
  type: string;
  created_at: string;
}

export interface NewWalletResponse {
  id: string;
  user_id: string;
  main_balance: number;
  revenue_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionResponse {
  id: string;
  wallet_id: string;
  booking_id: string | null;
  amount: number;
  type: string;
  status: string;
  note: string | null;
  created_at: string;
}

export interface WalletTransactionListResponse {
  items: WalletTransactionResponse[];
  total: number;
}

// --- Driver ---
export interface DriverProfileResponse {
  id: string;
  user_id: string;
  bio: string | null;
  license_number: string | null;
  vehicle_info: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransferResponse {
  id: string;
  driver_id: string;
  title: string;
  description: string | null;
  from_location: string;
  to_location: string;
  price: number;
  currency: string;
  max_passengers: number;
  vehicle_type: string | null;
  duration_minutes: number | null;
  status: string;
  is_active: boolean;
  city_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferListResponse {
  items: TransferResponse[];
  total: number;
}

export interface DriverDashboardResponse {
  profile: {
    id: string;
    bio: string | null;
    license_number: string | null;
    vehicle_info: string | null;
    is_approved: boolean;
  } | null;
  transfers_count: number;
  active_transfers: number;
  transfers: TransferResponse[];
}

// --- Guide ---
export interface GuideProfileResponse {
  id: string;
  user_id: string;
  bio: string | null;
  languages: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourResponse {
  id: string;
  guide_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  max_guests: number;
  includes: string | null;
  meeting_point: string | null;
  city_id: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourListResponse {
  items: TourResponse[];
  total: number;
}

// --- Activity Provider ---
export interface ActivityProviderProfileResponse {
  id: string;
  user_id: string;
  company_name: string | null;
  bio: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityResponse {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  max_participants: number;
  duration_minutes: number;
  location: string | null;
  city_id: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityListResponse {
  items: ActivityResponse[];
  total: number;
}

// --- Restaurant Partner ---
export interface RestaurantPartnerProfileResponse {
  id: string;
  user_id: string;
  restaurant_name: string | null;
  description: string | null;
  cuisine_type: string | null;
  address: string | null;
  phone: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantResponse {
  id: string;
  partner_id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  address: string | null;
  phone: string | null;
  price_range: string | null;
  opening_hours: string | null;
  city_id: string | null;
  city?: { id: string; name: string; slug?: string };
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantListResponse {
  items: RestaurantResponse[];
  total: number;
}

// --- Moderation ---
export interface ModerationQueueItem {
  id: string;
  service_type: string;
  title: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

export interface ModerationQueueResponse {
  items: ModerationQueueItem[];
  total: number;
}

export interface RoleResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ListRolesResponse {
  items: RoleResponse[];
}

// --- Admin ---
export interface AdminOwnerResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface AdminOwnerListResponse {
  items: AdminOwnerResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface AdminPropertyResponse {
  id: string;
  title: string;
  owner_id: string;
  owner_name: string;
  category: string;
  city: string;
  status: string;
  price_per_night: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminPropertyListResponse {
  items: AdminPropertyResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface AdminBookingResponse {
  id: string;
  property_id: string;
  property_title: string;
  guest_id: string;
  guest_name: string;
  owner_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  guest_confirmed: boolean;
  owner_confirmed: boolean;
  verification_code: string | null;
  created_at: string;
}

export interface AdminBookingListResponse {
  items: AdminBookingResponse[];
  total: number;
  offset: number;
  limit: number;
}

export interface AdminBookingDetailResponse {
  id: string;
  property_id: string;
  property_title: string;
  property_category: string;
  property_city: string;
  property_address: string;
  property_price_per_night: number;
  property_max_guests: number;
  property_bedrooms: number;
  property_beds: number;
  property_bathrooms: number;
  property_amenities: string[];
  property_images: { url: string; is_primary: boolean }[];
  guest_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  guest_count: number;
  special_requests: string | null;
  verification_code: string | null;
  guest_confirmed: boolean;
  owner_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPropertyDetailResponse {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  category: string;
  city: string;
  address: string;
  status: string;
  price_per_night: number;
  currency: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  check_in_time: string | null;
  check_out_time: string | null;
  amenities: string[];
  images: { url: string; is_primary: boolean }[];
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  is_active: boolean;
  booking_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminOwnerDetailResponse {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_approved: boolean;
  is_active: boolean;
  property_count: number;
  business_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStatsResponse {
  total_users: number;
  total_owners: number;
  total_properties: number;
  total_bookings: number;
  total_revenue: number;
  role_counts: AdminStatsRoleCount[];
}

export interface WithdrawalResponse {
  id: string;
  wallet_id: string;
  amount: number;
  type: string;
  status: string;
  note: string | null;
  created_at: string;
}

export interface WithdrawalListResponse {
  items: WithdrawalResponse[];
  total: number;
}

// --- Agency ---
export interface AgencyProfileResponse {
  id: string;
  user_id: string;
  company_name: string;
  description: string | null;
  license_number: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourPackageResponse {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  max_guests: number;
  includes: string | null;
  itinerary: Record<string, unknown> | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourPackageListResponse {
  items: TourPackageResponse[];
  total: number;
}

export interface AgencyDashboardResponse {
  profile: {
    id: string;
    company_name: string;
    description: string | null;
    license_number: string | null;
    is_approved: boolean;
  } | null;
  packages_count: number;
  active_packages: number;
  packages: TourPackageResponse[];
}

// --- Concierge ---
export interface ConciergeProfileResponse {
  id: string;
  user_id: string;
  bio: string | null;
  service_areas: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// --- Translator ---
export interface TranslatorProfileResponse {
  id: string;
  user_id: string;
  bio: string | null;
  languages: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStatsRoleCount {
  slug: string;
  name: string;
  count: number;
}
