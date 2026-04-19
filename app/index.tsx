import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import type { GameState, Vec2, UpgradeType, SpecialType } from "../game/types";
import { createInitialState } from "../game/initialState";
import { tickGame, applyUpgrade, useSpecialAbility } from "../game/gameLoop";
import GameCanvas from "../components/GameCanvas";
import HUD from "../components/HUD";
import Joystick from "../components/Joystick";
import LevelUpScreen from "../components/LevelUpScreen";
import StartScreen from "../components/StartScreen";
import GameOverScreen from "../components/GameOverScreen";
import SpecialButton from "../components/SpecialButton";
import WaveBanner from "../components/WaveBanner";
import SettingsModal, {
  Settings,
  DEFAULT_SETTINGS,
} from "../components/SettingsModal";
import ProfileModal, {
  Profile,
  DEFAULT_PROFILE,
} from "../components/ProfileModal";

const HIGH_SCORE_KEY = "vs_high_score";
const SETTINGS_KEY = "vs_settings";
const PROFILE_KEY = "vs_profile";
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  const joystickDir = useRef<Vec2>({ x: 0, y: 0 });
  const gameStateRef = useRef<GameState | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadStored() {
      const [hsVal, settingsVal, profileVal] = await Promise.all([
        AsyncStorage.getItem(HIGH_SCORE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);
      if (hsVal) setHighScore(parseInt(hsVal, 10));
      if (settingsVal) {
        const parsed = JSON.parse(settingsVal) as Settings;
        setSettings(parsed);
        settingsRef.current = parsed;
      }
      if (profileVal) {
        setProfile(JSON.parse(profileVal) as Profile);
      }
    }
    loadStored();
  }, []);

  const saveHighScore = useCallback(async (score: number) => {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
    setHighScore(score);
  }, []);

  const handleSettingsChange = useCallback((s: Settings) => {
    setSettings(s);
    settingsRef.current = s;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }, []);

  const handleProfileApply = useCallback(
    (p: Profile) => {
      setProfile(p);
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      setProfileVisible(false);
      if (gameStateRef.current && gameStateRef.current.phase === "paused") {
        const resumed = { ...gameStateRef.current, phase: "playing" as const };
        gameStateRef.current = resumed;
        lastTimeRef.current = 0;
        setGameState(resumed);
      }
    },
    []
  );

  const handleProfileClose = useCallback(() => {
    setProfileVisible(false);
    if (gameStateRef.current && gameStateRef.current.phase === "paused") {
      const resumed = { ...gameStateRef.current, phase: "playing" as const };
      gameStateRef.current = resumed;
      lastTimeRef.current = 0;
      setGameState(resumed);
    }
  }, []);

  const clearGameLoop = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    lastTimeRef.current = 0;
    frameCountRef.current = 0;
    joystickDir.current = { x: 0, y: 0 };
    gameStateRef.current = null;
  }, []);

  function applyPassives(state: GameState, p: Profile): GameState {
    let s = state;
    for (const slot of p.passiveSlots) {
      if (slot) {
        s = applyUpgrade(s, slot);
      }
    }
    return s;
  }

  const startGame = useCallback(async () => {
    clearGameLoop();
    const hs = await AsyncStorage.getItem(HIGH_SCORE_KEY).then((v) =>
      v ? parseInt(v, 10) : 0
    );
    const currentProfile = await AsyncStorage.getItem(PROFILE_KEY).then((v) =>
      v ? (JSON.parse(v) as Profile) : profile
    );
    let initial = createInitialState(SCREEN_W, SCREEN_H, hs);
    initial = applyPassives(initial, currentProfile);
    const playing = { ...initial, phase: "playing" as const };
    gameStateRef.current = playing;
    setGameState(playing);
  }, [clearGameLoop, profile]);

  const restartGame = useCallback(async () => {
    const prevHighScore = gameStateRef.current?.highScore ?? highScore;
    clearGameLoop();
    const storedHs = await AsyncStorage.getItem(HIGH_SCORE_KEY).then((v) =>
      v ? parseInt(v, 10) : 0
    );
    const finalHs = Math.max(prevHighScore, storedHs);
    if (finalHs > highScore) await saveHighScore(finalHs);
    const currentProfile = await AsyncStorage.getItem(PROFILE_KEY).then((v) =>
      v ? (JSON.parse(v) as Profile) : profile
    );
    let initial = createInitialState(SCREEN_W, SCREEN_H, finalHs);
    initial = applyPassives(initial, currentProfile);
    const playing = { ...initial, phase: "playing" as const };
    gameStateRef.current = playing;
    setGameState(playing);
  }, [highScore, saveHighScore, clearGameLoop, profile]);

  const handlePause = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.phase !== "playing") return;
    const paused = { ...gameStateRef.current, phase: "paused" as const };
    gameStateRef.current = paused;
    setGameState(paused);
    setProfileVisible(true);
  }, []);

  const handleUpgrade = useCallback((upgrade: UpgradeType) => {
    if (!gameStateRef.current) return;
    const newState = applyUpgrade(gameStateRef.current, upgrade);
    gameStateRef.current = newState;
    setGameState(newState);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleSpecial = useCallback((type: SpecialType) => {
    if (!gameStateRef.current || gameStateRef.current.phase !== "playing") return;
    const newState = useSpecialAbility(gameStateRef.current, type);
    gameStateRef.current = newState;
    setGameState(newState);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  useEffect(() => {
    if (!gameState || gameState.phase !== "playing") {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (gameState?.phase === "gameover" && gameState.highScore > highScore) {
        saveHighScore(gameState.highScore);
      }
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const current = gameStateRef.current;
      if (!current || current.phase !== "playing") return;

      const next = tickGame(current, dt, joystickDir.current, SCREEN_W, SCREEN_H);
      gameStateRef.current = next;
      frameCountRef.current++;

      if (next.phase !== "playing") {
        setGameState(next);
        if (next.phase === "levelup") {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else if (next.phase === "gameover") {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          if (next.highScore > highScore) {
            saveHighScore(next.highScore);
          }
        }
      } else {
        const skipFrame = !settingsRef.current.smoothFps && frameCountRef.current % 2 !== 0;
        if (!skipFrame) {
          setGameState(next);
        }
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [gameState?.phase]);

  const handleJoystickMove = useCallback((dir: Vec2) => {
    joystickDir.current = dir;
  }, []);

  const handleJoystickRelease = useCallback(() => {
    joystickDir.current = { x: 0, y: 0 };
  }, []);

  const isInGame =
    !!gameState &&
    gameState.phase !== "start" &&
    gameState.phase !== "gameover";

  if (!gameState || gameState.phase === "start") {
    return (
      <View style={styles.container}>
        <StartScreen
          highScore={highScore}
          onStart={startGame}
          onSettings={() => setSettingsVisible(true)}
          onProfile={() => setProfileVisible(true)}
        />
        <SettingsModal
          visible={settingsVisible}
          settings={settings}
          onClose={() => setSettingsVisible(false)}
          onChange={handleSettingsChange}
        />
        <ProfileModal
          visible={profileVisible}
          profile={profile}
          isInGame={false}
          onClose={() => setProfileVisible(false)}
          onApply={handleProfileApply}
        />
      </View>
    );
  }

  const activePhase = gameState.phase;

  return (
    <View style={styles.container}>
      <GameCanvas
        state={gameState}
        width={SCREEN_W}
        height={SCREEN_H}
        playerColor={profile.playerColor}
      />

      {(activePhase === "playing" ||
        activePhase === "levelup" ||
        activePhase === "paused") && (
        <HUD state={gameState} />
      )}

      {activePhase === "playing" && (
        <>
          <View
            style={[styles.joystickContainer, { bottom: bottomPad + 30 }]}
            pointerEvents="box-none"
          >
            <Joystick
              onMove={handleJoystickMove}
              onRelease={handleJoystickRelease}
              size={130}
            />
          </View>

          <View
            style={[styles.specialsContainer, { bottom: bottomPad + 30 }]}
            pointerEvents="box-none"
          >
            {(["nova", "shield", "timewarp"] as SpecialType[]).map((type) => (
              <SpecialButton
                key={type}
                type={type}
                slot={gameState.specials[type]}
                onPress={handleSpecial}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.pauseBtn, { top: topPad + 60 }]}
            onPress={handlePause}
            activeOpacity={0.7}
          >
            <Text style={styles.pauseBtnText}>☽</Text>
          </TouchableOpacity>
        </>
      )}

      {activePhase === "playing" && gameState.waveNumber > 0 && (
        <WaveBanner
          waveNumber={gameState.waveNumber}
          waveBannerTimer={gameState.waveBannerTimer}
        />
      )}

      {activePhase === "levelup" && (
        <LevelUpScreen
          level={gameState.level}
          upgrades={gameState.pendingUpgrades}
          currentLevels={gameState.upgrades}
          onChoose={handleUpgrade}
        />
      )}

      {activePhase === "gameover" && (
        <GameOverScreen state={gameState} onRestart={restartGame} />
      )}

      <ProfileModal
        visible={profileVisible}
        profile={profile}
        isInGame={isInGame}
        onClose={handleProfileClose}
        onApply={handleProfileApply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  joystickContainer: {
    position: "absolute",
    right: 30,
  },
  specialsContainer: {
    position: "absolute",
    left: 24,
    flexDirection: "column",
    gap: 10,
  },
  pauseBtn: {
    position: "absolute",
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(10,4,4,0.75)",
    borderWidth: 1,
    borderColor: "#3a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseBtnText: {
    color: "#8b4a4a",
    fontSize: 16,
  },
});
