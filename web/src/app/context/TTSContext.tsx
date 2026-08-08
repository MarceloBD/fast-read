"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { TextToSpeechService } from "../../application/services/TextToSpeechService";
import { useReader } from "./ReaderContext";

interface TTSContextValue {
  isTTSActive: boolean;
  isTTSPaused: boolean;
  isTTSSupported: boolean;
  ttsRate: number;
  useSyncedSpeed: boolean;
  startTTS: () => void;
  pauseTTS: () => void;
  resumeTTS: () => void;
  stopTTS: () => void;
  toggleTTS: () => void;
  setTTSRate: (rate: number) => void;
  setUseSyncedSpeed: (synced: boolean) => void;
}

const TTSContext = createContext<TTSContextValue | null>(null);

export function TTSProvider({ children }: { children: ReactNode }) {
  const { state, seekTo, pause: pauseRSVP } = useReader();
  const { document: doc, currentIndex, settings } = state;

  const ttsRef = useRef<TextToSpeechService | null>(null);
  if (ttsRef.current === null && typeof window !== "undefined") {
    ttsRef.current = new TextToSpeechService();
  }
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [ttsRate, setTTSRateState] = useState(1.0);
  const [useSyncedSpeed, setUseSyncedSpeed] = useState(true);

  const isTTSSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const tts = ttsRef.current;
    if (!tts) return;

    tts.setCallbacks({
      onWordSpoken: (wordIndex) => {
        seekTo(wordIndex);
      },
      onComplete: () => {
        setIsTTSActive(false);
        setIsTTSPaused(false);
      },
      onStart: () => {
        setIsTTSActive(true);
        setIsTTSPaused(false);
      },
      onPause: () => {
        setIsTTSPaused(true);
      },
      onResume: () => {
        setIsTTSPaused(false);
      },
    });

    return () => {
      tts.destroy();
    };
  }, [seekTo]);

  useEffect(() => {
    if (doc) {
      const words = doc.tokens.map((token) => token.word);
      ttsRef.current?.loadWords(words);
    }
  }, [doc]);

  useEffect(() => {
    if (useSyncedSpeed) {
      const syncedRate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
      ttsRef.current?.setRate(syncedRate);
      setTTSRateState(syncedRate);
    }
  }, [settings.wordsPerMinute, useSyncedSpeed]);

  const startTTS = useCallback(() => {
    if (!doc || !ttsRef.current) return;
    pauseRSVP();
    const rate = useSyncedSpeed
      ? TextToSpeechService.rateFromWpm(settings.wordsPerMinute)
      : ttsRate;
    ttsRef.current.setRate(rate);
    ttsRef.current.speak(currentIndex);
  }, [doc, currentIndex, pauseRSVP, settings.wordsPerMinute, ttsRate, useSyncedSpeed]);

  const pauseTTS = useCallback(() => {
    ttsRef.current?.pause();
  }, []);

  const resumeTTS = useCallback(() => {
    ttsRef.current?.resume();
  }, []);

  const stopTTS = useCallback(() => {
    ttsRef.current?.stop();
    setIsTTSActive(false);
    setIsTTSPaused(false);
  }, []);

  const toggleTTS = useCallback(() => {
    if (isTTSActive && !isTTSPaused) {
      pauseTTS();
      return;
    }

    if (isTTSPaused) {
      resumeTTS();
      return;
    }

    startTTS();
  }, [isTTSActive, isTTSPaused, startTTS, pauseTTS, resumeTTS]);

  const setTTSRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(4.0, rate));
    setTTSRateState(clampedRate);
    setUseSyncedSpeed(false);
    ttsRef.current?.setRate(clampedRate);
  }, []);

  const contextValue: TTSContextValue = {
    isTTSActive,
    isTTSPaused,
    isTTSSupported,
    ttsRate,
    useSyncedSpeed,
    startTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
    toggleTTS,
    setTTSRate,
    setUseSyncedSpeed,
  };

  return (
    <TTSContext.Provider value={contextValue}>
      {children}
    </TTSContext.Provider>
  );
}

export function useTTS(): TTSContextValue {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error("useTTS must be used within a TTSProvider");
  }
  return context;
}
