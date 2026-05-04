import { Entity } from '../types';

export abstract class SmallEnemy implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class BigEnemy implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract targetX: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class MediumEnemy implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract expired: boolean;
  abstract targetX: number;
  abstract hp: number;
  abstract laserHitCooldown: number;
  abstract takeLaserHit(): boolean;
  abstract takePearlHit(): boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class Level3Enemy implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract expired: boolean;
  abstract targetX: number;
  abstract targetY: number;
  abstract hp: number;
  abstract pendingProjectiles: Entity[];
  abstract laserHitCooldown: number;
  abstract takeLaserHit(): boolean;
  abstract takePearlHit(): boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class FoodCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract score: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class BonusFoodCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract score: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class TreasureCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract score: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class PowerupCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract score: number;
  get powerupStyle(): 'laser' | 'arc' | 'nuclear' { return 'laser'; }
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class HealCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract score: number;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class OrbitalCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class CoinCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class SpeedBoostCollectible implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract collected: boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class ProjectileEntity implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract active: boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}

export abstract class BossEnemy implements Entity {
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract hp: number;
  abstract maxHp: number;
  abstract defeated: boolean;
  abstract targetX: number;
  abstract targetY: number;
  abstract isRaging: boolean;
  abstract pendingProjectiles: Entity[];
  abstract laserHitCooldown: number;
  abstract takeLaserHit(): boolean;
  abstract takePearlHit(): boolean;
  abstract update(dt: number, scrollSpeed: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
}
