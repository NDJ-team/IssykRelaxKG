export function buildPath(page: string, extra?: Record<string, string>): string {
  if (page === "property" && extra?.property_id) return `/property/${extra.property_id}`
  if (page === "city" && extra?.city_slug) return `/city/${extra.city_slug}`
  if (page === "category" && extra?.category_slug) return `/category/${extra.category_slug}`
  if (page === "activity" && extra?.activity_id) return `/activity/${extra.activity_id}`
  if (page === "transfer" && extra?.transfer_id) return `/transfer/${extra.transfer_id}`
  if (page === "tour" && extra?.tour_id) return `/tour/${extra.tour_id}`
  if (page === "tour-package" && extra?.pkg_id) return `/tour-package/${extra.pkg_id}`
  if (page === "restaurant" && extra?.restaurant_id) return `/restaurant/${extra.restaurant_id}`
  if (page === "local-experience" && extra?.experience_id) return `/local-experience/${extra.experience_id}`
  if (page === "search") {
    const sp = new URLSearchParams()
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) sp.set(k, v) })
    }
    return `/search${sp.toString() ? `?${sp}` : ""}`
  }
  if (page === "landing") return "/"
  return `/${page}`
}

export function getCurrentPage(pathname: string): string {
  if (pathname === "/" || pathname === "") return "landing"
  if (pathname.startsWith("/property/")) return "property"
  if (pathname.startsWith("/city/")) return "city"
  if (pathname.startsWith("/category/")) return "category"
  if (pathname.startsWith("/activity/")) return "activity"
  if (pathname.startsWith("/transfer/")) return "transfer"
  if (pathname.startsWith("/tour/")) return "tour"
  if (pathname.startsWith("/tour-package/")) return "tour-package"
  if (pathname.startsWith("/restaurant/")) return "restaurant"
  if (pathname.startsWith("/local-experience/")) return "local-experience"
  if (pathname.startsWith("/search")) return "search"
  return pathname.slice(1)
}
