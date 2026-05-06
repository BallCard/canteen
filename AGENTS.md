# Project Instructions

## Product Direction
- Build a generic campus canteen assistant, not a Zhejiang University-only product.
- UI copy should prefer "校园", "食堂", "同学", "社区" and generic canteen names such as "一食堂", "二食堂", "三食堂".
- Zhejiang University background may inspire the demo, but it should not be the visible product boundary.

## Active Code Paths
- Active frontend: `frontend_react/`
- Active backend: `backend/`
- Legacy or reference-only code: root `src/`, root `server.ts`, and `frontend/`.
- Do not implement new product behavior in legacy paths unless explicitly requested.

## Frontend Conventions
- Use React + Vite + TypeScript in `frontend_react/`.
- API calls should go through `frontend_react/src/services/api.ts` when practical.
- Keep user-facing flows complete: loading, empty, error, success, and disabled states.
- For demo-only integrations, show clear simulated states instead of pretending to call real platform SDKs.

## Backend Conventions
- Use FastAPI modules under `backend/routers/`.
- Keep demo data in `backend/data.py` unless a real persistence layer is explicitly introduced.
- API responses should stay stable for frontend pages. If a field is renamed, update both sides in the same change.
- Secrets such as API keys must stay in environment variables and never be committed.

## Verification
- After frontend changes, run `npm run lint` from `frontend_react/`.
- After backend changes, run Python syntax checks for touched backend files.
- If a command cannot be run, report the reason and the residual risk.

## Git
- Commit messages should be concise English.
- Do not push unless the user explicitly asks.
