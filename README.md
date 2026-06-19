# LE LABS — back-office

Admin dashboard to manage **LE LABS** projects (the `le_labs_project` table):
create / edit / delete projects, with project-image uploads to sovereign
S3-compatible storage.

- **React + Vite + TypeScript + MUI**
- **Auth:** passwordless **magic-link / OTP** by email (Supabase GoTrue)
- **Storage:** image uploads to Supabase Storage (MinIO in dev, real S3 in prod)
- Talks to Supabase **same-origin**: the app reverse-proxies `/auth/v1`,
  `/rest/v1`, `/storage/v1` to the API gateway (no CORS).

## Run it

This app is normally launched as part of the sovereign stack orchestrated by the
**[le-labs-website](../le-labs-website)** repo (clone both side by side):

```bash
# from ../le-labs-website
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
# back-office -> http://localhost:5174
```

### Standalone dev

```bash
npm install
# point at a Supabase origin (defaults to same-origin /auth|rest|storage proxy)
SUPABASE_GATEWAY_URL=http://localhost:8000 npm run dev
```

`VITE_SUPABASE_URL` (optional) targets a managed Supabase; otherwise the app uses
the current origin and relies on the dev proxy / nginx to reach the gateway.
`VITE_SUPABASE_ANON_KEY` sets the public anon key (a dev demo key is used as a
fallback).

## Scripts

```bash
npm run dev        # Vite dev server (HMR)
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Docker images

- `Dockerfile.dev` — Vite dev server (HMR)
- `Dockerfile.prod` — static build served by nginx (`docker/nginx.conf`), which
  also reverse-proxies the Supabase prefixes to the gateway.
