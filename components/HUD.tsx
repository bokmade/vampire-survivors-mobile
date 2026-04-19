import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { GameState } from "../game/types";
import { formatTime } from "../game/utils";

interface HUDProps {
  state: GameState;
}

export default function HUD({ state }: HUDProps) {
  const insets = useSafeAreaInsets();
  const { player, kills, timeElapsed, level, xp, xpNeeded, waveNumber } = state;
  const hpFrac = Math.max(0, player.hp / player.maxHp);
  const xpFrac = Math.min(1, xp / xpNeeded);
  const topOffset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const isBossWave = waveNumber > 0 && waveNumber % 5 === 0;

  const waveFlash = useRef(new Animated.Value(0)).current;
  const prevWaveRef = useRef(waveNumber);

  useEffect(() => {
    if (waveNumber > 0 && waveNumber !== prevWaveRef.current) {
      prevWaveRef.current = waveNumber;
      waveFlash.setValue(0);
      Animated.sequence([
        Animated.timing(waveFlash, { toValue: 1, duration: 140, useNativeDriver: false }),
        Animated.timing(waveFlash, { toValue: 0, duration: 460, useNativeDriver: false }),
      ]).start();
    } else {
      prevWaveRef.current = waveNumber;
    }
  }, [waveNumber]);

  const waveScale = waveFlash.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const waveColorNormal = waveFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ["#c8b49a", "#ffd700"],
  });

  const waveColorBoss = waveFlash.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ff4444", "#ff8800"],
  });

  const waveColor = isBossWave ? waveColorBoss : waveColorNormal;

  return (
    <View
      style={[styles.container, { paddingTop: topOffset + 6 }]}
      pointerEvents="none"
    >
      <View style={styles.hudStrip}>
        <View style={styles.hpSection}>
          <Text style={styles.hpLabel}>❤ HP</Text>
          <View style={styles.hpBarBg}>
            <View style={[styles.hpBar, { width: `${hpFrac * 100}%` }]} />
            <View style={[styles.hpBarShine, { width: `${hpFrac * 60}%` }]} />
          </View>
          <Text style={styles.hpText}>
            {Math.ceil(player.hp)}/{player.maxHp}
          </Text>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>☠</Text>
            <Text style={styles.killsText}>{kills}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✦</Text>
            <Text style={styles.levelText}>Lv{level}</Text>
          </View>
          <Animated.View style={[styles.statItem, { transform: [{ scale: waveScale }] }]}>
            <Text style={[styles.statIcon, isBossWave && styles.bossWaveIcon]}>
              {isBossWave ? "💀" : "〜"}
            </Text>
            <Animated.Text style={[styles.waveText, { color: waveColor }]}>
              W.{waveNumber}
            </Animated.Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.xpBarBg}>
        <View style={[styles.xpBar, { width: `${xpFrac * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  hudStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,4,4,0.88)",
    borderWidth: 1,
    borderColor: "#3a0a0a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    shadowColor: "#8b0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  hpSection: {
    flex: 1,
    marginRight: 8,
  },
  hpLabel: {
    color: "#8b0000",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 3,
  },
  hpBarBg: {
    height: 9,
    backgroundColor: "#1a0505",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3a0a0a",
    position: "relative",
  },
  hpBar: {
    height: "100%",
    backgroundColor: "#8b0000",
    borderRadius: 4,
  },
  hpBarShine: {
    position: "absolute",
    top: 1,
    left: 0,
    height: 3,
    backgroundColor: "rgba(255,80,80,0.25)",
    borderRadius: 2,
  },
  hpText: {
    color: "#c8b49a",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statsDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#3a0a0a",
    marginHorizontal: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    fontSize: 9,
    color: "#5a2a2a",
    marginBottom: 1,
  },
  bossWaveIcon: {
    color: "#cc1111",
    fontSize: 10,
  },
  timerText: {
    color: "#c8b49a",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  killsText: {
    color: "#cc1111",
    fontSize: 13,
    fontWeight: "700",
  },
  levelText: {
    color: "#d4a84b",
    fontSize: 13,
    fontWeight: "700",
  },
  waveText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  xpBarBg: {
    height: 4,
    backgroundColor: "#1a0514",
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a0a22",
  },
  xpBar: {
    height: "100%",
    backgroundColor: "#6600aa",
    borderRadius: 2,
  },
});
