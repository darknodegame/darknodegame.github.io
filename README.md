# darknodegame.com

Website for our games, served by GitHub Pages from the repo root. Plain
HTML/CSS, no build step: open a page locally to check it.

The site hosts several games, one folder each. Dark Node came first, so it
lives at the root and its URLs stay there. Every other game gets its own
folder with its own styling, and never links to or borrows from another game.

## Dark Node: Initiation (repo root)

Line-of-sight puzzle for Android.

- `index.html` — the single-page site
- `style.css` — styling (palette + fonts mirror the game)
- `assets/img/` — branding + in-game screenshots
- `assets/fonts/` — Orbitron + Inter (SIL OFL)
- `rules.html`, `rules.css`, `privacy.html`, `terms.html`, `delete-data.html`

## Boss Lock: Pirate Match 3 RPG (`bosslock/`)

Match-3 RPG for Android, package `com.darknode.bosslock`.

- `bosslock/index.html` — https://darknodegame.com/bosslock/ (stub: title and legal links)
- `bosslock/privacy.html` — https://darknodegame.com/bosslock/privacy.html
- `bosslock/delete-data.html` — https://darknodegame.com/bosslock/delete-data.html
- `bosslock/terms.html` — https://darknodegame.com/bosslock/terms.html
- `bosslock/style.css` — neutral light styling for this folder only

## Shared

- `app-ads.txt` — AdMob publisher line for the whole domain
- `CNAME`, `.nojekyll` — GitHub Pages setup
