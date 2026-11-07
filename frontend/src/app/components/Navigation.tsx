import { useState, useEffect } from "react";
import {
  Globe, ChevronDown, User, Heart, Bell, LogOut, Settings, LayoutDashboard,
  Home, BedDouble, Sparkles, Route as RouteIcon, Car, Map, Compass, Backpack,
  Utensils, Mountain, Info, MessageSquare, Wallet, HelpCircle, Menu, Shield,
  Languages, Plus, LogIn, Dumbbell, Building2,
} from "lucide-react";
import logotip from "@/assets/logo.png";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useI18n, LOCALE_LABELS } from "../i18n";
import type { Locale } from "../i18n";
import { getCategories } from "../services/properties";
import type { CategoryResponse } from "../types/api";

interface NavigationProps {
  currentPage: string;
}

function sectionForPage(page: string): string {
  if (page === "landing") return "/";
  if (["search", "property", "city", "category"].includes(page)) return "/search";
  if (["experiences", "restaurants", "activities", "restaurant", "activity", "local-experience"].includes(page)) {
    return "/experiences";
  }
  if (["routes", "tours", "tour", "tour-packages", "tour-package", "planner", "map"].includes(page)) {
    return "/routes";
  }
  if (["transports", "transfers", "transfer"].includes(page)) return "/transports";
  return "";
}

