import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Polygon } from "react-native-svg";
import type { UpgradeType } from "../game/types";
import { UPGRADE_META } from "../game/types";

export type PassiveSlots = [UpgradeType | null, UpgradeType | null, UpgradeType | null];

export interface Profile {
  playerColor: string;
  passiveSlots: PassiveSlots;
}

export const DEFAULT_PROFILE: Profile = {
  playerColor: "#8b0000",
  passiveSlots: [null, null, null],
};

interface ProfileModalProps {
  visible: boolean;
  profile: Profile;
  isInGame: boolean;
  onClose: () => void;
  onApply: (profile: Profile) => void;
}

const ALL_UPGRADES: UpgradeType[] = [
  "damage",
  "fireRate",
  "aoe",
  "extraProjectile",
  "speed",
  "health",
  "magnet",
  "pierce",
];

const PLAYER_COLORS: Array<{ color: string; label: string }> = [
  { color: "#cc1111", label: "Blood" },
  { color: "#d4a84b", label: "Gold" },
  { color: "#6600aa", label: "Arcane" },
  { color: "#2288cc", label: "Frost" },
  { color: "#33aa66", label: "Venom" },
  { color: "#e8d5b7", label: "Bone" },
];

function PlayerPreview({ color }: { color: string }) {
  const cx = 32;
  const cy = 34;
  const r = 10;
  const capePoints = `${cx},${cy + r * 0.1} ${cx - r * 1.2},${cy + r * 2.2} ${cx + r * 1.2},${cy + r * 2.2}`;
  return (
    <Svg width={64} height={64}>
      <Circle cx={cx} cy={cy} r={r + 6} fill={color} opacity={0.14} />
      <Polygon
        points={capePoints}
        fill="#0d0508"
        stroke="#2a0010"
        strokeWidth={1}
        opacity={0.95}
      />
      <Circle cx={cx} cy={cy - r * 0.5} r={r * 0.42} fill="#c8b49a" />
      <Circle
        cx={cx - r * 0.15}
        cy={cy - r * 0.55}
        r={r * 0.09}
        fill={color}
        opacity={0.9}
      />
      <Circle
        cx={cx + r * 0.15}
        cy={cy - r * 0.55}
        r={r * 0.09}
        fill={color}
        opacity={0.9}
      />
      <Circle
        cx={cx - r * 0.15}
        cy={cy - r * 0.55}
        r={r * 0.04}
        fill={color}
        opacity={0.6}
      />
      <Circle
        cx={cx + r * 0.15}
        cy={cy - r * 0.55}
        r={r * 0.04}
        fill={color}
        opacity={0.6}
      />
    </Svg>
  );
}

