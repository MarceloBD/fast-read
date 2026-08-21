import { TargetLanguage } from "../enums/TargetLanguage";

export class TranslationResult {
  readonly originalText: string;
  readonly translatedText: string;
  readonly sourceLanguage: string;
  readonly targetLanguage: TargetLanguage;

  constructor(params: {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: TargetLanguage;
  }) {
    this.validate(params);
    this.originalText = params.originalText;
    this.translatedText = params.translatedText;
    this.sourceLanguage = params.sourceLanguage;
    this.targetLanguage = params.targetLanguage;
  }

  private validate(params: {
    originalText: string;
    translatedText: string;
    targetLanguage: string;
  }): void {
    if (!params.originalText.trim()) {
      throw new Error("TranslationResult originalText is required");
    }
    if (!params.translatedText.trim()) {
      throw new Error("TranslationResult translatedText is required");
    }
    if (!params.targetLanguage.trim()) {
      throw new Error("TranslationResult targetLanguage is required");
    }
  }
}
