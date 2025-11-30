# Deployment Guide ✅

This document outlines steps to deploy the Next.js 16 application (with Supabase backend) from this repository to Vercel, Docker (self-host or cloud), or Render. It also covers setting required environment variables and running Supabase migrations.

---

## Prerequisites
- A Supabase project (for auth and DB)
- A Vercel, Render, or Docker-hosting account
- GitHub repo connected to your hosting provider (for automated deploys)
- (Optional) Supabase CLI for applying migrations

---

## Required environment variables
- NEXT_PUBLIC_SUPABASE_URL: The Supabase project URL (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: The public anon key
- SUPABASE_SERVICE_ROLE_KEY: The service_role key (server-side only)
* Optional: `NEXTAUTH_SECRET` (or any session secret if you later add session management) — keep it secret in the hosting provider.

Note: Do not commit `.env*` files to the repo. Set these in your hosting provider's environment settings (Vercel environment variables, Render environment, or runtime env in Docker).

---

## Deploying to Vercel (recommended for Next.js)
1. Sign in to Vercel and click **New Project → Import Git Repository**. Choose `No0bToProIsLive/gamified-productivity-app`.
2. Configure your build settings (Vercel usually autodetects Next.js):
   - Build Command: `npm run build`
   - Output Directory: (Vercel will detect `.next` automatically)
3. Under **Environment Variables**, add the project secrets for the `Production` environment:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key (mark as secret)
4. Deploy. If the repository is connected to Vercel, pushes to `main` will auto-deploy.

### Optional: GitHub Action to deploy to Vercel
- The repo includes `.github/workflows/deploy-to-vercel.yml` which leverages the Vercel Action. To use it, add GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_ORG_ID`.
- The workflow runs on pushes to `main` and triggers a production deployment.
   - Note: You can avoid the GitHub Action and use the Vercel official GitHub integration instead — Vercel will auto-deploy from the `main` branch.
   - For the Action to work, add these GitHub secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_ORG_ID`.
   - Optional: `NEXTAUTH_SECRET` if you're using NextAuth or similar session tokens.

---

## Deploying with Docker (Render, self-hosting, or container registry)
1. Build the Docker image:

```powershell
# in the project root
docker build -t gamified-productivity-app .
```

2. Run locally (environment variables required):

```powershell
docker run -e NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role" \
  -p 3000:3000 gamified-productivity-app
```

3. For cloud providers (e.g. Render or AWS ECS): push the image to a registry (GitHub Container Registry, Docker Hub) and configure the service to run the container with port 3000 and the environment variables.

### GitHub Actions and secrets for Docker or Render
- For pushing to GHCR (via `.github/workflows/docker-image.yml`) you can use the default `GITHUB_TOKEN` (no additional secrets required). If you're pushing to Docker Hub, add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- For Render: set `RENDER_API_KEY` in Secrets and follow Render's docs to create a new service based on the repo. Set environment variables for the service in Render's dashboard.

---

## Deploying to Render (Docker or static mode)
- Create a new Web Service on Render.
- Choose Docker deployment or a static build depending on the plan
- Use the repo and point to the Dockerfile in the project root (the repo includes a Dockerfile)
- Add required environment variables in Render's dashboard
- Deploy

---

## Supabase setup and migrations
You have an initial schema in `supabase/migrations/001_initial_schema.sql`.

**Manual SQL import (Supabase Dashboard):**
1. Create a new Supabase project in the Supabase Console.
2. In the Project Dashboard, go to `SQL Editor` and run the SQL in `supabase/migrations/001_initial_schema.sql` to setup the initial tables.
3. In the Project Settings → API, copy the `Project URL` and `anon/public` key and add to your hosting's environment variables.
4. In Project Settings → API → Service Key, copy `SERVICE_ROLE_KEY` and set in the hosting provider as server-only secret.

**Using Supabase CLI (optional):**
- Install: `npm install -g supabase` or follow instructions at https://supabase.com/docs/guides/cli
- Login: `supabase login`
- Follow CLI docs for pushing local migrations or running SQL on the project.

---

## Auth redirects and callbacks
Make sure to configure Supabase Auth redirect URLs to match your deployed URL. Add these in Supabase Dashboard → Authentication → Settings → Redirect URLs.
- Example: `https://<your-domain>/auth/callback` and `http://localhost:3000/auth/callback` for local dev

---

## Local Development
- Create a `.env.local` file with the variables mentioned above (local only).
- Run locally: `npm ci` then `npm run dev`

---

## Notes & Tips 💡
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server environments; never expose it to the client.
- Ensure the Supabase project’s CORS settings are configured to allow your production domain.
- Check Vercel logs if middleware or edge functions fail; Next.js middleware can cause runtime errors if env vars are missing.

---

If you want, I can:
- Add a `docker-compose.yml` to support local integration between the Next.js app and a Supabase (or local stack), or
- Configure a Render/Netlify/Terraform deployment pipeline and a more robust GitHub Actions workflow (e.g., building and pushing to a registry).

Tell me which target you prefer (Vercel / Render / Docker) and I’ll finish any additional action steps (like adding a `docker-compose.yml`, or improving the GitHub Actions workflow).