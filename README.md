# Private Study App

A private, ad-free study platform designed for one learner, with a flexible library that can grow beyond medical terminology into languages, English, mathematics, science, and more.

> The product name is intentionally undecided. This repository name is temporary.

## First release

- Library organized into subjects and study sets
- Flexible term/definition and question/answer cards
- Individual and bulk card editing
- Paste-based import with duplicate review before changes are applied
- Flashcards and configurable quizzes
- Per-card and per-set progress tracking
- Responsive dark forest-inspired interface
- Private authentication and row-level database security before any real data is stored

## Planned study modes

1. Flashcards
2. Adaptive Learn
3. Match
4. Quiz
5. Write
6. Word Builder
7. Challenge
8. Progress & Review

The first build focuses on the core library, card editor, safe import flow, flashcards, and a basic quiz. The remaining modes are planned follow-up phases.

## Tech stack

- React + Vite
- Supabase Auth and Postgres for private cloud data
- Cloudflare Pages for hosting
- PWA/offline support is a later phase

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Create a local `.env` file from `.env.example` when Supabase is configured. Never put a Supabase service-role key or other secret in frontend code.

## Security and privacy

- This repository must remain private.
- No public sign-up or public sharing is planned.
- Never commit real study records, passwords, API keys, or production secrets.
- Database tables exposed through the Supabase Data API must have row-level security enabled and ownership-aware policies.
- Existing Supabase projects are not used by this app. A separate project will be configured for it.

## Product specification

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the full feature plan and phased roadmap.
