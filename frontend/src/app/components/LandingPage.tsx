import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Search, MapPin, Star, ArrowRight, CheckCircle, CalendarDays, Users,
  Sparkles, Compass, Car, Utensils, Shield, BadgeCheck,
  Headphones, BedDouble, Wallet, Waves, Map, Route as RouteIcon,
  ChevronRight, Clock,
} from "lucide-react";
import logotip from "@/assets/logo.png";
import { SEO } from "./SEO";
import { localBusinessSchema, searchActionSchema } from "../lib/schemas";
import { ImgWithFallback } from "./ui/img-with-fallback";
import { getCategories, getCities, getProperties } from "../services/properties";
import { listTours } from "../services/guides";
import { listExperiences } from "../services/experiences";
import type { LocalExperienceResponse } from "../services/experiences";
import { IssykKulMap, cityCoords } from "./IssykKulMap";
import type { MapPoint } from "./IssykKulMap";
import { useI18n } from "../i18n";
import type {
  CategoryResponse, CityResponse, PropertyResponse, TourResponse,
} from "../types/api";

interface LandingPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialCategories?: CategoryResponse[];
  initialFeaturedProperties?: PropertyResponse[];
  initialTours?: TourResponse[];
  initialCities?: CityResponse[];
}

const DEST_IMAGES: Record<string, string> = {
  "cholpon-ata": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80&auto=format&fit=crop",
  "bosteri": "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=700&q=80&auto=format&fit=crop",
  "kara-oy": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80&auto=format&fit=crop",
  "chok-tal": "https://images.unsplash.com/photo-1482192505345-5852bda519bb?w=700&q=80&auto=format&fit=crop",
  "tamchy": "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=700&q=80&auto=format&fit=crop",
  "karakol": "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=700&q=80&auto=format&fit=crop",
  "balykchy": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=700&q=80&auto=format&fit=crop",
};

const DEST_FALLBACK = [
  { id: "cholpon-ata", name: "Чолпон-Ата", slug: "cholpon-ata" },
  { id: "bosteri", name: "Бостери", slug: "bosteri" },
  { id: "kara-oy", name: "Кара-Ой", slug: "kara-oy" },
  { id: "chok-tal", name: "Чок-Тал", slug: "chok-tal" },
  { id: "tamchy", name: "Тамчы", slug: "tamchy" },
  { id: "karakol", name: "Каракол", slug: "karakol" },
];

const TESTIMONIALS = [
  {
    name: "Алина Сейткали",
    city: "Алматы, Казахстан",
    text: "Нашли идеальный коттедж на берегу за 10 минут. IssykRelax собрал жильё, трансфер и экскурсию в один понятный маршрут.",
    rating: 5,
  },
  {
    name: "Дмитрий Козлов",
    city: "Москва, Россия",
    text: "Впервые на Иссык-Куле — и сразу в восторге. Отдельное спасибо за местные впечатления: конная прогулка была лучшей частью поездки.",
    rating: 5,
  },
  {
    name: "Нодира Юсупова",
    city: "Ташкент, Узбекистан",
    text: "Юрт-кемп и ужин у местной семьи — это что-то невероятное. Бронирование заняло пару минут, всё подтвердилось сразу.",
    rating: 5,
  },
];

const EXPERIENCE_CATEGORIES = [
  { title: "Кулинария", desc: "Мастер-классы у местных", icon: Utensils, color: "#f59e0b", bg: "#fff7ed" },
  { title: "Конные прогулки", desc: "По долинам и берегу", icon: Compass, color: "#14b8a6", bg: "#ecfdf5" },
  { title: "Рыбалка", desc: "На озере и горных реках", icon: Waves, color: "#3b82f6", bg: "#eff6ff" },
  { title: "Культура", desc: "Юрты, ремёсла, музыка", icon: Sparkles, color: "#ec4899", bg: "#fdf2f8" },
];

