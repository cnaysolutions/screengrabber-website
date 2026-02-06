# ScreenGrabber Website - Vercel + Supabase Deployment

This is the ScreenGrabber website with authentication, ready to deploy on Vercel with Supabase.

## Tech Stack
- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT-based authentication
- **Hosting**: Vercel (free tier)

## Deployment Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
4. Go to **Settings > API** and copy:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key

### Step 2: Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
gh repo create screengrabber-website --public
git push -u origin main
```

Or push to an existing repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/screengrabber-website.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project" and select your GitHub repo
3. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `JWT_SECRET` | A random 32+ character string |

4. Click **Deploy**

### Step 4: Configure Custom Domain

1. In Vercel, go to your project > Settings > Domains
2. Add `screengrabber.cloud`
3. Update your DNS settings:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record if using apex domain

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Login button at top-right header
- ✅ User email displayed after login
- ✅ Forgot password functionality
- ✅ Pricing section with "Sign In to Upgrade"
- ✅ Shows user email in pricing when logged in
- ✅ License validation API for Chrome extension

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/license/validate` | POST | Validate license key |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

## License

© 2024 ScreenGrabber. All rights reserved.
