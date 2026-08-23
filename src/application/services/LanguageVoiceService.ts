const LANGUAGE_STOP_WORDS: Record<string, string[]> = {
  en: ["the", "is", "are", "was", "were", "have", "has", "been", "and", "but", "not", "this", "that", "with", "for", "from"],
  pt: ["que", "não", "uma", "para", "com", "são", "está", "mais", "por", "como", "também", "dos", "das", "nos"],
  es: ["que", "del", "las", "los", "por", "una", "con", "para", "está", "más", "pero", "como", "desde"],
  fr: ["les", "des", "une", "que", "est", "dans", "pour", "pas", "qui", "sur", "avec", "sont", "cette"],
  de: ["der", "die", "das", "und", "ist", "von", "nicht", "mit", "ein", "sich", "auf", "für", "auch"],
  it: ["che", "non", "una", "sono", "del", "per", "con", "più", "anche", "come", "dalla", "questo"],
  nl: ["het", "een", "van", "dat", "niet", "zijn", "voor", "met", "ook", "maar", "heeft", "deze"],
  pl: ["nie", "jest", "się", "jak", "ale", "czy", "tak", "już", "jego", "tylko", "tego", "przez"],
  tr: ["bir", "için", "olan", "ile", "gibi", "daha", "çok", "kadar", "ama", "ancak", "olan", "olan"],
};

export function findVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  languageCode: string
): SpeechSynthesisVoice | null {
  const normalizedCode = languageCode.toLowerCase();
  const prefix = normalizedCode.split("-")[0];

  const matchingVoices = voices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang === normalizedCode || voiceLang.startsWith(prefix + "-") || voiceLang === prefix;
  });

  if (matchingVoices.length === 0) return null;

  const localVoice = matchingVoices.find((voice) => voice.localService);
  if (localVoice) return localVoice;

  return matchingVoices[0];
}

export function detectTextLanguage(text: string): string | null {
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0400-\u04ff]/.test(text)) return "ru";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\u0900-\u097f]/.test(text)) return "hi";

  const words = text
    .toLowerCase()
    .replace(/[.,;:!?'"()\[\]{}]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1);

  if (words.length === 0) return null;

  let bestLanguage: string | null = null;
  let bestScore = 0;

  for (const [language, stopWords] of Object.entries(LANGUAGE_STOP_WORDS)) {
    let matchCount = 0;
    for (const word of words) {
      if (stopWords.includes(word)) matchCount++;
    }

    const score = matchCount / Math.max(words.length, 1);
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  if (bestScore > 0.02) return bestLanguage;

  return null;
}

export function speakTextWithVoice(
  text: string,
  voice: SpeechSynthesisVoice | null,
  languageCode: string
): SpeechSynthesisUtterance {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = languageCode;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeechPlayback(): void {
  window.speechSynthesis.cancel();
}
