import { ReadingMode } from "../enums/ReadingMode";
import { ThemeType } from "../enums/ThemeType";

const MIN_WPM = 50;
const MAX_WPM = 1500;
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 64;
const MIN_CONTEXT_FONT_SIZE = 10;
const MAX_CONTEXT_FONT_SIZE = 32;
const WPM_STEP = 25;

export class ReadingSettings {
  readonly wordsPerMinute: number;
  readonly fontSize: number;
  readonly contextFontSize: number;
  readonly readingMode: ReadingMode;
  readonly theme: ThemeType;

  constructor(params?: Partial<{
    wordsPerMinute: number;
    fontSize: number;
    contextFontSize: number;
    readingMode: ReadingMode;
    theme: ThemeType;
  }>) {
    this.wordsPerMinute = this.clampWpm(params?.wordsPerMinute ?? 300);
    this.fontSize = this.clampFontSize(params?.fontSize ?? 32);
    this.contextFontSize = this.clampContextFontSize(params?.contextFontSize ?? 14);
    this.readingMode = params?.readingMode ?? ReadingMode.STUDY;
    this.theme = params?.theme ?? ThemeType.DARK;
  }

  private clampWpm(value: number): number {
    return Math.max(MIN_WPM, Math.min(MAX_WPM, value));
  }

  private clampFontSize(value: number): number {
    return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value));
  }

  private clampContextFontSize(value: number): number {
    return Math.max(MIN_CONTEXT_FONT_SIZE, Math.min(MAX_CONTEXT_FONT_SIZE, value));
  }

  withWordsPerMinute(wordsPerMinute: number): ReadingSettings {
    return new ReadingSettings({ ...this, wordsPerMinute });
  }

  withFontSize(fontSize: number): ReadingSettings {
    return new ReadingSettings({ ...this, fontSize });
  }

  withContextFontSize(contextFontSize: number): ReadingSettings {
    return new ReadingSettings({ ...this, contextFontSize });
  }

  withReadingMode(readingMode: ReadingMode): ReadingSettings {
    return new ReadingSettings({ ...this, readingMode });
  }

  withTheme(theme: ThemeType): ReadingSettings {
    return new ReadingSettings({ ...this, theme });
  }

  increaseSpeed(): ReadingSettings {
    return this.withWordsPerMinute(this.wordsPerMinute + WPM_STEP);
  }

  decreaseSpeed(): ReadingSettings {
    return this.withWordsPerMinute(this.wordsPerMinute - WPM_STEP);
  }

  get baseDelayMs(): number {
    return 60000 / this.wordsPerMinute;
  }

  static get minWpm(): number {
    return MIN_WPM;
  }

  static get maxWpm(): number {
    return MAX_WPM;
  }

  static get minFontSize(): number {
    return MIN_FONT_SIZE;
  }

  static get maxFontSize(): number {
    return MAX_FONT_SIZE;
  }

  static get minContextFontSize(): number {
    return MIN_CONTEXT_FONT_SIZE;
  }

  static get maxContextFontSize(): number {
    return MAX_CONTEXT_FONT_SIZE;
  }

  static get wpmStep(): number {
    return WPM_STEP;
  }
}
