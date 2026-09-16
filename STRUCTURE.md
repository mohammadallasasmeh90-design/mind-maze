# Mind Maze Structure

- `client/src/App.tsx`: app shell and route state.
- `client/src/pages/Home.tsx`: product UI, game loop, profile/store/settings views.
- `client/src/game/engine.ts`: framework-agnostic challenge generators and scoring helpers.
- `client/src/lib/storage.ts`: guarded local persistence and analytics adapter.
- `client/src/index.css`: visual system, responsive layout, motion, accessibility.
- `client/public/manifest.json`: PWA metadata.

The `MonetizationManager` boundary lives in `Home.tsx` as a small adapter today and is intentionally mock/configuration-ready. A future backend or platform SDK can replace the adapter without changing the game loop.
