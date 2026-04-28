import { Entity } from '../types';
import { BossEnemy } from '../entities/entityRoles';

export interface StageSpawnConfig {
  createSmallEnemy: (x: number, y: number, speedMult: number, level: number) => Entity;
  createBigEnemy: (x: number, y: number, targetX: number, level: number) => Entity;
  createMediumEnemy: (x: number, y: number, targetX: number) => Entity;
  createLevel3Enemy: (x: number, y: number, targetX: number, targetY: number) => Entity;
  createFood: (x: number, y: number) => Entity;
  createBonusFood: (x: number, y: number) => Entity;
  createTreasure: (x: number, y: number) => Entity;
  createPowerupChest: (x: number, y: number) => Entity;
  createRedTreasure: (x: number, y: number) => Entity;
  createGlowingClam: (x: number, y: number) => Entity;
  createCoin: (x: number, y: number) => Entity;
}

export interface StageDefinition {
  id: number;
  name: string;
  backgroundStageId: number;
  spawnConfig: StageSpawnConfig;
  createBoss: (x: number, startY: number) => BossEnemy;
  bossName: string;
  level2Message: string;
  level3Message: string;
  level4BossMessage: string;
  stageClearMessage: string;
  smallEnemyDisintColors: string[];
  bigEnemyDisintColors: string[];
  mediumEnemyDisintColors: string[];
  level3EnemyDisintColors: string[];
  mediumEnemyLaserHitColor: string;
  level3EnemyLaserHitColor: string;
}
