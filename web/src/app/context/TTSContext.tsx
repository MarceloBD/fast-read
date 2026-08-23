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
import {
  detectTextLanguage,
  findVoiceForLanguage,
} from "../../application/services/LanguageVoiceService";
import { useReader } from "./ReaderContext";

interface TTSContextValue {
  isTTSEnabled: boolean;
  isTTSSpeaking: boolean;
  isTTSPaused: boolean;
  isTTSSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  startTTS: (fromIndex?: number) => void;
  pauseTTS: () => void;
  resumeTTS: () => void;
  stopTTS: () => void;
  stopSpeech: () => void;
  toggleTTSEnabled: () => void;
  toggleTTSPlayPause: () => void;
}

const TTSContext = createContext<TTSContextValue | null>(null);

export function TTSProvider({ children }: { children: ReactNode }) {
  const { state, seekTo, pause: pauseRSVP } = useReader();
  const { document: doc, currentIndex, settings } = state;

  const ttsRef = useRef<TextToSpeechService | null>(null);
  if (ttsRef.current === null && typeof window !== "undefined") {
    ttsRef.current = new TextToSpeechService();
  }
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isTTSSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isTTSSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (voices.length > 0) {
        ttsRef.current?.warmUp();
      }

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
        setIsTTSSpeaking(false);
        setIsTTSPaused(false);
      },
      onStart: () => {
        setIsTTSSpeaking(true);
        setIsTTSPaused(false);
      },
      onPause: () => {
        setIsTTSPaused(true);
      },
      onResume: () => {
        setIsTTSPaused(false);
      },
      onError: () => {
        setIsTTSSpeaking(false);
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

  const recoverIfStuck = useCallback(() => {
    const tts = ttsRef.current;
    if (!tts) return false;
    if (tts.isStuck) {
      tts.forceReset();
      setIsTTSSpeaking(false);
      setIsTTSPaused(false);
      return true;
    }
    return false;
  }, []);

  const startTTS = useCallback((fromIndex?: number) => {
    if (!doc || !ttsRef.current) return;
    pauseRSVP();

    const rate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
    ttsRef.current.setRateWithoutRestart(rate);

    let speakFrom = fromIndex ?? currentIndex;
    const isAtEnd = speakFrom >= (doc.totalWords - 1);
    if (isAtEnd) {
      speakFrom = 0;
      seekTo(0);
    }

    setIsTTSSpeaking(true);
    setIsTTSPaused(false);
    ttsRef.current.speak(speakFrom);
  }, [doc, currentIndex, pauseRSVP, seekTo, settings.wordsPerMinute]);

  const pauseTTS = useCallback(() => {
    ttsRef.current?.pause();
  }, []);

  const resumeTTS = useCallback(() => {
    ttsRef.current?.resume();
  }, []);

  const stopTTS = useCallback(() => {
    ttsRef.current?.stop();
    setIsTTSEnabled(false);
    setIsTTSSpeaking(false);
    setIsTTSPaused(false);
  }, []);

  const stopSpeech = useCallback(() => {
    ttsRef.current?.stop();
    setIsTTSSpeaking(false);
    setIsTTSPaused(false);
  }, []);

  const autoSelectVoiceForText = useCallback(() => {
    if (!doc || availableVoices.length === 0) return;

    const sampleText = doc.tokens
      .slice(0, Math.min(100, doc.tokens.length))
      .map((token) => token.displayWord)
      .join(" ");

    const detectedLanguage = detectTextLanguage(sampleText);
    if (!detectedLanguage) return;

    const currentVoiceLang = selectedVoice?.lang.split("-")[0].toLowerCase();
    if (currentVoiceLang === detectedLanguage.split("-")[0].toLowerCase()) return;

    const matchingVoice = findVoiceForLanguage(availableVoices, detectedLanguage);
    if (!matchingVoice) return;

    setSelectedVoice(matchingVoice);
    ttsRef.current?.setVoice(matchingVoice);
  }, [doc, availableVoices, selectedVoice]);

  const toggleTTSEnabled = useCallback(() => {
    if (isTTSEnabled) {
      ttsRef.current?.stop();
      setIsTTSEnabled(false);
      setIsTTSSpeaking(false);
      setIsTTSPaused(false);
      return;
    }
    autoSelectVoiceForText();
    setIsTTSEnabled(true);
  }, [isTTSEnabled, autoSelectVoiceForText]);

  const toggleTTSPlayPause = useCallback(() => {
    if (!isTTSEnabled) return;

    const tts = ttsRef.current;
    if (!tts) return;

    if (isTTSSpeaking && !tts.isSpeaking && !tts.isPaused) {
      tts.forceReset();
      setIsTTSSpeaking(false);
      setIsTTSPaused(false);
      startTTS();
      return;
    }

    if (recoverIfStuck()) {
      startTTS();
      return;
    }

    if (isTTSSpeaking && !isTTSPaused) {
      pauseTTS();
      return;
    }

    if (isTTSPaused) {
      resumeTTS();
      return;
    }

    startTTS();
  }, [isTTSEnabled, isTTSSpeaking, isTTSPaused, pauseTTS, resumeTTS, startTTS, recoverIfStuck]);

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
    isTTSEnabled,
    isTTSSpeaking,
    isTTSPaused,
    isTTSSupported,
    availableVoices,
    selectedVoice,
    setVoice,
    startTTS,
    pauseTTS,
    resumeTTS,
    stopTTS,
    stopSpeech,
    toggleTTSEnabled,
    toggleTTSPlayPause,
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
