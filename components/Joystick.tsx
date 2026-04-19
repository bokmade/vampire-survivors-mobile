import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
} from "react-native";
import type { Vec2 } from "../game/types";

interface JoystickProps {
  onMove: (dir: Vec2) => void;
  onRelease: () => void;
  size?: number;
}

export default function Joystick({
  onMove,
  onRelease,
  size = 120,
}: JoystickProps) {
  const knobSize = size * 0.42;
  const maxOffset = (size - knobSize) / 2;
  const knobPos = useRef<Vec2>({ x: 0, y: 0 });
  const knobViewRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const dx = gs.dx;
        const dy = gs.dy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(len, maxOffset);
        const nx = len > 0 ? (dx / len) * clamped : 0;
        const ny = len > 0 ? (dy / len) * clamped : 0;
        knobPos.current = { x: nx, y: ny };

        knobViewRef.current?.setNativeProps({
          style: {
            transform: [{ translateX: nx }, { translateY: ny }],
          },
        });

        const normX = len > 0 ? dx / len : 0;
        const normY = len > 0 ? dy / len : 0;
        const intensity = Math.min(1, len / maxOffset);
        onMove({ x: normX * intensity, y: normY * intensity });
      },
      onPanResponderRelease: () => {
        knobPos.current = { x: 0, y: 0 };
        knobViewRef.current?.setNativeProps({
          style: { transform: [{ translateX: 0 }, { translateY: 0 }] },
        });
        onRelease();
      },
      onPanResponderTerminate: () => {
        knobPos.current = { x: 0, y: 0 };
        knobViewRef.current?.setNativeProps({
          style: { transform: [{ translateX: 0 }, { translateY: 0 }] },
        });
        onRelease();
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        ref={knobViewRef}
        style={[
          styles.knob,
          { width: knobSize, height: knobSize, borderRadius: knobSize / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  knob: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    position: "absolute",
  },
});
