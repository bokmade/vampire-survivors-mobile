import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WAVE_NAMES, WAVE_BANNER_DURATION } from "../game/constants";

interface WaveBannerProps {
  waveNumber: number;
  waveBannerTimer: number;
}

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let result = "";
  let remaining = n;
  for (let i = 0; i < vals.length; i++) {
    while (remaining >= vals[i]) {
      result += syms[i];
      remaining -= vals[i];
    }
  }
  return result;
}

export default function WaveBanner({ waveNumber, waveBannerTimer }: WaveBannerProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const prevWave = useRef(0);

  useEffect(() => {
    if (waveNumber !== prevWave.current && waveBannerTimer > 0) {
      prevWave.current = waveNumber;
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay((WAVE_BANNER_DURATION - 0.9) * 1000),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -12, duration: 500, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [waveNumber]);

  if (waveNumber === 0) return null;

  const nameIndex = Math.min(waveNumber - 1, WAVE_NAMES.length - 1);
  const waveName = WAVE_NAMES[nameIndex];

  const topOffset = insets.top + (Platform.OS === "web" ? 67 : 0) + 60;

  return (
    <Animated.View
      style={[styles.container, { top: topOffset, opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={styles.banner}>
        <View style={styles.runicRow}>
          <Text style={styles.runic}>✦</Text>
          <View style={styles.divider} />
          <Text style={styles.runic}>✦</Text>
        </View>
        <Text style={styles.waveLabel}>WAVE {toRoman(waveNumber)}</Text>
        <Text style={styles.waveName}>{waveName}</Text>
        <View style={styles.runicRow}>
          <Text style={styles.runic}>✦</Text>
          <View style={styles.divider} />
          <Text style={styles.runic}>✦</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  banner: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "rgba(10,3,3,0.88)",
    borderWidth: 1,
    borderColor: "#6b0000",
    borderRadius: 4,
    shadowColor: "#8b0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 12,
    minWidth: 240,
  },
  runicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  divider: {
    height: 1,
    width: 60,
    backgroundColor: "#6b0000",
    opacity: 0.7,
  },
  runic: {
    color: "#8b0000",
    fontSize: 9,
  },
  waveLabel: {
    color: "#8b0000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 5,
    marginBottom: 4,
  },
  waveName: {
    color: "#d4b89a",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "#8b0000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
