import { useCallback, useEffect, useRef } from "react";
import { useReader } from "../../context/ReaderContext";
import { useTTS } from "../../context/TTSContext";
import { useTranslation } from "../../context/TranslationContext";
import { ContentType } from "../../../domain/enums/ContentType";
import { CloseIcon } from "../Icons/Icons";
import styles from "./FullTextView.module.css";

const SINGLE_CLICK_DELAY_MS = 250;

interface FullTextViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullTextView({ isOpen, onClose }: FullTextViewProps) {
  const { state, seekTo, play } = useReader();
  const { isTTSEnabled, startTTS, stopSpeech } = useTTS();
  const { translateWord } = useTranslation();
  const { document: doc, currentIndex } = state;
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && currentWordRef.current) {
      currentWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentWordRef.current) {
      currentWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleWordClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>, tokenIndex: number, word: string) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (event.detail >= 2) {
        const rect = event.currentTarget.getBoundingClientRect();
        translateWord(word, rect);
        return;
      }

      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        stopSpeech();
        seekTo(tokenIndex);
        if (isTTSEnabled) {
          startTTS(tokenIndex);
        } else {
          play();
        }
      }, SINGLE_CLICK_DELAY_MS);
    },
    [seekTo, play, isTTSEnabled, startTTS, stopSpeech, translateWord]
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !doc) return null;

  return (
    <div className={styles.overlay} onKeyDown={handleKeyDown} tabIndex={-1}>
      <header className={styles.header}>
        <h2 className={styles.title}>{doc.title}</h2>
        <span className={styles.hint}>Click to play from word, double-click or select to translate</span>
        <button className={styles.closeButton} onClick={onClose} title="Close (Esc)">
          <CloseIcon size={16} />
        </button>
      </header>

      <article className={styles.content} onMouseUp={handleTextSelection}>
        {doc.blocks.map((block, blockIndex) => {
          if (block.type === ContentType.CODE) {
            return (
              <pre key={blockIndex} className={styles.codeBlock}>
                <code>{block.content}</code>
              </pre>
            );
          }

          if (block.type === ContentType.IMAGE && block.imageUrl) {
            return (
              <figure key={blockIndex} className={styles.imageFigure}>
                <img
                  src={block.imageUrl}
                  alt={block.content}
                  className={styles.imageBlock}
                />
                {block.content && (
                  <figcaption className={styles.imageCaption}>{block.content}</figcaption>
                )}
              </figure>
            );
          }

          if (block.type === ContentType.HEADING) {
            return (
              <h3 key={blockIndex} className={styles.heading}>
                {renderBlockWords(block.content, blockIndex)}
              </h3>
            );
          }

          return (
            <p key={blockIndex} className={styles.paragraph}>
              {renderBlockWords(block.content, blockIndex)}
            </p>
          );
        })}
      </article>
    </div>
  );

  function renderBlockWords(content: string, blockIndex: number) {
    const words = content.split(/\s+/).filter((word) => word.length > 0);

    return words.map((word, wordIndexInBlock) => {
      const tokenIndex = findTokenIndex(blockIndex, wordIndexInBlock);
      const isCurrent = tokenIndex === currentIndex;
      const token = doc!.tokens[tokenIndex];
      const displayText = token ? token.displayWord : word;

      return (
        <span
          key={wordIndexInBlock}
          ref={isCurrent ? currentWordRef : undefined}
          className={`${styles.word} ${isCurrent ? styles.currentWord : ""}`}
          onClick={(event) => handleWordClick(event, tokenIndex, displayText)}
        >
          {displayText}{" "}
        </span>
      );
    });
  }

  function findTokenIndex(blockIndex: number, wordIndexInBlock: number): number {
    let count = 0;
    for (let i = 0; i < doc!.tokens.length; i++) {
      const token = doc!.tokens[i];
      if (token.blockIndex === blockIndex) {
        if (count === wordIndexInBlock) {
          return i;
        }
        count++;
      }
    }
    return 0;
  }
}
