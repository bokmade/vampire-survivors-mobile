import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Rect,
  G,
  Polygon,
  Ellipse,
  Defs,
  RadialGradient,
  Stop,
  Pattern,
} from "react-native-svg";
import type { GameState } from "../game/types";
import {
  ORB_SIZE,
  BLADE_SIZE,
  GEM_SIZE,
  PLAYER_SIZE,
  COLORS,
  ENEMY_CONFIGS,
  HEALTH_PICKUP_SIZE,
} from "../game/constants";

interface GameCanvasProps {
  state: GameState;
  width: number;
  height: number;
  playerColor?: string;
}

const ENEMY_FLASH_COLOR: Record<string, string> = {
  walker: "#cc1111",
  bat: "#aa22dd",
  brute: "#ff6600",
};

function getEnemyColor(type: string, flash: boolean): string {
  if (flash) return ENEMY_FLASH_COLOR[type] ?? "#cc1111";
  return ENEMY_CONFIGS[type as keyof typeof ENEMY_CONFIGS]?.color ?? "#5a7040";
}

function getEnemyFlashColor(type: string): string {
  return ENEMY_FLASH_COLOR[type] ?? "#cc1111";
}

function zombiePoints(cx: number, cy: number, r: number): string {
  const radii = [r, r * 0.78, r * 1.08, r * 0.88, r * 0.95, r * 1.05, r * 0.82, r];
  return radii.map((rad, i) => {
    const a = (i * Math.PI * 2) / radii.length - Math.PI / 2;
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`;
  }).join(" ");
}

function brutePoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.68;
    pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
  }
  return pts.join(" ");
}

function bloodDropPoints(cx: number, cy: number, r: number): string {
  return [
    `${cx},${cy - r * 1.4}`,
    `${cx + r * 0.8},${cy - r * 0.1}`,
    `${cx + r * 0.6},${cy + r * 0.7}`,
    `${cx},${cy + r}`,
    `${cx - r * 0.6},${cy + r * 0.7}`,
    `${cx - r * 0.8},${cy - r * 0.1}`,
  ].join(" ");
}

const TILE_W = 72;
const TILE_H = 56;

function stoneTileOffset(worldOffset: { x: number; y: number }): { ox: number; oy: number } {
  const ox = ((worldOffset.x % TILE_W) + TILE_W) % TILE_W;
  const oy = ((worldOffset.y % TILE_H) + TILE_H) % TILE_H;
  return { ox, oy };
}

export default function GameCanvas({ state, width, height, playerColor = COLORS.playerGlow }: GameCanvasProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnimY = useRef(new Animated.Value(0)).current;
  const shakeRef = useRef(0);

  const labelAnim = useRef(new Animated.Value(0)).current;
  const prevLabelTimerRef = useRef(0);

  useEffect(() => {
    const newTimer = state.player.shakeTimer;
    if (newTimer > shakeRef.current) {
      const isBruteShake = newTimer >= 0.45;
      const dx = state.player.shakeDir.x;
      const dy = state.player.shakeDir.y;
      if (isBruteShake) {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 14 * dx, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -14 * dx, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 9 * dx, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6 * dx, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 3 * dx, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(shakeAnimY, { toValue: 10 * dy, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: -10 * dy, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: 6 * dy, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: -4 * dy, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: 2 * dy, duration: 35, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: 0, duration: 30, useNativeDriver: true }),
          ]),
        ]).start();
      } else {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 7 * dx, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -7 * dx, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 4 * dx, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(shakeAnimY, { toValue: 4 * dy, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: -4 * dy, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: 2 * dy, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnimY, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
        ]).start();
      }
    }
    shakeRef.current = newTimer;
  }, [state.player.shakeTimer]);

  useEffect(() => {
    const cur = state.levelUpLabelTimer;
    const prev = prevLabelTimerRef.current;
    if (cur > prev && cur >= 0.9) {
      labelAnim.setValue(0);
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
    prevLabelTimerRef.current = cur;
  }, [state.levelUpLabelTimer]);

  const { player, enemies, gems, particles, weapons } = state;
  const orbCount = weapons.orb.count + (state.upgrades.extraProjectile ?? 0);
  const bladeCount = weapons.blade.angles.length;
  const orbRadius = weapons.orb.radius * (1 + (state.upgrades.aoe ?? 0) * 0.2);
  const bladeRadius = weapons.blade.radius * (1 + (state.upgrades.aoe ?? 0) * 0.2);

  const { ox: tileOx, oy: tileOy } = stoneTileOffset(state.worldOffset);

  const px = player.pos.x;
  const py = player.pos.y;
  const pr = PLAYER_SIZE;

  const capePoints = [
    `${px},${py - pr * 0.6}`,
    `${px + pr * 1.4},${py - pr * 0.1}`,
    `${px + pr * 0.9},${py + pr * 1.4}`,
    `${px},${py + pr * 1.9}`,
    `${px - pr * 0.9},${py + pr * 1.4}`,
    `${px - pr * 1.4},${py - pr * 0.1}`,
  ].join(" ");

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }, { translateY: shakeAnimY }] }}>
      <Svg width={width} height={height} style={{ backgroundColor: COLORS.dungeonBase }}>
        <Defs>
          <RadialGradient id="bloodOrbGrad" cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor="#cc2222" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4a0000" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="gemGrad" cx="35%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#cc2222" stopOpacity="1" />
            <Stop offset="100%" stopColor="#5a0000" stopOpacity="1" />
          </RadialGradient>
          <Pattern
            id="stoneTile"
            x={tileOx}
            y={tileOy}
            width={TILE_W * 2}
            height={TILE_H * 2}
            patternUnits="userSpaceOnUse"
          >
            <Rect x={0} y={0} width={TILE_W * 2} height={TILE_H * 2} fill={COLORS.dungeonBase} />
            <Rect x={1.5} y={1.5} width={TILE_W - 3} height={TILE_H - 3} fill={COLORS.dungeonStone1} stroke={COLORS.dungeonGrout} strokeWidth={2.5} rx={2} />
            <Rect x={TILE_W + 1.5} y={1.5} width={TILE_W - 3} height={TILE_H - 3} fill={COLORS.dungeonStone3} stroke={COLORS.dungeonGrout} strokeWidth={2.5} rx={2} />
            <Rect x={1.5} y={TILE_H + 1.5} width={TILE_W - 3} height={TILE_H - 3} fill={COLORS.dungeonStone2} stroke={COLORS.dungeonGrout} strokeWidth={2.5} rx={2} />
            <Rect x={TILE_W + 1.5} y={TILE_H + 1.5} width={TILE_W - 3} height={TILE_H - 3} fill={COLORS.dungeonStone1} stroke={COLORS.dungeonGrout} strokeWidth={2.5} rx={2} />
          </Pattern>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#stoneTile)" />

        {gems.map((gem) => (
          <G key={gem.id}>
            <Circle
              cx={gem.pos.x}
              cy={gem.pos.y}
              r={GEM_SIZE * 1.3}
              fill={COLORS.gemColor}
              opacity={0.25}
            />
            <Polygon
              points={bloodDropPoints(gem.pos.x, gem.pos.y, GEM_SIZE * 0.85)}
              fill="url(#gemGrad)"
              opacity={0.95}
            />
            <Circle
              cx={gem.pos.x - GEM_SIZE * 0.22}
              cy={gem.pos.y - GEM_SIZE * 0.4}
              r={GEM_SIZE * 0.2}
              fill={COLORS.gemShine}
              opacity={0.6}
            />
          </G>
        ))}

        {state.healthPickups.map((hp) => {
          const pulse = 1 + Math.sin(hp.pulse) * 0.18;
          const r = HEALTH_PICKUP_SIZE * pulse;
          const bx = hp.pos.x;
          const by = hp.pos.y;
          return (
            <G key={hp.id}>
              <Circle cx={bx} cy={by} r={r + 6} fill={COLORS.healthPickup} opacity={0.15} />
              <Rect
                x={bx - r * 0.55}
                y={by - r * 0.4}
                width={r * 1.1}
                height={r * 1.5}
                fill={COLORS.healthPickupBody}
                rx={r * 0.25}
                stroke={COLORS.projectileColor}
                strokeWidth={1}
              />
              <Rect
                x={bx - r * 0.3}
                y={by - r * 0.9}
                width={r * 0.6}
                height={r * 0.55}
                fill={COLORS.healthPickup}
                rx={r * 0.1}
              />
              <Rect
                x={bx - r * 0.38}
                y={by - r * 0.95}
                width={r * 0.76}
                height={r * 0.2}
                fill={COLORS.healthPickupCork}
                rx={r * 0.08}
              />
              <Rect
                x={bx - r * 0.22}
                y={by - r * 0.15}
                width={r * 0.44}
                height={r * 0.8}
                fill={COLORS.healthPickupInner}
                opacity={0.5}
                rx={r * 0.15}
              />
            </G>
          );
        })}

        {particles.map((p) => {
          const alpha = Math.max(0, p.lifetime / p.maxLifetime);
          const cx = p.pos.x;
          const cy = p.pos.y;
          const sz = Math.max(0.5, p.size * alpha);
          const a = p.angle ?? 0;

          if (p.shape === "drop") {
            const pts = bloodDropPoints(cx, cy, sz * 0.75);
            const angleDeg = (a * 180) / Math.PI;
            return (
              <Polygon
                key={p.id}
                points={pts}
                fill={p.color}
                opacity={alpha * 0.92}
                transform={`rotate(${angleDeg}, ${cx}, ${cy})`}
              />
            );
          }

          if (p.shape === "spark") {
            const len = sz * 2.2;
            const a2 = a + Math.PI / 2;
            return (
              <G key={p.id} opacity={alpha * 0.95}>
                <Line
                  x1={cx - Math.cos(a) * len}
                  y1={cy - Math.sin(a) * len}
                  x2={cx + Math.cos(a) * len}
                  y2={cy + Math.sin(a) * len}
                  stroke={p.color}
                  strokeWidth={sz * 0.5}
                  strokeLinecap="round"
                />
                <Line
                  x1={cx - Math.cos(a2) * len * 0.55}
                  y1={cy - Math.sin(a2) * len * 0.55}
                  x2={cx + Math.cos(a2) * len * 0.55}
                  y2={cy + Math.sin(a2) * len * 0.55}
                  stroke={p.color}
                  strokeWidth={sz * 0.35}
                  strokeLinecap="round"
                />
              </G>
            );
          }

          if (p.shape === "shard") {
            const w = sz * 0.55;
            const h = sz * 1.6;
            const angleDeg = (a * 180) / Math.PI;
            return (
              <Rect
                key={p.id}
                x={cx - w / 2}
                y={cy - h / 2}
                width={w}
                height={h}
                fill={p.color}
                opacity={alpha * 0.88}
                rx={1}
                transform={`rotate(${angleDeg}, ${cx}, ${cy})`}
              />
            );
          }

          if (p.shape === "ring") {
            const ringRadius = p.size * (1 - alpha);
            const strokeW = Math.max(1, 5 * alpha);
            return (
              <Circle
                key={p.id}
                cx={cx}
                cy={cy}
                r={Math.max(1, ringRadius)}
                fill="none"
                stroke={p.color}
                strokeWidth={strokeW}
                opacity={alpha * 0.9}
              />
            );
          }

          return (
            <Circle
              key={p.id}
              cx={cx}
              cy={cy}
              r={sz}
              fill={p.color}
              opacity={alpha * 0.9}
            />
          );
        })}

        {enemies.map((enemy) => {
          const col = getEnemyColor(enemy.type, enemy.flashTimer > 0);
          const hpFrac = Math.max(0, enemy.hp / enemy.maxHp);
          const barW = enemy.size * 2;
          const cx = enemy.pos.x;
          const cy = enemy.pos.y;
          const r = enemy.size;

          const isFlashing = enemy.flashTimer > 0;
          const flashColor = getEnemyFlashColor(enemy.type);
          const glowOpacity = isFlashing ? Math.min(0.7, enemy.flashTimer * 5) : 0;

          let enemyShape: React.ReactNode = null;

          if (enemy.type === "walker") {
            enemyShape = (
              <G>
                {isFlashing && (
                  <Circle cx={cx} cy={cy} r={r * 1.65} fill={flashColor} opacity={glowOpacity} />
                )}
                <Polygon
                  points={zombiePoints(cx, cy, r)}
                  fill={col}
                  opacity={0.92}
                  stroke={isFlashing ? flashColor : COLORS.walkerStroke}
                  strokeWidth={isFlashing ? 2.5 : 1.5}
                />
                <Circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.18} fill="#000" opacity={0.8} />
                <Circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.18} fill="#000" opacity={0.8} />
                <Ellipse cx={cx} cy={cy + r * 0.3} rx={r * 0.25} ry={r * 0.12} fill="#000" opacity={0.5} />
              </G>
            );
          } else if (enemy.type === "bat") {
            const wc = isFlashing ? flashColor : COLORS.batWing;
            const bodyColor = isFlashing ? flashColor : COLORS.batBody;
            enemyShape = (
              <G>
                {isFlashing && (
                  <Circle cx={cx} cy={cy} r={r * 2.0} fill={flashColor} opacity={glowOpacity} />
                )}
                <Polygon
                  points={`${cx},${cy} ${cx - r * 2.6},${cy - r * 0.6} ${cx - r * 1.6},${cy + r * 0.5}`}
                  fill={wc}
                  opacity={0.9}
                  stroke={isFlashing ? flashColor : COLORS.batWingStroke}
                  strokeWidth={1}
                />
                <Polygon
                  points={`${cx},${cy} ${cx + r * 2.6},${cy - r * 0.6} ${cx + r * 1.6},${cy + r * 0.5}`}
                  fill={wc}
                  opacity={0.9}
                  stroke={isFlashing ? flashColor : COLORS.batWingStroke}
                  strokeWidth={1}
                />
                <Circle cx={cx} cy={cy} r={r * 0.55} fill={bodyColor} opacity={0.95} />
                <Circle cx={cx - r * 0.18} cy={cy - r * 0.05} r={r * 0.13} fill="#cc0000" opacity={0.85} />
                <Circle cx={cx + r * 0.18} cy={cy - r * 0.05} r={r * 0.13} fill="#cc0000" opacity={0.85} />
              </G>
            );
          } else if (enemy.type === "brute") {
            enemyShape = (
              <G>
                {isFlashing && (
                  <Circle cx={cx} cy={cy} r={r * 1.7} fill={flashColor} opacity={glowOpacity} />
                )}
                <Polygon
                  points={brutePoints(cx, cy, r)}
                  fill={col}
                  opacity={0.88}
                  stroke={isFlashing ? flashColor : COLORS.bruteStroke}
                  strokeWidth={isFlashing ? 3 : 2}
                />
                <Circle cx={cx} cy={cy} r={r * 0.5} fill="rgba(0,0,0,0.35)" />
                <Circle cx={cx - r * 0.25} cy={cy - r * 0.2} r={r * 0.15} fill="#cc4400" opacity={0.7} />
                <Circle cx={cx + r * 0.25} cy={cy - r * 0.2} r={r * 0.15} fill="#cc4400" opacity={0.7} />
              </G>
            );
          }

          return (
            <G key={enemy.id}>
              {enemyShape}
              <Rect
                x={cx - r}
                y={cy - r - 9}
                width={barW}
                height={4}
                fill="rgba(0,0,0,0.6)"
                rx={2}
              />
              <Rect
                x={cx - r}
                y={cy - r - 9}
                width={barW * hpFrac}
                height={4}
                fill={COLORS.enemyHpBar}
                rx={2}
              />
            </G>
          );
        })}

        {[...Array(orbCount)].map((_, i) => {
          const angle = weapons.orb.angle + (i * Math.PI * 2) / Math.max(orbCount, 1);
          const ox = player.pos.x + Math.cos(angle) * orbRadius;
          const oy = player.pos.y + Math.sin(angle) * orbRadius;
          return (
            <G key={`orb${i}`}>
              <Circle cx={ox} cy={oy} r={ORB_SIZE * 1.6} fill={COLORS.orbColor} opacity={0.18} />
              <Circle cx={ox} cy={oy} r={ORB_SIZE} fill="url(#bloodOrbGrad)" opacity={0.95} />
            </G>
          );
        })}

        {weapons.blade.angles.slice(0, bladeCount).map((angle, i) => {
          const bx = player.pos.x + Math.cos(angle) * bladeRadius;
          const by = player.pos.y + Math.sin(angle) * bladeRadius;
          const bs = BLADE_SIZE;
          const bladeHorizontal = `${bx - bs},${by} ${bx - bs * 0.15},${by - bs * 0.3} ${bx + bs},${by} ${bx + bs * 0.15},${by + bs * 0.3}`;
          const bladeVertical = `${bx},${by - bs} ${bx + bs * 0.3},${by - bs * 0.15} ${bx},${by + bs} ${bx - bs * 0.3},${by + bs * 0.15}`;
          return (
            <G key={`blade${i}`}>
              <Circle cx={bx} cy={by} r={bs * 1.2} fill={COLORS.bladeColor} opacity={0.1} />
              <Polygon points={bladeHorizontal} fill={COLORS.bladeColor} opacity={0.92} />
              <Polygon points={bladeVertical} fill={COLORS.bladeColor} opacity={0.92} />
              <Circle cx={bx} cy={by} r={bs * 0.28} fill={COLORS.bladeGlow} opacity={0.8} />
            </G>
          );
        })}

        {state.projectiles.map((proj) => {
          const alpha = Math.max(0, 1 - proj.lifetime / proj.maxLifetime);
          const cx = proj.pos.x;
          const cy = proj.pos.y;
          const r = proj.radius;
          const velAngleDeg = Math.atan2(proj.vel.y, proj.vel.x) * (180 / Math.PI) + 90;
          return (
            <G key={proj.id} transform={`rotate(${velAngleDeg}, ${cx}, ${cy})`}>
              <Circle cx={cx} cy={cy} r={r * 2} fill={COLORS.projectileGlow} opacity={0.18 * alpha} />
              <Polygon
                points={bloodDropPoints(cx, cy, r * 1.1)}
                fill={COLORS.projectileColor}
                opacity={0.92 * alpha}
              />
              <Circle cx={cx - r * 0.25} cy={cy - r * 0.4} r={r * 0.3} fill={COLORS.projectileShine} opacity={0.5 * alpha} />
            </G>
          );
        })}

        {weapons.lightning.flashTimer > 0 && weapons.lightning.flashTarget && (() => {
          const tx = weapons.lightning.flashTarget.x;
          const ty = weapons.lightning.flashTarget.y;
          const midX = (px + tx) / 2 + (Math.sin(Date.now() / 80) * 12);
          const midY = (py + ty) / 2 + (Math.cos(Date.now() / 80) * 12);
          const opacity = weapons.lightning.flashTimer / 0.2;
          return (
            <G>
              <Line
                x1={px} y1={py}
                x2={midX} y2={midY}
                stroke={COLORS.lightningOuter}
                strokeWidth={4}
                opacity={opacity * 0.6}
              />
              <Line
                x1={midX} y1={midY}
                x2={tx} y2={ty}
                stroke={COLORS.lightningOuter}
                strokeWidth={4}
                opacity={opacity * 0.6}
              />
              <Line
                x1={px} y1={py}
                x2={midX} y2={midY}
                stroke={COLORS.lightningInner}
                strokeWidth={1.5}
                opacity={opacity * 0.85}
              />
              <Line
                x1={midX} y1={midY}
                x2={tx} y2={ty}
                stroke={COLORS.lightningInner}
                strokeWidth={1.5}
                opacity={opacity * 0.85}
              />
            </G>
          );
        })()}

        <G>
          {state.shieldTimer > 0 && (() => {
            const now = Date.now();
            const swirlAngle = (now / 600) % (Math.PI * 2);
            const swirlR = pr + 20;
            const orbits = [0, 1, 2, 3, 4].map((i) => {
              const a = swirlAngle + (i * Math.PI * 2) / 5;
              return { x: px + Math.cos(a) * swirlR, y: py + Math.sin(a) * swirlR };
            });
            const ringDotCount = 18;
            const ringDotAngle = (now / 1800) % (Math.PI * 2);
            const ringDots = [...Array(ringDotCount)].map((_, i) => {
              const a = ringDotAngle + (i * Math.PI * 2) / ringDotCount;
              const dotSize = i % 3 === 0 ? 2.8 : 1.8;
              const dotOpacity = i % 3 === 0 ? 0.9 : 0.5;
              return { x: px + Math.cos(a) * swirlR, y: py + Math.sin(a) * swirlR, size: dotSize, opacity: dotOpacity };
            });
            return (
              <>
                <Circle
                  cx={px}
                  cy={py}
                  r={swirlR}
                  fill={COLORS.shieldFill}
                  opacity={0.18 + 0.08 * Math.sin(now / 180)}
                />
                {ringDots.map((d, i) => (
                  <Circle
                    key={`ringdot${i}`}
                    cx={d.x}
                    cy={d.y}
                    r={d.size}
                    fill={COLORS.shieldRing}
                    opacity={d.opacity}
                  />
                ))}
                {orbits.map((o, i) => (
                  <Circle
                    key={`swirl${i}`}
                    cx={o.x}
                    cy={o.y}
                    r={3.5}
                    fill={i % 2 === 0 ? COLORS.shieldOrbit1 : COLORS.shieldOrbit2}
                    opacity={0.85}
                  />
                ))}
              </>
            );
          })()}
          <Circle
            cx={px}
            cy={py}
            r={pr + 10}
            fill={state.shieldTimer > 0 ? "#6600aa" : playerColor}
            opacity={0.12}
          />
          <Polygon
            points={capePoints}
            fill={player.invulnTimer > 0 && state.shieldTimer <= 0 ? "#3a1a28" : COLORS.playerCape}
            opacity={player.invulnTimer > 0 && state.shieldTimer <= 0 ? 0.5 : 0.97}
            stroke="#2a0010"
            strokeWidth={1}
          />
          <Circle
            cx={px}
            cy={py - pr * 0.55}
            r={pr * 0.42}
            fill={state.shieldTimer > 0 ? "#8844cc" : COLORS.playerFace}
            opacity={player.invulnTimer > 0 && state.shieldTimer <= 0 ? 0.5 : 1}
          />
          <Circle cx={px - pr * 0.14} cy={py - pr * 0.6} r={pr * 0.09} fill={playerColor} opacity={0.9} />
          <Circle cx={px + pr * 0.14} cy={py - pr * 0.6} r={pr * 0.09} fill={playerColor} opacity={0.9} />
          <Circle cx={px - pr * 0.14} cy={py - pr * 0.6} r={pr * 0.04} fill={playerColor} opacity={0.7} />
          <Circle cx={px + pr * 0.14} cy={py - pr * 0.6} r={pr * 0.04} fill={playerColor} opacity={0.7} />
        </G>

        {state.slowTimer > 0 && (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={COLORS.slowOverlay}
            opacity={0.05}
          />
        )}

      </Svg>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: px - 70,
          top: py - pr - 50,
          width: 140,
          alignItems: "center",
          opacity: labelAnim.interpolate({
            inputRange: [0, 0.1, 0.7, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: labelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -55],
              }),
            },
          ],
        }}
      >
        <Text
          style={{
            color: "#FFD700",
            fontSize: 20,
            fontWeight: "bold",
            textShadowColor: "#000000",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 4,
            letterSpacing: 1,
          }}
        >
          LEVEL UP!
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
