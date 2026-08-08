import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { Document } from "../../domain/entities/Document";
import { WordToken } from "../../domain/entities/WordToken";
import { ReadingSettings } from "../../domain/value-objects/ReadingSettings";
import { ReadingMode } from "../../domain/enums/ReadingMode";
import { RSVPEngineService } from "../../application/services/RSVPEngineService";
import { LocalStorageAdapter } from "../../infrastructure/storage/LocalStorageAdapter";

interface ReaderState {
  document: Document | null;
  currentIndex: number;
  isPlaying: boolean;
  isPausedOnSpecialContent: boolean;
  specialContentToken: WordToken | null;
  settings: ReadingSettings;
}

type ReaderAction =
  | { type: "SET_DOCUMENT"; payload: Document }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "PAUSE_ON_SPECIAL"; payload: WordToken }
  | { type: "RESUME_FROM_SPECIAL" }
  | { type: "SET_SETTINGS"; payload: ReadingSettings }
  | { type: "RESET" };

const storageAdapter = new LocalStorageAdapter();

function createInitialState(): ReaderState {
  return {
    document: null,
    currentIndex: 0,
    isPlaying: false,
    isPausedOnSpecialContent: false,
    specialContentToken: null,
    settings: storageAdapter.loadSettings(),
  };
}

function readerReducer(state: ReaderState, action: ReaderAction): ReaderState {
  switch (action.type) {
    case "SET_DOCUMENT":
      return {
        ...state,
        document: action.payload,
        currentIndex: 0,
        isPlaying: false,
        isPausedOnSpecialContent: false,
        specialContentToken: null,
      };
    case "SET_CURRENT_INDEX":
      return { ...state, currentIndex: action.payload };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "PAUSE_ON_SPECIAL":
      return {
        ...state,
        isPausedOnSpecialContent: true,
        isPlaying: false,
        specialContentToken: action.payload,
      };
    case "RESUME_FROM_SPECIAL":
      return {
        ...state,
        isPausedOnSpecialContent: false,
        specialContentToken: null,
      };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

interface ReaderContextValue {
  state: ReaderState;
  loadDocument: (document: Document) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  navigateForward: () => void;
  navigateBack: () => void;
  seekTo: (index: number) => void;
  continueFromSpecialContent: () => void;
  updateSettings: (settings: ReadingSettings) => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(readerReducer, undefined, createInitialState);
  const engineRef = useRef(new RSVPEngineService());
  const settingsRef = useRef(state.settings);

  useEffect(() => {
    settingsRef.current = state.settings;
  }, [state.settings]);

  const loadDocument = useCallback((document: Document) => {
    dispatch({ type: "SET_DOCUMENT", payload: document });
    engineRef.current.load(document.tokens);
    engineRef.current.setBaseDelay(settingsRef.current.baseDelayMs);
    engineRef.current.setPauseOnSpecialContent(
      settingsRef.current.readingMode === ReadingMode.STUDY
    );

    engineRef.current.setCallbacks({
      onWordChange: (index) => {
        dispatch({ type: "SET_CURRENT_INDEX", payload: index });
      },
      onPauseOnSpecialContent: (token) => {
        dispatch({ type: "PAUSE_ON_SPECIAL", payload: token });
      },
      onComplete: () => {
        dispatch({ type: "SET_PLAYING", payload: false });
      },
    });
  }, []);

  const play = useCallback(() => {
    engineRef.current.play();
    dispatch({ type: "SET_PLAYING", payload: true });
  }, []);

  const pause = useCallback(() => {
    engineRef.current.pause();
    dispatch({ type: "SET_PLAYING", payload: false });
  }, []);

  const togglePlayPause = useCallback(() => {
    const engineState = engineRef.current.getState();
    if (engineState.isPausedOnSpecialContent) return;

    if (engineState.isPlaying) {
      engineRef.current.pause();
      dispatch({ type: "SET_PLAYING", payload: false });
    } else {
      engineRef.current.play();
      dispatch({ type: "SET_PLAYING", payload: true });
    }
  }, []);

  const navigateForward = useCallback(() => {
    engineRef.current.navigateForward();
  }, []);

  const navigateBack = useCallback(() => {
    engineRef.current.navigateBack();
  }, []);

  const seekTo = useCallback((index: number) => {
    engineRef.current.seekTo(index);
  }, []);

  const continueFromSpecialContent = useCallback(() => {
    engineRef.current.continueFromSpecialContent();
    dispatch({ type: "RESUME_FROM_SPECIAL" });
    dispatch({ type: "SET_PLAYING", payload: true });
  }, []);

  const updateSettings = useCallback((settings: ReadingSettings) => {
    dispatch({ type: "SET_SETTINGS", payload: settings });
    engineRef.current.setBaseDelay(settings.baseDelayMs);
    engineRef.current.setPauseOnSpecialContent(
      settings.readingMode === ReadingMode.STUDY
    );
    storageAdapter.saveSettings(settings);
  }, []);

  const increaseSpeed = useCallback(() => {
    const newSettings = settingsRef.current.increaseSpeed();
    dispatch({ type: "SET_SETTINGS", payload: newSettings });
    engineRef.current.setBaseDelay(newSettings.baseDelayMs);
    storageAdapter.saveSettings(newSettings);
  }, []);

  const decreaseSpeed = useCallback(() => {
    const newSettings = settingsRef.current.decreaseSpeed();
    dispatch({ type: "SET_SETTINGS", payload: newSettings });
    engineRef.current.setBaseDelay(newSettings.baseDelayMs);
    storageAdapter.saveSettings(newSettings);
  }, []);

  const contextValue: ReaderContextValue = {
    state,
    loadDocument,
    play,
    pause,
    togglePlayPause,
    navigateForward,
    navigateBack,
    seekTo,
    continueFromSpecialContent,
    updateSettings,
    increaseSpeed,
    decreaseSpeed,
  };

  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader(): ReaderContextValue {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error("useReader must be used within a ReaderProvider");
  }
  return context;
}
