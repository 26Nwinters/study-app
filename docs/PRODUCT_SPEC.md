# Product Specification

## Product direction

A private, ad-free, expandable study platform inspired by useful parts of Quizlet, without depending on Quizlet's API or scraping. It starts with medical terminology but must be general-purpose. The final app name is undecided.

## Non-negotiable cost rule

- Spending limit is **$0**.
- Do not create cloud projects, hosting resources, paid trials, paid plans, or usage-based services.
- Do not enable billing or upgrade a plan.
- A quoted $0 creation cost is not proof that future use cannot incur charges.
- If a proposed step has any possibility of causing a charge, stop and explain it before proceeding.
- Develop and test locally for now. Cloud sync and remote hosting are deferred unless a genuinely no-charge approach can be established without billing risk.

## Users and privacy

- One learner account, intended for Zero; owner manages setup and content.
- No public registration, public profiles, public sets, or ads.
- The app now supports authenticated Supabase cloud sync for the single learner account, while retaining local browser persistence and JSON export.
- The `study_user_data` table has Row Level Security policies that limit reads/writes to the signed-in owner. Public/anonymous table access is revoked.
- Do not put real learner data in the app until the sign-in and sync flow has been tested end to end.
- Never expose service-role keys or secrets in browser code or Git.

## Library and organization

Hierarchy: Library → Subject/Course → Study Set → Cards.
Examples: Medical Terminology Chapters 1–12; English Vocabulary/Grammar; Algebra Formulas; Biology Exam Review.
- Search/filter sets and cards; tags, archive, delete.
- Combine sets into sessions without duplicating stored cards.
- Individual and bulk card editing.
- Card types: term/definition, question/answer, equation/solution, fill-in-the-blank, multi-step math, word parts, and custom long answers.

## Study modes

1. Flashcards: flip, shuffle, previous/next, mark known/needs review.
2. Learn: adaptive multiple choice, typed recall, spaced review.
3. Match: pair terms and definitions.
4. Quiz: configurable count/difficulty; multiple choice, true/false, typed, matching.
5. Write: typed recall and configurable spelling tolerance.
6. Word Builder: prefix, root, combining vowel, suffix, assembled meaning.
7. Challenge: rounds, points, streaks.
8. Progress & Review: missed cards, progress summaries, session history, review queue.

Activities must adapt to card type; don't force multi-step math into a simple flashcard format.

## Import and export

- Manual creation, paste text from sets the user owns, simple portable text export.
- Photo/screenshot OCR and document import are later additions.
- Clean pasted formatting and preserve pronunciation markers where practical.
- Do not assume Quizlet AI access, a public API, or permission to scrape Quizlet.

### Import duplicate review

- Classify candidates as **New**, **Duplicate**, or **Definition Changed**.
- Normalize case, whitespace, harmless punctuation, and known pronunciation markers.
- Flag similar-but-not-identical definitions for human review; don't auto-merge.
- Offer add/skip/replace/keep both as appropriate.
- Ask before changing existing definitions.
- Allow bulk-select of new cards and filter by classification.
- Show final summary and require confirmation.
- Apply import transactionally.
- Preserve study history when a definition changes.
- Prefer deterministic/local duplicate detection over AI to keep costs down.

## Progress and review

Per card: familiarity/mastery, correct/incorrect answers, last studied, next review time.
Per set/subject: accuracy, completion, session history, missed cards, streaks, review queue and suggestions.
Definition edits must not erase study history.

## Visual design and accessibility

- Mature dark forest-inspired theme, not bright/minimalist.
- Responsive on phones (including iPhone) and desktop/laptop (including Mac Neo).
- Touch-friendly controls plus keyboard/mouse support.
- Dashboard with Continue Learning and study-mode shortcuts.
- No ads; respect reduced-motion preferences and readable contrast.

## Cost and dependencies

