import { useEffect } from "react";
import { useReader } from "../context/ReaderContext";
import { useTTS } from "../context/TTSContext";
import { ReadingMode } from "../../domain/enums/ReadingMode";

export function useKeyboardControls(): void {
  const {
    state,
    togglePlayPause,
    navigateForward,
    navigateBack,
    increaseSpeed,
    decreaseSpeed,
    continueFromSpecialContent,
    loadDocument,
    updateSettings,
  } = useReader();

  const { isTTSActive, toggleTTSEnabled, toggleTTSPause } = useTTS();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTextInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTextInput) return;

      switch (event.key) {
        case " ":
          event.preventDefault();
          if (state.isPausedOnSpecialContent) {
            continueFromSpecialContent();
          } else if (isTTSActive) {
            toggleTTSPause();
          } else {
            togglePlayPause();
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          navigateBack();
          break;

        case "ArrowRight":
          event.preventDefault();
          navigateForward();
          break;

        case "ArrowUp":
          event.preventDefault();
          increaseSpeed();
          break;

        case "ArrowDown":
          event.preventDefault();
          decreaseSpeed();
          break;

        case "r":
        case "R":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            if (state.document) {
              loadDocument(state.document);
            }
          }
          break;

        case "m":
        case "M":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const nextMode =
              state.settings.readingMode === ReadingMode.STUDY
                ? ReadingMode.SPEED
                : ReadingMode.STUDY;
            updateSettings(state.settings.withReadingMode(nextMode));
          }
          break;

        case "t":
        case "T":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            toggleTTSEnabled();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state,
    togglePlayPause,
    navigateForward,
    navigateBack,
    increaseSpeed,
    decreaseSpeed,
    continueFromSpecialContent,
    loadDocument,
    updateSettings,
    isTTSActive,
    toggleTTSEnabled,
    toggleTTSPause,
  ]);
}
