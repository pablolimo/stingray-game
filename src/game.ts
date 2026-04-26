import { Background } from './background';
import { Player } from './player';
import { InputHandler } from './input';
import { Spawner } from './spawner';
import { HUD } from './hud';
import { Entity, GameState, Particle, DisintegrationParticle } from './types';

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}
import { Fish } from './entities/fish';
import { Starfish } from './entities/starfish';
import { Jellyfish } from './entities/jellyfish';
import { Shark } from './entities/shark';
import { Squid } from './entities/squid';
import { TreasureChest } from './entities/treasure';
import { PowerupChest } from './entities/powerupchest';
import { RedTreasure } from './entities/redtreasure';
import { GlowingClam } from './entities/glowingclam';
import { GoldenCoin } from './entities/goldencoin';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  INITIAL_SCROLL_SPEED, MAX_SCROLL_SPEED, SCROLL_SPEED_INCREMENT,
  SCREEN_SHAKE_DURATION, SCREEN_SHAKE_MAGNITUDE,
  LASER_DURATION, LASER_DRAIN_RATE, GAUGE_PER_EAT,
  LEVEL2_SCORE_THRESHOLD, LEVEL3_SCORE_THRESHOLD,
  PEARL_ORBIT_RADIUS, PEARL_SPIN_SPEED, PEARL_HIT_RADIUS, PEARL_DRAW_RADIUS,
  EXPLOSION_PARTICLE_COUNT, SHOCKWAVE_INITIAL_RADIUS, SHOCKWAVE_MAX_RADIUS, SHOCKWAVE_DURATION,
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

interface OrbitalPearl {
  angleOffset: number;   // fixed angular offset from the shared rotation angle
  killsRemaining: number;
  glowTimer: number;
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
  private level: number = 1;
  private levelUpBannerTimer: number = 0;
  private scrollSpeed: number = INITIAL_SCROLL_SPEED;
  private shakeTimer: number = 0;
  private spaceWasDown: boolean = false;
  private titleAnimTime: number = 0;
  private powerupActive: boolean = false;
  private gaugeLevel: number = 0;
  private laserActive: boolean = false;
  private laserAnimTime: number = 0;
  private shieldAnimTime: number = 0;
  private orbitalPearls: OrbitalPearl[] = [];
  private orbitalPearlAngle: number = 0;
  private shockwaveRings: ShockwaveRing[] = [];
  private goldScore: number = 0;
  private disintegrationParticles: DisintegrationParticle[] = [];

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

        // Powerup timers
        if (this.powerupActive) {
          // no time-based expiry – powerup lasts until damaged
        }
        if (this.laserActive) {
          this.laserAnimTime += dt;
          // Drain the gauge while the laser is firing
          this.gaugeLevel -= LASER_DRAIN_RATE * dt;
          if (this.gaugeLevel <= 0) {
            this.gaugeLevel = 0;
            this.laserActive = false;
            // powerupActive stays true – can be recharged
          }
        }
        if (this.player.shieldActive) {
          this.shieldAnimTime += dt;
        }

        // Update entities
        for (const e of this.entities) {
          if (e instanceof Squid) {
            e.targetX = this.player.x;
          }
          if (e instanceof Shark && this.level >= 3) {
            e.targetX = this.player.x;
          }
          e.update(dt, this.scrollSpeed);
        }

        // Spawn
        const newEntities = this.spawner.update(dt, this.scrollSpeed, this.player.x, this.level);
        this.entities.push(...newEntities);

        // Remove off-screen or expired squids
        this.entities = this.entities.filter(e => {
          if (e instanceof Squid && e.expired) return false;
          return e.y > -100 && e.y < CANVAS_HEIGHT + 100;
        });

        // Laser beam – destroy enemies in its path each frame while active
        if (this.laserActive) {
          const laserBeamHalfWidth = 20;
          this.entities = this.entities.filter(e => {
            if (e instanceof Jellyfish || e instanceof Shark || e instanceof Squid) {
              if (Math.abs(e.x - this.player.x) < laserBeamHalfWidth + e.width / 2 && e.y < this.player.y) {
                if (e instanceof Squid) {
                  // Squid needs 3 HP (≈2.5× hits) to die from the laser
                  const dead = e.takeLaserHit();
                  if (!dead) {
                    this.spawnParticles(e.x, e.y, '#ff8844', 5);
                    return true; // still alive
                  }
                  this.spawnDisintegration(e.x, e.y, ['#9b1e4b', '#dc508c', '#6e0032', '#ffe000']);
                  return false;
                }
                // All other enemies: disintegrate immediately
                const colors = e instanceof Jellyfish
                  ? ['#c864c8', '#e0a0e0', '#9632b4', '#ffffff']
                  : ['#708090', '#536878', '#b0c0d0', '#ffffff'];
                this.spawnDisintegration(e.x, e.y, colors);
                return false;
              }
            }
            return true;
          });
        }

