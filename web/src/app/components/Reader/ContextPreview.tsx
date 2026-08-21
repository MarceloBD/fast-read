"use client";

import { useMemo, useCallback, useRef, useEffect } from "react";
import { WordToken } from "../../../domain/entities/WordToken";
import { useTranslation } from "../../context/TranslationContext";
import styles from "./ContextPreview.module.css";

const SINGLE_CLICK_DELAY_MS = 250;

interface ContextPreviewProps {
  tokens: WordToken[];
  currentIndex: number;
  contextFontSize: number;
  onWordClick?: (index: number) => void;
}

const CONTEXT_WINDOW = 5;

export function ContextPreview({ tokens, currentIndex, contextFontSize, onWordClick }: ContextPreviewProps) {
  const { translateWord } = useTranslation();
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const { beforeTokens, afterTokens, startBeforeIndex } = useMemo(() => {
    const startBefore = Math.max(0, currentIndex - CONTEXT_WINDOW);
    const endAfter = Math.min(tokens.length, currentIndex + CONTEXT_WINDOW + 1);

    return {
      beforeTokens: tokens.slice(startBefore, currentIndex),
      afterTokens: tokens.slice(currentIndex + 1, endAfter),
      startBeforeIndex: startBefore,
    };
  }, [tokens, currentIndex]);

  const handleWordClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>, tokenIndex: number, token: WordToken) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (event.detail >= 2) {
        const rect = event.currentTarget.getBoundingClientRect();
        translateWord(token.displayWord, rect);
        return;
      }

      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        onWordClick?.(tokenIndex);
      }, SINGLE_CLICK_DELAY_MS);
    },
    [translateWord, onWordClick]
  );

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText || selectedText.split(/\s+/).length < 2) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    translateWord(selectedText, rect);
    selection!.removeAllRanges();
  }, [translateWord]);

  if (tokens.length === 0) return null;

  return (
    <div
      className={styles.container}
      style={{ fontSize: `${contextFontSize}px` }}
      onMouseUp={handleTextSelection}
    >
      <span className={styles.before}>
        {beforeTokens.map((token, index) => (
          <span
            key={startBeforeIndex + index}
            className={styles.word}
            onClick={(event) => handleWordClick(event, startBeforeIndex + index, token)}
          >
            {token.displayWord}{" "}
          </span>
        ))}
      </span>
      <span
        className={`${styles.current} ${styles.word}`}
        onClick={(event) => {
          const currentToken = tokens[currentIndex];
          if (currentToken) handleWordClick(event, currentIndex, currentToken);
        }}
      >
        {tokens[currentIndex]?.displayWord ?? ""}
      </span>
      <span className={styles.after}>
        {afterTokens.map((token, index) => (
          <span
            key={currentIndex + 1 + index}
            className={styles.word}
            onClick={(event) => handleWordClick(event, currentIndex + 1 + index, token)}
          >
            {" "}{token.displayWord}
          </span>
        ))}
      </span>
    </div>
  );
}
