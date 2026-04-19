import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Svg, { Polygon, Rect, Circle } from "react-native-svg";
import type { GameState, FeatherIconName } from "../game/types";
import { formatTime } from "../game/utils";

interface GameOverScreenProps {
  state: GameState;
  onRestart: () => void;
}

function TombstoneIcon({ width = 80, height = 100 }: { width?: number; height?: number }) {
  const w = width;
  const h = height;
  const archH = h * 0.45;
  return (
    <Svg width={w} height={h}>
      <Rect
        x={w * 0.1}
        y={archH * 0.5}
        width={w * 0.8}
        height={h - archH * 0.5}
        fill="#1a1212"
        stroke="#3a2020"
        strokeWidth={1.5}
        rx={2}
      />
      <Polygon
        points={`${w * 0.1},${archH * 0.5} ${w * 0.5},${archH * 0.05} ${w * 0.9},${archH * 0.5}`}
        fill="#1a1212"
        stroke="#3a2020"
        strokeWidth={1.5}
      />
      <Circle cx={w * 0.5} cy={archH * 0.35} r={w * 0.06} fill="#8b0000" opacity={0.7} />
      <Rect x={w * 0.47} y={archH * 0.52} width={w * 0.06} height={h * 0.22} fill="#2a1818" rx={1} />
      <Rect x={w * 0.38} y={archH * 0.62} width={w * 0.24} height={h * 0.06} fill="#2a1818" rx={1} />
    </Svg>
  );
}

export default function GameOverScreen({ state, onRestart }: GameOverScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cryptAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cryptAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(cryptAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const score = state.kills + Math.floor(state.timeElapsed);
  const isNewHighScore = score > state.highScore;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, paddingTop: topPad + 20, paddingBottom: botPad + 20 },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TombstoneIcon width={72} height={90} />

        <Animated.Text
          style={[
            styles.deathText,
            {
              opacity: cryptAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
            },
          ]}
        >
          YOU DIED
        </Animated.Text>

        <Text style={styles.sub}>The darkness claims another soul</Text>

        {isNewHighScore && (
          <View style={styles.newRecord}>
            <Text style={styles.newRecordIcon}>☠</Text>
            <Text style={styles.newRecordText}>NEW RECORD!</Text>
          </View>
        )}

        <View style={styles.statsBox}>
          <View style={styles.statsBoxBorder} />
          <StatRow icon={"clock" as const} label="Time Survived" value={formatTime(state.timeElapsed)} />
          <View style={styles.divider} />
          <StatRow icon={"crosshair" as const} label="Enemies Slain" value={state.kills.toString()} />
          <View style={styles.divider} />
          <StatRow icon={"star" as const} label="Level Reached" value={state.level.toString()} />
          <View style={styles.divider} />
          <StatRow icon={"activity" as const} label="Score" value={score.toString()} />
          {state.highScore > 0 && (
            <>
              <View style={styles.divider} />
              <StatRow icon={"award" as const} label="Best Score" value={state.highScore.toString()} color="#d4a84b" />
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.restartButton}
          onPress={onRestart}
          activeOpacity={0.8}
        >
          <Feather name={"refresh-cw" as const} size={18} color="#e8d5b7" />
          <Text style={styles.restartText}>RISE AGAIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function StatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: FeatherIconName;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statRow}>
      <Feather name={icon} size={14} color={color ?? "#5a3a3a"} />
      <Text style={[styles.statLabel, color ? { color } : {}]}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,3,3,0.97)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  deathText: {
    color: "#8b0000",
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 5,
    textShadowColor: "#cc0000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  sub: {
    color: "#3a2a2a",
    fontSize: 13,
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
  newRecord: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212,168,75,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(212,168,75,0.28)",
  },
  newRecordIcon: {
    fontSize: 16,
    color: "#d4a84b",
  },
  newRecordText: {
    color: "#d4a84b",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  statsBox: {
    width: "100%",
    backgroundColor: "#100808",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2a1010",
    padding: 16,
    gap: 2,
    position: "relative",
  },
  statsBoxBorder: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: "#1e0a0a",
    borderRadius: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e0a0a",
    marginVertical: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 3,
  },
  statLabel: {
    flex: 1,
    color: "#5a3a3a",
    fontSize: 13,
  },
  statValue: {
    color: "#c8b49a",
    fontSize: 15,
    fontWeight: "700",
  },
  restartButton: {
    flexDirection: "row",
    backgroundColor: "#6a0000",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#cc0000",
    shadowColor: "#cc0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  restartText: {
    color: "#e8d5b7",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
