# Product Specification

## Product direction
A private, ad-free, expandable study platform inspired by useful parts of Quizlet, without depending on Quizlet's API or scraping. It starts with medical terminology but must be general-purpose. The final app name is undecided.

## Users and privacy
- One learner account, used by Zero; owner manages setup and content.
- No public registration, public profiles, public sets, or ads.
- Use a dedicated Supabase project, separate from unrelated projects.
- Enforce ownership through Supabase Auth and row-level security (RLS), not only client-side UI.
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
Prefer deterministic/local duplicate detection over AI to keep costs down.

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
- Target $0/month initially where free tiers allow.
- Verify current service limits.
- Pin dependency versions and commit a lockfile once dependencies are installed.
- No paid AI dependency for core workflows.
- Browser OCR first; server-side AI vision is optional and later.

## Suggested architecture
React + Vite + CSS; Supabase Auth + Postgres; Cloudflare Pages; PWA/offline later.
Use only a publishable Supabase key in the browser. Enable RLS on every exposed table with policies scoped to the authenticated owner.

## Delivery phases
### Phase 1: Core
Private login/session handling; library, subjects, sets, card creation and individual/bulk editing; manual/paste import with duplicate review; flashcards and basic configurable quiz; basic progress; responsive styling.
### Phase 2: Smarter study
Adaptive Learn, Write, Match; missed-card review and spaced repetition; tags, combined sessions, richer progress and review queue.
### Phase 3: Specialized modes and import
Word Builder, Challenge, photo/screenshot and document import, stronger math checking, diagrams/image labeling, audio/pronunciation, language support.
### Future options
Custom templates, more game modes, analytics, export/backup, optional affordable AI-assisted set creation.

## First implementation acceptance criteria
- Create subject, set, and cards.
- Edit cards individually and in bulk.
- Review pasted import candidates before saving.
- Flashcards and basic quiz work across card types.
- View progress; definition edits preserve progress.
- Usable on mobile and desktop.
- Don't store real data until auth, RLS, and the dedicated backend are configured and tested.