function LanguageMenu({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const locales: Locale[] = ["ru", "ky", "en"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="irx-icon-btn" aria-label={t("nav.language")}>
          <Globe size={16} />
          <span>{LOCALE_LABELS[locale]}</span>
          {!compact && <ChevronDown size={13} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
        {locales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)} className="flex items-center justify-between">
            <span>
              {code === "ru" ? "Русский" : code === "ky" ? "Кыргызча" : "English"}
            </span>
            <span className="text-xs opacity-60">{locale === code ? "✓" : LOCALE_LABELS[code]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DashboardItems({ close }: { close?: () => void }) {
  const { hasRole } = useAuth();
  const { t } = useI18n();

  const item = (href: string, icon: React.ReactNode, label: string) => (
    <DropdownMenuItem key={href + label} asChild>
      <a href={href} className="flex items-center" onClick={close}>
        {icon}
        <span className="ml-2">{label}</span>
      </a>
    </DropdownMenuItem>
  );

  return (
    <>
      {item("/dashboard", <User size={15} />, t("nav.profile"))}
      {item("/dashboard", <Heart size={15} />, t("nav.favorites"))}
      {item("/dashboard", <Bell size={15} />, t("nav.notifications"))}
      <DropdownMenuSeparator />
      {hasRole("owner") && item("/owner-dashboard", <LayoutDashboard size={15} />, "Панель владельца")}
      {hasRole("driver") && item("/driver-dashboard", <Car size={15} />, "Панель водителя")}
      {hasRole("guide") && item("/guide-dashboard", <Compass size={15} />, "Панель гида")}
      {hasRole("activity_provider") && item("/activity-dashboard", <Dumbbell size={15} />, "Панель аниматора")}
      {hasRole("restaurant_partner") && item("/restaurant-dashboard", <Utensils size={15} />, "Панель ресторана")}
      {hasRole("agency") && item("/agency-dashboard", <Building2 size={15} />, "Панель агентства")}
      {hasRole("concierge") && item("/concierge-dashboard", <Bell size={15} />, "Панель консьержа")}
      {hasRole("translator") && item("/translator-dashboard", <Languages size={15} />, "Панель переводчика")}
      {hasRole("local_host") && item("/local-host-dashboard", <Sparkles size={15} />, "Панель хозяина впечатлений")}
      {(hasRole("admin") || hasRole("moderator")) && item("/moderator", <Shield size={15} />, "Модерация")}
      {hasRole("admin") && item("/admin", <Settings size={15} />, "Администратор")}
    </>
  );
}

export function Navigation({ currentPage }: NavigationProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = currentPage !== "landing" || scrolled;
  const section = sectionForPage(currentPage);

  const navLinks = [
    { key: "nav.home", href: "/", icon: Home },
    { key: "nav.stays", href: "/search", icon: BedDouble },
    { key: "nav.experiences", href: "/experiences", icon: Sparkles },
    { key: "nav.routes", href: "/routes", icon: RouteIcon },
    { key: "nav.transport", href: "/transports", icon: Car },
  ];

  const moreLinks = [
    { key: "nav.more.planner", href: "/planner", icon: Sparkles },
    { key: "nav.more.map", href: "/map", icon: Map },
    { key: "nav.more.tours", href: "/tours", icon: Compass },
    { key: "nav.more.packages", href: "/tour-packages", icon: Backpack },
    { key: "nav.more.restaurants", href: "/restaurants", icon: Utensils },
    { key: "nav.more.activities", href: "/activities", icon: Mountain },
    { key: "nav.more.transfers", href: "/transfers", icon: Car },
  ];

  const secondaryLinks = [
    { key: "nav.more.about", href: "/about", icon: Info },
    { key: "nav.more.feedback", href: "/feedback", icon: MessageSquare },
    { key: "nav.more.pricing", href: "/pricing", icon: Wallet },
    { key: "nav.more.faq", href: "/faq", icon: HelpCircle },
  ];

  const isActive = (href: string) => section === href;

  const mobileMenu = (
    <DropdownMenuContent align="end" className="w-72 max-h-[72vh] overflow-y-auto">
      {navLinks.map((link) => {
        const Icon = link.icon;
        return (
          <DropdownMenuItem key={link.href} asChild>
            <a href={link.href} className="flex items-center">
              <Icon size={16} />
              <span className="ml-2">{t(link.key)}</span>
            </a>
          </DropdownMenuItem>
        );
      })}
      <DropdownMenuSeparator />
      {moreLinks.map((link) => {
        const Icon = link.icon;
        return (
          <DropdownMenuItem key={link.href} asChild>
            <a href={link.href} className="flex items-center">
              <Icon size={15} />
              <span className="ml-2">{t(link.key)}</span>
            </a>
          </DropdownMenuItem>
        );
      })}
      <DropdownMenuSeparator />
      {secondaryLinks.map((link) => {
        const Icon = link.icon;
        return (
          <DropdownMenuItem key={link.href} asChild>
            <a href={link.href} className="flex items-center">
              <Icon size={15} />
              <span className="ml-2">{t(link.key)}</span>
            </a>
          </DropdownMenuItem>
        );
      })}
      {categories.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("nav.categories")}</DropdownMenuLabel>
          {categories.map((cat) => (
            <DropdownMenuItem key={cat.id} asChild>
              <a href={`/category/${cat.slug}`}>{cat.name}</a>
            </DropdownMenuItem>
          ))}
        </>
      )}
      <DropdownMenuSeparator />
      {user ? (
        <>
          <DashboardItems />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); window.location.href = "/"; }}>
            <LogOut size={15} />
            <span className="ml-2">{t("nav.logout")}</span>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem asChild>
            <a href="/login" className="flex items-center">
              <LogIn size={15} />
              <span className="ml-2">{t("nav.login")}</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/register" className="flex items-center">
              <User size={15} />
              <span className="ml-2">{t("nav.register")}</span>
            </a>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );

  return (
    <>
      {/* Desktop header */}
      <nav className={`irx-nav ${solid ? "irx-nav-solid" : "irx-nav-transparent"} hidden lg:block`}>
        <div className="irx-nav-inner">
          <a href="/" className="irx-logo" aria-label="IssykRelax">
            <img src={logotip} alt="" className="irx-logo-mark" />
            <span className="irx-logo-word">Issyk<em>Relax</em></span>
          </a>

          <div className="irx-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`irx-nav-link ${isActive(link.href) ? "is-active" : ""}`}
              >
                {t(link.key)}
              </a>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="irx-nav-link">
                  {t("nav.more")} <ChevronDown size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {moreLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <a href={link.href} className="flex items-center">
                        <Icon size={15} />
                        <span className="ml-2">{t(link.key)}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                {secondaryLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <a href={link.href} className="flex items-center">
                        <Icon size={15} />
                        <span className="ml-2">{t(link.key)}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
                {categories.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t("nav.categories")}</DropdownMenuLabel>
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} asChild>
                        <a href={`/category/${cat.slug}`}>{cat.name}</a>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="irx-nav-right">
            {hasRole("owner") && (
              <a href="/add-listing" className="irx-btn irx-btn-primary" style={{ padding: "9px 16px" }}>
                <Plus size={15} />
                {t("nav.addListing")}
              </a>
            )}

            <LanguageMenu />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="irx-profile-btn" aria-label={t("nav.profile")}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar_url || undefined} />
                      <AvatarFallback style={{ background: "var(--lake-blue)", color: "#fff" }}>
                        {(user?.full_name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Menu size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DashboardItems />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); window.location.href = "/"; }}>
                    <LogOut size={15} />
                    <span className="ml-2">{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/login" className="irx-icon-btn">{t("nav.login")}</a>
                <a href="/register" className="irx-btn irx-btn-primary" style={{ padding: "9px 16px" }}>
                  {t("nav.register")}
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className={`irx-nav ${solid ? "irx-nav-solid" : "irx-nav-transparent"} lg:hidden`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <a href="/" className="irx-logo" aria-label="IssykRelax">
            <img src={logotip} alt="" className="irx-logo-mark" style={{ height: 30 }} />
            <span className="irx-logo-word" style={{ fontSize: "1.1rem" }}>Issyk<em>Relax</em></span>
          </a>
          <div className="flex items-center gap-1">
            <LanguageMenu compact />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="irx-icon-btn" aria-label={t("nav.menu")}>
                  <Menu size={20} />
                </button>
              </DropdownMenuTrigger>
              {mobileMenu}
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="irx-bottom-nav lg:hidden">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <a key={link.href} href={link.href} className={`irx-bottom-link ${active ? "is-active" : ""}`}>
                <Icon size={20} />
                <span>{t(link.key)}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
