"use client";

import styles from "./StudyModeOverlay.module.css";

interface ImagePanelProps {
  imageUrl: string;
  altText?: string;
}

export function ImagePanel({ imageUrl, altText }: ImagePanelProps) {
  return (
    <div>
      <div className={styles.header}>
        <span className={styles.badge}>Image</span>
        {altText && <span className={styles.language}>{altText}</span>}
      </div>
      <div className={styles.imageContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText || "Document image"}
          className={styles.image}
        />
      </div>
    </div>
  );
}
