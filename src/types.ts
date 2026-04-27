export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  update(dt: number, scrollSpeed: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface Sprite {
  canvas: HTMLCanvasElement;
  frames: HTMLCanvasElement[];
}

export enum GameState {
  Title = 'Title',
  Playing = 'Playing',
  Paused = 'Paused',
  GameOver = 'GameOver',
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

export interface DisintegrationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  w: number;
  h: number;
  rotation: number;
  rotSpeed: number;
}
