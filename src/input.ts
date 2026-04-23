export class InputHandler {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  get left(): boolean {
    return this.isDown('ArrowLeft') || this.isDown('KeyA');
  }
  get right(): boolean {
    return this.isDown('ArrowRight') || this.isDown('KeyD');
  }
  get up(): boolean {
    return this.isDown('ArrowUp') || this.isDown('KeyW');
  }
  get down(): boolean {
    return this.isDown('ArrowDown') || this.isDown('KeyS');
  }
  get space(): boolean {
    return this.isDown('Space');
  }
}
