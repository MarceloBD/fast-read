"use client";

import { useCallback, useState } from "react";
import { ReaderProvider, useReader } from "../../context/ReaderContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { TTSProvider, useTTS } from "../../context/TTSContext";
import { TranslationProvider } from "../../context/TranslationContext";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import { WordDisplay } from "../Reader/WordDisplay";
import { PlaybackControls } from "../Reader/PlaybackControls";
import { ContextPreview } from "../Reader/ContextPreview";
import { DropZone } from "../FileImport/DropZone";
import { StudyModeOverlay } from "../StudyMode/StudyModeOverlay";
import { SettingsDrawer } from "../Settings/SettingsDrawer";
import { FullTextView } from "../FullTextView/FullTextView";
import { TranslationTooltip } from "../Translation/TranslationTooltip";
import { TextViewIcon, BookIcon, BoltIcon, SettingsIcon } from "../Icons/Icons";
import { ReadingMode } from "../../../domain/enums/ReadingMode";
import styles from "./AppShell.module.css";

function ReaderUI() {
  useKeyboardControls();

  const { state, updateSettings, seekTo, play, pause } = useReader();
  const { isTTSEnabled, startTTS, stopSpeech } = useTTS();
  const { document: doc, currentIndex, settings } = state;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullTextOpen, setIsFullTextOpen] = useState(false);

  const currentToken = doc?.tokens[currentIndex] ?? null;

  const handleContextWordClick = useCallback((index: number) => {
    stopSpeech();
    seekTo(index);
    if (isTTSEnabled) {
      startTTS(index);
    } else {
      play();
    }
  }, [seekTo, play, isTTSEnabled, startTTS, stopSpeech]);

  const handleToggleMode = useCallback(() => {
    const nextMode =
      settings.readingMode === ReadingMode.STUDY
        ? ReadingMode.SPEED
        : ReadingMode.STUDY;
    updateSettings(settings.withReadingMode(nextMode));
  }, [settings, updateSettings]);

  return (
    <div className={styles.shell}>
      {!doc && <DropZone />}

      {doc && (
        <div className={styles.readerLayout}>
          <header className={styles.header}>
            <h1 className={styles.title}>{doc.title}</h1>
            <div className={styles.headerActions}>
              <button
                className={styles.textViewButton}
                onClick={() => setIsFullTextOpen(true)}
                title="View full text"
              >
                <TextViewIcon size={16} />
              </button>
              <button
                className={`${styles.modeButton} ${
                  settings.readingMode === ReadingMode.SPEED ? styles.modeSpeed : styles.modeStudy
                }`}
                onClick={handleToggleMode}
                title={settings.readingMode === ReadingMode.STUDY
                  ? "Study: pauses on code/images (M)"
                  : "Speed: skips code/images (M)"}
              >
                {settings.readingMode === ReadingMode.STUDY
                  ? <><BookIcon size={14} /> Study</>
                  : <><BoltIcon size={14} /> Speed</>}
              </button>
              <button
                className={styles.settingsButton}
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </header>

          <main className={styles.readerArea}>
            <WordDisplay
              token={currentToken}
              fontSize={settings.fontSize}
              onTranslateClick={pause}
            />
            <div className={styles.contextWrapper}>
              <ContextPreview
                tokens={doc.tokens}
                currentIndex={currentIndex}
                contextFontSize={settings.contextFontSize}
                onWordClick={handleContextWordClick}
              />
            </div>
          </main>

          <footer className={styles.footer}>
            <PlaybackControls />
          </footer>
        </div>
      )}

      <StudyModeOverlay />
      <FullTextView
        isOpen={isFullTextOpen}
        onClose={() => setIsFullTextOpen(false)}
      />
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export function AppShell() {
  return (
    <ReaderProvider>
      <ThemeProvider>
        <TTSProvider>
          <TranslationProvider>
            <ReaderUI />
            <TranslationTooltip />
          </TranslationProvider>
        </TTSProvider>
      </ThemeProvider>
    </ReaderProvider>
  );
}
