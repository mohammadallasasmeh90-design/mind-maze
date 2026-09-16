# Mind Maze – Brain Training Game
[▶ فتح اللعبة مباشرة](https://mindmaze-xmnvanuq.manus.space)


Mind Maze is a mobile-first brain-training web MVP built with React, TypeScript, Vite, and Tailwind. It is designed around a short daily route: five quick challenges across Memory, Logic, Attention, Speed, and Pattern. The core game is playable offline-friendly and stores progression locally in the browser.

## Included in this MVP

The shipped experience includes a home dashboard, daily challenge route, deterministic answer-safe challenge generators, score and accuracy feedback, XP and coins, streak progression, achievements, player profile, optional store UI, preferences modal, reduced motion support, generated brand art, PWA metadata, and a service worker for offline shell caching. It also includes interfaces for analytics and monetization configuration so production SDKs can be added without placing ad logic inside the game loop.

## Run locally

From the project root:

```bash
pnpm install
pnpm dev
```

The Vite dev server runs on port 3000 by default. Open the printed local URL in a browser. Use `/?demo` to open a deterministic in-game state for visual QA.

## Checks and production build

```bash
pnpm check
pnpm build
```

`pnpm check` runs TypeScript validation. `pnpm build` creates the Vite frontend build and the template server bundle. The project is frontend-only for product functionality; no backend or API key is required.

## Project structure

`client/src/App.tsx` contains the user-facing game shell and screen state. Challenge generation lives in `client/src/game/engine.ts` and is framework-agnostic. Local persistence and analytics boundaries live in `client/src/lib/storage.ts`. The visual system is in `client/src/index.css`. Product decisions and verification criteria are recorded in `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, and `ASSETS.md`.

## Monetization configuration

`client/src/lib/storage.ts` contains `monetizationConfig` with placeholder product IDs and reward/frequency values. The current store is explicitly configuration-ready: it does not simulate a purchase, load an ad SDK, or claim that a transaction completed. A production integration should provide a platform adapter for rewarded ads, interstitial frequency control, Remove Ads entitlement restoration, Premium status, and purchase verification. Rewarded ads must remain user-initiated, and forced ads must never interrupt a question.

## Analytics event list

The analytics boundary supports `app_open`, `game_started`, `challenge_started`, `challenge_completed`, `correct_answer`, `wrong_answer`, `hint_used`, `daily_challenge_completed`, `achievement_unlocked`, `level_up`, and `share_clicked`. Only non-sensitive gameplay metadata should be sent. The default provider logs events in development and is ready to be replaced by a consent-aware production provider.

## Privacy and consent

The MVP does not request contacts, messages, precise location, or sensitive data. Consent is represented in the settings UI and gameplay remains functional when analytics consent is disabled. A production launch still needs a reviewed Privacy Policy, Terms page, regional ad/analytics consent implementation, account data deletion flow if accounts are introduced, and platform-specific disclosures.

## Deployment

Use the WebDev management UI to create a checkpoint and then publish the project through the supported WebDev Publish flow. The temporary development preview is for verification only and is not a production deployment URL.

## Testing report

TypeScript checks and the production build pass. Desktop preview verification shows the home dashboard and in-game Memory challenge. A 375px mobile preview shows the game header, progress indicator, question, four touch-sized answer buttons, hint action, and bottom navigation without horizontal overflow.

Manual regression coverage should include: answering all five questions, replaying, sharing, settings toggles, localStorage disabled or unavailable, reload persistence, `prefers-reduced-motion`, keyboard focus, and all 320px–1024px widths.

## Known limitations

Real ads, real purchases, global leaderboards, authentication, cloud saves, push notifications, platform billing verification, and server-backed remote config are not connected. Leaderboard, referral, and notification systems are intentionally future architecture rather than fake features. Arabic mode currently exposes the language preference boundary but does not yet translate every screen. The service worker caches the shell; production cache invalidation and asset versioning should be hardened before launch.

## Production checklist

Before publishing to an app store or enabling monetization, connect a consent-aware ad provider, platform billing, restore purchases, server-side purchase verification, cloud save, remote config, and real leaderboard services. Add Privacy Policy and Terms routes, complete accessibility testing with screen readers, verify RTL translations, add legal age/consent flows where required, test on low-end devices, instrument crash/error reporting, and run a final QA pass with network disabled and local storage unavailable.
