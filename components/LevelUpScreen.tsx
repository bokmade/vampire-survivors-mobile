import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { UpgradeType, FeatherIconName } from "../game/types";
import { UPGRADE_META } from "../game/types";

interface LevelUpScreenProps {
  level: number;
  upgrades: UpgradeType[];
  currentLevels: Record<UpgradeType, number>;
  onChoose: (upgrade: UpgradeType) => void;
}

export default function LevelUpScreen({
  level,
  upgrades,
  currentLevels,
  onChoose,
}: LevelUpScreenProps) {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View
      style={[
        styles.overlay,
        { paddingTop: topPad + 20, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.runicAccent}>⚔ ✦ ⚔</Text>
        <Text style={styles.levelText}>DARK POWER</Text>
        <Text style={styles.subtitle}>Level {level} — Choose your curse</Text>
      </View>

      <View style={styles.cardsContainer}>
        {upgrades.map((upgrade) => {
          const meta = UPGRADE_META[upgrade];
          const currentLvl = currentLevels[upgrade] ?? 0;
          return (
            <TouchableOpacity
              key={upgrade}
              style={styles.card}
              onPress={() => onChoose(upgrade)}
              activeOpacity={0.75}
            >
              <View style={styles.cardIconWrap}>
                <Feather name={meta.icon} size={30} color="#8b0000" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{meta.label}</Text>
                <Text style={styles.cardDesc}>{meta.desc}</Text>
              </View>
              <View style={styles.lvlPips}>
                {[...Array(meta.maxLevel)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.pip,
                      i < currentLvl + 1 ? styles.pipFilled : styles.pipEmpty,
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,3,3,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 26,
  },
  runicAccent: {
    color: "#3a0a0a",
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 6,
  },
  levelText: {
    color: "#8b0000",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "#cc0000",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: "#5a3a3a",
    fontSize: 13,
    marginTop: 6,
    fontStyle: "italic",
  },
  cardsContainer: {
    width: "100%",
    gap: 12,
  },
  card: {
    backgroundColor: "#100808",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#2a1010",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#8b0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: "#1a0808",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a1010",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    color: "#c8b49a",
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    color: "#5a3a3a",
    fontSize: 12,
  },
  lvlPips: {
    flexDirection: "row",
    gap: 4,
  },
  pip: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  pipFilled: {
    backgroundColor: "#8b0000",
  },
  pipEmpty: {
    backgroundColor: "#1a0808",
    borderWidth: 1,
    borderColor: "#3a1010",
  },
});
