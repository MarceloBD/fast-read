"use client";

import { useMemo, useCallback, useRef } from "react";
import { WordToken } from "../../../domain/entities/WordToken";
import { useTranslation } from "../../context/TranslationContext";
import styles from "./WordDisplay.module.css";

interface WordDisplayProps {
  token: WordToken | null;
  fontSize: number;
  onTranslateClick?: () => void;
}

export function WordDisplay({ token, fontSize, onTranslateClick }: WordDisplayProps) {
  const { translateWord } = useTranslation();
  const wordRef = useRef<HTMLDivElement>(null);

  const { before, orp, after } = useMemo(() => {
    if (!token) return { before: "", orp: "", after: "" };

    const { displayWord, orpIndex } = token;
    return {
      before: displayWord.slice(0, orpIndex),
      orp: displayWord[orpIndex] ?? "",
      after: displayWord.slice(orpIndex + 1),
    };
  }, [token]);

  const handleClick = useCallback(() => {
    if (!token || !wordRef.current) return;

    onTranslateClick?.();
    const rect = wordRef.current.getBoundingClientRect();
    translateWord(token.displayWord, rect);
  }, [token, translateWord, onTranslateClick]);

  if (!token) {
    return (
      <div className={styles.container}>
        <span className={styles.placeholder} style={{ fontSize }}>
          Paste or drop a file to start reading
        </span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.guideLine} />
      <div
        ref={wordRef}
        className={styles.wordWrapper}
        style={{ fontSize, cursor: "pointer" }}
        onClick={handleClick}
        title="Click to translate"
      >
        <span className={styles.before}>{before}</span>
        <span className={styles.orp}>{orp}</span>
        <span className={styles.after}>{after}</span>
      </div>
      <div className={styles.guideLine} />
    </div>
  );
}