- Pin dependency versions and commit a lockfile once dependencies are installed.
- No paid AI dependency for core workflows.
- Prefer local deterministic algorithms.
- Browser OCR is a possible later addition only if it does not require a paid service.
- Review any new dependency or external service for cost, privacy, and billing implications before use.

## Suggested architecture

React + Vite + CSS. Keep data handling behind a small storage interface so the app can begin with local storage and be changed later if a genuinely safe backend option is approved. Cloud backend, hosted deployment, and PWA sync are deferred.

If a backend is considered in the future, first review current pricing, billing controls, free-tier limits, data portability, authentication, and row-level security. Do not create a resource or enable billing under the current $0 rule.

## Delivery phases

### Phase 1: Local core
- Library, subjects, sets, and card creation.
- Individual and bulk editing.
- Manual and paste import with duplicate review.
- Flashcards and basic configurable quiz.
- Basic progress.
- Responsive styling and keyboard support.
- Local persistence and export/backup.

### Phase 2: Smarter study
- Adaptive Learn, Write, Match.
- Missed-card review and spaced repetition.
- Tags, combined sessions, richer progress and review queue.

### Phase 3: Specialized modes and import
- Word Builder, Challenge.
- Photo/screenshot and document import if it can be done without paid services.
- Stronger math checking, diagrams/image labeling, audio/pronunciation, language support.

### Future options
- Custom templates, more game modes, analytics, export/backup, optional AI-assisted set creation only if a genuinely no-cost option is available and the user approves it.

## First implementation acceptance criteria

- Create subject, set, and cards.
- Edit cards individually and in bulk.
- Review pasted import candidates before saving.
- Flashcards and basic quiz work across card types.
- View progress; definition edits preserve progress.
- Usable on mobile and desktop.
- Cloud persistence, local fallback, and RLS policies are implemented; verify sign-in, first sync, cross-device sync, sign-out, and backup restore before treating it as production-ready.


## Implementation status (2026-10-16)

Implemented in the current local-first app:
- Subject/set library, search, subject filtering, set create/edit/archive/restore/duplicate/delete/export.
- Flexible card types and individual card editing.
- Bulk card add, bulk editing of selected cards, bulk delete, and combined study sessions across selected sets.
- Pasted text import with duplicate and changed-definition review. Existing definitions are not replaced without an explicit choice.
- Flashcards, typed recall, multiple-choice quiz with configurable question count, matching, word-part review, challenge practice, progress history, and due-card review.
- Local browser persistence, JSON backup/restore, and text export.

Not yet release-ready:
- A production build has not been run in this environment, so source syntax and runtime behavior still need to be verified with npm install and npm run build locally.
- Automated tests are not in place. Import edge cases, matching interactions, and backup restoration need manual and automated verification.
- Learn is a basic typed-recall foundation, not a fully adaptive spaced-learning engine. Matching and answer tolerance need more testing.
- Photo OCR, document import, audio/pronunciation, diagram labeling, advanced math checking, PWA packaging, authentication, and cloud sync remain future work.
- The current app stores data only in the browser's localStorage. It is not yet safe to deploy publicly with private learner data.

Cost rule: use free local tools wherever possible. If a step may incur a charge, stop and choose a free alternative rather than knowingly proceeding.


## Supabase connection status (2026-10-16)

- Dedicated existing project: `Study-App` (project ref `dkzpcqoczhefinrojelp`).
- Browser client uses the project URL and publishable key only; no service-role key is shipped.
- Table: `public.study_user_data`, one JSONB data record per authenticated user.
- RLS is enabled; authenticated users can access only their own `user_id` row. Anonymous table privileges are revoked.
- App sign-in uses email/password and intentionally does not expose a sign-up form. Create the learner account manually in Supabase Authentication → Users and disable public sign-ups in project Auth settings.
- Not yet verified: production build, first sign-in, database round-trip, cross-device sync, and restore conflict behavior. The app should not be treated as production-ready until those checks pass.
