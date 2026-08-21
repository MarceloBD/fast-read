import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { TranslationResult } from "../../domain/entities/TranslationResult";
import { TargetLanguage } from "../../domain/enums/TargetLanguage";
import { TranslationService } from "../../application/services/TranslationService";
import { MyMemoryTranslationAdapter } from "../../infrastructure/adapters/MyMemoryTranslationAdapter";

interface TranslationRequest {
  word: string;
  anchorRect: DOMRect;
}

interface TranslationContextValue {
  targetLanguage: TargetLanguage;
  isTranslating: boolean;
  translationResult: TranslationResult | null;
  translationError: string | null;
  activeRequest: TranslationRequest | null;
  setTargetLanguage: (language: TargetLanguage) => void;
  translateWord: (word: string, anchorRect: DOMRect) => void;
  dismiss: () => void;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const serviceRef = useRef(
    new TranslationService(new MyMemoryTranslationAdapter())
  );

  const [targetLanguage, setTargetLanguageState] = useState<TargetLanguage>(
    () => serviceRef.current.loadTargetLanguage()
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] =
    useState<TranslationRequest | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const setTargetLanguage = useCallback((language: TargetLanguage) => {
    setTargetLanguageState(language);
    serviceRef.current.saveTargetLanguage(language);
  }, []);

  const dismiss = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setActiveRequest(null);
    setTranslationResult(null);
    setTranslationError(null);
    setIsTranslating(false);
  }, []);

  const translateWord = useCallback(
    async (word: string, anchorRect: DOMRect) => {
      dismiss();

      const cleanedWord = word.replace(/[.,;:!?'"()\[\]{}]/g, "").trim();
      if (!cleanedWord) return;

      setActiveRequest({ word: cleanedWord, anchorRect });
      setIsTranslating(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await serviceRef.current.translate(
          cleanedWord,
          targetLanguage
        );

        if (controller.signal.aborted) return;

        setTranslationResult(result);
        setTranslationError(null);
      } catch (error) {
        if (controller.signal.aborted) return;

        setTranslationError("Translation unavailable");
        setTranslationResult(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false);
        }
      }
    },
    [targetLanguage, dismiss]
  );

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const contextValue: TranslationContextValue = {
    targetLanguage,
    isTranslating,
    translationResult,
    translationError,
    activeRequest,
    setTargetLanguage,
    translateWord,
    dismiss,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextValue {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