export default function ProfileModal({
  visible,
  profile,
  isInGame,
  onClose,
  onApply,
}: ProfileModalProps) {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const [color, setColor] = useState(profile.playerColor);
  const [slots, setSlots] = useState<PassiveSlots>(profile.passiveSlots);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2 | null>(null);

  useEffect(() => {
    if (visible) {
      setColor(profile.playerColor);
      setSlots(profile.passiveSlots);
      setActiveSlot(null);
    }
  }, [visible]);

  function handleCardPress(upgrade: UpgradeType) {
    let target = activeSlot;
    if (target === null) {
      const firstEmpty = slots.findIndex((s) => s === null);
      if (firstEmpty === -1) return;
      target = firstEmpty as 0 | 1 | 2;
    }
    const newSlots = [...slots] as PassiveSlots;
    if (newSlots[target] === upgrade) {
      newSlots[target] = null;
    } else {
      for (let i = 0; i < 3; i++) {
        if (i !== target && newSlots[i] === upgrade) newSlots[i] = null;
      }
      newSlots[target] = upgrade;
    }
    setSlots(newSlots);
    const nextEmpty = newSlots.findIndex(
      (s, i) => s === null && i > (target as number)
    );
    setActiveSlot(nextEmpty >= 0 ? (nextEmpty as 0 | 1 | 2) : null);
  }

  function handleSlotPress(i: 0 | 1 | 2) {
    setActiveSlot(activeSlot === i ? null : i);
  }

  function handleClearSlot(i: 0 | 1 | 2) {
    const newSlots = [...slots] as PassiveSlots;
    newSlots[i] = null;
    setSlots(newSlots);
    setActiveSlot(i);
  }

  function handleApply() {
    onApply({ playerColor: color, passiveSlots: slots });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: topPad, paddingBottom: botPad },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerIconBtn}>
            <Feather name="x" size={20} color="#5a3a3a" />
          </TouchableOpacity>
          <Text style={styles.title}>☽ HUNTER PROFILE</Text>
          <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>APPLY</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APPEARANCE</Text>
            <View style={styles.colorRow}>
              <View style={styles.previewWrap}>
                <PlayerPreview color={color} />
              </View>
              <View style={styles.swatchGrid}>
                {PLAYER_COLORS.map(({ color: c, label }) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      color === c && styles.swatchActive,
                    ]}
                    activeOpacity={0.75}
                  >
                    {color === c && (
                      <Text style={styles.swatchCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.colorLabel}>
                {PLAYER_COLORS.find((p) => p.color === color)?.label ?? ""}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STARTING LOADOUT</Text>
            {isInGame && (
              <Text style={styles.sectionNote}>Applies to your next run</Text>
            )}
            <View style={styles.slotsRow}>
              {([0, 1, 2] as const).map((i) => {
                const slotUpgrade = slots[i];
                const meta = slotUpgrade ? UPGRADE_META[slotUpgrade] : null;
                const isActive = activeSlot === i;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSlotPress(i)}
                    onLongPress={() => handleClearSlot(i)}
                    style={[styles.slot, isActive && styles.slotActive]}
                    activeOpacity={0.75}
                  >
                    {meta ? (
                      <>
                        <Feather
                          name={meta.icon as any}
                          size={22}
                          color={isActive ? "#cc1111" : "#8b0000"}
                        />
                        <Text
                          style={[
                            styles.slotLabel,
                            isActive && styles.slotLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {meta.label}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.slotEmpty}>+</Text>
                        <Text style={styles.slotEmptyLabel}>Empty</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.slotHint}>Tap to select · Hold to clear</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PICK ABILITIES</Text>
            <View style={styles.abilityList}>
              {ALL_UPGRADES.map((upgrade) => {
                const meta = UPGRADE_META[upgrade];
                const slotIndex = slots.findIndex((s) => s === upgrade);
                const isSelected = slotIndex >= 0;
                return (
                  <TouchableOpacity
                    key={upgrade}
                    onPress={() => handleCardPress(upgrade)}
                    style={[
                      styles.abilityCard,
                      isSelected && styles.abilityCardSelected,
                    ]}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.abilityIconWrap,
                        isSelected && styles.abilityIconWrapSelected,
                      ]}
                    >
                      <Feather
                        name={meta.icon as any}
                        size={26}
                        color={isSelected ? "#cc1111" : "#8b0000"}
                      />
                    </View>
                    <View style={styles.abilityText}>
                      <Text
                        style={[
                          styles.abilityLabel,
                          isSelected && styles.abilityLabelSelected,
                        ]}
                      >
                        {meta.label}
                      </Text>
                      <Text style={styles.abilityDesc}>{meta.desc}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.slotBadge}>
                        <Text style={styles.slotBadgeText}>
                          {slotIndex + 1}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,2,2,0.97)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a0a0a",
  },
  headerIconBtn: {
    padding: 6,
  },
  title: {
    color: "#8b0000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },
  applyBtn: {
    backgroundColor: "#6a0000",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cc0000",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  applyBtnText: {
    color: "#e8d5b7",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#5a2a2a",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  sectionNote: {
    color: "#3a2a2a",
    fontSize: 11,
    fontStyle: "italic",
    marginTop: -6,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  previewWrap: {
    width: 64,
    height: 64,
    backgroundColor: "#0d0808",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a1010",
    justifyContent: "center",
    alignItems: "center",
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  swatchActive: {
    borderColor: "#ffffff",
  },
  swatchCheck: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  colorLabel: {
    color: "#6a5a4a",
    fontSize: 10,
    letterSpacing: 1,
    position: "absolute",
    bottom: -16,
    left: 80,
  },
  slotsRow: {
    flexDirection: "row",
    gap: 10,
  },
  slot: {
    flex: 1,
    backgroundColor: "#100808",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#2a1010",
    padding: 10,
    alignItems: "center",
    gap: 6,
    minHeight: 72,
    justifyContent: "center",
  },
  slotActive: {
    borderColor: "#8b0000",
    backgroundColor: "#1a0808",
  },
  slotLabel: {
    color: "#c8b49a",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  slotLabelActive: {
    color: "#cc1111",
  },
  slotEmpty: {
    color: "#2a1a1a",
    fontSize: 22,
    fontWeight: "300",
  },
  slotEmptyLabel: {
    color: "#2a1a1a",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  slotHint: {
    color: "#2a1a1a",
    fontSize: 10,
    textAlign: "center",
    marginTop: -4,
  },
  abilityList: {
    gap: 8,
  },
  abilityCard: {
    backgroundColor: "#100808",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#2a1010",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  abilityCardSelected: {
    borderColor: "#5a0000",
    backgroundColor: "#1a0808",
  },
  abilityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#1a0808",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a1010",
  },
  abilityIconWrapSelected: {
    borderColor: "#5a0000",
    backgroundColor: "#200808",
  },
  abilityText: {
    flex: 1,
    gap: 3,
  },
  abilityLabel: {
    color: "#c8b49a",
    fontSize: 15,
    fontWeight: "700",
  },
  abilityLabelSelected: {
    color: "#e8c49a",
  },
  abilityDesc: {
    color: "#4a2a2a",
    fontSize: 12,
  },
  slotBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#5a0000",
    justifyContent: "center",
    alignItems: "center",
  },
  slotBadgeText: {
    color: "#e8d5b7",
    fontSize: 11,
    fontWeight: "900",
  },
});
