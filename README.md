# Ideas Vault

A Next.js app for capturing startup ideas and reviewing AI research on them. Auth and captures are backed by Supabase. Media is extracted to text, then a research packet is generated on the server with OpenAI or Gemini.

## What’s working

- Email sign up and sign in, with a dedicated check-email screen after confirmation is required
- Google OAuth sign-in (enable the Google provider in Supabase Auth)
- Sign in with Apple button in the UI (not wired yet)
- Password reset and update-password flows
- Signed-in account menu (initials avatar) with Profile, Settings, and log out
- Profile: view email and join date; edit first and last name
- Text, voice, and snapshot capture all go through one draft first: trimmed title + description (the text a processing service can use), plus an optional normalized file
- Text capture: title + description persist to `public.ideas` (RLS so each user only sees their own rows)
- Voice capture: record in the browser, store the file in a private Storage bucket, then transcribe it with the configured AI provider
- Snapshot capture: upload or drop a JPEG/PNG/WebP (compressed to JPEG) or a simple PDF, store in the same bucket, then extract text with the configured AI provider
- Vault list and idea detail, including extracted text from voice/photo/PDF, loading and client-safe error copy
- Soft archive / restore (`archived_at`): archived ideas leave the vault for `/archive` but still count toward the free-plan idea limit
- After extract, Free research is a high-level snapshot. Pro plans with the text model, investigates with `gpt-6-astra` + web search, then synthesizes a working brief from those findings
- Pricing at `/pricing`: Free (3 ideas, archived included) or Pro ($15/mo or $180/year) via Stripe Checkout; Settings can open the Stripe billing portal
- Auth redirects preserve `?next=` (for example pricing → sign up → return to pricing)
- Protected app routes (`/vault`, `/archive`, `/digest`, `/board`, `/profile`, `/settings`, `/ideas`, `/update-password`)

## Not yet

- Weekly Digest and Board (placeholder screens)
- Co-founder matching based on complementary idea interests (listed on Pro pricing)
- Sign in with Apple (UI only)

## Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS and shadcn / Base UI
- Supabase Auth (`@supabase/ssr`) and Postgres
- Stripe Checkout + Customer Portal
- OpenAI or Gemini for extract / research

## Setup

### 1. Environment

Copy `.env.example` to `.env.local`.

```
NEXT_SUPABASE_URL=your-project-url
NEXT_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_SUPABASE_SECRET_KEY=your-service-role-key

APP_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_MONTHLY=price_monthly
STRIPE_PRICE_YEARLY=price_yearly

AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
OPENAI_TEXT_MODEL=gpt-6-luna
OPENAI_ASTRA_MODEL=gpt-6-astra
OPENAI_EXTRACT_MODEL=gpt-6-luna
OPENAI_TRANSCRIBE_MODEL=whisper-1

GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-3.8-flash
```

These names are used because some hosts block `NEXT_PUBLIC_*`. The app also accepts `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as a fallback.

The browser client uses the **publishable** (anon) key. `NEXT_SUPABASE_SECRET_KEY` is the service role key and is only used on the server to write `profiles.plan` after Stripe events. `SUPABASE_SERVICE_ROLE_KEY` is accepted as a fallback name. Never prefix Stripe or service-role keys with `NEXT_PUBLIC_`.

`OPENAI_API_KEY` and `GEMINI_API_KEY` stay on the server. Do not prefix them with `NEXT_PUBLIC_`. Default `AI_PROVIDER` is `openai`. Snapshot and PDF extract use `OPENAI_EXTRACT_MODEL` (`gpt-6-luna`). Free snapshots, the Pro research plan, and the Pro brief synthesis use `OPENAI_TEXT_MODEL` (`gpt-6-luna`). Pro investigation uses `OPENAI_ASTRA_MODEL` (`gpt-6-astra`) with the Responses API and built-in web search. Voice still uses Whisper. Set `AI_PROVIDER=gemini` to use Google AI Studio for extract, Free research, the Pro plan, and synthesis; Astra investigation still needs `OPENAI_API_KEY`. Restart the dev server after changing it.

### Stripe

1. In Stripe, create a product (for example “Ideas Vault Pro”) with a **$15 / month** price and a **$180 / year** price. Copy those Price IDs into `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`.
2. Enable the Customer Portal (subscription cancel/update) in the Stripe Dashboard.
3. Put the secret key in `STRIPE_SECRET_KEY` (test mode is `sk_test_…`).
4. For local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted
```

Paste the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`. After Checkout, Settings also confirms the session so Pro can unlock even if the listener is not running.

### Supabase Auth (Google)

1. In Google Cloud, create OAuth credentials and add the authorized redirect URI from Supabase (Authentication → Providers → Google).
2. Enable Google in the Supabase dashboard and paste the client ID / secret.
3. Add `http://localhost:3000/auth/callback` (and your production callback) under Auth URL configuration if needed.

### 2. Database

In the Supabase SQL Editor, run in order:

1. `supabase/migrations/20260916234500_create_ideas.sql` — `public.ideas` with row-level security
2. `supabase/migrations/20260918133300_idea_media_bucket.sql` — private `idea-media` Storage bucket (audio, images, PDFs) and policies
3. `supabase/migrations/20260930211500_profiles_and_free_idea_limit.sql` — `public.profiles` plus a 3-idea cap on the free plan
4. `supabase/migrations/20261002184500_idea_archive.sql` — `archived_at` on ideas; free limit still counts active + archived
5. `supabase/migrations/20261013143000_idea_research_depth.sql` — `research_depth` plus Pro risks, segments, and why now
6. `supabase/migrations/20261013234500_pro_deep_research.sql` — Pro questions, areas, opportunities, assumptions, sources
7. `supabase/migrations/20261014010000_pro_investigation.sql` — Astra investigation status and per-question findings

Confirm email in the Auth settings if you want the post-signup confirmation screen to apply.

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
