import { useMemo } from "react";
import { useReader } from "../../context/ReaderContext";
import { useTheme } from "../../context/ThemeContext";
import { useTTS } from "../../context/TTSContext";
import { useTranslation } from "../../context/TranslationContext";
import { ThemeType } from "../../../domain/enums/ThemeType";
import {
  TargetLanguage,
  TARGET_LANGUAGE_LABELS,
} from "../../../domain/enums/TargetLanguage";
import { ReadingSettings } from "../../../domain/value-objects/ReadingSettings";
import { CloseIcon } from "../Icons/Icons";
import styles from "./SettingsDrawer.module.css";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: ThemeType; label: string }[] = [
  { value: ThemeType.DARK, label: "Dark" },
  { value: ThemeType.LIGHT, label: "Light" },
  { value: ThemeType.SEPIA, label: "Sepia" },
  { value: ThemeType.HIGH_CONTRAST, label: "High Contrast" },
];

interface VoiceGroup {
  language: string;
  voices: SpeechSynthesisVoice[];
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { state, updateSettings } = useReader();
  const { currentTheme, setTheme } = useTheme();
  const { availableVoices, selectedVoice, setVoice, isTTSSupported } = useTTS();
  const { targetLanguage, setTargetLanguage } = useTranslation();
  const { settings } = state;

  const voicesByLanguage = useMemo((): VoiceGroup[] => {
    const grouped = new Map<string, SpeechSynthesisVoice[]>();
    for (const voice of availableVoices) {
      const langCode = voice.lang.split("-")[0];
      const displayLang = new Intl.DisplayNames(["en"], { type: "language" }).of(langCode) ?? langCode;
      const existing = grouped.get(displayLang) ?? [];
      existing.push(voice);
      grouped.set(displayLang, existing);
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([language, voices]) => ({ language, voices }));
  }, [availableVoices]);

  if (!isOpen) return null;

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fontSize = Number(event.target.value);
    updateSettings(settings.withFontSize(fontSize));
  };

  const handleContextFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const contextFontSize = Number(event.target.value);
    updateSettings(settings.withContextFontSize(contextFontSize));
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const wordsPerMinute = Number(event.target.value);
    updateSettings(settings.withWordsPerMinute(wordsPerMinute));
  };

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceUri = event.target.value;
    if (!voiceUri) {
      setVoice(null);
      return;
    }
    const voice = availableVoices.find((v) => v.voiceURI === voiceUri) ?? null;
    setVoice(voice);
  };

  const handleOpenVoiceSettings = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) {
      window.open("ms-settings:speech", "_blank");
    } else if (userAgent.includes("mac")) {
      window.open("x-apple.systempreferences:com.apple.preference.universalaccess?TextToSpeech", "_blank");
    } else if (userAgent.includes("android")) {
      window.open("intent://com.android.settings.TTS_SETTINGS#Intent;scheme=android-app;end", "_blank");
    } else {
      window.open("https://support.google.com/chrome/answer/9015266", "_blank");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.drawer} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Settings</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Theme</label>
          <div className={styles.themeGrid}>
            {THEME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`${styles.themeOption} ${
                  currentTheme === value ? styles.themeActive : ""
                }`}
                onClick={() => setTheme(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Word Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min={ReadingSettings.minFontSize}
            max={ReadingSettings.maxFontSize}
            value={settings.fontSize}
            onChange={handleFontSizeChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>{ReadingSettings.minFontSize}px</span>
            <span>{ReadingSettings.maxFontSize}px</span>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Context Text Size: {settings.contextFontSize}px
          </label>
          <input
            type="range"
            min={ReadingSettings.minContextFontSize}
            max={ReadingSettings.maxContextFontSize}
            value={settings.contextFontSize}
            onChange={handleContextFontSizeChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>{ReadingSettings.minContextFontSize}px</span>
            <span>{ReadingSettings.maxContextFontSize}px</span>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Speed: {settings.wordsPerMinute} WPM
          </label>
          <input
            type="range"
            min={ReadingSettings.minWpm}
            max={ReadingSettings.maxWpm}
            step={ReadingSettings.wpmStep}
            value={settings.wordsPerMinute}
            onChange={handleSpeedChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>{ReadingSettings.minWpm}</span>
            <span>{ReadingSettings.maxWpm}</span>
          </div>
        </div>

        {isTTSSupported && availableVoices.length > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>Voice</label>
            <select
              className={styles.voiceSelect}
              value={selectedVoice?.voiceURI ?? ""}
              onChange={handleVoiceChange}
            >
              <option value="">System Default</option>
              {voicesByLanguage.map(({ language, voices }) => (
                <optgroup key={language} label={language}>
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              className={styles.voiceHelpButton}
              onClick={handleOpenVoiceSettings}
              type="button"
            >
              Download more voices
            </button>
            <p className={styles.voiceHelpText}>
              Opens your system speech settings where you can install additional languages and voices.
              After installing, refresh this page to see new voices.
            </p>
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.label}>Translation Language</label>
          <select
            className={styles.voiceSelect}
            value={targetLanguage}
            onChange={(event) =>
              setTargetLanguage(event.target.value as TargetLanguage)
            }
          >
            {Object.values(TargetLanguage).map((langCode) => (
              <option key={langCode} value={langCode}>
                {TARGET_LANGUAGE_LABELS[langCode]}
              </option>
            ))}
          </select>
          <p className={styles.voiceHelpText}>
            Click the current word to translate it. Double-click words in context or full text view.
          </p>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Reading Modes</label>
          <p className={styles.modeDescription}>
            <strong>Study:</strong> Pauses on code blocks and images so you can review them.
          </p>
          <p className={styles.modeDescription}>
            <strong>Speed:</strong> Skips code blocks and images for uninterrupted reading.
          </p>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Keyboard Shortcuts</label>
          <ul className={styles.shortcutList}>
            <li><kbd>Space</kbd> Play / Pause</li>
            <li><kbd>←</kbd> Previous word (hold to repeat)</li>
            <li><kbd>→</kbd> Next word (hold to repeat)</li>
            <li><kbd>↑</kbd> Increase speed (hold to repeat)</li>
            <li><kbd>↓</kbd> Decrease speed (hold to repeat)</li>
            <li><kbd>M</kbd> Toggle reading mode</li>
            <li><kbd>T</kbd> Read aloud (Text-to-Speech)</li>
            <li><kbd>R</kbd> Restart</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
