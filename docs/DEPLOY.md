# Redline Installers — Netlify Deployment Guide

Single source of truth for deploying this monorepo to Netlify.

---

## 1. Architecture Overview

One GitHub repository hosts two independent Netlify sites, each built from a different base directory.

```
redline/                        <- GitHub repo root
  netlify.toml                  <- Site 1 config (Astro frontend)
  src/                          <- Astro source
  dist/                         <- Astro build output (publish dir)
  admin/
    netlify.toml                <- Site 2 config (Next.js admin)
    src/                        <- Next.js source
    .next/                      <- Next.js build output (publish dir)
```

| Site | Framework | Netlify Base Dir | Domain |
|------|-----------|-----------------|--------|
| Frontend | Astro 6 (static SSG) | *(repo root)* | redlineinstallers.com |
| Admin | Next.js 15 (SSR + API routes) | `admin` | admin.redlineinstallers.com |

The frontend is pure static HTML/CSS/JS — no server, no adapter. It POSTs lead forms to the admin site's API routes over HTTPS.

The admin site runs as a serverless Node.js app via `@netlify/plugin-nextjs`, handling authentication, MongoDB reads/writes, and Resend email dispatch.

---

## 2. Prerequisites

- GitHub account with this repo pushed
- Netlify account (free tier is sufficient)
- MongoDB Atlas account (free M0 cluster is sufficient for production start)
- Resend account with domain verified (redlineinstallers.com)

---

## 3. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a new project named `redline`.
2. Create a free M0 cluster. Region: closest to US East (N. Virginia recommended).
3. In **Database Access**, create a new database user:
   - Username: `redline-prod`
   - Password: generate a strong random password, save it
   - Role: `readWriteAnyDatabase`
4. In **Network Access**, add IP `0.0.0.0/0` (allow from anywhere). Netlify does not have fixed outbound IPs, so this is required.
5. In the cluster view, click **Connect > Drivers**. Copy the connection string. It looks like:
   ```
   mongodb+srv://redline-prod:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password from step 3. Add the database name before the `?`:
   ```
   mongodb+srv://redline-prod:<password>@cluster0.xxxxx.mongodb.net/redline?retryWrites=true&w=majority
   ```
   This is your `MONGODB_URI` value.

---

## 4. Resend Setup

1. Go to https://resend.com and create an account.
2. In **Domains**, add `redlineinstallers.com`. Follow the DNS verification steps (add TXT and MX records at your DNS provider).
3. Once verified, go to **API Keys** and create a key named `redline-prod`. Copy it — this is your `RESEND_API_KEY`.
4. The `from` address used in code is `leads@redlineinstallers.com`. Verify this sender is covered by your verified domain (it is, since the domain is verified).

---

## 5. Site 1: Frontend (Astro)

### Create the Netlify site

1. In Netlify dashboard, click **Add new site > Import an existing project**.
2. Connect to GitHub and select the `redline` repository.
3. On the build settings screen:
   - **Base directory**: leave empty (repo root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: will be picked up from `netlify.toml` (`NODE_VERSION = "22"`)
4. Click **Deploy site**. The first build may fail if env vars are not yet set — that is expected.

### Environment variables

In the Netlify site dashboard go to **Site configuration > Environment variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `PUBLIC_API_URL` | `https://admin.redlineinstallers.com` | Set after admin site is deployed and domain assigned. Use the `.netlify.app` URL as a placeholder initially. |

The frontend Astro site has no server-side secrets. Any `PUBLIC_*` variable is inlined at build time.

### Deploy settings

- **Branch to deploy**: `main`
- **Auto-publish**: enabled (deploys on every push to `main`)

---

## 6. Site 2: Admin (Next.js)

> **Critical:** Use **Base directory** (under Build settings), NOT the monorepo "Package path" feature.
> When Base directory is set to `admin`, Netlify reads `admin/netlify.toml` first and uses it exclusively.
> If you use Package path / monorepo mode instead, Netlify reads the root `netlify.toml` and the build will fail with a wrong publish directory error.

### Create the Netlify site

1. In Netlify dashboard, click **Add new site > Import an existing project**.
2. Connect to GitHub and select the same `redline` repository.
3. On the build settings screen:
   - **Base directory**: `admin` — type this in the "Base directory" field under Build settings
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: will be picked up from `admin/netlify.toml`
4. Netlify will detect `@netlify/plugin-nextjs` from `admin/netlify.toml` and install it automatically.
5. Click **Deploy site**.

### If the site was already created with wrong settings

If the site was created with monorepo Package path instead of Base directory:

1. Go to **Site configuration → Build & deploy → Build settings**
2. Set **Base directory** to `admin`
3. Set **Publish directory** to `.next`
4. Set **Build command** to `npm run build`
5. Click **Save**, then trigger a new deploy from **Deploys → Trigger deploy**

### Environment variables

In **Site configuration > Environment variables** add all of the following:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://redline-prod:<pw>@...` | From Atlas setup step 6 |
| `JWT_SECRET` | 64-char random string | Run `openssl rand -hex 32` locally to generate |
| `RESEND_API_KEY` | `re_...` | From Resend dashboard |
| `ADMIN_EMAIL` | `jk@redlineinstallers.com` | Login username for admin panel |
| `ADMIN_PASSWORD` | strong password | Do not reuse dev password in production |
| `ALLOWED_ORIGIN` | `https://redlineinstallers.com` | Must match frontend domain exactly, no trailing slash |

**Important:** Never commit these values to git. They must only exist in Netlify's environment variable UI.

### Deploy settings

- **Base directory**: `admin` (critical — must match)
- **Branch to deploy**: `main`
- **Auto-publish**: enabled

