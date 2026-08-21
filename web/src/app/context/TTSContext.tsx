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
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  startTTS: () => void;
  pauseTTS: () => void;
  resumeTTS: () => void;
  stopTTS: () => void;
  toggleTTSEnabled: () => void;
  toggleTTSPause: () => void;
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isTTSSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isTTSSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      const savedVoiceUri = localStorage.getItem("tts-voice-uri");
      if (savedVoiceUri) {
        const saved = voices.find((voice) => voice.voiceURI === savedVoiceUri);
        if (saved) {
          setSelectedVoice(saved);
          ttsRef.current?.setVoice(saved);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isTTSSupported]);

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
      const words = doc.tokens.map((token) => token.displayWord);
      ttsRef.current?.loadWords(words);
    }
  }, [doc]);

  useEffect(() => {
    const rate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
    ttsRef.current?.setRate(rate);
  }, [settings.wordsPerMinute]);

  const startTTS = useCallback(() => {
    if (!doc || !ttsRef.current) return;
    pauseRSVP();
    const rate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
    ttsRef.current.setRate(rate);
    ttsRef.current.speak(currentIndex);
  }, [doc, currentIndex, pauseRSVP, settings.wordsPerMinute]);

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

  const toggleTTSEnabled = useCallback(() => {
    if (isTTSActive) {
      stopTTS();
      return;
    }
    startTTS();
  }, [isTTSActive, startTTS, stopTTS]);

  const toggleTTSPause = useCallback(() => {
    if (!isTTSActive) return;

    if (isTTSPaused) {
      resumeTTS();
    } else {
      pauseTTS();
    }
  }, [isTTSActive, isTTSPaused, pauseTTS, resumeTTS]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    ttsRef.current?.setVoice(voice);
    if (voice) {
      localStorage.setItem("tts-voice-uri", voice.voiceURI);
    } else {
      localStorage.removeItem("tts-voice-uri");
    }
  }, []);

  const contextValue: TTSContextValue = {
    isTTSActive,
    isTTSPaused,
    isTTSSupported,
    availableVoices,
    selectedVoice,
    setVoice,
    startTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
    toggleTTSEnabled,
    toggleTTSPause,
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
