# IssykRelax вЂ” РґРµРїР»РѕР№

## РЎС‚СЂСѓРєС‚СѓСЂР°
- `frontend/` вЂ” React SSR-РїСЂРёР»РѕР¶РµРЅРёРµ (Vite)
- `backend/` вЂ” FastAPI (Python)
- `docker-compose.yml` вЂ” РїРѕР»РЅС‹Р№ СЃС‚РµРє (PostgreSQL, Redis, backend, frontend)

## Р’Р°СЂРёР°РЅС‚ 1: Docker (СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ)
```bash
cp .env.example .env
# РѕС‚СЂРµРґР°РєС‚РёСЂСѓР№С‚Рµ СЃРµРєСЂРµС‚С‹ РІ .env
docker-compose up -d --build
```
РџРѕСЃР»Рµ Р·Р°РїСѓСЃРєР°: frontend http://localhost:3000, backend http://localhost:8000.

## Р’Р°СЂРёР°РЅС‚ 2: Р СѓС‡РЅРѕР№ Р·Р°РїСѓСЃРє

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate ; Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # РёР»Рё Р·Р°РґР°Р№С‚Рµ РїРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ
alembic upgrade head
python scripts/seed_roles.py
python scripts/seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run build
NODE_ENV=production node server/index.mjs
```
Dev-СЂРµР¶РёРј: `npm run dev:ssr`.

## РџРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ (backend)
- `DATABASE_URL` вЂ” PostgreSQL async URL
- `REDIS_URL` вЂ” Redis URL
- `SECRET_KEY` вЂ” СЃРµРєСЂРµС‚ JWT (СЃРјРµРЅРёС‚Рµ!)
- `CORS_ORIGINS` вЂ” СЂР°Р·СЂРµС€С‘РЅРЅС‹Рµ origin

## РЎС‚Р°С‚РёС‡РµСЃРєРёР№ РґРµРїР»РѕР№ С„СЂРѕРЅС‚РµРЅРґР°
РЎРѕР±СЂР°РЅРЅС‹Р№ `frontend/dist` РјРѕР¶РЅРѕ СЂР°Р·РґР°С‚СЊ РєР°Рє СЃС‚Р°С‚РёРєСѓ (Nginx/Vercel/Netlify).
Р’СЃРµ РјР°СЂС€СЂСѓС‚С‹ РґРѕР»Р¶РЅС‹ РѕС‚РґР°РІР°С‚СЊ `index.html` (SPA fallback).

## Р”РµРјРѕ-Р°РєРєР°СѓРЅС‚С‹ (РїРѕСЃР»Рµ seed)
- admin@issykrelax.kg / admin123
- owner@issykrelax.kg / owner123
- user@issykrelax.kg / user123
- local@issykrelax.kg / local123
- guide@issykrelax.kg / guide123
- driver@issykrelax.kg / driver123

## Деплой на Render (бесплатный)

1. Загрузите репозиторий на GitHub (папка IssykRelax-Ready).
2. В Render: New -> Blueprint -> выберите репозиторий. Render прочитает ender.yaml и создаст БД + 2 сервиса.
3. После создания фронтенда URL будет https://issykrelax-frontend.onrender.com. Если имя сервиса другое — обновите VITE_API_URL и API_INTERNAL_URL в настройках фронтенда и CORS_ORIGINS в backend.
4. Redis (опционально): создайте бесплатную БД на Upstash, скопируйте URL в env REDIS_URI backend-сервиса. Без Redis кеш/лимиты не работают, но API запустится (rate-limiter может падать на запросах — в таком случае оставьте REDIS_URI пустым и отключите rate-limit в коде).
5. Первый запуск автоматически применит миграции и загрузит seed-данные (демо-аккаунты из DEPLOY.md).
6. Внимание: бесплатные web-сервисы Render "засыпают" после 15 минут бездействия; первый запрос после сна занимает ~30-60 сек.
