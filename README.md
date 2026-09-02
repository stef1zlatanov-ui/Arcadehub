# Quarterbin — Cyberpunk Arcade Hub

A single-page site for a retro arcade lounge: cabinet showcase, live leaderboards (tab-switchable), and an upcoming-tournaments list with a live countdown.

## Files

- `index.html` — page structure and content
- `styles.css` — all styling (no build step, no framework)
- `script.js` — leaderboard tabs, tournament rendering, countdown timer, mobile nav
- `games.js` — the game modal controller plus four playable canvas mini-games

No dependencies to install and no build step — it's plain HTML/CSS/JS, so it runs as-is.

## Playable games

Clicking **Play** on a cabinet opens a modal with a real canvas game:

- **Volt Invaders** — Space-Invaders-style shooter. Arrow keys move, Space shoots.
- **Circuit Smash** — Breakout clone. Arrow keys or mouse move the paddle; the paddle shrinks each time you clear a level.
- **Grid Runner** — three-lane dodger. Left/Right switch lanes, speed ramps up over time.
- **Signal Breaker** — a simplified falling color-match puzzle (match 3+ connected same-color blocks to clear them). Left/Right move, Down soft-drops, Space hard-drops.

Each game tracks a personal best in the browser's `localStorage` (per game, per browser — it's not a shared/global leaderboard). The house leaderboard table lower on the page is still static display data, not connected to actual gameplay.

The other five cabinets (Neon Striker, Crypt Raiders, Rust Bucket Derby, Pixel Phantom, Overdrive 2088) show a "Being repaired" button — a fighting game, an isometric dungeon crawler, and real racers are a much bigger build than a quick canvas game, so they're left as placeholders rather than faked. Ask if you'd like one of those built out next.

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
