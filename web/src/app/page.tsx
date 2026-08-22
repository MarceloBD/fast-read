import Link from "next/link";
import { AppShell } from "./components/Layout/AppShell";
import styles from "./page.module.css";

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

export default function Home() {
  return (
    <>
      <main>
        <AppShell />
      </main>

      <section className={styles.seoSection} aria-label="About Fast Read">
        <h1>Fast Read — Free RSVP Speed Reading App</h1>
        <p>
          Read faster with Rapid Serial Visual Presentation (RSVP). Fast Read
          displays text one word at a time, eliminating eye movement overhead so
          your brain processes words significantly faster — from 300 to over
          1 500 words per minute.
        </p>

        <h2>Features</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map(({ title, description }) => (
            <div key={title} className={styles.featureCard}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>

        <h2>Supported Formats</h2>
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

        <h2>How It Works</h2>
        <p>
          Traditional reading requires your eyes to scan left-to-right across
          each line, then jump back to the start of the next. These saccadic eye
          movements consume roughly 20% of your reading time. RSVP eliminates
          this overhead by presenting each word in a fixed position with the
          Optimal Recognition Point (ORP) highlighted — the character where your
          eye naturally focuses for fastest recognition.
        </p>

        <h2>Free & Open Source</h2>
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
    </>
  );
}