const styles = `
  .irl { background: var(--paper); color: var(--ink-800); overflow-x: clip; }

  /* ── HERO ─────────────────────────────────────────────── */
  .irl-hero { position: relative; overflow: hidden; background: var(--ink-900); padding: 118px 20px 0; }
  .irl-hero-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2200&q=85&auto=format&fit=crop') center 42%/cover no-repeat;
    transform: scale(1.02);
  }
  .irl-hero-scrim {
    position: absolute; inset: 0;
    background:
      linear-gradient(100deg, rgba(6,24,43,0.94) 0%, rgba(6,24,43,0.72) 42%, rgba(6,24,43,0.22) 100%),
      linear-gradient(180deg, rgba(6,24,43,0.35) 0%, rgba(6,24,43,0.72) 100%);
  }
  .irl-hero-inner {
    position: relative; z-index: 2;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1.08fr 0.92fr;
    gap: 56px; align-items: center;
    min-height: 520px; padding-bottom: 72px;
  }
  .irl-hero-copy { color: #fff; max-width: 620px; }
  .irl-hero-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 14px; border-radius: 999px;
    background: rgba(20,184,166,0.14); border: 1px solid rgba(94,234,212,0.38);
    color: var(--aqua-300); font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 24px;
  }
  .irl-hero-title {
    font-family: var(--font-display); font-weight: 700;
    font-size: clamp(2.8rem, 6vw, 5rem); line-height: 1.02;
    letter-spacing: -0.02em; margin: 0 0 20px; color: #fff;
  }
  .irl-hero-title em { font-style: italic; color: var(--aqua-300); }
  .irl-hero-sub {
    color: rgba(255,255,255,0.72); font-size: clamp(1rem, 1.5vw, 1.12rem);
    line-height: 1.75; margin: 0 0 32px; max-width: 560px;
  }
  .irl-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
  .irl-hero-trust { display: flex; flex-wrap: wrap; gap: 18px; }
  .irl-trust-item { display: inline-flex; align-items: center; gap: 7px; color: rgba(255,255,255,0.62); font-size: 0.78rem; font-weight: 550; }
  .irl-trust-item svg { color: var(--aqua-300); }

  .irl-hero-aside { position: relative; }
  .irl-hero-photo {
    position: relative; border-radius: 28px; overflow: hidden;
    aspect-ratio: 4 / 5; max-height: 440px;
    border: 1px solid rgba(255,255,255,0.18);
    box-shadow: 0 34px 90px rgba(0,0,0,0.42);
  }
  .irl-hero-photo img { width: 100%; height: 100%; object-fit: cover; }
  .irl-hero-photo::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(6,24,43,0.72), transparent 55%);
  }
  .irl-photo-badge {
    position: absolute; z-index: 2; left: 16px; right: 16px; bottom: 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 12px 14px; border-radius: 16px;
    background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.24);
    backdrop-filter: blur(16px); color: #fff;
  }
  .irl-photo-badge strong { display: block; font-size: 0.86rem; }
  .irl-photo-badge span { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.68); margin-top: 2px; }
  .irl-photo-badge-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: var(--gradient-aqua); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .irl-hero-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
    margin-top: 14px; padding: 8px; border-radius: 18px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16);
    backdrop-filter: blur(16px);
  }
  .irl-stat { text-align: center; padding: 10px 4px; }
  .irl-stat strong { display: block; font-family: var(--font-display); font-size: 1.25rem; color: #fff; line-height: 1; }
  .irl-stat span { display: block; font-size: 0.62rem; color: rgba(255,255,255,0.55); margin-top: 5px; line-height: 1.2; }

  /* ── SEARCH DOCK ──────────────────────────────────────── */
  .irl-search {
    position: relative; z-index: 5;
    max-width: 1180px; margin: -6px auto -54px;
    display: grid; grid-template-columns: 1.45fr 1fr 1fr 0.9fr 1.05fr auto;
    align-items: center; gap: 2px;
    padding: 12px; border-radius: 24px;
    background: rgba(255,255,255,0.96);
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow: 0 30px 80px rgba(6,24,43,0.30);
    backdrop-filter: blur(24px);
  }
  .irl-field {
    display: flex; flex-direction: column; gap: 3px;
    padding: 9px 14px; min-width: 0;
    border-right: 1px solid rgba(10,37,64,0.08);
  }
  .irl-field:nth-last-child(2) { border-right: none; }
  .irl-field-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.62rem; font-weight: 750; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-secondary);
  }
  .irl-field-label svg { color: var(--aqua-500); }
  .irl-field input, .irl-field select {
    width: 100%; border: none; outline: none; background: transparent;
    color: var(--ink-800); font-family: inherit; font-size: 0.9rem;
    font-weight: 600; padding: 0; min-width: 0;
  }
  .irl-field input[type="date"] { font-size: 0.84rem; }
  .irl-search-btn {
    height: 54px; padding: 0 26px; border-radius: 16px; border: none;
    background: var(--gradient-aqua); color: #fff; font-family: inherit;
    font-size: 0.9rem; font-weight: 700; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    box-shadow: 0 12px 26px rgba(20,184,166,0.32);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    white-space: nowrap;
  }
  .irl-search-btn:hover { transform: translateY(-1px); box-shadow: 0 16px 34px rgba(20,184,166,0.42); }

  /* ── SECTION RHYTHM ───────────────────────────────────── */
  .irl-section { padding: 92px 20px; }
  .irl-section-tight { padding-top: 124px; }
  .irl-container { max-width: 1200px; margin: 0 auto; }
  .irl-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 40px; flex-wrap: wrap; }
  .irl-section-head h2 { font-family: var(--font-display); font-size: clamp(1.9rem, 3.4vw, 2.7rem); line-height: 1.12; color: var(--ink-800); margin: 0 0 8px; }
  .irl-section-head p { color: var(--text-secondary); margin: 0; font-size: 0.98rem; }
  .irl-link {
    display: inline-flex; align-items: center; gap: 7px;
    background: none; border: none; cursor: pointer; padding: 0;
    color: var(--lake-blue); font-family: inherit; font-size: 0.86rem;
    font-weight: 700; white-space: nowrap;
  }
  .irl-link:hover { gap: 11px; }

  /* ── DESTINATIONS ─────────────────────────────────────── */
  .irl-dest-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
  .irl-dest {
    position: relative; border-radius: 22px; overflow: hidden; cursor: pointer;
    aspect-ratio: 3 / 4; border: 1px solid rgba(10,37,64,0.06);
    background: var(--ink-800); text-align: left; padding: 0;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .irl-dest:hover { transform: translateY(-4px); box-shadow: 0 22px 48px rgba(6,24,43,0.2); }
  .irl-dest img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
  .irl-dest:hover img { transform: scale(1.07); }
  .irl-dest::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(6,24,43,0.88) 0%, rgba(6,24,43,0.08) 60%, transparent 100%); }
  .irl-dest-body { position: absolute; z-index: 2; left: 14px; right: 14px; bottom: 14px; color: #fff; }
  .irl-dest-body strong { display: block; font-size: 0.95rem; line-height: 1.2; }
  .irl-dest-body span { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.62); margin-top: 3px; }
  .irl-dest-arrow {
    position: absolute; z-index: 2; top: 12px; right: 12px;
    width: 28px; height: 28px; border-radius: 999px;
    background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.24);
    display: flex; align-items: center; justify-content: center; color: #fff;
    backdrop-filter: blur(10px);
  }

  /* ── AI BAND ──────────────────────────────────────────── */
  .irl-ai-wrap { padding: 0 20px 92px; }
  .irl-ai {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center;
    padding: 48px; border-radius: 32px; overflow: hidden; position: relative;
    background: var(--gradient-lake);
    border: 1px solid rgba(94,234,212,0.2);
    box-shadow: 0 30px 80px rgba(6,24,43,0.22);
  }
  .irl-ai::before {
    content: ''; position: absolute; width: 420px; height: 420px; border-radius: 999px;
    right: -120px; top: -160px; background: radial-gradient(circle, rgba(20,184,166,0.35), transparent 65%);
    pointer-events: none;
  }
  .irl-ai-copy { position: relative; z-index: 2; color: #fff; }
  .irl-ai-copy h2 { font-family: var(--font-display); font-size: clamp(1.9rem, 3.2vw, 2.6rem); line-height: 1.12; margin: 0 0 14px; color: #fff; }
  .irl-ai-copy p { color: rgba(255,255,255,0.7); line-height: 1.75; margin: 0 0 22px; font-size: 0.98rem; }
  .irl-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
  .irl-chip {
    padding: 6px 11px; border-radius: 999px; font-size: 0.72rem; font-weight: 650;
    color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.16);
  }
  .irl-ai-visual { position: relative; z-index: 2; }
  .irl-plan-card {
    padding: 20px; border-radius: 24px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(18px); color: #fff;
  }
  .irl-plan-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
  .irl-plan-head strong { font-size: 0.92rem; }
  .irl-plan-head span { font-size: 0.7rem; color: rgba(255,255,255,0.6); }
  .irl-plan-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.12); }
  .irl-plan-row:first-of-type { border-top: none; }
  .irl-plan-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .irl-plan-row strong { display: block; font-size: 0.8rem; }
  .irl-plan-row span { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.58); margin-top: 2px; }
  .irl-plan-price { margin-left: auto; font-size: 0.78rem; font-weight: 700; color: var(--aqua-300); white-space: nowrap; }

  /* ── CARD GRIDS ───────────────────────────────────────── */
  .irl-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .irl-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .irl-card {
    display: flex; flex-direction: column; text-align: left; padding: 0;
    background: #fff; border: 1px solid rgba(10,37,64,0.08);
    border-radius: 22px; overflow: hidden; cursor: pointer;
    transition: transform 0.24s ease, box-shadow 0.24s ease;
  }
  .irl-card:hover { transform: translateY(-5px); box-shadow: 0 24px 54px rgba(6,24,43,0.13); }
  .irl-card-img { position: relative; height: 190px; overflow: hidden; background: var(--surface); }
  .irl-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
  .irl-card:hover .irl-card-img img { transform: scale(1.06); }
  .irl-card-badge {
    position: absolute; top: 12px; left: 12px; z-index: 2;
    padding: 4px 9px; border-radius: 999px; font-size: 0.66rem; font-weight: 750;
    color: #fff; background: rgba(6,24,43,0.78); backdrop-filter: blur(8px);
  }
  .irl-card-badge.aqua { background: rgba(20,184,166,0.92); }
  .irl-card-price {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
    padding: 22px 14px 11px; color: #fff; font-size: 0.92rem; font-weight: 750;
    background: linear-gradient(to top, rgba(6,24,43,0.82), transparent);
  }
  .irl-card-body { padding: 15px 16px 17px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .irl-card-title { font-size: 0.9rem; font-weight: 700; color: var(--ink-800); line-height: 1.35; }
  .irl-card-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 0.72rem; color: var(--text-secondary); }
  .irl-card-meta span { display: inline-flex; align-items: center; gap: 4px; }
  .irl-price { margin-top: auto; padding-top: 6px; font-size: 0.95rem; font-weight: 750; color: var(--lake-blue); }
  .irl-price small { font-size: 0.72rem; font-weight: 500; color: var(--text-secondary); }

  .irl-empty {
    padding: 34px; border-radius: 20px; text-align: center;
    border: 1px dashed rgba(10,37,64,0.16); color: var(--text-secondary);
    background: rgba(255,255,255,0.6); font-size: 0.9rem;
  }

  /* ── MAP SECTION ──────────────────────────────────────── */
  .irl-map-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: center; }
  .irl-map-copy h2 { font-family: var(--font-display); font-size: clamp(1.9rem, 3.4vw, 2.7rem); line-height: 1.12; margin: 0 0 12px; color: var(--ink-800); }
  .irl-map-copy p { color: var(--text-secondary); line-height: 1.75; margin: 0 0 22px; }
  .irl-map-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
  .irl-legend {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 650;
    background: #fff; border: 1px solid rgba(10,37,64,0.08); color: var(--ink-800);
  }
  .irl-legend i { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }

  /* ── EXPERIENCES ──────────────────────────────────────── */
  .irl-exp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .irl-exp-card {
    text-align: left; padding: 22px; border-radius: 22px; cursor: pointer;
    background: #fff; border: 1px solid rgba(10,37,64,0.08);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .irl-exp-card:hover { transform: translateY(-4px); box-shadow: 0 20px 46px rgba(6,24,43,0.1); }
  .irl-exp-icon { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .irl-exp-card strong { display: block; font-size: 0.92rem; color: var(--ink-800); margin-bottom: 5px; }
  .irl-exp-card span { font-size: 0.76rem; color: var(--text-secondary); line-height: 1.5; }

  /* ── REVIEWS & BENEFITS ───────────────────────────────── */
  .irl-review {
    padding: 26px; border-radius: 22px; background: #fff;
    border: 1px solid rgba(10,37,64,0.08); display: flex; flex-direction: column;
  }
  .irl-stars { display: flex; gap: 3px; margin-bottom: 14px; }
  .irl-quote { font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary); margin: 0 0 20px; font-style: italic; }
  .irl-reviewer { display: flex; align-items: center; gap: 10px; margin-top: auto; }
  .irl-avatar {
    width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--gradient-aqua); color: #fff; font-size: 0.78rem; font-weight: 750;
  }
  .irl-reviewer strong { display: block; font-size: 0.8rem; color: var(--ink-800); }
  .irl-reviewer span { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-top: 1px; }

  .irl-benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .irl-benefit { padding: 24px; border-radius: 22px; background: #fff; border: 1px solid rgba(10,37,64,0.08); }
  .irl-benefit-icon {
    width: 44px; height: 44px; border-radius: 13px; margin-bottom: 16px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #e6f2f9, #e6faf7); color: var(--lake-blue);
  }
  .irl-benefit strong { display: block; font-size: 0.9rem; color: var(--ink-800); margin-bottom: 6px; }
  .irl-benefit p { margin: 0; font-size: 0.78rem; line-height: 1.6; color: var(--text-secondary); }

  /* ── BUSINESS CTA ─────────────────────────────────────── */
  .irl-business-wrap { padding: 0 20px 92px; }
  .irl-business {
    position: relative; max-width: 1200px; margin: 0 auto; overflow: hidden;
    border-radius: 32px; padding: 56px 48px; color: #fff;
    background: var(--gradient-lake);
  }
  .irl-business::before {
    content: ''; position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format&fit=crop') center/cover;
    opacity: 0.14;
  }
  .irl-business::after {
    content: ''; position: absolute; width: 380px; height: 380px; border-radius: 999px;
    right: -100px; bottom: -160px; background: radial-gradient(circle, rgba(20,184,166,0.32), transparent 65%);
  }
  .irl-business-inner { position: relative; z-index: 2; max-width: 620px; }
  .irl-business h2 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); line-height: 1.08; margin: 0 0 14px; }
  .irl-business p { color: rgba(255,255,255,0.72); line-height: 1.7; margin: 0 0 24px; }
  .irl-business-feats { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-bottom: 28px; }
  .irl-business-feat { display: inline-flex; align-items: center; gap: 7px; font-size: 0.8rem; color: rgba(255,255,255,0.84); }
  .irl-business-feat svg { color: var(--sand-300); }
  .irl-business-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  /* ── FOOTER ───────────────────────────────────────────── */
  .irl-footer { background: var(--ink-900); color: rgba(255,255,255,0.66); padding: 64px 20px 30px; }
  .irl-footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; }
  .irl-footer-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .irl-footer-brand-mark { height: 34px; width: auto; border-radius: 8px; background: #fff; padding: 3px 5px; }
  .irl-footer-brand-name { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: #fff; }
  .irl-footer-brand-name em { font-style: normal; color: var(--aqua-400); }
  .irl-footer-desc { font-size: 0.82rem; line-height: 1.7; color: rgba(255,255,255,0.52); margin: 0 0 18px; max-width: 320px; }
  .irl-langs { display: flex; gap: 7px; }
  .irl-lang {
    padding: 5px 10px; border-radius: 7px; cursor: pointer;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.62); font-family: inherit; font-size: 0.7rem; font-weight: 650;
  }
  .irl-lang:hover, .irl-lang.active { background: rgba(20,184,166,0.2); border-color: rgba(94,234,212,0.4); color: #fff; }
  .irl-footer-col-title { font-size: 0.7rem; font-weight: 750; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.38); margin-bottom: 14px; }
  .irl-footer-link {
    display: block; margin-bottom: 9px; padding: 0; border: none; background: none;
    color: rgba(255,255,255,0.64); font-family: inherit; font-size: 0.82rem;
    text-align: left; cursor: pointer; transition: color 0.15s ease;
  }
  .irl-footer-link:hover { color: #fff; }
  .irl-footer-bottom {
    max-width: 1200px; margin: 44px auto 0; padding-top: 22px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px; font-size: 0.74rem; color: rgba(255,255,255,0.38);
  }
  .irl-footer-bottom-links { display: flex; gap: 20px; }
  .irl-footer-bottom-link { border: none; background: none; color: inherit; font-family: inherit; font-size: inherit; cursor: pointer; }
  .irl-footer-bottom-link:hover { color: #fff; }

  /* ── RESPONSIVE ───────────────────────────────────────── */
  @media (max-width: 1100px) {
    .irl-dest-grid { grid-template-columns: repeat(3, 1fr); }
    .irl-search { grid-template-columns: 1.2fr 1fr 1fr 0.8fr auto; }
    .irl-field:nth-last-child(3) { display: none; }
  }
  @media (max-width: 980px) {
    .irl-hero-inner { grid-template-columns: 1fr; gap: 32px; padding-bottom: 56px; }
    .irl-hero-aside { max-width: 520px; }
    .irl-hero-photo { aspect-ratio: 16 / 10; max-height: 320px; }
    .irl-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .irl-exp-grid, .irl-benefits { grid-template-columns: repeat(2, 1fr); }
    .irl-map-grid, .irl-ai { grid-template-columns: 1fr; }
    .irl-ai { padding: 34px; }
  }
  @media (max-width: 760px) {
    .irl-hero { padding: 96px 16px 0; }
    .irl-hero-title { font-size: clamp(2.4rem, 10vw, 3.4rem); }
    .irl-search {
      grid-template-columns: 1fr 1fr; gap: 2px;
      margin: -4px auto -34px; padding: 10px; border-radius: 20px;
    }
    .irl-field { border-right: none; padding: 8px 10px; background: rgba(244,248,251,0.6); border-radius: 12px; }
    .irl-field:nth-last-child(3) { display: flex; }
    .irl-field:first-child { grid-column: 1 / -1; }
    .irl-search-btn { grid-column: 1 / -1; height: 48px; margin-top: 4px; justify-content: center; }
    .irl-section-tight { padding-top: 88px; }
    .irl-section { padding: 64px 16px; }
    .irl-ai-wrap, .irl-business-wrap { padding: 0 16px 64px; }
    .irl-dest-grid { grid-template-columns: repeat(2, 1fr); }
    .irl-grid-3 { grid-template-columns: 1fr; }
    .irl-grid-4 { grid-template-columns: 1fr; }
    .irl-section-head { margin-bottom: 28px; }
    .irl-footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
    .irl-business { padding: 36px 24px; border-radius: 24px; }
    .irl-ai { padding: 28px 22px; border-radius: 24px; }
    .irl-hero-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .irl-dest-grid, .irl-exp-grid, .irl-benefits { grid-template-columns: 1fr; }
    .irl-footer-grid { grid-template-columns: 1fr; gap: 24px; }
    .irl-hero-actions .irx-btn { width: 100%; }
  }
`;

