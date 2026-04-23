# 🐟 Stingray — Endless Ocean Adventure

An endless top-to-bottom scrolling underwater game built with **TypeScript** + **HTML5 Canvas** (no game engine). Guide your stingray through a crystal-clear ocean, eat fish and starfish for points, and dodge dangerous enemies!

## How to Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

## Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** / **WASD** | Move the stingray |
| **Space** | Start game / Restart after Game Over |

## Gameplay

- **Eat** 🐠 fish (+10 pts) and ⭐ starfish (+25 pts) to rack up your score.
- **Avoid** enemies — each hit costs 1 life. You have **3 lives** (shown as ♥♥♥ top-right).
- After a hit you're briefly **invincible** (stingray flashes for ~1 second).
- The ocean gets **faster and more dangerous** over time — survive as long as you can!

### Enemies

| Enemy | Behaviour |
|-------|-----------|
| 🪼 **Jellyfish** | Slow, sinuous side-to-side drift |
| 🦈 **Shark** | Fast straight-line charge |

## Visual Features

- Hand-crafted **pixel-art sprites** generated procedurally in code
- **3-layer parallax** sandy seafloor background
- Animated **light caustics** for crystal-clear water effect
- Rising **bubble particles** and collect-burst **particles**
- **Screen shake** on taking a hit
- Smooth stingray **wing-flap** animation
