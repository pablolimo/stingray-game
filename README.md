# 🐟 Stingray — Endless Ocean Adventure

An endless top-to-bottom scrolling underwater game built with **TypeScript** + **HTML5 Canvas** (no game engine). Guide your stingray through a crystal-clear ocean, eat fish and starfish for points, and dodge dangerous enemies!

## How to Run (standalone)

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build standalone production bundle to `dist/` |
| `npm run build:lib` | Build embeddable library to `dist/stingray-game.js` |
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

---

## Using as a Git Submodule

You can embed the Stingray game inside any TypeScript web app by adding this repository as a git submodule.

### 1. Add the submodule

```bash
git submodule add https://github.com/pablolimo/stingray-game.git stingray-game
git submodule update --init --recursive
```

### 2. Build the library

```bash
cd stingray-game
npm install
npm run build:lib
```

This produces `stingray-game/dist/stingray-game.js` — a self-contained ES module.

### 3. Import and embed

```typescript
import { StingrayGameElement } from './stingray-game/dist/stingray-game.js';

// Create the game instance
const game = new StingrayGameElement();

// Append its canvas element to any container in your app
document.getElementById('game-container')!.appendChild(game.element);
```

The game starts on **Stage 1** showing the title screen, ready for the player to press Space.

### API

#### `new StingrayGameElement()`

Creates a new game instance with an internal canvas. The game begins on Stage 1 at the title screen.

---

#### `game.element` → `HTMLDivElement`

The root DOM element containing the canvas. Append this anywhere in your app.

---

#### `game.setStage(stage: number): void`

Switch to a different stage without starting the game. The title screen will reflect the chosen stage.

```typescript
game.setStage(3); // 1 – Caribbean Reef, 2 – Midnight Deep, 3 – Nuclear Wasteland, 4 – Frozen Shipwreck
```

---

#### `game.startGame(params: { lives: number }): void`

Start (or restart) the game with a custom number of lives.

```typescript
game.startGame({ lives: 3 });  // stingray starts with ♥♥♥
game.startGame({ lives: 10 }); // stingray starts with 10 hearts
```

---

#### `game.onStagePass(callback): void`

Register a callback that fires whenever the player **clears a stage** (defeats the boss).

```typescript
game.onStagePass(({ lives, score, goldCoins }) => {
  console.log(`Stage cleared! Lives left: ${lives}, Score: ${score}, Coins: ${goldCoins}`);
});
```

| Param | Type | Description |
|-------|------|-------------|
| `lives` | `number` | Remaining hearts when the stage was cleared |
| `score` | `number` | Total score at stage clear |
| `goldCoins` | `number` | Gold coins collected |

---

#### `game.onGameOver(callback): void`

Register a callback that fires when the player **loses all lives**.

```typescript
game.onGameOver(({ score, goldCoins }) => {
  console.log(`Game over! Final score: ${score}, Coins: ${goldCoins}`);
});
```

| Param | Type | Description |
|-------|------|-------------|
| `score` | `number` | Final score |
| `goldCoins` | `number` | Gold coins collected |

---

#### `game.destroy(): void`

Stop the animation loop and remove the element from the DOM.

---

### Full example

```typescript
import { StingrayGameElement } from './stingray-game/dist/stingray-game.js';

const game = new StingrayGameElement();
document.getElementById('game-container')!.appendChild(game.element);

// Start on stage 2 with 5 lives
game.setStage(2);
game.startGame({ lives: 5 });

game.onStagePass(({ lives, score, goldCoins }) => {
  console.log('Stage passed!', { lives, score, goldCoins });
});

game.onGameOver(({ score, goldCoins }) => {
  console.log('Game over', { score, goldCoins });
  game.destroy();
});
```

### Using with Vite (import from source)

If your host app uses **Vite + TypeScript**, you can import directly from source without a separate build step. In your `vite.config.ts`, ensure the submodule's source is resolved:

```typescript
// vite.config.ts (host app)
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'stingray-game': '/stingray-game/src/index.ts',
    },
  },
});
```

Then import:

```typescript
import { StingrayGameElement } from 'stingray-game';
```
