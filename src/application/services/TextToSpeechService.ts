export interface TTSCallbacks {
  onWordSpoken: (wordIndex: number) => void;
  onComplete: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private callbacks: TTSCallbacks | null = null;
  private isActive = false;
  private isPausedState = false;
  private rate = 1.0;
  private words: string[] = [];
  private currentWordIndex = 0;
  private startFromIndex = 0;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(4.0, rate));

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
    return Math.max(0.5, Math.min(4.0, wordsPerMinute / baseWpm));
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

    this.startFromIndex = fromIndex;
    this.currentWordIndex = fromIndex;
    const textToSpeak = this.words.slice(fromIndex).join(" ");

    if (!textToSpeak.trim()) return;

    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = this.rate;
    this.utterance.pitch = 1.0;

    this.utterance.onstart = () => {
      this.isActive = true;
      this.callbacks?.onStart();
    };

    this.utterance.onend = () => {
      if (!this.isPausedState) {
        this.isActive = false;
        this.callbacks?.onComplete();
      }
    };

    this.utterance.onboundary = (event) => {
      if (event.name === "word") {
        const spokenText = textToSpeak.slice(0, event.charIndex);
        const wordsBefore = spokenText.split(/\s+/).filter((w) => w.length > 0).length;
        this.currentWordIndex = this.startFromIndex + wordsBefore;
        this.callbacks?.onWordSpoken(this.currentWordIndex);
      }
    };

    this.utterance.onerror = (event) => {
      if (event.error !== "canceled" && event.error !== "interrupted") {
        this.isActive = false;
      }
    };

    this.synthesis.speak(this.utterance);
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

  private cancelSpeech(): void {
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

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  destroy(): void {
    this.stop();
    this.callbacks = null;
    this.words = [];
  }
}
