import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { LayoutSEO } from "./components/LayoutSEO";
import { SearchResults } from "./components/SearchResults";
import { PropertyDetails } from "./components/PropertyDetails";
import { RestaurantsPage } from "./components/RestaurantsPage";
import { ToursPage } from "./components/ToursPage";
import { ActivitiesPage } from "./components/ActivitiesPage";
import { TransfersPage } from "./components/TransfersPage";
import { TourPackagesPage } from "./components/TourPackagesPage";
import { UserDashboard } from "./components/UserDashboard";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { AddListingWizard } from "./components/AddListingWizard";
import { PricingPage } from "./components/PricingPage";
import { AboutPage } from "./components/AboutPage";
import { FeedbackPage } from "./components/FeedbackPage";
import { CityPage } from "./components/CityPage";
import { CategoryPage } from "./components/CategoryPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { TermsPage } from "./components/TermsPage";
import { FaqPage } from "./components/FaqPage";
import { ActivityDetailPage } from "./components/ActivityDetailPage";
import { TransferDetailPage } from "./components/TransferDetailPage";
import { TourDetailPage } from "./components/TourDetailPage";
import { TourPackageDetailPage } from "./components/TourPackageDetailPage";
import { RestaurantDetailPage } from "./components/RestaurantDetailPage";
import { ExperiencesPage } from "./components/ExperiencesPage";
import { RoutesPage } from "./components/RoutesPage";
import { TravelPlannerPage } from "./components/TravelPlannerPage";
import { MapPage } from "./components/MapPage";
import { LocalExperienceDetailPage } from "./components/LocalExperienceDetailPage";
import { LocalHostDashboard } from "./components/LocalHostDashboard";
import { I18nProvider } from "./i18n";
import { Toaster } from "./components/ui/sonner";
import { SSRDataContext, useSSRData } from "./lib/SSRDataContext";
import { getCurrentPage } from "./lib/navigate";

const AdminPanel = lazy(() => import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })));
const ModeratorDashboard = lazy(() => import("./components/ModeratorDashboard").then((m) => ({ default: m.ModeratorDashboard })));
const DriverDashboard = lazy(() => import("./components/DriverDashboard").then((m) => ({ default: m.DriverDashboard })));
const GuideDashboard = lazy(() => import("./components/GuideDashboard").then((m) => ({ default: m.GuideDashboard })));
const ActivityProviderDashboard = lazy(() => import("./components/ActivityProviderDashboard").then((m) => ({ default: m.ActivityProviderDashboard })));
const RestaurantDashboard = lazy(() => import("./components/RestaurantDashboard").then((m) => ({ default: m.RestaurantDashboard })));
const AgencyDashboard = lazy(() => import("./components/AgencyDashboard").then((m) => ({ default: m.AgencyDashboard })));
const ConciergeDashboard = lazy(() => import("./components/ConciergeDashboard").then((m) => ({ default: m.ConciergeDashboard })));
const TranslatorDashboard = lazy(() => import("./components/TranslatorDashboard").then((m) => ({ default: m.TranslatorDashboard })));

export type Page =
  | "landing" | "search" | "property"
  | "restaurants" | "tours" | "activities" | "transfers" | "tour-packages"
  | "activity" | "transfer" | "tour" | "tour-package" | "restaurant"
  | "experiences" | "routes" | "transports" | "planner" | "map"
  | "local-experience" | "local-host-dashboard"
  | "city" | "category"
  | "dashboard" | "owner-dashboard" | "driver-dashboard" | "guide-dashboard"
  | "activity-dashboard" | "restaurant-dashboard" | "agency-dashboard"
  | "concierge-dashboard" | "translator-dashboard" | "moderator" | "admin"
  | "add-listing" | "pricing" | "about" | "feedback" | "login" | "register"
  | "privacy" | "terms" | "faq";

