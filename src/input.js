export class InputHandler {
    constructor() {
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }
    isDown(code) {
        return this.keys.has(code);
    }
    get left() {
        return this.isDown('ArrowLeft') || this.isDown('KeyA');
    }
    get right() {
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
    get up() {
        return this.isDown('ArrowUp') || this.isDown('KeyW');
    }
    get down() {
        return this.isDown('ArrowDown') || this.isDown('KeyS');
    }
    get space() {
        return this.isDown('Space');
    }
}
