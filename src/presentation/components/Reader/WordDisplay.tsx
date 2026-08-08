import { useMemo } from "react";
import { WordToken } from "../../../domain/entities/WordToken";
import styles from "./WordDisplay.module.css";

interface WordDisplayProps {
  token: WordToken | null;
  fontSize: number;
}

export function WordDisplay({ token, fontSize }: WordDisplayProps) {
  const { before, orp, after } = useMemo(() => {
    if (!token) return { before: "", orp: "", after: "" };

    const { displayWord, orpIndex } = token;
    return {
      before: displayWord.slice(0, orpIndex),
      orp: displayWord[orpIndex] ?? "",
      after: displayWord.slice(orpIndex + 1),
    };
  }, [token]);

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
      <div className={styles.wordWrapper} style={{ fontSize }}>
        <span className={styles.before}>{before}</span>
        <span className={styles.orp}>{orp}</span>
        <span className={styles.after}>{after}</span>
      </div>
      <div className={styles.guideLine} />
    </div>
  );
}
