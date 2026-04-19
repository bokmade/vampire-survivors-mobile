import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface Settings {
  soundEnabled: boolean;
  smoothFps: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  smoothFps: false,
};

interface SettingsModalProps {
  visible: boolean;
  settings: Settings;
  onClose: () => void;
  onChange: (s: Settings) => void;
}

export default function SettingsModal({
  visible,
  settings,
  onClose,
  onChange,
}: SettingsModalProps) {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.panel, { marginTop: topPad > 0 ? topPad * 0.5 : 0 }]}>
          <Text style={styles.title}>⚙ SETTINGS</Text>

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Text style={styles.label}>Sound</Text>
              <Text style={styles.hint}>
                {settings.soundEnabled ? "On" : "Off"}
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => onChange({ ...settings, soundEnabled: v })}
              trackColor={{ false: "#2a0a0a", true: "#6a0000" }}
              thumbColor={settings.soundEnabled ? "#cc1111" : "#3a1a1a"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <Text style={styles.label}>Smooth FPS</Text>
              <Text style={styles.hint}>
                {settings.smoothFps ? "High — uses more battery" : "Normal"}
              </Text>
            </View>
            <Switch
              value={settings.smoothFps}
              onValueChange={(v) => onChange({ ...settings, smoothFps: v })}
              trackColor={{ false: "#2a0a0a", true: "#6a0000" }}
              thumbColor={settings.smoothFps ? "#cc1111" : "#3a1a1a"}
            />
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  panel: {
    width: "100%",
    backgroundColor: "#0d0808",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#3a1010",
    padding: 24,
    gap: 18,
    shadowColor: "#8b0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    color: "#8b0000",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    gap: 3,
  },
  label: {
    color: "#c8b49a",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  hint: {
    color: "#5a3a3a",
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: "#1a0808",
  },
  closeBtn: {
    backgroundColor: "#1a0808",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3a1010",
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  closeBtnText: {
    color: "#8b0000",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 3,
  },
});
