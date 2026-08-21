import { TranslationResult } from "../../domain/entities/TranslationResult";
import { TargetLanguage } from "../../domain/enums/TargetLanguage";
import { TranslationPort } from "../../application/ports/TranslationPort";

const API_BASE_URL = "https://api.mymemory.translated.net/get";
const REQUEST_TIMEOUT_MS = 8000;

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responderId: string;
  matches: Array<{
    translation: string;
    quality: string;
    reference: string;
    segment: string;
  }>;
}

export class MyMemoryTranslationAdapter implements TranslationPort {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: TargetLanguage
  ): Promise<TranslationResult> {
    const sourceLang = sourceLanguage === "autodetect" ? "en" : sourceLanguage;
    const languagePair = `${sourceLang}|${targetLanguage}`;

    const params = new URLSearchParams({
      q: text,
      langpair: languagePair,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Translation API returned status ${response.status}`);
      }

      const data: MyMemoryResponse = await response.json();

      if (data.responseStatus !== 200) {
        throw new Error(`Translation failed with status ${data.responseStatus}`);
      }

      return new TranslationResult({
        originalText: text,
        translatedText: data.responseData.translatedText,
        sourceLanguage: sourceLang,
        targetLanguage,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
