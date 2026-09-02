# Base44 Dev Environment

## Stack
- Vite + React 18 frontend (JSX), Tailwind, Radix UI.
- Uses `@base44/sdk` + `@base44/vite-plugin`. All data/auth goes through the hosted Base44 backend.

## Run
```
docker compose -f docker-compose.base44.yml up -d
```
- Web entry: host port 3000 -> container 5173 (Vite dev server).
- `node:22-alpine` image, repo bind-mounted at `/app`, `node_modules` in an anonymous volume. `npm install` runs at container start.
- Live reload is on (Vite HMR). Edits appear without rebuilds.

## Env / Secrets
- App reads `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL` via `import.meta.env` (see `src/lib/app-params.js` and `src/api/base44Client.js`).
- Vite loads these from a root `.env` file (gitignored). A placeholder `.env` exists so the frontend boots; replace the values with the real Base44 app credentials (or provide them as secrets) to get live data/auth.
- `vite.config.js` sets `server.allowedHosts: true` so the preview's external hostname is accepted.

## Verify
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the SPA HTML.
- Without real credentials the app renders its shell/auth flow but cannot load entities.

## Notes
- No local backend/DB; the Base44 SDK talks to the hosted backend. No migrations/seeds needed locally.
