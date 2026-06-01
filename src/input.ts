import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

export class InputHandler {
  private keys: Set<string> = new Set();
  private touchPoint: { x: number; y: number } | null = null;
  private activeTouchId: number | null = null;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    canvas.addEventListener('touchmove', (e) => {
      const touch = this.getTrackedTouch(e.touches);
      if (!touch) return;
      this.updateTouchPoint(touch);
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
      if (!this.getTrackedTouch(e.touches)) {
        this.clearPointer();
      }
    });
    canvas.addEventListener('touchcancel', (e) => {
      if (!this.getTrackedTouch(e.touches)) {
        this.clearPointer();
      }
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  clearPointer(): void {
    this.touchPoint = null;
    this.activeTouchId = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  startTouchDrag(touch: Touch, anchorX: number, anchorY: number): void {
    const canvasPoint = this.getCanvasPoint(touch);
    this.activeTouchId = touch.identifier;
    this.dragOffset = {
      x: canvasPoint.x - anchorX,
      y: canvasPoint.y - anchorY,
    };
    this.touchPoint = { x: anchorX, y: anchorY };
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

  private updateTouchPoint(touch: Touch): void {
    const canvasPoint = this.getCanvasPoint(touch);
    this.touchPoint = {
      x: canvasPoint.x - this.dragOffset.x,
      y: canvasPoint.y - this.dragOffset.y,
    };
  }

  private getCanvasPoint(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  private getTrackedTouch(touches?: TouchList): Touch | null {
    if (this.activeTouchId === null || !touches) {
      return null;
    }

    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      if (touch.identifier === this.activeTouchId) {
        return touch;
      }
    }

    return null;
  }
}
