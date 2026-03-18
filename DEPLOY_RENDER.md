# Deploy MoneyExchange on Render

This repository now includes a Render Blueprint file at `render.yaml`.

## Why Render for this project

- Deploy backend and frontend from one repo.
- No monorepo path mismatch like `backend/frontend/package.json`.
- Easy environment variable management.

## Steps

1. Push your latest code to GitHub.
2. In Render: `New` -> `Blueprint`.
3. Select this repository (`MallamDeepak/moneyexchange`).
4. Render will detect `render.yaml` and create two services:
   - `moneyexchange-backend` (Node web service)
   - `moneyexchange-frontend` (Static site)
5. Set backend env vars before first deploy:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `SEED_USERS_PASSWORD`
   - `MAIL_SERVICE` (optional)
   - `MAIL_USER` (optional)
   - `MAIL_PASSWORD` (optional)
6. Deploy backend first.
7. Copy backend URL and set frontend env var:
   - `VITE_API_URL=https://<your-backend>.onrender.com/api`
8. Add frontend URL into backend CORS env var:
   - `FRONTEND_URLS=https://<your-frontend>.onrender.com`
   - Keep local URLs too if needed, comma-separated.
9. Redeploy both services.

## Health check

Backend should return:

- `GET /api/health` -> `{ "status": "ok" }`

## Notes

- Render free tier may sleep after inactivity.
- If you keep Vercel frontend, set `VITE_API_URL` there to Render backend `/api` URL.