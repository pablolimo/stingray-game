import { Fish } from './entities/fish';
import { Starfish } from './entities/starfish';
import { Jellyfish } from './entities/jellyfish';
import { Shark } from './entities/shark';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
export class Spawner {
    constructor() {
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fishTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "starfishTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "jellyfishTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "sharkTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    update(dt, scrollSpeed, playerX) {
        this.time += dt;
        const spawned = [];
        // Difficulty multiplier
        const diff = Math.min(this.time / 60, 1); // 0 to 1 over 60 seconds
        // Fish: starts at 2s interval, decreases to 0.8s
        const fishInterval = 2.0 - diff * 1.2;
        this.fishTimer += dt;
        if (this.fishTimer >= fishInterval) {
            this.fishTimer -= fishInterval;
            const count = Math.random() < 0.3 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
                const variant = Math.floor(Math.random() * 3);
                spawned.push(new Fish(x, CANVAS_HEIGHT + 20, variant));
            }
        }
        // Starfish: every 5s decreasing to 3s
        const starfishInterval = 5.0 - diff * 2.0;
        this.starfishTimer += dt;
        if (this.starfishTimer >= starfishInterval) {
            this.starfishTimer -= starfishInterval;
            const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
            spawned.push(new Starfish(x, CANVAS_HEIGHT + 20));
        }
        // Jellyfish: start at 4s, decrease to 1.5s
        const jellyfishInterval = 4.0 - diff * 2.5;
        this.jellyfishTimer += dt;
        if (this.jellyfishTimer >= jellyfishInterval) {
            this.jellyfishTimer -= jellyfishInterval;
            const x = 30 + Math.random() * (CANVAS_WIDTH - 60);
            spawned.push(new Jellyfish(x, CANVAS_HEIGHT + 30));
        }
        // Shark: start at 10s, decrease to 4s
        const sharkInterval = 10.0 - diff * 6.0;
        this.sharkTimer += dt;
        if (this.sharkTimer >= sharkInterval) {
            this.sharkTimer -= sharkInterval;
            const x = Math.random() * CANVAS_WIDTH;
            spawned.push(new Shark(x, CANVAS_HEIGHT + 20, playerX));
        }
        // Use scrollSpeed to satisfy TS (it influences difficulty implicitly via time)
        void scrollSpeed;
        return spawned;
    }
    reset() {
        this.time = 0;
        this.fishTimer = 0;
        this.starfishTimer = 0;
        this.jellyfishTimer = 0;
        this.sharkTimer = 0;
    }
}
