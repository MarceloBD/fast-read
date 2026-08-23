export interface TTSCallbacks {
  onWordSpoken: (wordIndex: number) => void;
  onComplete: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onError: () => void;
}

const STARTUP_TIMEOUT_MS = 5_000;
const COMPLETION_THRESHOLD_WORDS = 5;
const MAX_RATE = 2.0;
const MIN_RATE = 0.5;

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private callbacks: TTSCallbacks | null = null;
  private isActive = false;
  private isPausedState = false;
  private rate = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private words: string[] = [];
  private currentWordIndex = 0;
  private startupTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingStartFromIndex: number | null = null;
  private isWarmedUp = false;
  private utteranceGeneration = 0;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  warmUp(): void {
    if (this.isWarmedUp) return;
    this.isWarmedUp = true;
    const silentUtterance = new SpeechSynthesisUtterance("");
    silentUtterance.volume = 0;
    silentUtterance.rate = 10;
    this.synthesis.speak(silentUtterance);
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  setRateWithoutRestart(rate: number): void {
    this.rate = Math.max(MIN_RATE, Math.min(MAX_RATE, rate));
  }

  setRate(rate: number): void {
    this.rate = Math.max(MIN_RATE, Math.min(MAX_RATE, rate));
    if (this.isActive && !this.isPausedState) {
      this.speakFromIndex(this.currentWordIndex);
    }
  }

  getRate(): number {
    return this.rate;
  }

  static rateFromWpm(wordsPerMinute: number): number {
    const baseWpm = 180;
    return Math.max(MIN_RATE, Math.min(MAX_RATE, wordsPerMinute / baseWpm));
  }

  loadWords(words: string[]): void {
    this.stop();
    this.words = words;
    this.currentWordIndex = 0;
  }

  speak(fromIndex = 0): void {
    if (this.words.length === 0) return;
    this.isPausedState = false;
    this.speakFromIndex(fromIndex);
  }

  private speakFromIndex(fromIndex: number): void {
    this.utteranceGeneration++;
    const generation = this.utteranceGeneration;

    this.cancelSpeech();
    this.currentWordIndex = fromIndex;

    const textToSpeak = this.words.slice(fromIndex).join(" ");
    if (!textToSpeak.trim()) {
      this.isActive = false;
      this.callbacks?.onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;
    this.utterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    }

    utterance.onstart = () => {
      if (generation !== this.utteranceGeneration) return;
      this.clearStartupTimer();
      if (!this.isActive) {
        this.isActive = true;
        this.callbacks?.onStart();
      }
    };

    utterance.onend = () => {
      if (generation !== this.utteranceGeneration) return;
      if (this.isPausedState) return;

      const remainingWords = this.words.length - this.currentWordIndex - 1;
      if (remainingWords > COMPLETION_THRESHOLD_WORDS) {
        this.speakFromIndex(this.currentWordIndex);
        return;
      }

      this.isActive = false;
      this.callbacks?.onComplete();
    };

    utterance.onboundary = (event) => {
      if (generation !== this.utteranceGeneration) return;
      if (event.name === "word") {
        const spokenText = textToSpeak.slice(0, event.charIndex);
        const wordsBefore = spokenText.split(/\s+/).filter((word) => word.length > 0).length;
        this.currentWordIndex = fromIndex + wordsBefore;
        this.callbacks?.onWordSpoken(this.currentWordIndex);
      }
    };

    utterance.onerror = (event) => {
      if (generation !== this.utteranceGeneration) return;
      this.clearStartupTimer();
      if (event.error !== "canceled" && event.error !== "interrupted") {
        this.isActive = false;
        this.isPausedState = false;
        this.callbacks?.onError();
      }
    };

    this.synthesis.speak(utterance);
    this.pendingStartFromIndex = fromIndex;
    this.scheduleStartupTimeout(fromIndex);
  }

  private scheduleStartupTimeout(fromIndex: number): void {
    if (this.startupTimer !== null) {
      clearTimeout(this.startupTimer);
      this.startupTimer = null;
    }
    this.pendingStartFromIndex = fromIndex;
    this.startupTimer = setTimeout(() => {
      if (this.pendingStartFromIndex !== fromIndex) return;
      if (!this.isActive && !this.isPausedState && this.utterance !== null) {
        this.speakFromIndex(fromIndex);
      }
    }, STARTUP_TIMEOUT_MS);
  }

  private clearStartupTimer(): void {
    if (this.startupTimer !== null) {
      clearTimeout(this.startupTimer);
      this.startupTimer = null;
    }
    this.pendingStartFromIndex = null;
  }

  pause(): void {
    if (!this.isActive || this.isPausedState) return;
    this.isPausedState = true;
    this.cancelSpeech();
    this.callbacks?.onPause();
  }

  resume(): void {
    if (!this.isPausedState) return;
    this.isPausedState = false;
    this.callbacks?.onResume();
    this.speakFromIndex(this.currentWordIndex);
  }

  stop(): void {
    this.utteranceGeneration++;
    this.cancelSpeech();
    this.isActive = false;
    this.isPausedState = false;
    this.currentWordIndex = 0;
  }

  forceReset(): void {
    this.utteranceGeneration++;
    this.cancelSpeech();
    this.isActive = false;
    this.isPausedState = false;
  }

  private cancelSpeech(): void {
    this.clearStartupTimer();
    this.synthesis.cancel();
    this.utterance = null;
  }

  get isSpeaking(): boolean {
    return this.isActive && !this.isPausedState;
  }

  get isPaused(): boolean {
    return this.isPausedState;
  }

  get isSupported(): boolean {
    return "speechSynthesis" in window;
  }

  get isStuck(): boolean {
    if (!this.isActive) return false;
    return !this.synthesis.speaking && !this.synthesis.pending && !this.isPausedState;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  setVoice(voice: SpeechSynthesisVoice | null): void {
    this.selectedVoice = voice;
    if (this.isActive && !this.isPausedState) {
      this.speakFromIndex(this.currentWordIndex);
    }
  }

  getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  destroy(): void {
    this.stop();
    this.callbacks = null;
    this.words = [];
  }
}
