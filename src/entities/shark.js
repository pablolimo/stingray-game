import { createSharkSprite } from '../sprites';
import { CANVAS_WIDTH } from '../constants';
export class Shark {
    constructor(x, y, targetX) {
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
            value: 20
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 12
        });
        Object.defineProperty(this, "sprite", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "speedMultiplier", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "angle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.sprite = createSharkSprite();
        this.speedMultiplier = 1.5;
        // Slight angle toward target
        const dx = targetX - x;
        this.angle = Math.atan2(-1, dx / CANVAS_WIDTH) * 0.3;
    }
    update(dt, scrollSpeed) {
        this.y -= scrollSpeed * this.speedMultiplier * dt;
        this.x += Math.sin(this.angle) * scrollSpeed * 0.3 * dt;
    }
    getBounds() {
        return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width, height: this.height };
    }
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}