        // Collisions
        const playerBounds = this.player.getBounds();
        for (const e of this.entities) {
          if (e instanceof Fish && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#f4721a', 8);
              this.incrementLaserGauge();
            }
          } else if (e instanceof Starfish && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#e8612a', 12);
              this.incrementLaserGauge();
            }
          } else if (e instanceof TreasureChest && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#ffd700', 16);
              this.incrementLaserGauge();
            }
          } else if (e instanceof PowerupChest && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#00e5ff', 20);
              if (this.powerupActive) {
                // Already have the gauge – fill it to 100% and start laser
                this.gaugeLevel = 1;
                this.laserActive = true;
                this.laserAnimTime = 0;
              } else {
                // First time picking up – start at 50%
                this.powerupActive = true;
                this.gaugeLevel = 0.5;
                this.laserActive = false;
              }
            }
          } else if (e instanceof RedTreasure && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#ff2222', 20);
              this.player.healHp();
              this.player.activateShield();
            }
          } else if (e instanceof GlowingClam && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.spawnParticles(e.x, e.y, '#44ff88', 24);
              // Grant 5 orbital pearls (reset if already active)
              this.orbitalPearls = [
                { angleOffset: 0,                      killsRemaining: 2, glowTimer: 0 },
                { angleOffset: (Math.PI * 2) / 5,      killsRemaining: 2, glowTimer: Math.PI * 0.4 },
                { angleOffset: (Math.PI * 4) / 5,      killsRemaining: 2, glowTimer: Math.PI * 0.8 },
                { angleOffset: (Math.PI * 6) / 5,      killsRemaining: 2, glowTimer: Math.PI * 1.2 },
                { angleOffset: (Math.PI * 8) / 5,      killsRemaining: 2, glowTimer: Math.PI * 1.6 },
              ];
            }
          } else if (e instanceof GoldenCoin && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.goldScore += 1;
              this.spawnParticles(e.x, e.y, '#ffd700', 12);
            }
          } else if (e instanceof Jellyfish) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                const tookDamage = this.player.takeDamage();
                if (tookDamage) {
                  this.shakeTimer = SCREEN_SHAKE_DURATION;
                  this.deactivatePowerup();
                }
              }
            }
          } else if (e instanceof Shark) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                const tookDamage = this.player.takeDamage();
                if (tookDamage) {
                  this.shakeTimer = SCREEN_SHAKE_DURATION;
                  this.deactivatePowerup();
                }
              }
            }
          } else if (e instanceof Squid) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                const tookDamage = this.player.takeDamage();
                if (tookDamage) {
                  this.shakeTimer = SCREEN_SHAKE_DURATION;
                  this.deactivatePowerup();
                }
              }
            }
          }
        }

        // Orbital pearls – rotate, collide with enemies
        if (this.orbitalPearls.length > 0) {
          this.orbitalPearlAngle += PEARL_SPIN_SPEED * dt;

          for (const pearl of this.orbitalPearls) {
            pearl.glowTimer += dt * 4;
          }

          const angle = this.orbitalPearlAngle;
          this.entities = this.entities.filter(e => {
            if (!(e instanceof Jellyfish || e instanceof Shark || e instanceof Squid)) return true;
            for (const pearl of this.orbitalPearls) {
              if (pearl.killsRemaining <= 0) continue;
              const pa = angle + pearl.angleOffset;
              const px = this.player.x + Math.cos(pa) * PEARL_ORBIT_RADIUS;
              const py = this.player.y + Math.sin(pa) * PEARL_ORBIT_RADIUS;
              const dx = e.x - px;
              const dy = e.y - py;
              if (Math.sqrt(dx * dx + dy * dy) < PEARL_HIT_RADIUS + e.width * 0.4) {
                if (e instanceof Squid) {
                  // Squid needs 3 HP (≈2.5× hits) to die from a pearl
                  const dead = e.takePearlHit();
                  if (!dead) {
                    // Pearl bounces off but doesn't consume a kill yet
                    return true;
                  }
                }
                pearl.killsRemaining -= 1;
                this.spawnExplosion(e.x, e.y);
                this.shakeTimer = Math.max(this.shakeTimer, SCREEN_SHAKE_DURATION * 0.6);
                return false;
              }
            }
            return true;
          });

          // Discard spent pearls
          this.orbitalPearls = this.orbitalPearls.filter(p => p.killsRemaining > 0);
        }

        // Level progression
        if (this.level < 2 && this.score >= LEVEL2_SCORE_THRESHOLD) {
          this.level = 2;
          this.levelUpBannerTimer = 2.5;
        }
        if (this.level < 3 && this.score >= LEVEL3_SCORE_THRESHOLD) {
          this.level = 3;
          this.levelUpBannerTimer = 2.5;
        }
        if (this.levelUpBannerTimer > 0) {
          this.levelUpBannerTimer -= dt;
        }

        // Remove collected
        this.entities = this.entities.filter(e => {
          if (e instanceof Fish && e.collected) return false;
          if (e instanceof Starfish && e.collected) return false;
          if (e instanceof TreasureChest && e.collected) return false;
          if (e instanceof PowerupChest && e.collected) return false;
          if (e instanceof RedTreasure && e.collected) return false;
          if (e instanceof GlowingClam && e.collected) return false;
          if (e instanceof GoldenCoin && e.collected) return false;
          return true;
        });

        // Update particles
        for (const p of this.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        // Update disintegration particles
        for (const p of this.disintegrationParticles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.rotSpeed * dt;
          p.life -= dt;
        }
        this.disintegrationParticles = this.disintegrationParticles.filter(p => p.life > 0);

        // Update shockwave rings
        for (const ring of this.shockwaveRings) {
          ring.radius += (ring.maxRadius / ring.maxLife) * dt;
          ring.life -= dt;
        }
        this.shockwaveRings = this.shockwaveRings.filter(r => r.life > 0);

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
    this.disintegrationParticles = [];
    this.score = 0;
    this.goldScore = 0;
    this.level = 1;
    this.levelUpBannerTimer = 0;
    this.scrollSpeed = INITIAL_SCROLL_SPEED;
    this.spawner.reset();
    this.powerupActive = false;
    this.gaugeLevel = 0;
    this.laserActive = false;
    this.laserAnimTime = 0;
    this.shieldAnimTime = 0;
    this.orbitalPearls = [];
    this.orbitalPearlAngle = 0;
    this.shockwaveRings = [];
  }

  private incrementLaserGauge(): void {
    if (!this.powerupActive) return;
    this.gaugeLevel = Math.min(1, this.gaugeLevel + GAUGE_PER_EAT);
    if (this.gaugeLevel >= 1 && !this.laserActive) {
      this.laserActive = true;
      this.laserAnimTime = 0;
    }
  }

  private deactivatePowerup(): void {
    this.powerupActive = false;
    this.gaugeLevel = 0;
    this.laserActive = false;
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

  private spawnExplosion(x: number, y: number): void {
    const explosionColors = ['#88ffcc', '#ffffff', '#ffff66', '#44ffaa', '#ff8844'];
    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 200;
      const color = explosionColors[Math.floor(Math.random() * explosionColors.length)];
      const maxLife = 0.5 + Math.random() * 0.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        color,
        size: 3 + Math.random() * 4,
      });
    }
    this.shockwaveRings.push({
      x, y,
      radius: SHOCKWAVE_INITIAL_RADIUS,
      maxRadius: SHOCKWAVE_MAX_RADIUS,
      life: SHOCKWAVE_DURATION,
      maxLife: SHOCKWAVE_DURATION,
    });
  }

  private spawnDisintegration(x: number, y: number, colors: string[]): void {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 18 + Math.random() * 55;
      const maxLife = 0.7 + Math.random() * 0.7;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.disintegrationParticles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        color,
        w: 2 + Math.random() * 4,
        h: 1 + Math.random() * 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
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

    // Disintegration particles (spinning debris fragments)
    for (const p of this.disintegrationParticles) {
      const alpha = (p.life / p.maxLife) * 0.95;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    // Shockwave rings (from pearl kills)
    for (const ring of this.shockwaveRings) {
      const alpha = (ring.life / ring.maxLife) * 0.8;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#88ffcc';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#44ffaa';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Red shield aura
    if (this.player.shieldActive) {
      ctx.save();
      const shieldPulse = 0.25 + Math.sin(this.shieldAnimTime * 10) * 0.1;
      ctx.globalAlpha = shieldPulse;
      const shieldGrad = ctx.createRadialGradient(
        this.player.x, this.player.y, this.player.width * 0.2,
        this.player.x, this.player.y, this.player.width * 0.85,
      );
      shieldGrad.addColorStop(0, 'rgba(255,60,60,0.9)');
      shieldGrad.addColorStop(1, 'rgba(200,0,0,0)');
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.ellipse(this.player.x, this.player.y, this.player.width * 0.85, this.player.height * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Powerup glow around the stingray
    if (this.powerupActive) {
      ctx.save();
      const glowPulse = 0.25 + Math.sin(Date.now() / 120) * 0.1;
      ctx.globalAlpha = glowPulse;
      const glowGrad = ctx.createRadialGradient(
        this.player.x, this.player.y, this.player.width * 0.2,
        this.player.x, this.player.y, this.player.width * 0.75,
      );
      glowGrad.addColorStop(0, 'rgba(0,229,255,0.9)');
      glowGrad.addColorStop(1, 'rgba(0,100,255,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(this.player.x, this.player.y, this.player.width * 0.75, this.player.height * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Laser beam (blue vertical blast forward/upward from stingray)
    if (this.laserActive) {
      ctx.save();
      const beamW = 40;
      const bx = this.player.x;
      const by = this.player.y - this.player.height / 2;

      // Core beam gradient
      const laserGrad = ctx.createLinearGradient(bx - beamW / 2, 0, bx + beamW / 2, 0);
      laserGrad.addColorStop(0, 'rgba(0,100,255,0)');
      laserGrad.addColorStop(0.35, 'rgba(0,229,255,0.6)');
      laserGrad.addColorStop(0.5, 'rgba(255,255,255,0.95)');
      laserGrad.addColorStop(0.65, 'rgba(0,229,255,0.6)');
      laserGrad.addColorStop(1, 'rgba(0,100,255,0)');

      // Outer glow
      const outerAlpha = 0.15 + Math.sin(this.laserAnimTime * 10) * 0.05;
      ctx.globalAlpha = outerAlpha;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(bx - beamW, 0, beamW * 2, by);

      // Inner beam
      ctx.globalAlpha = 0.85 + Math.sin(this.laserAnimTime * 15) * 0.1;
      ctx.fillStyle = laserGrad;
      ctx.fillRect(bx - beamW / 2, 0, beamW, by);

      ctx.restore();
    }

    // Orbital pearls – draw glowing pearls orbiting the player
    if (this.orbitalPearls.length > 0) {
      const pr = PEARL_DRAW_RADIUS;
      for (const pearl of this.orbitalPearls) {
        const pa = this.orbitalPearlAngle + pearl.angleOffset;
        const px = this.player.x + Math.cos(pa) * PEARL_ORBIT_RADIUS;
        const py = this.player.y + Math.sin(pa) * PEARL_ORBIT_RADIUS;

        // Outer glow
        ctx.save();
        const glow = ctx.createRadialGradient(px, py, pr * 0.3, px, py, pr * 2.2);
        glow.addColorStop(0, 'rgba(180,255,200,0.7)');
        glow.addColorStop(1, 'rgba(0,200,80,0)');
        ctx.globalAlpha = 0.55 + Math.sin(pearl.glowTimer) * 0.2;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, pr * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Pearl body
        ctx.save();
        const pearlGrad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.05, px, py, pr);
        pearlGrad.addColorStop(0, '#ffffff');
        pearlGrad.addColorStop(0.45, '#ccf5dd');
        pearlGrad.addColorStop(1, '#44cc88');
        ctx.fillStyle = pearlGrad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();

        // Shine highlight
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px - pr * 0.35, py - pr * 0.35, pr * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    this.player.render(ctx);
    this.hud.render(ctx, this.score, this.player.hp, this.powerupActive, this.gaugeLevel, this.laserActive, this.player.shieldActive, this.player.shieldTimer, this.goldScore);

    // Level indicator (top-right, below score area)
    if (this.level >= 2) {
      ctx.save();
      ctx.font = 'bold 12px monospace';
      const lvlColor = this.level >= 3 ? '#00ccff' : '#ff6ed8';
      ctx.fillStyle = lvlColor;
      ctx.shadowColor = lvlColor;
      ctx.shadowBlur = 6;
      // Shift down if gold score is visible
      ctx.fillText(`LVL ${this.level}`, 10, this.goldScore > 0 ? 58 : 44);
      ctx.restore();
    }

    // Level-up banner
    if (this.levelUpBannerTimer > 0) {
      const alpha = Math.min(1, this.levelUpBannerTimer / 0.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      if (this.level >= 3) {
        ctx.fillStyle = '#00ccff';
        ctx.shadowColor = '#0088ff';
        ctx.shadowBlur = 24;
        ctx.fillText('LEVEL 3!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ccf0ff';
        ctx.shadowBlur = 8;
        ctx.fillText('Jellyfish are electrified! Sharks hunt you!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
      } else {
        ctx.fillStyle = '#ff6ed8';
        ctx.shadowColor = '#ff00cc';
        ctx.shadowBlur = 24;
        ctx.fillText('LEVEL 2!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffccf0';
        ctx.shadowBlur = 8;
        ctx.fillText('Squid attackers incoming!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
      }
      ctx.restore();
    }
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

    if (this.goldScore > 0) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#b8860b';
      ctx.fillText(`Gold Coins: $${this.goldScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36);
    }

    const blink = Math.sin(this.titleAnimTime * 3) > 0;
    if (blink) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#adf';
      ctx.fillText('Press SPACE to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60 + (this.goldScore > 0 ? 20 : 0));
    }
    ctx.restore();
  }
}