export interface NavParams {
  property_id?: string; query?: string; category_id?: string; city_id?: string;
  city_slug?: string; category_slug?: string; check_in?: string; check_out?: string;
  guests?: string; offset?: string; activity_id?: string; transfer_id?: string;
  tour_id?: string; pkg_id?: string; restaurant_id?: string; experience_id?: string;
}

function parseURL(): { page: Page; params: NavParams } {
  const path = window.location.pathname;
  const sp = new URLSearchParams(window.location.search);

  if (path.startsWith("/property/")) return { page: "property", params: { property_id: path.split("/")[2] } };
  if (path.startsWith("/search")) return { page: "search", params: Object.fromEntries(sp) as NavParams };
  if (path.startsWith("/city/")) return { page: "city", params: { city_slug: path.split("/")[2] } };
  if (path.startsWith("/category/")) return { page: "category", params: { category_slug: path.split("/")[2] } };
  if (path.startsWith("/activity/")) return { page: "activity", params: { activity_id: path.split("/")[2] } };
  if (path.startsWith("/transfer/")) return { page: "transfer", params: { transfer_id: path.split("/")[2] } };
  if (path.startsWith("/tour/")) return { page: "tour", params: { tour_id: path.split("/")[2] } };
  if (path.startsWith("/tour-package/")) return { page: "tour-package", params: { pkg_id: path.split("/")[2] } };
  if (path.startsWith("/restaurant/")) return { page: "restaurant", params: { restaurant_id: path.split("/")[2] } };
  if (path.startsWith("/local-experience/")) return { page: "local-experience", params: { experience_id: path.split("/")[2] } };

  const pageMap: Record<string, Page> = {
    "/dashboard": "dashboard", "/owner-dashboard": "owner-dashboard",
    "/driver-dashboard": "driver-dashboard", "/guide-dashboard": "guide-dashboard",
    "/activity-dashboard": "activity-dashboard", "/restaurant-dashboard": "restaurant-dashboard",
    "/agency-dashboard": "agency-dashboard", "/concierge-dashboard": "concierge-dashboard",
    "/translator-dashboard": "translator-dashboard", "/moderator": "moderator",
    "/add-listing": "add-listing", "/admin": "admin",
    "/restaurants": "restaurants", "/tours": "tours", "/pricing": "pricing",
    "/about": "about", "/feedback": "feedback", "/login": "login", "/register": "register",
    "/privacy": "privacy", "/terms": "terms", "/faq": "faq",
    "/activities": "activities", "/transfers": "transfers", "/tour-packages": "tour-packages",
    "/experiences": "experiences", "/routes": "routes", "/transports": "transports",
    "/planner": "planner", "/map": "map", "/local-host-dashboard": "local-host-dashboard",
  };
  return { page: pageMap[path] || "landing", params: {} };
}

interface AppProps {
  initialData?: Record<string, unknown>;
}

function getInitialRoute(data: Record<string, unknown>): { page: Page; params: NavParams } {
  const route = data.__route as { page: string; params: Record<string, string> } | undefined
  if (route) {
    return { page: route.page as Page, params: route.params as NavParams }
  }
  return parseURL()
}

