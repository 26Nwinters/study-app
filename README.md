# Private Study App

A private, ad-free study platform designed for one learner, with a flexible library that can grow beyond medical terminology into languages, English, mathematics, science, and more.

> The product name is intentionally undecided. This repository name is temporary.

## First release goals

- Library organized into subjects and study sets
- Flexible term/definition and question/answer cards
- Individual and bulk card editing
- Paste-based import with duplicate review before changes are applied
- Flashcards and configurable quizzes
- Per-card and per-set progress tracking
- Responsive dark forest-inspired interface
- Local persistence and export/backup before any real study data is relied on

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

## Cost rule

**Hard limit: $0 spending.** Do not create cloud projects, paid resources, paid trials, usage-based services, or hosting resources. Do not upgrade plans or enable billing. If a step has any possibility of causing a charge, stop and discuss it first.

For now, develop and test locally. The app is a prototype, and its current sample data is not permanent. Cloud sync and remote hosting are deferred unless a genuinely no-charge approach can be established without exposing the user to billing risk.

## Tech stack

- React + Vite
- Browser-based development and local testing
- A future backend is not configured
- PWA/offline support is a later phase

## Local development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Security and privacy

- This repository must remain private.
- No public sign-up or public sharing is planned.
- Never commit real study records, passwords, API keys, or production secrets.
- Keep local environment files out of Git.
- Do not store real study data remotely until privacy, access control, backups, and costs have been reviewed.

## Product specification

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the full feature plan and phased roadmap.
