import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { SpecialType, SpecialSlot, FeatherIconName } from "../game/types";

interface SpecialButtonProps {
  type: SpecialType;
  slot: SpecialSlot;
  onPress: (type: SpecialType) => void;
}

const SPECIAL_META: Record<
  SpecialType,
  { label: string; icon: FeatherIconName; color: string }
> = {
  nova: { label: "NOVA", icon: "zap", color: "#9b59b6" },
  shield: { label: "WARD", icon: "shield" as FeatherIconName, color: "#3498db" },
  timewarp: { label: "SLOW", icon: "clock", color: "#1abc9c" },
};

export default function SpecialButton({ type, slot, onPress }: SpecialButtonProps) {
  const meta = SPECIAL_META[type];
  const isReady = slot.timer <= 0;
  const progress = isReady ? 1 : 1 - slot.timer / slot.cooldown;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReady) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isReady]);

  const cdText = slot.timer > 0 ? Math.ceil(slot.timer).toString() : "";

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.btn,
          { borderColor: isReady ? meta.color : "rgba(255,255,255,0.15)" },
        ]}
        onPress={() => onPress(type)}
        activeOpacity={0.75}
        disabled={!isReady}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: meta.color,
              opacity: isReady ? 0.25 : 0.08,
              height: `${progress * 100}%` as any,
            },
          ]}
        />
        <Feather
          name={meta.icon}
          size={22}
          color={isReady ? meta.color : "rgba(255,255,255,0.3)"}
        />
        <Text style={[styles.label, { color: isReady ? meta.color : "rgba(255,255,255,0.3)" }]}>
          {meta.label}
        </Text>
        {!isReady && (
          <View style={styles.cdOverlay}>
            <Text style={styles.cdText}>{cdText}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const BTN = 60;

const styles = StyleSheet.create({
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: "rgba(10,10,20,0.85)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    gap: 2,
  },
  fill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  label: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cdOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  cdText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});