---

## 7. Custom Domains

### Frontend: redlineinstallers.com

1. In the Netlify frontend site, go to **Domain management > Add a domain**.
2. Enter `redlineinstallers.com` and click **Verify**.
3. At your DNS registrar, add/update records:
   - `A` record: `@` -> Netlify load balancer IP (shown in UI, typically `75.2.60.5`)
   - `CNAME` record: `www` -> `<your-site-name>.netlify.app`
4. In Netlify, also add `www.redlineinstallers.com` and set it to redirect to the apex domain.
5. SSL is provisioned automatically via Let's Encrypt once DNS propagates (up to 48 hours).

### Admin: admin.redlineinstallers.com

1. In the Netlify admin site, go to **Domain management > Add a domain**.
2. Enter `admin.redlineinstallers.com`.
3. At your DNS registrar, add:
   - `CNAME` record: `admin` -> `<your-admin-site-name>.netlify.app`
4. SSL provisioned automatically.

### Update ALLOWED_ORIGIN

After both custom domains are live, go back to the admin site's environment variables and confirm `ALLOWED_ORIGIN` is set to `https://redlineinstallers.com` (not the `.netlify.app` URL). Trigger a redeploy if you changed it.

---

## 8. Environment Variables Reference

### Frontend site (repo root)

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_URL` | Yes | Full URL of admin site, e.g. `https://admin.redlineinstallers.com` |

### Admin site (`admin/` directory)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | Atlas connection string including database name |
| `JWT_SECRET` | Yes | Random 32+ byte hex string for signing JWTs |
| `RESEND_API_KEY` | Yes | Resend API key, prefix `re_` |
| `ADMIN_EMAIL` | Yes | Email address used to log in to admin panel |
| `ADMIN_PASSWORD` | Yes | Password for admin panel login |
| `ALLOWED_ORIGIN` | Yes | Exact frontend origin for CORS, e.g. `https://redlineinstallers.com` |

---

## 9. Post-Deployment Checklist

Run these checks after both sites are live with custom domains.

1. **Frontend loads**: open https://redlineinstallers.com — page renders with no console errors.
2. **Quote form submits**: fill out the quote form on the frontend, submit. Verify:
   - You receive a success confirmation on-screen.
   - `jk@redlineinstallers.com` receives an admin notification email from Resend.
   - The submitter's email address receives a confirmation email.
3. **Lead appears in admin**: log in to https://admin.redlineinstallers.com with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Verify the lead from step 2 appears in the leads list.
4. **CORS is working**: if the form submission returns a CORS error in browser devtools, verify `ALLOWED_ORIGIN` matches the exact origin (scheme + domain, no trailing slash).
5. **MongoDB connected**: if leads are not saving, check Netlify function logs in the admin site dashboard under **Functions**. A connection error will appear there.
6. **SSL on both domains**: confirm both URLs load with `https://` and the padlock shows.

---

## 10. Troubleshooting

### MongoDB connection refused / timeout

- Verify `MONGODB_URI` is correct and includes the database name before `?`.
- Verify `0.0.0.0/0` is in Atlas Network Access. Netlify's outbound IPs are not static.
- Check Atlas cluster is not paused (free M0 clusters pause after 60 days of inactivity).

### CORS errors on form submission

- `ALLOWED_ORIGIN` in admin env vars must exactly match the `Origin` header sent by the browser.
- Check for trailing slash: `https://redlineinstallers.com` (no slash) vs `https://redlineinstallers.com/` (with slash). The browser sends no trailing slash.
- After changing `ALLOWED_ORIGIN`, trigger a redeploy of the admin site.

### JWT errors / 401 on admin login

- `JWT_SECRET` must be set. If it is missing or empty, all token verifications fail.
- If you rotate `JWT_SECRET`, all existing sessions are invalidated — users must log in again.

### Resend emails not delivering

- Verify the domain is confirmed in Resend dashboard (green checkmark).
- Check the `from` address in the code matches the verified domain.
- Check Netlify function logs for Resend API error responses.

### Build fails: "Cannot find module @netlify/plugin-nextjs"

- Confirm `@netlify/plugin-nextjs` is listed in `admin/package.json` devDependencies.
- Confirm `admin/netlify.toml` has the `[[plugins]]` block.
- Trigger a fresh deploy (clear cache if needed via **Deploys > Deploy settings > Clear cache and deploy**).

### Astro build fails

- Check Node version is 22 (`NODE_VERSION = "22"` in root `netlify.toml`).
- Run `npm run build` locally first to catch TypeScript or Astro errors before pushing.

---

## 11. Local Development

### Run both sites simultaneously

Open two terminals.

**Terminal 1 — Astro frontend (port 4321):**
```bash
# from repo root
npm run dev
```

**Terminal 2 — Next.js admin (port 3001):**
```bash
# from repo root
npm run dev:admin
# or equivalently:
cd admin && npm run dev
```

### Local environment files

`admin/.env.local` is gitignored. Create it locally with:

```env
MONGODB_URI=mongodb://localhost:27017/redline
JWT_SECRET=any-random-string-for-local-dev
RESEND_API_KEY=re_your_key_here
ADMIN_EMAIL=jk@redlineinstallers.com
ADMIN_PASSWORD=redlineinstallers2026
ALLOWED_ORIGIN=http://localhost:4321
```

For the frontend, create `.env.local` at repo root:

```env
PUBLIC_API_URL=http://localhost:3001
```

### Local MongoDB

Either run MongoDB locally (`mongod`) or point `MONGODB_URI` at a free Atlas cluster even for local dev. The Atlas approach avoids installing MongoDB locally.
