export const TargetLanguage = {
  PT: "pt",
  ES: "es",
  FR: "fr",
  DE: "de",
  IT: "it",
  JA: "ja",
  ZH: "zh-CN",
  KO: "ko",
  RU: "ru",
  AR: "ar",
  HI: "hi",
  NL: "nl",
  PL: "pl",
  TR: "tr",
  EN: "en",
} as const;

export type TargetLanguage = (typeof TargetLanguage)[keyof typeof TargetLanguage];

export const TARGET_LANGUAGE_LABELS: Record<TargetLanguage, string> = {
  [TargetLanguage.PT]: "Portuguese",
  [TargetLanguage.ES]: "Spanish",
  [TargetLanguage.FR]: "French",
  [TargetLanguage.DE]: "German",
  [TargetLanguage.IT]: "Italian",
  [TargetLanguage.JA]: "Japanese",
  [TargetLanguage.ZH]: "Chinese",
  [TargetLanguage.KO]: "Korean",
  [TargetLanguage.RU]: "Russian",
  [TargetLanguage.AR]: "Arabic",
  [TargetLanguage.HI]: "Hindi",
  [TargetLanguage.NL]: "Dutch",
  [TargetLanguage.PL]: "Polish",
  [TargetLanguage.TR]: "Turkish",
  [TargetLanguage.EN]: "English",
};
