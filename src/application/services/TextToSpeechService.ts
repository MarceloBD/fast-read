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

    if (this.isActive && this.utterance) {
      const resumeIndex = this.currentWordIndex;
      this.stopInternal();
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
    this.speakFromIndex(fromIndex);
  }

  private speakFromIndex(fromIndex: number): void {
    this.stopInternal();

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
      this.isActive = false;
      this.callbacks?.onComplete();
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
    if (this.isActive) {
      this.synthesis.pause();
      this.callbacks?.onPause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.callbacks?.onResume();
    }
  }

  stop(): void {
    this.stopInternal();
    this.currentWordIndex = 0;
  }

  private stopInternal(): void {
    this.synthesis.cancel();
    this.isActive = false;
    this.utterance = null;
  }

  get isSpeaking(): boolean {
    return this.isActive && this.synthesis.speaking;
  }

  get isPaused(): boolean {
    return this.synthesis.paused;
  }

  get isSupported(): boolean {
    return "speechSynthesis" in window;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    if (this.utterance) {
      this.utterance.voice = voice;
    }
  }

  destroy(): void {
    this.stop();
    this.callbacks = null;
    this.words = [];
  }
}
