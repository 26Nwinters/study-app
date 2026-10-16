# Private Study App

A private, ad-free study platform for one learner. It starts with medical terminology and can grow into English, mathematics, languages, science, and other subjects.

The product name is intentionally undecided. This repository name is temporary.

## What is implemented in the current local-first build

- Subject and study-set library with search and subject filtering
- Create, edit, archive, restore, duplicate, export, and delete sets
- Flexible cards for terms, questions, equations, fill-in-the-blank prompts, word parts, multi-step problems, and long answers
- Individual card editing, selection, bulk deletion, and bulk add
- Paste-based import using tab, `::`, or ` = ` separators
- Import review that classifies new terms, duplicates, and changed definitions; each row must be approved or skipped before changes are applied
- Flashcards, typed recall, quiz, matching, word-part review, challenge practice, and progress history
- Per-card correctness, mastery estimate, last studied date, next review date, and a review queue
- Local browser persistence, JSON backup/restore, and text export
- Supabase email/password sign-in with cloud sync and a user-owned JSON data row protected by Row Level Security
- Responsive dark forest-inspired interface with no ads

## Important current limitations

- The app now connects to the dedicated `Study-App` Supabase project for authenticated cloud sync and keeps a local browser copy. Export backups regularly. If sync reports an error, keep the local copy until sync is restored.
- Starter cards are examples and should be replaced with the learner's actual course material.
- The Learn, Match, Quiz, Write, Word Builder, and Challenge modes are functional foundations, not yet a polished adaptive learning engine. Matching and spelling evaluation can be improved.
- Photo OCR, document import, audio, diagram labeling, advanced math checking, cross-device sync, and PWA installation are not implemented yet.
- The repository being private does not automatically make a deployed website private. Do not deploy this app publicly with real learner data until authentication and access controls are implemented and reviewed.

## Authentication and cloud sync

- The app provides sign-in only. It does not provide public account creation.
- In Supabase Dashboard, open Authentication → Users and create the learner account manually. Use that email and password on the app sign-in screen.
- In Authentication settings, disable public sign-ups if the project will be reachable by anyone other than the learner.
- The `study_user_data` table stores one JSONB document per authenticated user. Row Level Security restricts every row to its owner, and `anon` has no table privileges.
- Cloud sync is debounced and local browser storage remains available as a fallback. Export a JSON backup before major changes.
- The project URL and `sb_publishable_...` key in `src/lib/supabase.js` are public client configuration, not secrets. Never replace them with a service-role or secret key.
- Cloud sync is connected in code, but a full production build and end-to-end login/sync test have not yet been run in this environment.

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite. `npm run build` creates a production build in `dist/`; `npm run preview` previews that build locally.

## Cost rule

**Avoid charges at all costs.** Prefer free local tools and services. If a proposed step might incur a charge, stop before taking it and find a free alternative. Do not knowingly create paid resources, start trials, upgrade plans, enable billing, or deploy to a service without checking the specific cost and access implications first.

The dedicated Supabase project already exists. The app uses only its browser-safe project URL and publishable key; no service-role or secret key is included. The current setup uses the existing project and does not create hosting resources. Supabase free-tier quotas and account-level billing conditions still apply.

## Security and privacy

- Keep this repository private.
- Never commit passwords, real learner records, API keys, or production secrets.
- Do not put service-role keys or private secrets in browser code.
- No public sign-up or public sharing is planned.
- Back up local study data before clearing browser storage or changing devices.

## Product specification

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the complete product requirements and roadmap.
