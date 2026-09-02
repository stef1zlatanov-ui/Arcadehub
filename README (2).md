# Quarterbin — Cyberpunk Arcade Hub

A single-page site for a retro arcade lounge: cabinet showcase, live leaderboards (tab-switchable), and an upcoming-tournaments list with a live countdown.

## Files

- `index.html` — page structure and content
- `styles.css` — all styling (no build step, no framework)
- `script.js` — leaderboard tabs, tournament rendering, countdown timer, mobile nav
- `games.js` — the game modal controller plus four playable canvas mini-games

No dependencies to install and no build step — it's plain HTML/CSS/JS, so it runs as-is.

## Playable games

Every cabinet now has a real, playable canvas game behind its **Play** button:

- **Volt Invaders** — Space-Invaders-style shooter. Arrow keys move, Space shoots.
- **Circuit Smash** — Breakout clone. Arrow keys or mouse move the paddle; it shrinks each level.
- **Grid Runner** — three-lane dodger, speed ramps up over time.
- **Signal Breaker** — falling color-match puzzle (connect 3+ same-color blocks to clear).
- **Neon Striker** — reflex fighter. Space attacks, hold Down to block an opponent's telegraphed strikes; win rounds to face tougher, faster opponents.
- **Crypt Raiders** — free-roam treasure grab. Arrow keys move, collect the gold, dodge patrolling guardians.
- **Pixel Phantom** — dot-collector maze chase with a ghost that actively hunts you down.
- **Rust Bucket Derby** — lane combat racer. Switch lanes, tap Space to ram rival cars for bonus points (debris still needs dodging).
- **Overdrive 2088** — freeform weaving bike racer with momentum-based steering and boost pickups.

Every game shares a retro-futuristic look: neon glow rendering, particle bursts on hits/clears, a radial CRT-style backdrop, and a modal "cabinet" frame that tints to each game's accent color. Each game also tracks a personal best in the browser's `localStorage` (per game, per browser — not a shared/global leaderboard). The house leaderboard table lower on the page is still static display data, not connected to actual gameplay scores.

## Publish it on GitHub Pages

1. Create a new GitHub repository (or use an existing one).
2. Add these three files to the **root** of the repo (or a `/docs` folder — see step 4).
3. Commit and push:
   ```bash
   git init
   git add .
   git commit -m "Add Quarterbin arcade site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
4. On GitHub: go to **Settings → Pages**. Under "Build and deployment," set **Source** to "Deploy from a branch," pick the `main` branch and the `/ (root)` folder (or `/docs` if that's where you put the files), then save.
5. GitHub will give you a URL like `https://YOUR-USERNAME.github.io/YOUR-REPO/`. It can take a minute or two to go live after the first deploy.

## Customizing

- **Games/cabinets:** each cabinet is an `<article class="cabinet">` block in `index.html`. Swap the name, description, tags, and the `--glow` inline style (a hex color) to reskin one.
- **Leaderboards:** edit the `boards` object at the top of `script.js` — one entry per cabinet, keyed to match the `data-game` attribute on each tab button.
- **Tournaments:** edit the `tournaments` array in `script.js`. Dates use JS `Date` objects (`'YYYY-MM-DDTHH:MM:SS'`); the countdown automatically tracks whichever one is soonest.
- **Colors/fonts:** the palette and type choices live as CSS custom properties at the top of `styles.css` (`:root`).
