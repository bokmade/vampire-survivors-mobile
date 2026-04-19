import type { GameState } from "./types";
import { xpNeededForLevel, spawnEnemy } from "./utils";
import {
  PLAYER_BASE_HP,
  PLAYER_BASE_SPEED,
  ORB_BASE_RADIUS,
  ORB_BASE_DAMAGE,
  ORB_SPEED,
  BLADE_BASE_RADIUS,
  BLADE_BASE_DAMAGE,
  BLADE_SPEED,
  LIGHTNING_BASE_COOLDOWN,
  LIGHTNING_BASE_DAMAGE,
  LIGHTNING_BASE_RANGE,
} from "./constants";

export function createInitialState(
  screenW: number,
  screenH: number,
  highScore: number
): GameState {
  return {
    phase: "start",
    worldOffset: { x: 0, y: 0 },
    player: {
      pos: { x: screenW / 2, y: screenH / 2 },
      hp: PLAYER_BASE_HP,
      maxHp: PLAYER_BASE_HP,
      speed: PLAYER_BASE_SPEED,
      invulnTimer: 0,
      shakeTimer: 0,
      shakeDir: { x: 0, y: 0 },
    },
    enemies: Array.from({ length: 6 }, () =>
      spawnEnemy(Math.random() < 0.7 ? "walker" : "bat", screenW, screenH)
    ),
    projectiles: [],
    gems: [],
    particles: [],
    level: 1,
    xp: 0,
    xpNeeded: xpNeededForLevel(1),
    kills: 0,
    timeElapsed: 0,
    waveTimer: 0,
    weapons: {
      orb: {
        angle: 0,
        count: 1,
        damage: ORB_BASE_DAMAGE,
        radius: ORB_BASE_RADIUS,
        speed: ORB_SPEED,
      },
      lightning: {
        cooldown: LIGHTNING_BASE_COOLDOWN,
        timer: 0,
        damage: LIGHTNING_BASE_DAMAGE,
        range: LIGHTNING_BASE_RANGE,
        targets: 1,
        flashTimer: 0,
        flashTarget: null,
      },
      blade: {
        angles: [0],
        damage: BLADE_BASE_DAMAGE,
        radius: BLADE_BASE_RADIUS,
        speed: BLADE_SPEED,
      },
      projectile: {
        cooldown: 0.8,
        timer: 0,
        damage: 25,
        speed: 320,
        range: 340,
        radius: 7,
      },
    },
    upgrades: {
      damage: 0,
      fireRate: 0,
      aoe: 0,
      extraProjectile: 0,
      speed: 0,
      health: 0,
      magnet: 0,
      pierce: 0,
    },
    highScore,
    pendingUpgrades: [],
    specials: {
      nova: { cooldown: 8, timer: 0 },
      shield: { cooldown: 12, timer: 0 },
      timewarp: { cooldown: 15, timer: 0 },
    },
    slowTimer: 0,
    shieldTimer: 0,
    healthPickups: [],
    waveNumber: 0,
    waveBannerTimer: 0,
    levelUpFlashTimer: 0,
    levelUpLabelTimer: 0,
  };
}
