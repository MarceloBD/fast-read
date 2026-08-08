"use client";

import { useMemo } from "react";
import { WordToken } from "../../../domain/entities/WordToken";
import styles from "./ContextPreview.module.css";

interface ContextPreviewProps {
  tokens: WordToken[];
  currentIndex: number;
  contextFontSize: number;
}

const CONTEXT_WINDOW = 5;

export function ContextPreview({ tokens, currentIndex, contextFontSize }: ContextPreviewProps) {
  const { beforeWords, afterWords } = useMemo(() => {
    const startBefore = Math.max(0, currentIndex - CONTEXT_WINDOW);
    const endAfter = Math.min(tokens.length, currentIndex + CONTEXT_WINDOW + 1);

    return {
      beforeWords: tokens.slice(startBefore, currentIndex).map((token) => token.displayWord),
      afterWords: tokens.slice(currentIndex + 1, endAfter).map((token) => token.displayWord),
    };
  }, [tokens, currentIndex]);

  if (tokens.length === 0) return null;

  return (
    <div className={styles.container} style={{ fontSize: `${contextFontSize}px` }}>
      <span className={styles.before}>{beforeWords.join(" ")}</span>
      <span className={styles.current}>{tokens[currentIndex]?.displayWord ?? ""}</span>
      <span className={styles.after}>{afterWords.join(" ")}</span>
    </div>
  );
}
