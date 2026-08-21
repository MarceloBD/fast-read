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
  isTTSEnabled: boolean;
  isTTSSpeaking: boolean;
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
  toggleTTSPlayPause: () => void;
}

const TTSContext = createContext<TTSContextValue | null>(null);

export function TTSProvider({ children }: { children: ReactNode }) {
  const { state, seekTo, pause: pauseRSVP } = useReader();
  const { document: doc, currentIndex, settings } = state;

  const ttsRef = useRef(new TextToSpeechService());
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

      const savedVoiceUri = localStorage.getItem("tts-voice-uri");
      if (savedVoiceUri) {
        const saved = voices.find((voice) => voice.voiceURI === savedVoiceUri);
        if (saved) {
          setSelectedVoice(saved);
          ttsRef.current.setVoice(saved);
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
    });

    return () => {
      tts.destroy();
    };
  }, [seekTo]);

  useEffect(() => {
    if (doc) {
      const words = doc.tokens.map((token) => token.displayWord);
      ttsRef.current.loadWords(words);
    }
  }, [doc]);

  useEffect(() => {
    const rate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
    ttsRef.current.setRate(rate);
  }, [settings.wordsPerMinute]);

  const startTTS = useCallback(() => {
    if (!doc) return;
    pauseRSVP();
    const rate = TextToSpeechService.rateFromWpm(settings.wordsPerMinute);
    ttsRef.current.setRate(rate);

    const isAtEnd = currentIndex >= (doc.totalWords - 1);
    const speakFrom = isAtEnd ? 0 : currentIndex;
    if (isAtEnd) {
      seekTo(0);
    }
    ttsRef.current.speak(speakFrom);
  }, [doc, currentIndex, pauseRSVP, seekTo, settings.wordsPerMinute]);

  const pauseTTS = useCallback(() => {
    ttsRef.current.pause();
  }, []);

  const resumeTTS = useCallback(() => {
    ttsRef.current.resume();
  }, []);

  const stopTTS = useCallback(() => {
    ttsRef.current.stop();
    setIsTTSEnabled(false);
    setIsTTSSpeaking(false);
    setIsTTSPaused(false);
  }, []);

  const toggleTTSEnabled = useCallback(() => {
    if (isTTSEnabled) {
      ttsRef.current.stop();
      setIsTTSEnabled(false);
      setIsTTSSpeaking(false);
      setIsTTSPaused(false);
      return;
    }
    setIsTTSEnabled(true);
  }, [isTTSEnabled]);

  const toggleTTSPlayPause = useCallback(() => {
    if (!isTTSEnabled) return;

    if (isTTSSpeaking && !isTTSPaused) {
      pauseTTS();
      return;
    }

    if (isTTSPaused) {
      resumeTTS();
      return;
    }

    startTTS();
  }, [isTTSEnabled, isTTSSpeaking, isTTSPaused, pauseTTS, resumeTTS, startTTS]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    ttsRef.current.setVoice(voice);
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
