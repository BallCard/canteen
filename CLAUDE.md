# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

浙大食堂助手 - A campus canteen assistant for Zhejiang University students. Full-stack web app built for Tencent PCG AI competition. Helps students decide what to eat, track nutrition, and get AI-powered recommendations.

## Commands

### Frontend (frontend_react)
```bash
npm run dev      # Start Vite dev server (port 5173, proxies /api to backend)
npm run build    # Production build
npm run lint     # TypeScript type check (tsc --noEmit)
```

### Backend
```bash
python -m backend.main              # Start backend (port 3001)
uvicorn backend.main:app --port 3001 --reload  # Dev mode with reload
```

### Root (legacy Express server)
```bash
npm run dev      # Run Express server via tsx server.ts
```

## Architecture

**Backend (FastAPI)**: Modular structure with clear separation:
- `backend/main.py` - Entry point, CORS, router registration
- `backend/routers/` - API route handlers (canteens, dishes, reviews, meal_logs, users, recommendations, chat)
- `backend/services/` - Business logic (recommendation algorithm, nutrition calculation, AI integration)
- `backend/data.py` - In-memory data store (dishes, canteens, reviews) - no database for demo phase

**Frontend (React)**:
- `frontend_react/src/App.tsx` - Router setup with 8 routes, bottom navigation for 4 main tabs
- `frontend_react/src/pages/` - Page components (Index, Menu, DishDetail, Recommend, Nutrition, Profile, CanteenMap, Favorites)
- `frontend_react/src/services/api.ts` - API client with fallback mock data when backend unavailable
- `frontend_react/vite.config.ts` - Proxy config: `/api` → `localhost:3001`

**AI Integration**: Uses DeepSeek API (not Tencent Hunyuan as originally planned) for generating recommendation reasons. Fallback reasons hardcoded when API unavailable.

## Environment Variables

- `DEEPSEEK_API_KEY` - For AI recommendation reasons
- `PORT` - Backend port (default 3001)

## Key Routes

| Route | Page | Tab |
|-------|------|-----|
| `/` | Index (canteen list + recommendations) | 首页 |
| `/menu/:canteenId` | Dish listing per canteen | - |
| `/dish/:dishId` | Dish detail with nutrition/reviews | - |
| `/recommend` | AI recommendation with preference form | 推荐 |
| `/track` | Nutrition tracking (daily intake, meal logs) | 追踪 |
| `/profile` | User profile, preferences, favorites | 我的 |
| `/map` | Canteen location map (Leaflet) | - |
| `/favorites` | User's favorite dishes | - |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Motion (framer-motion fork), react-router-dom 7 |
| Maps | Leaflet + react-leaflet |
| Icons | lucide-react |
| Backend | FastAPI (Python), uvicorn |
| AI | DeepSeek API |
| Data | In-memory Python dicts (demo mode) |

## Notes

- Project originally designed for QQ mini-program, implemented as Web SPA for competition requirements
- Backend has 24 RESTful API endpoints under `/api/`
- Frontend has fallback mock data for offline/error scenarios
- No formal requirements.txt - dependencies installed globally or via pip
- Legacy `frontend/` directory (vanilla JS/HTML) not actively used - `frontend_react/` is the active frontend