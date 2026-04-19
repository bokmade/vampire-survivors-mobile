import type { Vec2, Enemy, GameState, EnemyType, UpgradeType } from "./types";
import {
  ENEMY_CONFIGS,
  GEM_VALUE,
  XP_BASE,
  XP_SCALE,
} from "./constants";

let _idCounter = 0;
export function genId(): string {
  _idCounter++;
  return `${Date.now()}_${_idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function xpNeededForLevel(level: number): number {
  return Math.floor(XP_BASE * Math.pow(XP_SCALE, level - 1));
}

export function spawnEnemy(
  type: EnemyType,
  screenW: number,
  screenH: number
): Enemy {
  const cfg = ENEMY_CONFIGS[type];
  const margin = 50;
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  if (side === 0) { x = Math.random() * screenW; y = -margin; }
  else if (side === 1) { x = screenW + margin; y = Math.random() * screenH; }
  else if (side === 2) { x = Math.random() * screenW; y = screenH + margin; }
  else { x = -margin; y = Math.random() * screenH; }

  return {
    id: genId(),
    type,
    pos: { x, y },
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    size: cfg.size,
    damage: cfg.damage,
    flashTimer: 0,
  };
}

export function gemValue(type: EnemyType): number {
  return GEM_VALUE[type];
}

export function pickRandomUpgrades(
  upgrades: Record<UpgradeType, number>
): UpgradeType[] {
  const allTypes: UpgradeType[] = [
    "damage",
    "fireRate",
    "aoe",
    "extraProjectile",
    "speed",
    "health",
    "magnet",
    "pierce",
  ];
  const maxLevels: Record<UpgradeType, number> = {
    damage: 5,
    fireRate: 5,
    aoe: 4,
    extraProjectile: 3,
    speed: 4,
    health: 5,
    magnet: 3,
    pierce: 2,
  };
  const available = allTypes.filter(
    (t) => (upgrades[t] ?? 0) < maxLevels[t]
  );
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
