export interface TTSCallbacks {
  onWordSpoken: (wordIndex: number) => void;
  onComplete: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onError: () => void;
}

const CHROME_KEEPALIVE_INTERVAL_MS = 10_000;
const STARTUP_TIMEOUT_MS = 5_000;
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
  private startFromIndex = 0;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
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
      const resumeIndex = this.currentWordIndex;
      this.cancelSpeech();
      this.speakFromIndex(resumeIndex);
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
    this.cancelSpeech();

    this.utteranceGeneration++;
    const generation = this.utteranceGeneration;

    this.startFromIndex = fromIndex;
    this.currentWordIndex = fromIndex;
    this.pendingStartFromIndex = fromIndex;
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
      this.isActive = true;
      this.startKeepAlive();
      this.callbacks?.onStart();
    };

    utterance.onend = () => {
      if (generation !== this.utteranceGeneration) return;
      this.clearKeepAlive();
      if (!this.isPausedState) {
        this.isActive = false;
        this.callbacks?.onComplete();
      }
    };

    utterance.onboundary = (event) => {
      if (generation !== this.utteranceGeneration) return;
      if (event.name === "word") {
        const spokenText = textToSpeak.slice(0, event.charIndex);
        const wordsBefore = spokenText.split(/\s+/).filter((word) => word.length > 0).length;
        this.currentWordIndex = this.startFromIndex + wordsBefore;
        this.callbacks?.onWordSpoken(this.currentWordIndex);
      }
    };

    utterance.onerror = (event) => {
      if (generation !== this.utteranceGeneration) return;
      this.clearKeepAlive();
      this.clearStartupTimer();
      if (event.error !== "canceled" && event.error !== "interrupted") {
        this.isActive = false;
        this.isPausedState = false;
        this.callbacks?.onError();
      }
    };

    this.synthesis.speak(utterance);
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
        this.cancelSpeech();
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

  private startKeepAlive(): void {
    this.clearKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (!this.synthesis.speaking) {
        this.clearKeepAlive();
        if (this.isActive && !this.isPausedState) {
          this.isActive = false;
          this.callbacks?.onComplete();
        }
        return;
      }
      this.synthesis.pause();
      this.synthesis.resume();
    }, CHROME_KEEPALIVE_INTERVAL_MS);
  }

  private clearKeepAlive(): void {
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
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
    this.cancelSpeech();
    this.isActive = false;
    this.isPausedState = false;
    this.currentWordIndex = 0;
  }

  forceReset(): void {
    this.cancelSpeech();
    this.isActive = false;
    this.isPausedState = false;
  }

  private cancelSpeech(): void {
    this.clearKeepAlive();
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
      const resumeIndex = this.currentWordIndex;
      this.cancelSpeech();
      this.speakFromIndex(resumeIndex);
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
