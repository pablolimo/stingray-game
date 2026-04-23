import { Background } from './background';
import { Player } from './player';
import { InputHandler } from './input';
import { Spawner } from './spawner';
import { HUD } from './hud';
import { Entity, GameState, Particle } from './types';
import { Fish } from './entities/fish';
import { Starfish } from './entities/starfish';
import { Jellyfish } from './entities/jellyfish';
import { Shark } from './entities/shark';
import { TreasureChest } from './entities/treasure';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  INITIAL_SCROLL_SPEED, MAX_SCROLL_SPEED, SCROLL_SPEED_INCREMENT,
  SCREEN_SHAKE_DURATION, SCREEN_SHAKE_MAGNITUDE,
} from './constants';

function aabb(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState = GameState.Title;
  private background: Background;
  private player: Player;
  private input: InputHandler;
  private spawner: Spawner;
  private hud: HUD;
  private entities: Entity[] = [];
  private particles: Particle[] = [];
  private score: number = 0;
  private scrollSpeed: number = INITIAL_SCROLL_SPEED;
  private shakeTimer: number = 0;
  private spaceWasDown: boolean = false;
  private titleAnimTime: number = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.background = new Background();
    this.player = new Player();
    this.input = new InputHandler();
    this.spawner = new Spawner();
    this.hud = new HUD();
  }

  update(dt: number): void {
    this.titleAnimTime += dt;
    const spaceNow = this.input.space;

    switch (this.state) {
      case GameState.Title:
        this.background.update(dt, INITIAL_SCROLL_SPEED);
        if (spaceNow && !this.spaceWasDown) {
          this.startGame();
        }
        break;

      case GameState.Playing:
        this.scrollSpeed = Math.min(this.scrollSpeed + SCROLL_SPEED_INCREMENT * dt, MAX_SCROLL_SPEED);
        this.background.update(dt, this.scrollSpeed);
        this.player.update(dt, this.input);

        // Update entities
        for (const e of this.entities) {
          e.update(dt, this.scrollSpeed);
        }

        // Spawn
        const newEntities = this.spawner.update(dt, this.scrollSpeed, this.player.x);
        this.entities.push(...newEntities);

        // Remove off-screen (entities move top to bottom)
        this.entities = this.entities.filter(e => e.y > -100 && e.y < CANVAS_HEIGHT + 100);

        // Collisions
        const playerBounds = this.player.getBounds();
        for (const e of this.entities) {
          if (e instanceof Fish && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#f4721a', 8);
            }
          } else if (e instanceof Starfish && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#e8612a', 12);
            }
          } else if (e instanceof TreasureChest && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#ffd700', 16);
            }
          } else if (e instanceof Jellyfish) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                this.player.takeDamage();
                this.shakeTimer = SCREEN_SHAKE_DURATION;
              }
            }
          } else if (e instanceof Shark) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                this.player.takeDamage();
                this.shakeTimer = SCREEN_SHAKE_DURATION;
              }
            }
          }
        }

        // Remove collected
        this.entities = this.entities.filter(e => {
          if (e instanceof Fish && e.collected) return false;
          if (e instanceof Starfish && e.collected) return false;
          if (e instanceof TreasureChest && e.collected) return false;
          return true;
        });

        // Update particles
        for (const p of this.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        // Screen shake
        if (this.shakeTimer > 0) {
          this.shakeTimer -= dt;
        }

        // Game over
        if (this.player.hp <= 0) {
          this.state = GameState.GameOver;
        }
        break;

      case GameState.GameOver:
        this.background.update(dt, 30);
        if (spaceNow && !this.spaceWasDown) {
          this.startGame();
        }
        break;
    }

    this.spaceWasDown = spaceNow;
  }

  private startGame(): void {
    this.state = GameState.Playing;
    this.player = new Player();
    this.entities = [];
    this.particles = [];
    this.score = 0;
    this.scrollSpeed = INITIAL_SCROLL_SPEED;
    this.spawner.reset();
  }

  private spawnParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 50 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }

  render(): void {
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (this.shakeTimer > 0) {
      const mag = SCREEN_SHAKE_MAGNITUDE * (this.shakeTimer / SCREEN_SHAKE_DURATION);
      ctx.translate(
        (Math.random() - 0.5) * mag,
        (Math.random() - 0.5) * mag
      );
    }

    switch (this.state) {
      case GameState.Title:
        this.renderTitle();
        break;
      case GameState.Playing:
        this.renderPlaying();
        break;
      case GameState.GameOver:
        this.renderGameOver();
        break;
    }

    ctx.restore();
  }

  private renderTitle(): void {
    const ctx = this.ctx;
    this.background.render(ctx);

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 20, 60, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#4af';
    ctx.shadowBlur = 20;
    const bounce = Math.sin(this.titleAnimTime * 2) * 3;
    ctx.fillText('STINGRAY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60 + bounce);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#adf';
    ctx.shadowBlur = 5;
    ctx.fillText('An Underwater Adventure', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    const blink = Math.sin(this.titleAnimTime * 3) > 0;
    if (blink) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      ctx.fillText('Press SPACE to Play', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = '#89c';
    ctx.fillText('Arrow Keys / WASD to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    ctx.fillText('Collect fish for points!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    ctx.fillText('Avoid jellyfish and sharks!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
    ctx.fillStyle = '#fd5';
    ctx.fillText('Float over treasure chests for 100pts!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 130);
    ctx.restore();
  }

  private renderPlaying(): void {
    const ctx = this.ctx;
    this.background.render(ctx);

    // Entities
    for (const e of this.entities) {
      e.render(ctx);
    }

    // Particles
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    this.player.render(ctx);
    this.hud.render(ctx, this.score, this.player.hp);
  }

  private renderGameOver(): void {
    const ctx = this.ctx;
    this.background.render(ctx);

    ctx.fillStyle = 'rgba(0, 0, 20, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#f44';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.font = '20px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 5;
    ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    const blink = Math.sin(this.titleAnimTime * 3) > 0;
    if (blink) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#adf';
      ctx.fillText('Press SPACE to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
    ctx.restore();
  }
}
