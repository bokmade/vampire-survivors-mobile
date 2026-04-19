export const SCREEN_PADDING = 0;

export const PLAYER_SIZE = 22;
export const PLAYER_BASE_SPEED = 290;
export const PLAYER_BASE_HP = 100;

export const ORB_BASE_RADIUS = 80;
export const ORB_BASE_DAMAGE = 20;
export const ORB_SPEED = 2.5;
export const ORB_SIZE = 10;

export const BLADE_BASE_RADIUS = 65;
export const BLADE_BASE_DAMAGE = 15;
export const BLADE_SPEED = 3.5;
export const BLADE_SIZE = 14;

export const LIGHTNING_BASE_DAMAGE = 35;
export const LIGHTNING_BASE_COOLDOWN = 1.4;
export const LIGHTNING_BASE_RANGE = 220;

export const GEM_COLLECT_RADIUS = 55;
export const GEM_SIZE = 10;

export const ENEMY_SPAWN_MARGIN = 60;

export const ENEMY_CONFIGS = {
  walker: { hp: 40, speed: 70, size: 20, damage: 10, color: "#5a7040" },
  bat: { hp: 20, speed: 130, size: 14, damage: 7, color: "#3d1a5c" },
  brute: { hp: 160, speed: 38, size: 34, damage: 20, color: "#4a2e18" },
};

export const GEM_VALUE = { walker: 2, bat: 1, brute: 6 };

export const XP_BASE = 10;
export const XP_SCALE = 1.35;

export const WAVE_INTERVAL = 8;
export const WAVE_ENEMY_BASE = 4;
export const WAVE_ENEMY_SCALE = 0.35;

export const HEALTH_PICKUP_SIZE = 9;
export const HEALTH_PICKUP_COLLECT_RADIUS = 28;
export const HEALTH_DROP_CHANCE = { walker: 0.05, bat: 0.02, brute: 0.22 };
export const HEALTH_HEAL_AMOUNT = { walker: 8, bat: 5, brute: 20 };

export const WAVE_BANNER_DURATION = 2.4;

export const WAVE_NAMES = [
  "The Dead Stir",
  "Bloodmoon Rising",
  "Grave Walkers",
  "Children of the Night",
  "The Damned March",
  "Cursed Legion",
  "The Eternal Hunger",
  "Lord of Shadows",
  "Dusk's Final Hour",
  "The Endless Dark",
];

export const COLORS = {
  playerBody: "#1a0a14",
  playerCape: "#0d0508",
  playerFace: "#c8b49a",
  playerGlow: "#8b0000",
  playerEye: "#cc1111",
  playerEyeGlow: "#ff4444",
  orbColor: "#7a0000",
  orbGlow: "#cc2222",
  bladeColor: "#d4cbb0",
  bladeGlow: "#fffae0",
  lightningColor: "#6600cc",
  lightningOuter: "#8800ee",
  lightningInner: "#cc88ff",
  gemColor: "#9b0000",
  gemHighlight: "#dd3333",
  gemShine: "#ff6666",
  particleHit: "#8b0000",
  particleGem: "#cc1111",
  projectileColor: "#cc1111",
  projectileGlow: "#8b0000",
  projectileShine: "#ff5555",
  healthPickup: "#8b0000",
  healthPickupBody: "#7a0000",
  healthPickupInner: "#cc3333",
  healthPickupCork: "#8a6a00",
  shieldFill: "#330044",
  shieldRing: "#8800cc",
  shieldOrbit1: "#aa44ff",
  shieldOrbit2: "#6600cc",
  dungeonBase: "#1a1210",
  dungeonStone1: "#251a14",
  dungeonStone2: "#201510",
  dungeonStone3: "#2a1e16",
  dungeonGrout: "#0a0706",
  batWing: "#3d1a5c",
  batWingStroke: "#220a38",
  batBody: "#2a0a40",
  walkerStroke: "#3a4a28",
  bruteStroke: "#2a1a0a",
  enemyHpBar: "#8b0000",
  slowOverlay: "#440066",
};
