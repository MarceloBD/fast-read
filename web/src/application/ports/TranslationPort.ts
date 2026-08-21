import { TranslationResult } from "../../domain/entities/TranslationResult";
import { TargetLanguage } from "../../domain/enums/TargetLanguage";

export interface TranslationPort {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: TargetLanguage
  ): Promise<TranslationResult>;
}
