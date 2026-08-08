"use client";

import { useReader } from "../../context/ReaderContext";
import { ContentType } from "../../../domain/enums/ContentType";
import { CodeBlockPanel } from "./CodeBlockPanel";
import { ImagePanel } from "./ImagePanel";
import styles from "./StudyModeOverlay.module.css";

export function StudyModeOverlay() {
  const { state, continueFromSpecialContent } = useReader();
  const { isPausedOnSpecialContent, specialContentToken, document: doc } = state;

  if (!isPausedOnSpecialContent || !specialContentToken || !doc) return null;

  const block = doc.blocks[specialContentToken.blockIndex];

  return (
    <div className={styles.overlay} onClick={continueFromSpecialContent}>
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        {specialContentToken.contentType === ContentType.CODE && (
          <CodeBlockPanel code={block.content} language={block.language} />
        )}

        {specialContentToken.contentType === ContentType.IMAGE && block.imageUrl && (
          <ImagePanel imageUrl={block.imageUrl} altText={block.content} />
        )}

        <button
          className={styles.continueButton}
          onClick={continueFromSpecialContent}
        >
          Press Space or click to continue
        </button>
      </div>
    </div>
  );
}
