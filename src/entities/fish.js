import { createFishSprites } from '../sprites';
import { FISH_SCORE } from '../constants';
export class Fish {
    constructor(x, y, colorVariant = 0) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 12
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 8
        });
        Object.defineProperty(this, "colorVariant", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "animFrame", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "animTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "collected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: FISH_SCORE
        });
        Object.defineProperty(this, "sprites", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "driftAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "driftSpeed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.colorVariant = colorVariant;
        this.sprites = createFishSprites();
        this.driftAngle = Math.random() * Math.PI * 2;
        this.driftSpeed = 20 + Math.random() * 20;
    }
    update(dt, scrollSpeed) {
        this.y -= scrollSpeed * dt;
        this.driftAngle += dt * 2;
        this.x += Math.sin(this.driftAngle) * this.driftSpeed * dt;
        this.animTimer += dt;
        if (this.animTimer >= 0.2) {
            this.animTimer -= 0.2;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }
    getBounds() {
        return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
    }
    render(ctx) {
        if (this.collected)
            return;
        const sprite = this.sprites[this.colorVariant][this.animFrame];
        ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
