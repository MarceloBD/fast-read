import Link from "next/link";
import styles from "./SeoSection.module.css";

const FEATURES = [
  {
    title: "RSVP Speed Reading",
    description:
      "Display text one word at a time at up to 1 500 WPM with Optimal Recognition Point highlighting.",
  },
  {
    title: "Text-to-Speech",
    description:
      "Read aloud with automatic language-matched voice selection and speed synchronized to your WPM.",
  },
  {
    title: "Built-in Translation",
    description:
      "Click any word to translate it instantly into 15 languages. Select phrases for multi-word translation.",
  },
  {
    title: "Multi-Format Support",
    description:
      "Open PDF, EPUB, Markdown, HTML, and plain text files — all processed locally in your browser.",
  },
  {
    title: "Study & Speed Modes",
    description:
      "Study mode pauses on code blocks and images. Speed mode skips non-text content for uninterrupted flow.",
  },
  {
    title: "Privacy-First",
    description:
      "All document processing happens in your browser. No files are uploaded. Preferences stored locally.",
  },
];

const SUPPORTED_FORMATS = ["PDF", "EPUB", "Markdown", "HTML", "TXT"];

export function SeoSection() {
  return (
    <section className={styles.seoSection} aria-label="About Fast Read">
      <h2 className={styles.heading}>Fast Read — Free RSVP Speed Reading App</h2>
      <p>
        Read faster with Rapid Serial Visual Presentation (RSVP). Fast Read
        displays text one word at a time, eliminating eye movement overhead so
        your brain processes words significantly faster — from 300 to over
        1 500 words per minute.
      </p>

      <h3>Features</h3>
      <div className={styles.featureGrid}>
        {FEATURES.map(({ title, description }) => (
          <div key={title} className={styles.featureCard}>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
        ))}
      </div>

      <h3>Supported Formats</h3>
      <p>
        Drag and drop or paste content from any of these file types to start
        reading immediately.
      </p>
      <ul className={styles.formatList}>
        {SUPPORTED_FORMATS.map((format) => (
          <li key={format} className={styles.formatBadge}>
            {format}
          </li>
        ))}
      </ul>

      <h3>How It Works</h3>
      <p>
        Traditional reading requires your eyes to scan left-to-right across
        each line, then jump back to the start of the next. These saccadic eye
        movements consume roughly 20% of your reading time. RSVP eliminates
        this overhead by presenting each word in a fixed position with the
        Optimal Recognition Point (ORP) highlighted — the character where your
        eye naturally focuses for fastest recognition.
      </p>

      <h3>Free & Open Source</h3>
      <p>
        Fast Read is available as a web app and as a desktop app for Windows,
        macOS, and Linux via Tauri. No account required — just paste text or
        drop a file and start reading.
      </p>

      <footer className={styles.seoFooter}>
        <p>&copy; {new Date().getFullYear()} Fast Read</p>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </section>
  );
}
