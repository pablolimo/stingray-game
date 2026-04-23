import { createJellyfishSprites } from '../sprites';
export class Jellyfish {
    constructor(x, y) {
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
            value: 16
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "sprites", {
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
        Object.defineProperty(this, "driftAngle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "driftAmplitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.sprites = createJellyfishSprites();
        this.driftAngle = Math.random() * Math.PI * 2;
        this.driftAmplitude = 30 + Math.random() * 30;
    }
    update(dt, scrollSpeed) {
        this.y -= scrollSpeed * dt;
        this.driftAngle += dt * 1.5;
        this.x += Math.sin(this.driftAngle) * this.driftAmplitude * dt;
        this.animTimer += dt;
        if (this.animTimer >= 0.4) {
            this.animTimer -= 0.4;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }
    getBounds() {
        return { x: this.x - this.width / 2, y: this.y - this.height / 2, width: this.width * 0.8, height: this.height * 0.7 };
    }
    render(ctx) {
        const sprite = this.sprites[this.animFrame];
        ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
