import { TranslationResult } from "../../domain/entities/TranslationResult";
import { TargetLanguage } from "../../domain/enums/TargetLanguage";
import { TranslationPort } from "../ports/TranslationPort";

const CACHE_KEY = "fast-read-translation-cache";
const TARGET_LANGUAGE_KEY = "fast-read-target-language";
const MAX_CACHE_ENTRIES = 500;

interface CachedTranslation {
  translatedText: string;
  sourceLanguage: string;
}

type TranslationCache = Record<string, CachedTranslation>;

export class TranslationService {
  private readonly translationAdapter: TranslationPort;
  private cache: TranslationCache;

  constructor(translationAdapter: TranslationPort) {
    this.translationAdapter = translationAdapter;
    this.cache = this.loadCache();
  }

  async translate(
    text: string,
    targetLanguage: TargetLanguage
  ): Promise<TranslationResult> {
    const cacheKey = this.buildCacheKey(text, targetLanguage);
    const cached = this.cache[cacheKey];

    if (cached) {
      return new TranslationResult({
        originalText: text,
        translatedText: cached.translatedText,
        sourceLanguage: cached.sourceLanguage,
        targetLanguage,
      });
    }

    const result = await this.translationAdapter.translate(
      text,
      "autodetect",
      targetLanguage
    );

    this.cacheResult(cacheKey, result);
    return result;
  }

  saveTargetLanguage(language: TargetLanguage): void {
    localStorage.setItem(TARGET_LANGUAGE_KEY, language);
  }

  loadTargetLanguage(): TargetLanguage {
    const stored = localStorage.getItem(TARGET_LANGUAGE_KEY);
    if (stored && Object.values(TargetLanguage).includes(stored as TargetLanguage)) {
      return stored as TargetLanguage;
    }
    return TargetLanguage.PT;
  }

  private buildCacheKey(text: string, targetLanguage: TargetLanguage): string {
    return `${text.toLowerCase().trim()}_${targetLanguage}`;
  }

  private cacheResult(key: string, result: TranslationResult): void {
    const entries = Object.keys(this.cache);
    if (entries.length >= MAX_CACHE_ENTRIES) {
      const oldestKey = entries[0];
      delete this.cache[oldestKey];
    }

    this.cache[key] = {
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
    };

    this.saveCache();
  }

  private loadCache(): TranslationCache {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};

    try {
      return JSON.parse(raw) as TranslationCache;
    } catch {
      return {};
    }
  }

  private saveCache(): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
  }
}
