import { useMemo } from "react";
import { WordToken } from "../../../domain/entities/WordToken";
import styles from "./ContextPreview.module.css";

interface ContextPreviewProps {
  tokens: WordToken[];
  currentIndex: number;
  contextFontSize: number;
  onWordClick?: (index: number) => void;
}

const CONTEXT_WINDOW = 5;

export function ContextPreview({ tokens, currentIndex, contextFontSize, onWordClick }: ContextPreviewProps) {
  const { beforeTokens, afterTokens, startBeforeIndex } = useMemo(() => {
    const startBefore = Math.max(0, currentIndex - CONTEXT_WINDOW);
    const endAfter = Math.min(tokens.length, currentIndex + CONTEXT_WINDOW + 1);

    return {
      beforeTokens: tokens.slice(startBefore, currentIndex),
      afterTokens: tokens.slice(currentIndex + 1, endAfter),
      startBeforeIndex: startBefore,
    };
  }, [tokens, currentIndex]);

  if (tokens.length === 0) return null;

  return (
    <div className={styles.container} style={{ fontSize: `${contextFontSize}px` }}>
      <span className={styles.before}>
        {beforeTokens.map((token, index) => (
          <span
            key={startBeforeIndex + index}
            className={styles.word}
            onClick={() => onWordClick?.(startBeforeIndex + index)}
          >
            {token.displayWord}{" "}
          </span>
        ))}
      </span>
      <span
        className={`${styles.current} ${styles.word}`}
        onClick={() => onWordClick?.(currentIndex)}
      >
        {tokens[currentIndex]?.displayWord ?? ""}
      </span>
      <span className={styles.after}>
        {afterTokens.map((token, index) => (
          <span
            key={currentIndex + 1 + index}
            className={styles.word}
            onClick={() => onWordClick?.(currentIndex + 1 + index)}
          >
            {" "}{token.displayWord}
          </span>
        ))}
      </span>
    </div>
  );
}
