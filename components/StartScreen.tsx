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
import Svg, { Polygon, Circle, G, Line } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
  onSettings: () => void;
  onProfile: () => void;
}

function BatIcon({ size = 48, color = "#6600aa" }: { size?: number; color?: string }) {
  const s = size / 2;
  return (
    <Svg width={size * 2} height={size}>
      <G>
        <Polygon
          points={`${s},${s * 0.5} ${s * 0.1},${s * 0.2} ${s * 0.5},${s * 0.9}`}
          fill={color}
          opacity={0.9}
        />
        <Polygon
          points={`${s},${s * 0.5} ${s * 1.9},${s * 0.2} ${s * 1.5},${s * 0.9}`}
          fill={color}
          opacity={0.9}
        />
        <Circle cx={s} cy={s * 0.55} r={s * 0.38} fill={color === "#ffffff" ? "#ffffff" : "#1a0028"} />
        <Circle cx={s - s * 0.18} cy={s * 0.45} r={s * 0.1} fill="#cc0000" opacity={0.85} />
        <Circle cx={s + s * 0.18} cy={s * 0.45} r={s * 0.1} fill="#cc0000" opacity={0.85} />
      </G>
    </Svg>
  );
}

function CoffinIcon({ size = 40 }: { size?: number }) {
  const w = size * 0.65;
  const h = size;
  const pts = [
    `${w * 0.3},0`,
    `${w * 0.7},0`,
    `${w},${h * 0.25}`,
    `${w},${h * 0.85}`,
    `${w * 0.75},${h}`,
    `${w * 0.25},${h}`,
    `0,${h * 0.85}`,
    `0,${h * 0.25}`,
  ].join(" ");
  return (
    <Svg width={w} height={h}>
      <Polygon points={pts} fill="#1a1010" stroke="#4a1a1a" strokeWidth={1.5} />
      <Line x1={w * 0.5} y1={h * 0.25} x2={w * 0.5} y2={h * 0.8} stroke="#3a1010" strokeWidth={1} />
      <Line x1={w * 0.25} y1={h * 0.55} x2={w * 0.75} y2={h * 0.55} stroke="#3a1010" strokeWidth={1} />
    </Svg>
  );
}

export default function StartScreen({ highScore, onStart, onSettings, onProfile }: StartScreenProps) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 0.82, duration: 120, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad + 30, paddingBottom: botPad + 30 },
      ]}
    >
      <Animated.View style={{ flexDirection: "row", gap: 28, opacity: flicker }}>
        <CoffinIcon size={38} />
        <View style={styles.batCenter}>
          <BatIcon size={30} color="#6600aa" />
        </View>
        <CoffinIcon size={38} />
      </Animated.View>

      <Animated.View style={{ opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }}>
        <Text style={styles.titleSub}>✦ THE DARK DESCENT ✦</Text>
      </Animated.View>

      <Animated.Text style={[styles.title, { transform: [{ scale: pulse }] }]}>
        VAMPIRE{"\n"}SURVIVORS
      </Animated.Text>

      <View style={styles.bloodDrips}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.bloodDrip, { height: 8 + (i % 3) * 6, marginTop: i % 2 === 0 ? 0 : 4 }]} />
        ))}
      </View>

      <View style={styles.subtitleRow}>
        <Text style={styles.dot}>✦</Text>
        <Text style={styles.tagline}>Survive. Level up. Become undying.</Text>
        <Text style={styles.dot}>✦</Text>
      </View>

      {highScore > 0 && (
        <View style={styles.highScoreBox}>
          <Text style={styles.highScoreIcon}>☠</Text>
          <Text style={styles.highScoreText}>Best: {highScore}</Text>
        </View>
      )}

      <View style={styles.weaponsRow}>
        {(
          [
            { icon: "radio" as const, label: "Blood Orbs", color: "#8b0000" },
            { icon: "zap" as const, label: "Cursed Bolt", color: "#6600cc" },
            { icon: "wind" as const, label: "Bone Blades", color: "#c8b49a" },
          ] as const
        ).map(({ icon, label, color }) => (
          <View key={icon} style={styles.weaponItem}>
            <View style={[styles.weaponIconWrap, { borderColor: color + "55" }]}>
              <Feather name={icon} size={20} color={color} />
            </View>
            <Text style={styles.weaponLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Text style={styles.playText}>ENTER THE CRYPT</Text>
      </TouchableOpacity>

      <View style={styles.menuButtonsRow}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onProfile}
          activeOpacity={0.8}
        >
          <Feather name="user" size={14} color="#8b4a4a" />
          <Text style={styles.menuButtonText}>PROFILE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onSettings}
          activeOpacity={0.8}
        >
          <Feather name="settings" size={14} color="#8b4a4a" />
          <Text style={styles.menuButtonText}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Use the joystick to move. Weapons fire automatically.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0808",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 28,
  },
  batCenter: {
    alignSelf: "center",
  },
  titleSub: {
    color: "#8b0000",
    fontSize: 11,
    letterSpacing: 5,
    fontWeight: "800",
  },
  title: {
    color: "#e8d5b7",
    fontSize: 50,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 54,
    letterSpacing: 3,
    textShadowColor: "#8b0000",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 18,
  },
  bloodDrips: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  bloodDrip: {
    width: 5,
    backgroundColor: "#8b0000",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    opacity: 0.8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    color: "#8b0000",
    fontSize: 10,
  },
  tagline: {
    color: "#6a5a4a",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  highScoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#120808",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3a1a1a",
  },
  highScoreIcon: {
    fontSize: 14,
    color: "#d4a84b",
  },
  highScoreText: {
    color: "#d4a84b",
    fontSize: 14,
    fontWeight: "700",
  },
  weaponsRow: {
    flexDirection: "row",
    gap: 20,
    marginVertical: 4,
  },
  weaponItem: {
    alignItems: "center",
    gap: 5,
  },
  weaponIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#120808",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weaponLabel: {
    color: "#6a5a4a",
    fontSize: 9,
    letterSpacing: 0.3,
  },
  playButton: {
    flexDirection: "row",
    backgroundColor: "#6a0000",
    paddingHorizontal: 36,
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: "#cc0000",
    shadowColor: "#cc0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  playText: {
    color: "#e8d5b7",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
  },
  menuButtonsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  menuButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#120808",
    borderWidth: 1,
    borderColor: "#2a1010",
    borderRadius: 4,
    paddingVertical: 10,
  },
  menuButtonText: {
    color: "#8b4a4a",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  hint: {
    color: "#3a2a2a",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});
