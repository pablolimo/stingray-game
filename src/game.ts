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
import {
  SmallEnemy, BigEnemy, MediumEnemy, Level3Enemy,
  FoodCollectible, BonusFoodCollectible, TreasureCollectible, PowerupCollectible,
  HealCollectible, OrbitalCollectible, CoinCollectible, SpeedBoostCollectible,
  ProjectileEntity, BossEnemy,
} from './entities/entityRoles';
import { StageDefinition } from './stages/stageDefinition';
import { stage1Definition } from './stages/stage1';
import { stage2Definition } from './stages/stage2';
import { stage3Definition } from './stages/stage3';
import { PlayerArcBall } from './entities/playerarcball';
import { FloatingBomb } from './entities/stage3/floatingbomb';
import { RadioactiveBarrel } from './entities/stage3/radioactivebarrel';
import { ElectricEel } from './entities/stage3/electriceel';
import { FrogTongue } from './entities/stage3/frogtongue';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  INITIAL_SCROLL_SPEED, MAX_SCROLL_SPEED, SCROLL_SPEED_INCREMENT,
  SCREEN_SHAKE_DURATION, SCREEN_SHAKE_MAGNITUDE,
  LASER_DRAIN_RATE, GAUGE_PER_EAT,
  LEVEL2_SCORE_THRESHOLD, LEVEL3_SCORE_THRESHOLD, LEVEL4_SCORE_THRESHOLD,
  PEARL_ORBIT_RADIUS, PEARL_SPIN_SPEED, PEARL_HIT_RADIUS, PEARL_DRAW_RADIUS,
  EXPLOSION_PARTICLE_COUNT, SHOCKWAVE_INITIAL_RADIUS, SHOCKWAVE_MAX_RADIUS, SHOCKWAVE_DURATION,
  SPEED_BOOST_MULTIPLIER, SPEED_BOOST_DURATION,
  NUCLEAR_BLAST_DURATION, NUCLEAR_BLAST_HALF_WIDTH,
  HOOK_DURATION,
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
  // Pause button bounds (canvas coordinates, updated each render)
  private pauseButtonBounds = { x: 0, y: 0, width: 28, height: 20 };
  private boss: BossEnemy | null = null;
  private bossDefeatedTimer: number = 0;
  private level4BlueChestTimer: number = 0;
  private currentStageId: number = 1;
  private stageDef: StageDefinition = stage1Definition;
  private activePowerupStyle: 'laser' | 'arc' | 'nuclear' = 'laser';
  private arcBallTimer: number = 0;
  // Stage 3 specific state
  private nuclearGaugeLevel: number = 0;  // separate gauge that persists through damage
  private nuclearBlastActive: boolean = false;
  private nuclearBlastTimer: number = 0;
  private nuclearBlastAnimTime: number = 0;
  private speedBoostTimer: number = 0;
  private baseScrollSpeed: number = INITIAL_SCROLL_SPEED; // scroll before boost

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.background = new Background(this.currentStageId);
    this.player = new Player();
    this.input = new InputHandler();
    this.spawner = new Spawner(this.stageDef.spawnConfig);
    this.hud = new HUD();
    canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  setStage(stageId: number): void {
    this.currentStageId = stageId;
    if (stageId === 3) {
      this.stageDef = stage3Definition;
    } else if (stageId === 2) {
      this.stageDef = stage2Definition;
    } else {
      this.stageDef = stage1Definition;
    }
    this.background = new Background(stageId);
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
        // Pause on spacebar press
        if (spaceNow && !this.spaceWasDown) {
          this.state = GameState.Paused;
          break;
        }
        // Speed boost: modulate scroll speed
        if (this.speedBoostTimer > 0) {
          this.speedBoostTimer -= dt;
          this.baseScrollSpeed = Math.min(this.baseScrollSpeed + SCROLL_SPEED_INCREMENT * dt, MAX_SCROLL_SPEED);
          this.scrollSpeed = Math.min(this.baseScrollSpeed * SPEED_BOOST_MULTIPLIER, MAX_SCROLL_SPEED * SPEED_BOOST_MULTIPLIER);
        } else {
          this.baseScrollSpeed = Math.min(this.baseScrollSpeed + SCROLL_SPEED_INCREMENT * dt, MAX_SCROLL_SPEED);
          this.scrollSpeed = this.baseScrollSpeed;
        }
        this.background.update(dt, this.scrollSpeed);
        this.player.update(dt, this.input);

        // Nuclear blast timer
        if (this.nuclearBlastActive) {
          this.nuclearBlastTimer -= dt;
          this.nuclearBlastAnimTime += dt;
          if (this.nuclearBlastTimer <= 0) {
            this.nuclearBlastActive = false;
            this.nuclearGaugeLevel = 0;
          }
        }

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
            this.arcBallTimer = 0;
            // powerupActive stays true – can be recharged
          }
          // Arc weapon: fire glowing energy balls periodically
          if (this.activePowerupStyle === 'arc') {
            this.arcBallTimer += dt;
            const ARC_FIRE_INTERVAL = 0.7;
            if (this.arcBallTimer >= ARC_FIRE_INTERVAL) {
              this.arcBallTimer -= ARC_FIRE_INTERVAL;
              this.entities.push(new PlayerArcBall(this.player.x, this.player.y - this.player.height / 2));
            }
          }
        }
        if (this.player.shieldActive) {
          this.shieldAnimTime += dt;
        }

        // Update entities
        for (const e of this.entities) {
          if (e instanceof MediumEnemy) {
            e.targetX = this.player.x;
          }
          if (e instanceof Level3Enemy) {
            e.targetX = this.player.x;
            e.targetY = this.player.y;
          }
          if (e instanceof BigEnemy && this.level >= 3) {
            e.targetX = this.player.x;
          }
          e.update(dt, this.scrollSpeed);
        }

        // Collect projectiles spawned by Level3Enemies this frame
        for (const e of this.entities) {
          if (e instanceof Level3Enemy && e.pendingProjectiles.length > 0) {
            this.entities.push(...e.pendingProjectiles);
            e.pendingProjectiles = [];
          }
        }

        // Update boss and collect its projectiles
        if (this.boss && !this.boss.defeated) {
          this.boss.targetX = this.player.x;
          this.boss.targetY = this.player.y;
          this.boss.update(dt, this.scrollSpeed);
          if (this.boss.pendingProjectiles.length > 0) {
            this.entities.push(...this.boss.pendingProjectiles);
            this.boss.pendingProjectiles = [];
          }
        }

        // Spawn (disabled during Level 4 boss fight)
        if (this.level < 4) {
          const newEntities = this.spawner.update(dt, this.scrollSpeed, this.player.x, this.level);
          this.entities.push(...newEntities);
        }

        // Level 4: spawn two powerup chests every 10 seconds
        if (this.level === 4 && this.boss && !this.boss.defeated) {
          this.level4BlueChestTimer += dt;
          if (this.level4BlueChestTimer >= 10.0) {
            this.level4BlueChestTimer -= 10.0;
            this.entities.push(this.stageDef.spawnConfig.createPowerupChest(40 + Math.random() * (CANVAS_WIDTH - 80), -30));
            this.entities.push(this.stageDef.spawnConfig.createPowerupChest(40 + Math.random() * (CANVAS_WIDTH - 80), -30));
          }
        }

        // Remove off-screen or expired entities
        this.entities = this.entities.filter(e => {
          if (e instanceof MediumEnemy && e.expired) return false;
          if (e instanceof Level3Enemy && e.expired) return false;
          if (e instanceof ProjectileEntity && !e.active) return false;
          return e.y > -100 && e.y < CANVAS_HEIGHT + 100;
        });

        // Laser beam – destroy enemies in its path each frame while active (laser style only)
        if (this.laserActive && this.activePowerupStyle === 'laser') {
          const laserBeamHalfWidth = 20;
          this.entities = this.entities.filter(e => {
            if (e instanceof SmallEnemy || e instanceof BigEnemy || e instanceof MediumEnemy || e instanceof Level3Enemy) {
              if (Math.abs(e.x - this.player.x) < laserBeamHalfWidth + e.width / 2 && e.y < this.player.y) {
                if (e instanceof MediumEnemy) {
                  const dead = e.takeLaserHit();
                  if (!dead) {
                    this.spawnParticles(e.x, e.y, this.stageDef.mediumEnemyLaserHitColor, 5);
                    return true;
                  }
                  this.spawnDisintegration(e.x, e.y, this.stageDef.mediumEnemyDisintColors);
                  return false;
                }
                if (e instanceof Level3Enemy) {
                  const dead = e.takeLaserHit();
                  if (!dead) {
                    this.spawnParticles(e.x, e.y, this.stageDef.level3EnemyLaserHitColor, 5);
                    return true;
                  }
                  this.spawnDisintegration(e.x, e.y, this.stageDef.level3EnemyDisintColors);
                  return false;
                }
                // SmallEnemy / BigEnemy: disintegrate immediately
                const colors = e instanceof SmallEnemy
                  ? this.stageDef.smallEnemyDisintColors
                  : this.stageDef.bigEnemyDisintColors;
                this.spawnDisintegration(e.x, e.y, colors);
                return false;
              }
            }
            return true;
          });

          // Boss: laser can damage it when not raging
          if (this.boss && !this.boss.defeated) {
            const laserBeamHalfWidth = 20;
            if (
              Math.abs(this.boss.x - this.player.x) < laserBeamHalfWidth + this.boss.width / 2 &&
              this.boss.y < this.player.y
            ) {
              const dead = this.boss.takeLaserHit();
              if (dead) {
                this.spawnBossDefeatExplosion();
              } else {
                this.spawnParticles(this.boss.x, this.boss.y, '#ffcc00', 8);
              }
            }
          }
        }

        // Nuclear blast beam – stronger than laser, wider, deals multiple hits per tick
        if (this.nuclearBlastActive) {
          const nuclearHalfWidth = NUCLEAR_BLAST_HALF_WIDTH;
          this.entities = this.entities.filter(e => {
            if (e instanceof SmallEnemy || e instanceof BigEnemy || e instanceof MediumEnemy || e instanceof Level3Enemy) {
              if (Math.abs(e.x - this.player.x) < nuclearHalfWidth + e.width / 2 && e.y < this.player.y) {
                if (e instanceof MediumEnemy) {
                  // Nuclear does 3× laser damage
                  for (let _i = 0; _i < 3; _i++) {
                    const dead = e.takeLaserHit();
                    if (dead) {
                      this.spawnDisintegration(e.x, e.y, this.stageDef.mediumEnemyDisintColors);
                      return false;
                    }
                  }
                  this.spawnParticles(e.x, e.y, '#ff4400', 8);
                  return true;
                }
                if (e instanceof Level3Enemy) {
                  for (let _i = 0; _i < 3; _i++) {
                    const dead = e.takeLaserHit();
                    if (dead) {
                      this.spawnDisintegration(e.x, e.y, this.stageDef.level3EnemyDisintColors);
                      return false;
                    }
                  }
                  this.spawnParticles(e.x, e.y, '#ff6600', 8);
                  return true;
                }
                const colors = e instanceof SmallEnemy
                  ? this.stageDef.smallEnemyDisintColors
                  : this.stageDef.bigEnemyDisintColors;
                this.spawnDisintegration(e.x, e.y, colors);
                return false;
              }
            }
            return true;
          });

          if (this.boss && !this.boss.defeated) {
            if (
              Math.abs(this.boss.x - this.player.x) < nuclearHalfWidth + this.boss.width / 2 &&
              this.boss.y < this.player.y
            ) {
              // Nuclear does 3× hits per tick
              let dead = false;
              for (let _i = 0; _i < 3; _i++) {
                dead = this.boss.takeLaserHit();
                if (dead) break;
              }
              if (dead) {
                this.spawnBossDefeatExplosion();
              } else {
                this.spawnParticles(this.boss.x, this.boss.y, '#ff4400', 10);
              }
            }
          }
        }

        // Arc energy balls – player projectiles hitting enemies
        if (this.activePowerupStyle === 'arc') {
          const arcBalls = this.entities.filter(
            e => e instanceof PlayerArcBall && (e as PlayerArcBall).active,
          ) as PlayerArcBall[];
          if (arcBalls.length > 0) {
            this.entities = this.entities.filter(e => {
              if (e instanceof SmallEnemy || e instanceof BigEnemy || e instanceof MediumEnemy || e instanceof Level3Enemy) {
                const eBounds = e.getBounds();
                for (const ball of arcBalls) {
                  if (!ball.active) continue;
                  if (aabb(ball.getBounds(), eBounds)) {
                    ball.active = false;
                    if (e instanceof MediumEnemy) {
                      // Arc ball hits harder: 3× damage
                      for (let i = 0; i < 3; i++) {
                        const dead = e.takePearlHit();
                        if (dead) { this.spawnDisintegration(e.x, e.y, this.stageDef.mediumEnemyDisintColors); return false; }
                      }
                      this.spawnParticles(e.x, e.y, this.stageDef.mediumEnemyLaserHitColor, 10);
                      return true;
                    }
                    if (e instanceof Level3Enemy) {
                      for (let i = 0; i < 3; i++) {
                        const dead = e.takePearlHit();
                        if (dead) { this.spawnDisintegration(e.x, e.y, this.stageDef.level3EnemyDisintColors); return false; }
                      }
                      this.spawnParticles(e.x, e.y, this.stageDef.level3EnemyLaserHitColor, 10);
                      return true;
                    }
                    // SmallEnemy / BigEnemy: destroy on contact
                    const colors = e instanceof SmallEnemy
                      ? this.stageDef.smallEnemyDisintColors
                      : this.stageDef.bigEnemyDisintColors;
                    this.spawnDisintegration(e.x, e.y, colors);
                    return false;
                  }
                }
              }
              return true;
            });

            // Arc balls vs boss
            if (this.boss && !this.boss.defeated) {
              const bossBounds = this.boss.getBounds();
              for (const ball of arcBalls) {
                if (!ball.active) continue;
                if (aabb(ball.getBounds(), bossBounds)) {
                  ball.active = false;
                  let dead = false;
                  for (let i = 0; i < 3; i++) {
                    dead = this.boss.takePearlHit();
                    if (dead) break;
                  }
                  if (dead) {
                    this.spawnBossDefeatExplosion();
                  } else {
                    this.spawnParticles(this.boss.x, this.boss.y, '#ccaaff', 14);
                    this.shakeTimer = Math.max(this.shakeTimer, SCREEN_SHAKE_DURATION * 0.5);
                  }
                }
              }
            }
          }
        }

        // Collisions
        const playerBounds = this.player.getBounds();

        // Boss ↔ player body collision
        if (this.boss && !this.boss.defeated && !this.player.isInvincible()) {
          if (aabb(playerBounds, this.boss.getBounds())) {
            const tookDamage = this.player.takeDamage();
            if (tookDamage) {
              this.shakeTimer = SCREEN_SHAKE_DURATION;
              this.deactivatePowerup();
            }
          }
        }

        for (const e of this.entities) {
          if (e instanceof FoodCollectible && !e.collected) {
            // Green glow: food melts (disappears) before reaching the stingray
            if (this.player.greenGlowTimer > 0) {
              const dx = e.x - this.player.x;
              const dy = e.y - this.player.y;
              if (Math.sqrt(dx * dx + dy * dy) < 80) {
                e.collected = true; // silently melt – no score
                this.spawnParticles(e.x, e.y, '#44ff44', 4);
              }
              continue;
            }
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#f4721a', 8);
              this.incrementLaserGauge();
            }
          } else if (e instanceof BonusFoodCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#e8612a', 12);
              this.incrementLaserGauge();
            }
          } else if (e instanceof TreasureCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#ffd700', 16);
              this.incrementLaserGauge();
            }
          } else if (e instanceof PowerupCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.activePowerupStyle = e.powerupStyle;
              const glowColor = this.activePowerupStyle === 'arc' ? '#ffffff'
                              : this.activePowerupStyle === 'nuclear' ? '#44ff88'
                              : '#00e5ff';
              this.spawnParticles(e.x, e.y, glowColor, 20);
              if (this.activePowerupStyle === 'nuclear') {
                this.powerupActive = true;
                if (this.nuclearGaugeLevel === 0) this.nuclearGaugeLevel = 0.3;
              } else if (this.powerupActive) {
                // Already have the gauge – fill it to 100% and start firing
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
          } else if (e instanceof SpeedBoostCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.speedBoostTimer = SPEED_BOOST_DURATION;
              this.spawnParticles(e.x, e.y, '#ffee00', 24);
            }
          } else if (e instanceof HealCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.score += e.score;
              this.spawnParticles(e.x, e.y, '#ff2222', 20);
              this.player.healHp();
              this.player.activateShield();
            }
          } else if (e instanceof OrbitalCollectible && !e.collected) {
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
          } else if (e instanceof CoinCollectible && !e.collected) {
            const bounds = e.getBounds();
            if (aabb(playerBounds, bounds)) {
              e.collected = true;
              this.goldScore += 1;
              this.spawnParticles(e.x, e.y, '#ffd700', 12);
            }
          } else if (e instanceof FloatingBomb) {
            // Floating bomb: instant death
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                this.player.hp = 0;
                this.shakeTimer = SCREEN_SHAKE_DURATION * 3;
                this.spawnExplosion(e.x, e.y);
              }
            }
          } else if (e instanceof RadioactiveBarrel) {
            // Radioactive barrel: 2-damage + green glow
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                const tookDamage = this.player.takeDamage(2);
                if (tookDamage) {
                  this.player.activateGreenGlow();
                  this.shakeTimer = SCREEN_SHAKE_DURATION * 1.5;
                  this.deactivatePowerup();
                  this.spawnParticles(e.x, e.y, '#44ff44', 16);
                }
              }
            }
          } else if (e instanceof ElectricEel) {
            // Electric eel: field = 1 damage, body = 2 damage
            if (!this.player.isInvincible()) {
              const bodyBounds = e.getBounds();
              if (aabb(playerBounds, bodyBounds)) {
                const tookDamage = this.player.takeDamage(2);
                if (tookDamage) {
                  this.shakeTimer = SCREEN_SHAKE_DURATION;
                  this.deactivatePowerup();
                  this.spawnParticles(e.x, e.y, '#00ccff', 12);
                }
              } else {
                // Check electric field (outer zone)
                const fieldBounds = e.getFieldBounds();
                if (aabb(playerBounds, fieldBounds)) {
                  const tookDamage = this.player.takeDamage(1);
                  if (tookDamage) {
                    this.shakeTimer = SCREEN_SHAKE_DURATION * 0.5;
                    this.deactivatePowerup();
                    this.spawnParticles(e.x, e.y, '#88eeff', 8);
                  }
                }
              }
            }
          } else if (e instanceof SmallEnemy && !(e instanceof FloatingBomb)) {
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
          } else if (e instanceof BigEnemy && !(e instanceof RadioactiveBarrel)) {
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
          } else if (e instanceof MediumEnemy) {
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
          } else if (e instanceof Level3Enemy && !(e instanceof ElectricEel)) {
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
          } else if (e instanceof ProjectileEntity && e.active && !(e instanceof PlayerArcBall)) {
            if (!this.player.isInvincible()) {
              const bounds = e.getBounds();
              if (aabb(playerBounds, bounds)) {
                // FrogTongue: hook the player
                if (e instanceof FrogTongue && !e.hitPlayer) {
                  e.hitPlayer = true;
                  e.active = false;
                  if (this.boss) {
                    const dx = this.boss.x - this.player.x;
                    const dy = this.boss.y - this.player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const pullSpeed = 180;
                    this.player.hookedTimer = HOOK_DURATION;
                    this.player.hookVx = (dx / dist) * pullSpeed;
                    this.player.hookVy = (dy / dist) * pullSpeed;
                  }
                } else {
                  e.active = false;
                  const tookDamage = this.player.takeDamage();
                  if (tookDamage) {
                    this.shakeTimer = SCREEN_SHAKE_DURATION;
                    this.deactivatePowerup();
                  }
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
            if (!(e instanceof SmallEnemy || e instanceof BigEnemy || e instanceof MediumEnemy || e instanceof Level3Enemy)) return true;
            for (const pearl of this.orbitalPearls) {
              if (pearl.killsRemaining <= 0) continue;
              const pa = angle + pearl.angleOffset;
              const px = this.player.x + Math.cos(pa) * PEARL_ORBIT_RADIUS;
              const py = this.player.y + Math.sin(pa) * PEARL_ORBIT_RADIUS;
              const dx = e.x - px;
              const dy = e.y - py;
              if (Math.sqrt(dx * dx + dy * dy) < PEARL_HIT_RADIUS + e.width * 0.4) {
                if (e instanceof MediumEnemy) {
                  const dead = e.takePearlHit();
                  if (!dead) {
                    return true;
                  }
                }
                if (e instanceof Level3Enemy) {
                  const dead = e.takePearlHit();
                  if (!dead) {
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

          // Pearls can also hit the boss (when not raging)
          if (this.boss && !this.boss.defeated && !this.boss.isRaging) {
            const bossBounds = this.boss.getBounds();
            for (const pearl of this.orbitalPearls) {
              if (pearl.killsRemaining <= 0) continue;
              const pa = this.orbitalPearlAngle + pearl.angleOffset;
              const ppx = this.player.x + Math.cos(pa) * PEARL_ORBIT_RADIUS;
              const ppy = this.player.y + Math.sin(pa) * PEARL_ORBIT_RADIUS;
              if (
                ppx >= bossBounds.x && ppx <= bossBounds.x + bossBounds.width &&
                ppy >= bossBounds.y && ppy <= bossBounds.y + bossBounds.height
              ) {
                const dead = this.boss.takePearlHit();
                pearl.killsRemaining -= 1;
                this.spawnExplosion(this.boss.x, this.boss.y);
                this.shakeTimer = Math.max(this.shakeTimer, SCREEN_SHAKE_DURATION * 0.6);
                if (dead) {
                  this.spawnBossDefeatExplosion();
                }
                break;
              }
            }
            this.orbitalPearls = this.orbitalPearls.filter(p => p.killsRemaining > 0);
          }
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
        if (this.level < 4 && this.score >= LEVEL4_SCORE_THRESHOLD) {
          this.level = 4;
          this.levelUpBannerTimer = 3.0;
          // Clear all enemies and their projectiles; keep only collectables
          this.entities = this.entities.filter(
            e =>
              e instanceof TreasureCollectible ||
              e instanceof PowerupCollectible ||
              e instanceof HealCollectible ||
              e instanceof OrbitalCollectible ||
              e instanceof CoinCollectible,
          );
          // Spawn level-4 loot: 2 powerup chests, 1 red chest, 1 green clam
          this.entities.push(this.stageDef.spawnConfig.createPowerupChest(CANVAS_WIDTH * 0.22, 280));
          this.entities.push(this.stageDef.spawnConfig.createPowerupChest(CANVAS_WIDTH * 0.78, 380));
          this.entities.push(this.stageDef.spawnConfig.createRedTreasure(CANVAS_WIDTH * 0.50, 220));
          this.entities.push(this.stageDef.spawnConfig.createGlowingClam(CANVAS_WIDTH * 0.62, 460));
          // Spawn the boss from the top centre
          this.boss = this.stageDef.createBoss(CANVAS_WIDTH / 2, -160);
        }
        if (this.levelUpBannerTimer > 0) {
          this.levelUpBannerTimer -= dt;
        }

        // Boss defeated → brief explosion then stage clear
        if (this.boss && this.boss.defeated) {
          this.bossDefeatedTimer -= dt;
          if (this.bossDefeatedTimer <= 0) {
            this.state = GameState.StageClear;
          }
        }

        // Remove collected
        this.entities = this.entities.filter(e => {
          if (e instanceof FoodCollectible && e.collected) return false;
          if (e instanceof BonusFoodCollectible && e.collected) return false;
          if (e instanceof TreasureCollectible && e.collected) return false;
          if (e instanceof PowerupCollectible && e.collected) return false;
          if (e instanceof HealCollectible && e.collected) return false;
          if (e instanceof OrbitalCollectible && e.collected) return false;
          if (e instanceof CoinCollectible && e.collected) return false;
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

      case GameState.Paused:
        // Resume on spacebar press
        if (spaceNow && !this.spaceWasDown) {
          this.state = GameState.Playing;
        }
        break;

      case GameState.GameOver:
        this.background.update(dt, 30);
        if (spaceNow && !this.spaceWasDown) {
          this.startGame();
        }
        break;

      case GameState.StageClear:
        this.background.update(dt, 40);
        if (spaceNow && !this.spaceWasDown) {
          this.startGame();
        }
        break;
    }

    this.spaceWasDown = spaceNow;
  }

  private handleClick(e: MouseEvent): void {
    if (this.state !== GameState.Playing && this.state !== GameState.Paused) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const b = this.pauseButtonBounds;
    if (cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height) {
      this.state = this.state === GameState.Paused ? GameState.Playing : GameState.Paused;
    }
  }

  private startGame(): void {
    this.state = GameState.Playing;
    this.background = new Background(this.currentStageId);
    this.player = new Player();
    this.entities = [];
    this.particles = [];
    this.disintegrationParticles = [];
    this.score = 0;
    this.goldScore = 0;
    this.level = 1;
    this.levelUpBannerTimer = 0;
    this.scrollSpeed = INITIAL_SCROLL_SPEED;
    this.baseScrollSpeed = INITIAL_SCROLL_SPEED;
    this.spawner = new Spawner(this.stageDef.spawnConfig);
    this.powerupActive = false;
    this.gaugeLevel = 0;
    this.laserActive = false;
    this.laserAnimTime = 0;
    this.shieldAnimTime = 0;
    this.orbitalPearls = [];
    this.orbitalPearlAngle = 0;
    this.shockwaveRings = [];
    this.boss = null;
    this.bossDefeatedTimer = 0;
    this.level4BlueChestTimer = 0;
    this.activePowerupStyle = 'laser';
    this.arcBallTimer = 0;
    this.nuclearGaugeLevel = 0;
    this.nuclearBlastActive = false;
    this.nuclearBlastTimer = 0;
    this.nuclearBlastAnimTime = 0;
    this.speedBoostTimer = 0;
    this.baseScrollSpeed = INITIAL_SCROLL_SPEED;
  }

  private incrementLaserGauge(): void {
    if (!this.powerupActive) return;
    if (this.activePowerupStyle === 'nuclear') {
      this.nuclearGaugeLevel = Math.min(1, this.nuclearGaugeLevel + GAUGE_PER_EAT);
      if (this.nuclearGaugeLevel >= 1 && !this.nuclearBlastActive) {
        this.nuclearBlastActive = true;
        this.nuclearBlastTimer = NUCLEAR_BLAST_DURATION;
        this.nuclearBlastAnimTime = 0;
      }
      return;
    }
    this.gaugeLevel = Math.min(1, this.gaugeLevel + GAUGE_PER_EAT);
    if (this.gaugeLevel >= 1 && !this.laserActive) {
      this.laserActive = true;
      this.laserAnimTime = 0;
    }
  }

  private deactivatePowerup(): void {
    if (this.activePowerupStyle === 'nuclear') {
      // Nuclear gauge persists through damage; only deactivate laser/arc portion
      this.laserActive = false;
      return;
    }
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

  private spawnBossDefeatExplosion(): void {
    const bx = this.boss!.x;
    const by = this.boss!.y;
    this.boss!.defeated = true;
    this.bossDefeatedTimer = 2.2;
    // Multiple big explosions across the boss's body
    const offsets = [
      [0, 0], [-60, -40], [60, -40], [-40, 40], [40, 40], [0, -80],
    ];
    const colors = ['#8b4513', '#ffcc00', '#228b22', '#ff6600', '#1a8a5a', '#ffffff', '#ff4444'];
    for (const [ox, oy] of offsets) {
      this.spawnExplosion(bx + ox, by + oy);
      this.spawnDisintegration(bx + ox, by + oy, colors);
    }
    this.shakeTimer = SCREEN_SHAKE_DURATION * 2.5;
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
      case GameState.Paused:
        this.renderPlaying();
        this.renderPauseOverlay();
        break;
      case GameState.GameOver:
        this.renderGameOver();
        break;
      case GameState.StageClear:
        this.renderStageClear();
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

    // Boss (drawn behind entities so it appears below treasures, etc.)
    if (this.boss) {
      this.boss.render(ctx);
    }

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
      if (this.activePowerupStyle === 'arc') {
        glowGrad.addColorStop(0, 'rgba(220,220,255,0.9)');
        glowGrad.addColorStop(1, 'rgba(160,160,255,0)');
      } else if (this.activePowerupStyle === 'nuclear') {
        glowGrad.addColorStop(0, 'rgba(255,60,0,0.9)');
        glowGrad.addColorStop(1, 'rgba(200,20,0,0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(0,229,255,0.9)');
        glowGrad.addColorStop(1, 'rgba(0,100,255,0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(this.player.x, this.player.y, this.player.width * 0.75, this.player.height * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Laser / arc beam (upward from stingray)
    if (this.laserActive) {
      ctx.save();
      const bx = this.player.x;
      const by = this.player.y - this.player.height / 2;

      if (this.activePowerupStyle === 'arc') {
        // Arc weapon active: show a pulsing charge indicator at the front of the stingray
        const chargePulse = 0.4 + Math.sin(this.laserAnimTime * 14) * 0.3;
        ctx.globalAlpha = chargePulse;
        const chargeGrad = ctx.createRadialGradient(bx, by, 2, bx, by, 22);
        chargeGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        chargeGrad.addColorStop(0.45, 'rgba(200,160,255,0.5)');
        chargeGrad.addColorStop(1, 'rgba(100,60,220,0)');
        ctx.fillStyle = chargeGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 22, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const beamW = 40;

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
      }

      ctx.restore();
    }

    // Nuclear blast beam (red fire beam, wider and stronger)
    if (this.nuclearBlastActive) {
      ctx.save();
      const bx = this.player.x;
      const by = this.player.y - this.player.height / 2;
      const beamW = NUCLEAR_BLAST_HALF_WIDTH * 2;
      const pulse = 0.7 + Math.sin(this.nuclearBlastAnimTime * 18) * 0.3;

      // Outer fire glow
      ctx.globalAlpha = 0.18 * pulse;
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(bx - beamW, 0, beamW * 2, by);

      // Inner beam
      const nucGrad = ctx.createLinearGradient(bx - beamW / 2, 0, bx + beamW / 2, 0);
      nucGrad.addColorStop(0, 'rgba(255,100,0,0)');
      nucGrad.addColorStop(0.3, 'rgba(255,80,0,0.7)');
      nucGrad.addColorStop(0.5, 'rgba(255,255,100,0.95)');
      nucGrad.addColorStop(0.7, 'rgba(255,80,0,0.7)');
      nucGrad.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.globalAlpha = 0.9 * pulse;
      ctx.fillStyle = nucGrad;
      ctx.fillRect(bx - beamW / 2, 0, beamW, by);

      // Fire flicker particles along beam
      ctx.globalAlpha = 0.35 * pulse;
      ctx.fillStyle = '#ff6600';
      for (let i = 0; i < 5; i++) {
        const fy = (this.nuclearBlastAnimTime * 150 + i * 100) % (by || 1);
        ctx.beginPath();
        ctx.arc(bx + (Math.sin(this.nuclearBlastAnimTime * 6 + i) * 12), fy, 6 + Math.sin(i * 2) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Green glow aura when radioactive (player hit by barrel)
    if (this.player.greenGlowTimer > 0) {
      ctx.save();
      const phase = (1 - this.player.greenGlowTimer / 10) * Math.PI * 2;
      const ga = 0.22 + Math.abs(Math.sin(Date.now() / 200)) * 0.14;
      ctx.globalAlpha = ga;
      const gGrd = ctx.createRadialGradient(
        this.player.x, this.player.y, this.player.width * 0.15,
        this.player.x, this.player.y, this.player.width * 0.9,
      );
      gGrd.addColorStop(0, 'rgba(0,255,80,0.85)');
      gGrd.addColorStop(1, 'rgba(0,200,50,0)');
      ctx.fillStyle = gGrd;
      ctx.beginPath();
      ctx.ellipse(this.player.x, this.player.y, this.player.width * 0.9, this.player.height * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dripping green sparks
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#88ff44';
      for (let i = 0; i < 4; i++) {
        const sx = this.player.x + Math.cos(phase + i * Math.PI / 2) * this.player.width * 0.4;
        const sy = this.player.y + Math.sin((phase + i * Math.PI / 2) * 1.2) * this.player.height * 0.35;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
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

    this.player.render(ctx, this.activePowerupStyle === 'nuclear' && this.powerupActive);
    // Pick the right gauge/label to show based on active powerup
    const showNuclear = this.powerupActive && this.activePowerupStyle === 'nuclear';
    const displayGauge = showNuclear ? this.nuclearGaugeLevel : this.gaugeLevel;
    const displayLaserActive = showNuclear ? this.nuclearBlastActive : this.laserActive;
    this.hud.render(ctx, this.score, this.player.hp, this.powerupActive, displayGauge, displayLaserActive, this.player.shieldActive, this.player.shieldTimer, this.goldScore, this.activePowerupStyle, this.speedBoostTimer);

    // Pause button next to score (top-left area)
    const pbX = 120;
    const pbY = 8;
    const pbW = 28;
    const pbH = 20;
    this.pauseButtonBounds = { x: pbX, y: pbY, width: pbW, height: pbH };
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = this.state === GameState.Paused ? '#4af' : '#336';
    ctx.strokeStyle = '#adf';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pbX, pbY, pbW, pbH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText(this.state === GameState.Paused ? '▶' : '⏸', pbX + pbW / 2, pbY + pbH - 4);
    ctx.restore();

    // Level indicator (top-right, below score area)
    if (this.level >= 2) {
      ctx.save();
      ctx.font = 'bold 12px monospace';
      const lvlColor = this.level >= 4 ? '#ffdd00' : this.level >= 3 ? '#00ccff' : '#ff6ed8';
      ctx.fillStyle = lvlColor;
      ctx.shadowColor = lvlColor;
      ctx.shadowBlur = 6;
      // Shift down if gold score is visible; also skip if boss bar is visible (level 4)
      const lvlY = this.goldScore > 0 ? 58 : 44;
      ctx.fillText(`LVL ${this.level}`, 10, lvlY);
      ctx.restore();
    }

    // Level-up banner
    if (this.levelUpBannerTimer > 0) {
      const alpha = Math.min(1, this.levelUpBannerTimer / 0.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px monospace';
      if (this.level >= 4) {
        ctx.fillStyle = '#ffdd00';
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 28;
        ctx.fillText('LEVEL 4!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffe577';
        ctx.shadowBlur = 10;
        ctx.fillText(this.stageDef.level4BossMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
      } else if (this.level >= 3) {
        ctx.fillStyle = '#00ccff';
        ctx.shadowColor = '#0088ff';
        ctx.shadowBlur = 24;
        ctx.fillText('LEVEL 3!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ccf0ff';
        ctx.shadowBlur = 8;
        ctx.fillText(this.stageDef.level3Message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
      } else {
        ctx.fillStyle = '#ff6ed8';
        ctx.shadowColor = '#ff00cc';
        ctx.shadowBlur = 24;
        ctx.fillText('LEVEL 2!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffccf0';
        ctx.shadowBlur = 8;
        ctx.fillText(this.stageDef.level2Message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
      }
      ctx.restore();
    }
  }

  private renderPauseOverlay(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 10, 40, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#4af';
    ctx.shadowBlur = 20;
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#adf';
    ctx.shadowBlur = 5;
    ctx.fillText('Press SPACE or click ⏸ to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
    ctx.restore();
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

  private renderStageClear(): void {
    const ctx = this.ctx;
    this.background.render(ctx);

    // Dark gold overlay
    ctx.fillStyle = 'rgba(20, 10, 0, 0.58)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.textAlign = 'center';

    // "STAGE CLEAR!" headline
    const bounce = Math.sin(this.titleAnimTime * 2) * 4;
    ctx.font = 'bold 50px monospace';
    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 30;
    ctx.fillText('STAGE CLEAR!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70 + bounce);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffe577';
    ctx.shadowBlur = 8;
    ctx.fillText(this.stageDef.stageClearMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 28);

    ctx.font = '20px monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 5;
    ctx.fillText(`Score: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14);

    if (this.goldScore > 0) {
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#b8860b';
      ctx.fillText(`Gold Coins: $${this.goldScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }

    const blink = Math.sin(this.titleAnimTime * 3) > 0;
    if (blink) {
      ctx.font = '14px monospace';
      ctx.fillStyle = '#adf';
      ctx.shadowBlur = 4;
      ctx.fillText('Press SPACE to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70 + (this.goldScore > 0 ? 20 : 0));
    }
    ctx.restore();
  }
}
