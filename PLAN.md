# Mind Maze MVP Plan

## Product goal
A fast, friendly brain-training web game that starts in seconds, works offline, and creates a daily return habit without dark patterns.

## Risk slices
1. Core challenge loop: deterministic, answer-safe generators for Memory, Logic, Attention, Speed, and Pattern.
2. Local persistence: guarded localStorage with fallback defaults; no network dependency for gameplay.
3. Responsive UI: mobile-first layout at 320–1024px with touch-friendly controls and RTL-ready copy.
4. Monetization boundary: explicit mock adapters only; no fake ad or purchase claims.

## MVP acceptance criteria
- Home opens with Play as the primary CTA and displays level, XP, coins, daily challenge, and streak.
- A five-question daily challenge can be completed with score, accuracy, XP, and coins.
- Each question has a single answer, no duplicate options, and feedback.
- Progress, achievements, and daily completion persist locally.
- Settings expose language, sound, reduced motion, and consent toggles.
- Store and profile are real screens; monetization items are labeled as configuration-ready, not live purchases.
- No horizontal overflow at 320px; game remains playable offline.
- Build and TypeScript checks pass; preview screenshots show home and in-game states.

## Non-goals for this MVP
Real ad SDKs, real billing, cloud saves, global leaderboards, push notifications, and backend authentication.

## Verification
Run `pnpm check` and `pnpm build`, then capture `/` and `/play` at desktop and 375px widths.
