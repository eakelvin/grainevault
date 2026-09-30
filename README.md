# Ideas Vault

A Next.js app for capturing startup ideas and reviewing AI research on them. Auth and captures are backed by Supabase. Media is extracted to text, then a research packet is generated on the server with OpenAI or Gemini.

## What’s working

- Email sign up and sign in, with a dedicated check-email screen after confirmation is required
- Password reset and update-password flows
- Signed-in account menu (initials avatar) with Profile, Settings, and log out
- Profile: view email and join date; edit first and last name
- Text, voice, and snapshot capture all go through one draft first: trimmed title + description (the text a processing service can use), plus an optional normalized file
- Text capture: title + description persist to `public.ideas` (RLS so each user only sees their own rows)
- Voice capture: record in the browser, store the file in a private Storage bucket, then transcribe it with the configured AI provider
- Snapshot capture: upload or drop a JPEG/PNG/WebP (compressed to JPEG) or a simple PDF, store in the same bucket, then extract text with the configured AI provider
- Vault list and idea detail, including extracted text from voice/photo/PDF, loading and client-safe error copy
- After extract, OpenAI research uses the Responses API with web search to fill readiness score, TAM, competitors, growth, tags, and an action plan
- Protected app routes (`/vault`, `/digest`, `/board`, `/profile`, `/settings`, `/ideas`, `/update-password`)

## Not yet

- Weekly Digest and Board (placeholder screens)

## Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS and shadcn / Base UI
- Supabase Auth (`@supabase/ssr`) and Postgres

## Setup

### 1. Environment

Copy `.env.example` to `.env.local`.

```
NEXT_SUPABASE_URL=your-project-url
NEXT_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key
OPENAI_TEXT_MODEL=gpt-6-luna
OPENAI_EXTRACT_MODEL=gpt-6-luna
OPENAI_TRANSCRIBE_MODEL=whisper-1

GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-3.8-flash
```

These names are used because some hosts block `NEXT_PUBLIC_*`. The app also accepts `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as a fallback.

Use the **publishable** (anon) key, not the service role key.

`OPENAI_API_KEY` and `GEMINI_API_KEY` stay on the server. Do not prefix them with `NEXT_PUBLIC_`. Default `AI_PROVIDER` is `openai`. Snapshot and PDF extract use `OPENAI_EXTRACT_MODEL` (`gpt-6-luna`); research uses `OPENAI_TEXT_MODEL` (`gpt-6-luna`) with the Responses API and built-in web search; voice still uses Whisper. Set `AI_PROVIDER=gemini` to use Google AI Studio for extract and research instead. Restart the dev server after changing it.

### 2. Database

In the Supabase SQL Editor, run:

1. `supabase/migrations/20260916234500_create_ideas.sql` — `public.ideas` with row-level security
2. `supabase/migrations/20260918133300_idea_media_bucket.sql` — private `idea-media` Storage bucket (audio, images, PDFs) and policies

Confirm email in the Auth settings if you want the post-signup confirmation screen to apply.

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
