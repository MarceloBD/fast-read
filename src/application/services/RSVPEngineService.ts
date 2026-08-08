import { WordToken } from "../../domain/entities/WordToken";

const SENTENCE_PAUSE_MULTIPLIER = 2.8;
const CLAUSE_PAUSE_MULTIPLIER = 1.6;
const LONG_WORD_EXTRA_MS = 40;

export interface RSVPEngineState {
  currentIndex: number;
  isPlaying: boolean;
  isPausedOnSpecialContent: boolean;
}

export interface RSVPEngineCallbacks {
  onWordChange: (index: number) => void;
  onPauseOnSpecialContent: (token: WordToken) => void;
  onComplete: () => void;
}

export class RSVPEngineService {
  private tokens: WordToken[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private isPausedOnSpecialContent = false;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private lastTickTime = 0;
  private baseDelayMs = 200;
  private callbacks: RSVPEngineCallbacks | null = null;
  private pauseOnSpecialContent = true;

  load(tokens: WordToken[]): void {
    this.stop();
    this.tokens = tokens;
    this.currentIndex = 0;
    this.isPausedOnSpecialContent = false;
  }

  setCallbacks(callbacks: RSVPEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  setBaseDelay(delayMs: number): void {
    this.baseDelayMs = delayMs;
  }

  setPauseOnSpecialContent(shouldPause: boolean): void {
    this.pauseOnSpecialContent = shouldPause;
  }

  play(): void {
    if (this.isPausedOnSpecialContent) return;
    if (this.tokens.length === 0) return;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.scheduleNext();
  }

  pause(): void {
    this.isPlaying = false;
    this.clearTimer();
  }

  stop(): void {
    this.isPlaying = false;
    this.isPausedOnSpecialContent = false;
    this.clearTimer();
    this.currentIndex = 0;
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  navigateForward(): void {
    if (this.currentIndex < this.tokens.length - 1) {
      this.currentIndex++;
      this.callbacks?.onWordChange(this.currentIndex);
      this.checkSpecialContent();
    }
  }

  navigateBack(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.callbacks?.onWordChange(this.currentIndex);
    }
  }

  seekTo(index: number): void {
    const clampedIndex = Math.max(0, Math.min(index, this.tokens.length - 1));
    this.currentIndex = clampedIndex;
    this.callbacks?.onWordChange(this.currentIndex);
  }

  continueFromSpecialContent(): void {
    if (!this.isPausedOnSpecialContent) return;
    this.isPausedOnSpecialContent = false;
    this.currentIndex++;
    if (this.currentIndex < this.tokens.length) {
      this.callbacks?.onWordChange(this.currentIndex);
      if (this.isPlaying) {
        this.scheduleNext();
      }
    }
  }

  getState(): RSVPEngineState {
    return {
      currentIndex: this.currentIndex,
      isPlaying: this.isPlaying,
      isPausedOnSpecialContent: this.isPausedOnSpecialContent,
    };
  }

  get totalTokens(): number {
    return this.tokens.length;
  }

  private scheduleNext(): void {
    this.clearTimer();
    if (!this.isPlaying) return;

    const currentToken = this.tokens[this.currentIndex];
    if (!currentToken) return;

    const delay = this.calculateDelay(currentToken);
    this.lastTickTime = performance.now();

    this.timerId = setTimeout(() => {
      this.advance();
    }, delay);
  }

  private advance(): void {
    if (!this.isPlaying) return;

    this.currentIndex++;

    if (this.currentIndex >= this.tokens.length) {
      this.isPlaying = false;
      this.callbacks?.onComplete();
      return;
    }

    this.callbacks?.onWordChange(this.currentIndex);

    if (this.checkSpecialContent()) return;

    const drift = performance.now() - this.lastTickTime - this.baseDelayMs;
    const nextDelay = Math.max(
      0,
      this.calculateDelay(this.tokens[this.currentIndex]) - drift
    );

    this.lastTickTime = performance.now();
    this.timerId = setTimeout(() => {
      this.advance();
    }, nextDelay);
  }

  private checkSpecialContent(): boolean {
    if (!this.pauseOnSpecialContent) return false;

    const token = this.tokens[this.currentIndex];
    if (token && token.contentType !== "TEXT" && token.contentType !== "HEADING") {
      this.isPausedOnSpecialContent = true;
      this.callbacks?.onPauseOnSpecialContent(token);
      return true;
    }
    return false;
  }

  private calculateDelay(token: WordToken): number {
    let delay = this.baseDelayMs;

    if (token.hasPunctuation) {
      delay *= SENTENCE_PAUSE_MULTIPLIER;
    } else if (token.hasClausePunctuation) {
      delay *= CLAUSE_PAUSE_MULTIPLIER;
    }

    if (token.isLongWord) {
      delay += LONG_WORD_EXTRA_MS;
    }

    return delay;
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.callbacks = null;
    this.tokens = [];
  }
}
