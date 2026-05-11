import { Swordfish } from '../entities/stage4/swordfish';
import { Seal } from '../entities/stage4/seal';
import { SkeletonFish } from '../entities/stage4/skeletonfish';
import { KillerWhale } from '../entities/stage4/killerwhale';
import { Salmon, createSalmonSchool } from '../entities/stage4/salmon';
import { Crab } from '../entities/stage4/crab';
import { Oyster } from '../entities/stage4/oyster';
import { GiantSkeletonBoss } from '../entities/stage4/skeletonboss';
import { RedTreasure } from '../entities/redtreasure';
import { GlowingClam } from '../entities/glowingclam';
import { GoldenCoin } from '../entities/goldencoin';
import { TreasureChest } from '../entities/treasure';
import { BlackPearlClam } from '../entities/stage3/blackpearlclam';
import { NuclearChest } from '../entities/stage3/nuclearchest';
import { StageDefinition } from './stageDefinition';

export const stage4Definition: StageDefinition = {
  id: 4,
  name: 'Stage 4: Frozen Shipwreck Graveyard',
  backgroundStageId: 4,
  spawnConfig: {
    // Small enemy: seals
    createSmallEnemy: (x, y, speedMult, level) => new Seal(x, y, speedMult, level),
    // Big enemy: fast swordfish
    createBigEnemy: (x, y, targetX, level) => new Swordfish(x, y, targetX, level),
    // Medium enemy: skeleton fish with glowing eyes
    createMediumEnemy: (x, y, targetX) => new SkeletonFish(x, y, targetX),
    // Level 3 enemy: killer whale (frantic)
    createLevel3Enemy: (x, y, targetX, targetY) => new KillerWhale(x, y, targetX, targetY),
    // Food: salmon or oysters (randomly alternated)
    createFood: (x, y) => Math.random() > 0.35 ? new Salmon(x, y) : new Oyster(x, y),
    // Food group: schools of salmon
    createFoodGroup: (x, y) => createSalmonSchool(x, y),
    // Bonus food: crabs
    createBonusFood: (x, y) => new Crab(x, y),
    // Treasure (regular)
    createTreasure: (x, y) => new TreasureChest(x, y),
    // Powerup chest (reuse nuclear chest style)
    createPowerupChest: (x, y) => new NuclearChest(x, y),
    // Red treasure (heart)
    createRedTreasure: (x, y) => new RedTreasure(x, y),
    // Glowing clam
    createGlowingClam: (x, y) => new GlowingClam(x, y),
    glowingClamInterval: 20.0,
    // Black pearl clam
    createBlackPearlClam: (x, y) => new BlackPearlClam(x, y),
    blackPearlClamInterval: 30.0,
    // Coins
    createCoin: (x, y) => new GoldenCoin(x, y),
    mediumEnemyGroupSize: 6,
    mediumEnemySpawnInterval: 6,
    maxLevel3EnemyCount: 1,
  },
  createBoss: (x, startY) => new GiantSkeletonBoss(x, startY),
  bossName: 'The Giant Skeleton',
  level2Message: 'Skeleton fish haunt these waters! Watch out for their glowing eyes!',
  level3Message: 'A Killer Whale is attacking! It moves frantically!',
  level4BossMessage: 'BOSS INCOMING – The Giant Skeleton rises from the depths!',
  stageClearMessage: 'The Giant Skeleton has crumbled! The Frozen Graveyard is at peace!',
  smallEnemyDisintColors: ['#aaaacc', '#8888bb', '#ddddee', '#ffffff'],
  bigEnemyDisintColors: ['#224466', '#336688', '#88aabb', '#ffffff'],
  mediumEnemyDisintColors: ['#00ffcc', '#008866', '#ccffee', '#ffffff'],
  level3EnemyDisintColors: ['#111111', '#334455', '#8899aa', '#ffffff'],
  mediumEnemyLaserHitColor: '#00ffcc',
  level3EnemyLaserHitColor: '#4488ff',
};
