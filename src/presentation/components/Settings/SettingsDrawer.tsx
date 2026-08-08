import { useReader } from "../../context/ReaderContext";
import { useTheme } from "../../context/ThemeContext";
import { ThemeType } from "../../../domain/enums/ThemeType";
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

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { state, updateSettings } = useReader();
  const { currentTheme, setTheme } = useTheme();
  const { settings } = state;

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
