import { getCategories, getCities, getProperties } from "../src/app/services/properties"
import { listRestaurantsApi } from "../src/app/services/restaurants-service"
import { listTours } from "../src/app/services/guides"
import { listActivities } from "../src/app/services/activities"
import { listTransfers } from "../src/app/services/drivers"
import { getPropertyReviews } from "../src/app/services/reviews"

export interface RouteInfo {
  page: string
  params: Record<string, string>
}

export function parseURL(url: string): RouteInfo {
  const path = url.split("?")[0]
  const sp = new URLSearchParams(url.split("?")[1] || "")

  if (path.startsWith("/property/")) return { page: "property", params: { property_id: path.split("/")[2] } }
  if (path.startsWith("/search")) return { page: "search", params: Object.fromEntries(sp) }
  if (path.startsWith("/city/")) return { page: "city", params: { city_slug: path.split("/")[2] } }
  if (path.startsWith("/category/")) return { page: "category", params: { category_slug: path.split("/")[2] } }
  if (path.startsWith("/activity/")) return { page: "activity", params: { activity_id: path.split("/")[2] } }
  if (path.startsWith("/transfer/")) return { page: "transfer", params: { transfer_id: path.split("/")[2] } }
  if (path.startsWith("/tour/")) return { page: "tour", params: { tour_id: path.split("/")[2] } }
  if (path.startsWith("/tour-package/")) return { page: "tour-package", params: { pkg_id: path.split("/")[2] } }
  if (path.startsWith("/restaurant/")) return { page: "restaurant", params: { restaurant_id: path.split("/")[2] } }
  if (path.startsWith("/local-experience/")) return { page: "local-experience", params: { experience_id: path.split("/")[2] } }

  const pageMap: Record<string, string> = {
    "/dashboard": "dashboard", "/owner-dashboard": "owner-dashboard", "/driver-dashboard": "driver-dashboard",
    "/guide-dashboard": "guide-dashboard", "/activity-dashboard": "activity-dashboard",
    "/restaurant-dashboard": "restaurant-dashboard", "/agency-dashboard": "agency-dashboard",
    "/concierge-dashboard": "concierge-dashboard", "/translator-dashboard": "translator-dashboard",
    "/moderator": "moderator", "/add-listing": "add-listing", "/admin": "admin",
    "/restaurants": "restaurants", "/tours": "tours", "/pricing": "pricing",
    "/about": "about", "/feedback": "feedback", "/login": "login", "/register": "register",
    "/privacy": "privacy", "/terms": "terms", "/faq": "faq",
    "/activities": "activities", "/transfers": "transfers", "/tour-packages": "tour-packages",
    "/experiences": "experiences", "/routes": "routes", "/transports": "transports",
    "/planner": "planner", "/map": "map", "/local-host-dashboard": "local-host-dashboard",
  }

  const page = pageMap[path] || "landing"
  return { page, params: {} }
}

export async function fetchData(route: RouteInfo): Promise<Record<string, unknown>> {
  const { page, params } = route

  try {
    if (page === "landing") {
      const [categories, properties, tours, cities] = await Promise.all([
        getCategories().catch(() => []),
        getProperties({ limit: "4", max_price: "50000" }).catch(() => ({ items: [] })),
        listTours(undefined, 0, 3).catch(() => ({ items: [] })),
        getCities().catch(() => []),
      ])
      return {
        landing: {
          categories: categories || [],
          featuredProperties: properties?.items || [],
          tours: tours?.items || [],
          cities: cities || [],
        },
      }
    }

    if (page === "property" && params.property_id) {
      const [property, reviews] = await Promise.all([
        getProperties({ limit: "1", property_id: params.property_id }).catch(() => null),
        getPropertyReviews(params.property_id, { limit: 10 }).catch(() => ({ items: [] })),
      ])
      return { property: { property, reviews: reviews?.items || [], similar: [] } }
    }

    if (page === "city" && params.city_slug) {
      const { getCities } = await import("../src/app/services/properties")
      const cities = await getCities().catch(() => [])
      const matched = (cities as any[]).find((c: any) => c.slug === params.city_slug)
      const cityId = matched?.id

      const [props, tours, restaurants, activities, transfers] = await Promise.all([
        getProperties(cityId ? { city_id: cityId, limit: "50" } : { query: params.city_slug, limit: "50" }).catch(() => ({ items: [] })),
        listTours(cityId, 0, 20).catch(() => ({ items: [] })),
        listRestaurantsApi(cityId, 0, 20).catch(() => ({ items: [] })),
        listActivities(cityId, 0, 20).catch(() => ({ items: [] })),
        listTransfers(cityId, 0, 20).catch(() => ({ items: [] })),
      ])
      return {
        city: {
          city: matched || null,
          properties: props?.items || [],
          tours: tours?.items || [],
          restaurants: restaurants?.items || [],
          activities: activities?.items || [],
          transfers: transfers?.items || [],
        },
      }
    }

    if (page === "category" && params.category_slug) {
      const { getCategories } = await import("../src/app/services/properties")
      const cats = await getCategories().catch(() => [])
      const matched = (cats as any[]).find((c: any) => c.slug === params.category_slug)
      let properties = { items: [] as any[] }
      if (matched) {
        properties = await getProperties({ category_id: matched.id, limit: "50" }).catch(() => ({ items: [] }))
      }
      return {
        category: {
          category: matched || null,
          properties: properties?.items || [],
        },
      }
    }
  } catch (e) {
    console.error("SSR data fetch error:", e)
  }

  return {}
}