function AppContent() {
  const ssrData = useSSRData()
  const [{ page: currentPage, params: navParams }, setRoute] = useState<{ page: Page; params: NavParams }>(() => getInitialRoute(ssrData));
  const { user } = useAuth();

  useEffect(() => {
    const onPop = () => setRoute(parseURL());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (page: string, extra?: NavParams) => {
    let path: string;
    if (page === "property" && extra?.property_id) path = `/property/${extra.property_id}`;
    else if (page === "city" && extra?.city_slug) path = `/city/${extra.city_slug}`;
    else if (page === "category" && extra?.category_slug) path = `/category/${extra.category_slug}`;
    else if (page === "activity" && extra?.activity_id) path = `/activity/${extra.activity_id}`;
    else if (page === "transfer" && extra?.transfer_id) path = `/transfer/${extra.transfer_id}`;
    else if (page === "tour" && extra?.tour_id) path = `/tour/${extra.tour_id}`;
    else if (page === "tour-package" && extra?.pkg_id) path = `/tour-package/${extra.pkg_id}`;
    else if (page === "restaurant" && extra?.restaurant_id) path = `/restaurant/${extra.restaurant_id}`;
    else if (page === "local-experience" && extra?.experience_id) path = `/local-experience/${extra.experience_id}`;
    else if (page === "search") {
      const sp = new URLSearchParams();
      if (extra) Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) sp.set(k, v); });
      path = `/search${sp.toString() ? `?${sp}` : ""}`;
    } else if (page === "landing") path = "/";
    else path = `/${page}`;
    window.history.pushState({}, "", path);
    setRoute({ page: page as Page, params: extra || {} });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
      if (link.getAttribute("target") === "_blank") return;
      if (link.getAttribute("download") != null) return;

      e.preventDefault();

      const pathname = href.startsWith("/") ? href : `/${href}`;
      const page = getCurrentPage(pathname);

      let params: NavParams = {};
      if (page === "category" && pathname.startsWith("/category/")) { params = { category_slug: pathname.split("/")[2] }; }
      else if (page === "city" && pathname.startsWith("/city/")) { params = { city_slug: pathname.split("/")[2] }; }
      else if (page === "property" && pathname.startsWith("/property/")) { params = { property_id: pathname.split("/")[2] }; }
      else if (page === "activity" && pathname.startsWith("/activity/")) { params = { activity_id: pathname.split("/")[2] }; }
      else if (page === "transfer" && pathname.startsWith("/transfer/")) { params = { transfer_id: pathname.split("/")[2] }; }
      else if (page === "tour" && pathname.startsWith("/tour/")) { params = { tour_id: pathname.split("/")[2] }; }
      else if (page === "tour-package" && pathname.startsWith("/tour-package/")) { params = { pkg_id: pathname.split("/")[2] }; }
      else if (page === "restaurant" && pathname.startsWith("/restaurant/")) { params = { restaurant_id: pathname.split("/")[2] }; }
      else if (page === "local-experience" && pathname.startsWith("/local-experience/")) { params = { experience_id: pathname.split("/")[2] }; }

      navigateRef.current(page, params);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const noNavPages: Page[] = ["add-listing"];
  const showNav = !noNavPages.includes(currentPage);
  const selfPaddedPages: Page[] = [
    "landing", "experiences", "routes", "planner", "map",
    "local-experience", "local-host-dashboard",
  ];
  const mainClassName = selfPaddedPages.includes(currentPage)
    ? "pb-16 md:pb-0"
    : "pt-16 md:pt-20 pb-16 md:pb-0";

  const getInitialData = (key: string): Record<string, unknown> =>
    (ssrData[key] as Record<string, unknown>) || {};

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-sans)", background: "var(--background)" }}>
      <LayoutSEO />
      {showNav && <Navigation currentPage={currentPage} />}
      <Toaster position="top-right" richColors />
      <main className={mainClassName}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--lake-blue)" }} /></div>}>
          {currentPage === "landing" && (() => {
            const d = getInitialData("landing");
            return <LandingPage onNavigate={navigate} initialCategories={d.categories} initialFeaturedProperties={d.featuredProperties} initialTours={d.tours} initialCities={d.cities} />;
          })()}
          {currentPage === "search" && <SearchResults onNavigate={navigate} params={navParams} />}
          {currentPage === "property" && (() => {
            const d = getInitialData("property");
            return <PropertyDetails onNavigate={navigate} propertyId={navParams.property_id} initialProperty={d.property} initialReviews={d.reviews} />;
          })()}
          {currentPage === "restaurants" && <RestaurantsPage onNavigate={navigate} />}
          {currentPage === "tours" && <ToursPage onNavigate={navigate} />}
          {currentPage === "dashboard" && <UserDashboard onNavigate={navigate} />}
          {currentPage === "owner-dashboard" && <OwnerDashboard onNavigate={navigate} />}
          {currentPage === "driver-dashboard" && <DriverDashboard onNavigate={navigate} />}
          {currentPage === "guide-dashboard" && <GuideDashboard onNavigate={navigate} />}
          {currentPage === "activity-dashboard" && <ActivityProviderDashboard onNavigate={navigate} />}
          {currentPage === "restaurant-dashboard" && <RestaurantDashboard onNavigate={navigate} />}
          {currentPage === "agency-dashboard" && <AgencyDashboard onNavigate={navigate} />}
          {currentPage === "concierge-dashboard" && <ConciergeDashboard onNavigate={navigate} />}
          {currentPage === "translator-dashboard" && <TranslatorDashboard onNavigate={navigate} />}
          {currentPage === "moderator" && <ModeratorDashboard onNavigate={navigate} />}
          {currentPage === "add-listing" && <AddListingWizard onNavigate={navigate} />}
          {currentPage === "pricing" && <PricingPage onNavigate={navigate} />}
          {currentPage === "admin" && <AdminPanel onNavigate={navigate} />}
          {currentPage === "about" && <AboutPage onNavigate={navigate} />}
          {currentPage === "feedback" && <FeedbackPage onNavigate={navigate} />}
          {currentPage === "city" && (() => {
            const d = getInitialData("city");
            return <CityPage onNavigate={navigate} citySlug={navParams.city_slug} initialCity={d.city} initialProperties={d.properties} initialTours={d.tours} initialRestaurants={d.restaurants} initialActivities={d.activities} initialTransfers={d.transfers} />;
          })()}
          {currentPage === "category" && (() => {
            const d = getInitialData("category");
            return <CategoryPage onNavigate={navigate} categorySlug={navParams.category_slug} initialCategory={d.category} initialProperties={d.properties} />;
          })()}
          {currentPage === "login" && <LoginPage onNavigate={navigate} />}
          {currentPage === "register" && <RegisterPage onNavigate={navigate} />}
          {currentPage === "privacy" && <PrivacyPage onNavigate={navigate} />}
          {currentPage === "terms" && <TermsPage onNavigate={navigate} />}
          {currentPage === "faq" && <FaqPage onNavigate={navigate} />}
          {currentPage === "activities" && <ActivitiesPage onNavigate={navigate} />}
          {currentPage === "transfers" && <TransfersPage onNavigate={navigate} />}
          {currentPage === "tour-packages" && <TourPackagesPage onNavigate={navigate} />}
          {currentPage === "activity" && <ActivityDetailPage onNavigate={navigate} activityId={navParams.activity_id} />}
          {currentPage === "transfer" && <TransferDetailPage onNavigate={navigate} transferId={navParams.transfer_id} />}
          {currentPage === "tour" && <TourDetailPage onNavigate={navigate} tourId={navParams.tour_id} />}
          {currentPage === "tour-package" && <TourPackageDetailPage onNavigate={navigate} pkgId={navParams.pkg_id} />}
          {currentPage === "restaurant" && <RestaurantDetailPage onNavigate={navigate} restaurantId={navParams.restaurant_id} />}
          {currentPage === "experiences" && <ExperiencesPage onNavigate={navigate} />}
          {currentPage === "routes" && <RoutesPage onNavigate={navigate} />}
          {currentPage === "transports" && <TransfersPage onNavigate={navigate} />}
          {currentPage === "planner" && <TravelPlannerPage onNavigate={navigate} />}
          {currentPage === "map" && <MapPage onNavigate={navigate} />}
          {currentPage === "local-experience" && <LocalExperienceDetailPage onNavigate={navigate} experienceId={navParams.experience_id} />}
          {currentPage === "local-host-dashboard" && <LocalHostDashboard onNavigate={navigate} />}
        </Suspense>
      </main>
    </div>
  );
}

export default function App({ initialData }: AppProps) {
  const ssrData = initialData || (typeof window !== "undefined" ? (window as any).__INITIAL_DATA__ : null) || {};

  return (
    <SSRDataContext.Provider value={ssrData}>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </SSRDataContext.Provider>
  );
}
