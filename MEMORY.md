# Mind Maze Memory

The project is a React/Vite web-static app. The generated neural background and brain-maze mark are stored via WebDev storage and referenced from `/manus-storage/...` paths instead of committed as large local assets.

The game intentionally uses CSS-driven UI rather than a 3D scene because the interaction is form-based brain training, not spatial gameplay. The high-risk slice is challenge correctness: generators use unique option sets and a single answer field. The browser local state is guarded with a fallback so an unavailable localStorage does not prevent play.

Verification completed: `pnpm check` passed; `pnpm build` passed; desktop home screenshot passed; desktop demo gameplay screenshot passed; 375px mobile home and demo gameplay screenshots passed. The current project preview is the source of truth for final review.
