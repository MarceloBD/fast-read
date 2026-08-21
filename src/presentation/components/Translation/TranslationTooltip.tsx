import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import { useTTS } from "../../context/TTSContext";
import {
  findVoiceForLanguage,
  speakTextWithVoice,
  stopSpeechPlayback,
} from "../../../application/services/LanguageVoiceService";
import { CloseIcon, VolumeIcon } from "../Icons/Icons";
import styles from "./TranslationTooltip.module.css";

const TOOLTIP_GAP = 8;

export function TranslationTooltip() {
  const {
    activeRequest,
    isTranslating,
    translationResult,
    translationError,
    dismiss,
  } = useTranslation();

  const { availableVoices } = useTTS();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isSpeakingOriginal, setIsSpeakingOriginal] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);

  const positionTooltip = useCallback(() => {
    if (!activeRequest || !tooltipRef.current) return;

    const { anchorRect } = activeRequest;
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = anchorRect.bottom + TOOLTIP_GAP;
    let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;

    if (top + tooltipRect.height > window.innerHeight) {
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    top = Math.max(8, top);

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }, [activeRequest]);

  useEffect(() => {
    positionTooltip();
  }, [positionTooltip, isTranslating, translationResult, translationError]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopSpeechPlayback();
        dismiss();
      }
    };

    if (activeRequest) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeRequest, dismiss]);

  useEffect(() => {
    if (!activeRequest) {
      stopSpeechPlayback();
      setIsSpeakingOriginal(false);
      setIsSpeakingTranslation(false);
    }
  }, [activeRequest]);

  const handleSpeak = useCallback(
    (text: string, languageCode: string, type: "original" | "translation") => {
      const isCurrentlySpeaking =
        type === "original" ? isSpeakingOriginal : isSpeakingTranslation;

      if (isCurrentlySpeaking) {
        stopSpeechPlayback();
        setIsSpeakingOriginal(false);
        setIsSpeakingTranslation(false);
        return;
      }

      stopSpeechPlayback();
      setIsSpeakingOriginal(type === "original");
      setIsSpeakingTranslation(type === "translation");

      const voice = findVoiceForLanguage(availableVoices, languageCode);
      const utterance = speakTextWithVoice(text, voice, languageCode);

      utterance.onend = () => {
        setIsSpeakingOriginal(false);
        setIsSpeakingTranslation(false);
      };

      utterance.onerror = () => {
        setIsSpeakingOriginal(false);
        setIsSpeakingTranslation(false);
      };
    },
    [availableVoices, isSpeakingOriginal, isSpeakingTranslation]
  );

  if (!activeRequest) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => { stopSpeechPlayback(); dismiss(); }} />
      <div ref={tooltipRef} className={styles.tooltip}>
        <div className={styles.header}>
          <div className={styles.originalRow}>
            <span className={styles.originalWord}>{activeRequest.word}</span>
            {translationResult && (
              <button
                className={`${styles.speakButton} ${isSpeakingOriginal ? styles.speakButtonActive : ""}`}
                onClick={() =>
                  handleSpeak(
                    activeRequest.word,
                    translationResult.sourceLanguage,
                    "original"
                  )
                }
                title="Listen to original"
              >
                <VolumeIcon size={12} />
              </button>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={() => { stopSpeechPlayback(); dismiss(); }}
            title="Close (Esc)"
          >
            <CloseIcon size={12} />
          </button>
        </div>

        {isTranslating && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Translating...</span>
          </div>
        )}

        {translationResult && (
          <div className={styles.translationRow}>
            <span className={styles.translatedText}>
              {translationResult.translatedText}
            </span>
            <button
              className={`${styles.speakButton} ${isSpeakingTranslation ? styles.speakButtonActive : ""}`}
              onClick={() =>
                handleSpeak(
                  translationResult.translatedText,
                  translationResult.targetLanguage,
                  "translation"
                )
              }
              title="Listen to translation"
            >
              <VolumeIcon size={14} />
            </button>
          </div>
        )}

        {translationError && (
          <div className={styles.error}>{translationError}</div>
        )}
      </div>
    </>
  );
}
