import { ReadingSettings } from "../../domain/value-objects/ReadingSettings";
import { ReadingMode } from "../../domain/enums/ReadingMode";
import { ThemeType } from "../../domain/enums/ThemeType";

const SETTINGS_KEY = "fast-read-settings";

interface StoredSettings {
  wordsPerMinute: number;
  fontSize: number;
  readingMode: ReadingMode;
  theme: ThemeType;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

export class LocalStorageAdapter {
  saveSettings(settings: ReadingSettings): void {
    if (!isClient()) return;

    const stored: StoredSettings = {
      wordsPerMinute: settings.wordsPerMinute,
      fontSize: settings.fontSize,
      readingMode: settings.readingMode,
      theme: settings.theme,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
  }

  loadSettings(): ReadingSettings {
    if (!isClient()) return new ReadingSettings();

    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return new ReadingSettings();

    try {
      const stored: StoredSettings = JSON.parse(raw);
      return new ReadingSettings(stored);
    } catch {
      return new ReadingSettings();
    }
  }
}