export function LandingPage({
  onNavigate,
  initialCategories,
  initialFeaturedProperties,
  initialTours,
  initialCities,
}: LandingPageProps) {
  const { t, locale, setLocale } = useI18n();
  const [categories, setCategories] = useState<CategoryResponse[]>(initialCategories || []);
  const [cities, setCities] = useState<CityResponse[]>(initialCities || []);
  const [featured, setFeatured] = useState<PropertyResponse[]>(initialFeaturedProperties || []);
  const [tours, setTours] = useState<TourResponse[]>(initialTours || []);
  const [experiences, setExperiences] = useState<LocalExperienceResponse[]>([]);
  const [loading, setLoading] = useState(!initialFeaturedProperties);

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [categoryId, setCategoryId] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let alive = true;

    getCities().then((data) => { if (alive) setCities(data); }).catch(() => {});
    listExperiences({ limit: 4 }).then((data) => { if (alive) setExperiences(data.items); }).catch(() => {});

    if (initialFeaturedProperties) {
      setLoading(false);
    } else {
      Promise.all([
        getCategories().catch(() => []),
        getProperties({ limit: 4, max_price: 50000 }).catch(() => ({ items: [] })),
        listTours(undefined, 0, 3).catch(() => ({ items: [] })),
      ])
        .then(([cats, props, ts]) => {
          if (!alive) return;
          setCategories(cats);
          setFeatured(props.items);
          setTours(ts.items);
        })
        .finally(() => { if (alive) setLoading(false); });
    }

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destinations = (cities.length > 0 ? cities : DEST_FALLBACK).slice(0, 6);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params: Record<string, string> = {};
    if (destination) {
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(destination)) {
        params.city_id = destination;
      } else {
        const city = cities.find((c) => c.id === destination);
        params.query = city?.name || destination.replace(/-/g, " ");
      }
    }
    if (checkIn) params.check_in = checkIn;
    if (checkOut) params.check_out = checkOut;
    if (guests) {
      params.guests = guests;
      params.max_guests = guests;
    }
    if (categoryId) params.category_id = categoryId;
    onNavigate("search", params);
  };

  const mapPoints: MapPoint[] = destinations.map((city) => {
    const coords = cityCoords(city.name) || { lat: 42.46, lng: 77.25 };
    return {
      id: `dest-${city.slug || city.id}`,
      type: "area",
      title: city.name,
      subtitle: "Иссык-Куль",
      lat: coords.lat,
      lng: coords.lng,
    };
  });

  return (
    <div className="irl">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <SEO
        title="IssykRelax — премиальная экосистема путешествий по Кыргызстану"
        description="Жильё, местные впечатления, маршруты и транспорт на Иссык-Куле. Бронируйте отели, коттеджи, юрты, туры, рестораны и трансферы в одной премиальной экосистеме."
        canonical="/"
        jsonLd={[localBusinessSchema(), searchActionSchema()]}
      />

      {/* HERO */}
      <section className="irl-hero">
        <div className="irl-hero-bg" />
        <div className="irl-hero-scrim" />
        <div className="irl-hero-inner">
          <div className="irl-hero-copy">
            <span className="irl-hero-pill">
              <Sparkles size={13} />
              {t("landing.eyebrow")}
            </span>
            <h1 className="irl-hero-title">
              {t("landing.title1")}
              <br />
              {" "}
              <em>{t("landing.titleAccent")}</em>
            </h1>
            <p className="irl-hero-sub">{t("landing.subtitle")}</p>
            <div className="irl-hero-actions">
              <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("planner")}>
                <Sparkles size={16} />
                {t("landing.ctaAi")}
              </button>
              <button className="irx-btn irx-btn-outline" onClick={() => onNavigate("search")}>
                {t("landing.ctaStays")}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="irl-hero-trust">
              <span className="irl-trust-item"><Shield size={14} /> Проверенные партнёры</span>
              <span className="irl-trust-item"><BadgeCheck size={14} /> Безопасная оплата</span>
              <span className="irl-trust-item"><Headphones size={14} /> Поддержка 24/7</span>
            </div>
          </div>

          <div className="irl-hero-aside">
            <div className="irl-hero-photo">
              <ImgWithFallback
                src="https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=900&q=80&auto=format&fit=crop"
                alt="Иссык-Куль"
                className="w-full h-full object-cover"
                priority
              />
              <div className="irl-photo-badge">
                <div>
                  <strong>Чолпон-Ата · Иссык-Куль</strong>
                  <span>Северное побережье, 1 607 м над морем</span>
                </div>
                <div className="irl-photo-badge-icon"><Waves size={18} /></div>
              </div>
            </div>
            <div className="irl-hero-stats">
              {[
                { value: "500+", label: t("landing.stats.objects") },
                { value: "120+", label: t("landing.stats.tours") },
                { value: "80+", label: t("landing.stats.restaurants") },
                { value: "50+", label: t("landing.stats.transfers") },
              ].map((stat) => (
                <div className="irl-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form className="irl-search" onSubmit={handleSearch}>
          <div className="irl-field">
            <label className="irl-field-label" htmlFor="irl-destination"><MapPin size={11} />{t("landing.where")}</label>
            <select id="irl-destination" value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="">{t("landing.wherePlaceholder")}</option>
              {cities.length > 0
                ? cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)
                : DEST_FALLBACK.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}
            </select>
          </div>
          <div className="irl-field">
            <label className="irl-field-label" htmlFor="irl-checkin"><CalendarDays size={11} />{t("landing.checkIn")}</label>
            <input id="irl-checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className="irl-field">
            <label className="irl-field-label" htmlFor="irl-checkout"><CalendarDays size={11} />{t("landing.checkOut")}</label>
            <input id="irl-checkout" type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="irl-field">
            <label className="irl-field-label" htmlFor="irl-guests"><Users size={11} />{t("landing.guests")}</label>
            <select id="irl-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1} {i === 0 ? t("landing.guest") : t("landing.guestsMany")}</option>
              ))}
            </select>
          </div>
          <div className="irl-field">
            <label className="irl-field-label" htmlFor="irl-category"><BedDouble size={11} />{t("landing.category")}</label>
            <select id="irl-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">{t("landing.anyCategory")}</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <button type="submit" className="irl-search-btn">
            <Search size={17} />
            {t("landing.search")}
          </button>
        </form>
      </section>

      {/* DESTINATIONS */}
      <section className="irl-section irl-section-tight">
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><MapPin size={12} />{t("landing.destinations")}</span>
              <h2>{t("landing.destinations")}</h2>
              <p>{t("landing.destinationsDesc")}</p>
            </div>
            <button className="irl-link" onClick={() => onNavigate("search")}>
              {t("landing.viewAll")} <ArrowRight size={15} />
            </button>
          </div>
          <div className="irl-dest-grid">
            {destinations.map((city) => (
              <button
                key={city.id}
                className="irl-dest"
                onClick={() => city.slug ? onNavigate("city", { city_slug: city.slug }) : onNavigate("search", { query: city.name })}
              >
                <ImgWithFallback
                  src={DEST_IMAGES[city.slug || ""] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80&auto=format&fit=crop"}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
                <span className="irl-dest-arrow"><ChevronRight size={14} /></span>
                <span className="irl-dest-body">
                  <strong>{city.name}</strong>
                  <span>Иссык-Куль</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI PLANNER */}
      <section className="irl-ai-wrap">
        <div className="irl-ai">
          <div className="irl-ai-copy">
            <span className="irx-eyebrow" style={{ color: "var(--aqua-300)" }}>
              <Sparkles size={12} />{t("landing.aiEyebrow")}
            </span>
            <h2>{t("landing.aiTitle")}</h2>
            <p>{t("landing.aiDesc")}</p>
            <div className="irl-chips">
              {["Бюджет", "Дни", "Компания", "Предпочтения", "Локация"].map((chip) => (
                <span key={chip} className="irl-chip">{chip}</span>
              ))}
            </div>
            <button className="irx-btn irx-btn-sand" onClick={() => onNavigate("planner")}>
              <Sparkles size={16} />
              {t("landing.aiCta")}
            </button>
          </div>
          <div className="irl-ai-visual">
            <div className="irl-plan-card">
              <div className="irl-plan-head">
                <div>
                  <strong>Маршрут · 3 дня</strong>
                  <span>2 путешественника · средний бюджет</span>
                </div>
                <Wallet size={18} style={{ color: "var(--aqua-300)" }} />
              </div>
              {[
                { icon: BedDouble, title: "День 1 · Заезд и жильё", sub: "Коттедж у озера · Чолпон-Ата", price: "8 500 сом" },
                { icon: Utensils, title: "День 2 · Впечатления", sub: "Конная прогулка + ужин у местных", price: "4 200 сом" },
                { icon: Car, title: "День 3 · Транспорт", sub: "Трансфер до аэропорта", price: "2 800 сом" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div className="irl-plan-row" key={row.title}>
                    <span className="irl-plan-icon"><Icon size={16} /></span>
                    <div>
                      <strong>{row.title}</strong>
                      <span>{row.sub}</span>
                    </div>
                    <span className="irl-plan-price">{row.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED STAYS */}
      <section className="irl-section" style={{ background: "#ffffff" }}>
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><BedDouble size={12} />{t("landing.staysEyebrow")}</span>
              <h2>{t("landing.staysTitle")}</h2>
              <p>{t("landing.staysDesc")}</p>
            </div>
            <button className="irl-link" onClick={() => onNavigate("search")}>
              {t("landing.viewAll")} <ArrowRight size={15} />
            </button>
          </div>
          {loading ? (
            <div className="irl-empty">{t("landing.loading")}</div>
          ) : featured.length === 0 ? (
            <div className="irl-empty">{t("landing.empty.stays")}</div>
          ) : (
            <div className="irl-grid-4">
              {featured.map((listing) => (
                <button
                  key={listing.id}
                  className="irl-card"
                  onClick={() => onNavigate("property", { property_id: listing.id })}
                >
                  <div className="irl-card-img">
                    <ImgWithFallback
                      src={listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80&auto=format&fit=crop"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.category?.name && <span className="irl-card-badge aqua">{listing.category.name}</span>}
                  </div>
                  <div className="irl-card-body">
                    <div className="irl-card-title">{listing.title}</div>
                    <div className="irl-card-meta">
                      <span><MapPin size={12} />{listing.city?.name || "Иссык-Куль"}</span>
                      <span><Users size={12} />{t("common.upTo")} {listing.max_guests} {t("common.people")}</span>
                    </div>
                    <div className="irl-price">
                      {listing.price_per_night.toLocaleString()} {t("common.currency")}
                      <small> {t("common.perNight")}</small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAP */}
      <section className="irl-section">
        <div className="irl-container">
          <div className="irl-map-grid">
            <div className="irl-map-copy">
              <span className="irx-eyebrow"><Map size={12} />{t("landing.mapEyebrow")}</span>
              <h2>{t("landing.mapTitle")}</h2>
              <p>{t("landing.mapDesc")}</p>
              <div className="irl-map-legend">
                {[
                  { label: "Жильё", color: "#14b8a6" },
                  { label: "Рестораны", color: "#f59e0b" },
                  { label: "Активности", color: "#8b5cf6" },
                  { label: "Туры", color: "#3b82f6" },
                  { label: "Транспорт", color: "#f97316" },
                  { label: "Впечатления", color: "#ec4899" },
                ].map((item) => (
                  <span className="irl-legend" key={item.label}>
                    <i style={{ background: item.color }} />{item.label}
                  </span>
                ))}
              </div>
              <button className="irx-btn irx-btn-primary" onClick={() => onNavigate("map")}>
                <Map size={16} />
                {t("landing.mapCta")}
              </button>
            </div>
            <IssykKulMap
              points={mapPoints}
              showAreas
              onSelect={(point) => onNavigate("search", { query: point.title })}
            />
          </div>
        </div>
      </section>

      {/* LOCAL EXPERIENCES */}
      <section className="irl-section" style={{ background: "#ffffff" }}>
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><Sparkles size={12} />{t("landing.experiencesEyebrow")}</span>
              <h2>{t("landing.experiencesTitle")}</h2>
              <p>{t("landing.experiencesDesc")}</p>
            </div>
            <button className="irl-link" onClick={() => onNavigate("experiences")}>
              {t("landing.experiencesCta")} <ArrowRight size={15} />
            </button>
          </div>

          {experiences.length > 0 ? (
            <div className="irl-grid-4">
              {experiences.map((exp) => (
                <button
                  key={exp.id}
                  className="irl-card"
                  onClick={() => onNavigate("local-experience", { experience_id: exp.id })}
                >
                  <div className="irl-card-img">
                    <ImgWithFallback
                      src={exp.images?.[0] || "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=700&q=80&auto=format&fit=crop"}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="irl-card-badge aqua">{exp.category}</span>
                  </div>
                  <div className="irl-card-body">
                    <div className="irl-card-title">{exp.title}</div>
                    <div className="irl-card-meta">
                      <span><MapPin size={12} />{exp.city?.name || exp.address || "Иссык-Куль"}</span>
                      {exp.duration_minutes && <span><Clock size={12} />{exp.duration_minutes} {t("common.minutes")}</span>}
                    </div>
                    <div className="irl-price">
                      {exp.price.toLocaleString()} {t("common.currency")}
                      <small> / {t("common.person")}</small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="irl-exp-grid">
              {EXPERIENCE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.title} className="irl-exp-card" onClick={() => onNavigate("experiences")}>
                    <span className="irl-exp-icon" style={{ background: cat.bg, color: cat.color }}>
                      <Icon size={21} />
                    </span>
                    <strong>{cat.title}</strong>
                    <span>{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* TOURS */}
      <section className="irl-section">
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><RouteIcon size={12} />{t("landing.toursEyebrow")}</span>
              <h2>{t("landing.toursTitle")}</h2>
              <p>{t("landing.toursDesc")}</p>
            </div>
            <button className="irl-link" onClick={() => onNavigate("routes")}>
              {t("landing.viewAll")} <ArrowRight size={15} />
            </button>
          </div>
          {loading ? (
            <div className="irl-empty">{t("landing.loading")}</div>
          ) : tours.length === 0 ? (
            <div className="irl-empty">{t("landing.empty.tours")}</div>
          ) : (
            <div className="irl-grid-3">
              {tours.map((tour) => (
                <button
                  key={tour.id}
                  className="irl-card"
                  onClick={() => onNavigate("tour", { tour_id: tour.id })}
                >
                  <div className="irl-card-img">
                    <ImgWithFallback
                      src="https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=700&q=80&auto=format&fit=crop"
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="irl-card-price">{tour.price.toLocaleString()} {t("common.currency")}</span>
                  </div>
                  <div className="irl-card-body">
                    <div className="irl-card-title">{tour.title}</div>
                    <div className="irl-card-meta">
                      <span><Clock size={12} />{tour.duration_days} {tour.duration_days === 1 ? t("common.day") : t("common.days")}</span>
                      <span><Users size={12} />{t("common.upTo")} {tour.max_guests} {t("common.people")}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="irl-section" style={{ background: "#ffffff" }}>
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><Star size={12} />{t("landing.reviewsEyebrow")}</span>
              <h2>{t("landing.reviewsTitle")}</h2>
            </div>
          </div>
          <div className="irl-grid-3">
            {TESTIMONIALS.map((review) => (
              <div className="irl-review" key={review.name}>
                <div className="irl-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--sand-400)" stroke="var(--sand-400)" />
                  ))}
                </div>
                <p className="irl-quote">“{review.text}”</p>
                <div className="irl-reviewer">
                  <span className="irl-avatar">{review.name.split(" ").map((w) => w[0]).join("")}</span>
                  <div>
                    <strong>{review.name}</strong>
                    <span>{review.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="irl-section">
        <div className="irl-container">
          <div className="irl-section-head">
            <div>
              <span className="irx-eyebrow"><Shield size={12} />{t("landing.benefitsEyebrow")}</span>
              <h2>{t("landing.benefitsTitle")}</h2>
              <p>{t("landing.benefitsDesc")}</p>
            </div>
          </div>
          <div className="irl-benefits">
            {[
              { icon: Shield, title: "Проверенные партнёры", desc: "Каждый объект проходит модерацию и проверку документов." },
              { icon: BadgeCheck, title: "Безопасное бронирование", desc: "Прозрачные условия, подтверждение и защита платежей." },
              { icon: Headphones, title: "Поддержка 24/7", desc: "Помогаем до, во время и после поездки — на русском и кыргызском." },
              { icon: Compass, title: "Локальные эксперты", desc: "Впечатления и маршруты от людей, которые живут на Иссык-Куле." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="irl-benefit" key={item.title}>
                  <span className="irl-benefit-icon"><Icon size={20} /></span>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <div className="irl-business-wrap">
        <div className="irl-business">
          <div className="irl-business-inner">
            <span className="irx-eyebrow" style={{ color: "var(--sand-300)" }}>{t("landing.businessEyebrow")}</span>
            <h2>{t("landing.businessTitle")}</h2>
            <p>{t("landing.businessDesc")}</p>
            <div className="irl-business-feats">
              {["Бесплатное размещение", "Свой календарь брони", "Аналитика и доходы", "Верификация бизнеса"].map((feat) => (
                <span className="irl-business-feat" key={feat}><CheckCircle size={14} />{feat}</span>
              ))}
            </div>
            <div className="irl-business-actions">
              <button className="irx-btn irx-btn-light" onClick={() => onNavigate("add-listing")}>
                {t("landing.businessCta")}
              </button>
              <button className="irx-btn irx-btn-outline" onClick={() => onNavigate("pricing")}>
                {t("landing.businessSecondary")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="irl-footer">
        <div className="irl-footer-grid">
          <div>
            <div className="irl-footer-brand">
              <img src={logotip} alt="" className="irl-footer-brand-mark" />
              <span className="irl-footer-brand-name">Issyk<em>Relax</em></span>
            </div>
            <p className="irl-footer-desc">{t("landing.footerTagline")}</p>
            <div className="irl-langs">
              {(["ru", "ky", "en"] as const).map((code) => (
                <button
                  key={code}
                  className={`irl-lang ${locale === code ? "active" : ""}`}
                  onClick={() => setLocale(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="irl-footer-col-title">{t("landing.footerTravelers")}</div>
            {[
              { label: "Жильё", page: "search" },
              { label: "Впечатления", page: "experiences" },
              { label: "Маршруты", page: "routes" },
              { label: "Транспорт", page: "transports" },
              { label: "AI-планировщик", page: "planner" },
              { label: "Карта", page: "map" },
            ].map((link) => (
              <button key={link.label} className="irl-footer-link" onClick={() => onNavigate(link.page)}>
                {link.label}
              </button>
            ))}
          </div>

          <div>
            <div className="irl-footer-col-title">{t("landing.footerOwners")}</div>
            {[
              { label: "Разместить объект", page: "add-listing" },
              { label: "Стать хозяином впечатлений", page: "local-host-dashboard" },
              { label: "Тарифы", page: "pricing" },
              { label: "Панель управления", page: "owner-dashboard" },
            ].map((link) => (
              <button key={link.label} className="irl-footer-link" onClick={() => onNavigate(link.page)}>
                {link.label}
              </button>
            ))}
          </div>

          <div>
            <div className="irl-footer-col-title">{t("landing.footerCompany")}</div>
            {[
              { label: "О нас", page: "about" },
              { label: "Контакты", page: "feedback" },
              { label: "FAQ", page: "faq" },
              { label: t("landing.privacy"), page: "privacy" },
              { label: t("landing.terms"), page: "terms" },
            ].map((link) => (
              <button key={link.label} className="irl-footer-link" onClick={() => onNavigate(link.page)}>
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="irl-footer-bottom">
          <span>© {new Date().getFullYear()} IssykRelax. {t("landing.rights")}.</span>
          <div className="irl-footer-bottom-links">
            <button className="irl-footer-bottom-link" onClick={() => onNavigate("privacy")}>{t("landing.privacy")}</button>
            <button className="irl-footer-bottom-link" onClick={() => onNavigate("terms")}>{t("landing.terms")}</button>
            <button className="irl-footer-bottom-link" onClick={() => onNavigate("faq")}>{t("landing.faq")}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
