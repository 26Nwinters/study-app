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
- Responsive dark forest-inspired interface with no ads

## Important current limitations

- Data stays in the current browser on the current device. There is no account system or cloud sync yet. Clearing browser data can erase study data, so export backups regularly.
- Starter cards are examples and should be replaced with the learner's actual course material.
- The Learn, Match, Quiz, Write, Word Builder, and Challenge modes are functional foundations, not yet a polished adaptive learning engine. Matching and spelling evaluation can be improved.
- Photo OCR, document import, audio, diagram labeling, advanced math checking, cross-device sync, and PWA installation are not implemented yet.
- The repository being private does not automatically make a deployed website private. Do not deploy this app publicly with real learner data until authentication and access controls are implemented and reviewed.

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite. `npm run build` creates a production build in `dist/`; `npm run preview` previews that build locally.

## Cost rule

**Avoid charges at all costs.** Prefer free local tools and services. If a proposed step might incur a charge, stop before taking it and find a free alternative. Do not knowingly create paid resources, start trials, upgrade plans, enable billing, or deploy to a service without checking the specific cost and access implications first.

No cloud project or hosting resource is configured for this app. The unused Supabase client dependency is intentionally excluded until a free, safe sync approach is evaluated.

## Security and privacy

- Keep this repository private.
- Never commit passwords, real learner records, API keys, or production secrets.
- Do not put service-role keys or private secrets in browser code.
- No public sign-up or public sharing is planned.
- Back up local study data before clearing browser storage or changing devices.

## Product specification

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the complete product requirements and roadmap.
