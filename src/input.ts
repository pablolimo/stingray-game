import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

export class InputHandler {
  private keys: Set<string> = new Set();
  private touchPoint: { x: number; y: number } | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    canvas.addEventListener('touchstart', (e) => {
      this.updateTouchPoint(e.touches[0]);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      this.updateTouchPoint(e.touches[0]);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
      this.clearPointer();
    });
    canvas.addEventListener('touchcancel', () => {
      this.clearPointer();
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  clearPointer(): void {
    this.touchPoint = null;
  }

  get dragging(): boolean {
    return this.touchPoint !== null;
  }

  get pointerX(): number {
    return this.touchPoint?.x ?? 0;
  }

  get pointerY(): number {
    return this.touchPoint?.y ?? 0;
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

  private updateTouchPoint(touch?: Touch): void {
    if (!touch) {
      this.clearPointer();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    this.touchPoint = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }
}
