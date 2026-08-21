import type { Metadata } from "next";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Free RSVP Speed Reading App",
  description:
    "Learn about Fast Read, a free open-source RSVP speed reading app with text-to-speech, built-in translation, and support for PDF, EPUB, Markdown, and TXT files.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Fast Read — Free RSVP Speed Reading App",
    description:
      "Free open-source RSVP speed reader with TTS, translation, and multi-format support.",
    url: "/about",
  },
};

const FAQ_ITEMS = [
  {
    question: "How fast can I read with RSVP?",
    answer:
      "Most users start at 300 WPM and can increase to 500–800 WPM with practice. Advanced users may reach 1000+ WPM for familiar material.",
  },
  {
    question: "Does speed reading reduce comprehension?",
    answer:
      "At moderate speeds (300–500 WPM), comprehension remains high. Above 600 WPM, comprehension may decrease for complex material. Use Study mode for technical content.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. All document processing happens entirely in your browser. No files are uploaded to any server. Your reading preferences are stored locally. Translation requests use the free MyMemory API; only the selected word or phrase is sent — never the full document.",
  },
  {
    question: "Can I use it on mobile?",
    answer:
      "Yes. The web version works on any modern browser. A desktop version built with Tauri is also available for Windows, macOS, and Linux.",
  },
  {
    question: "Which languages can I translate into?",
    answer:
      "Fast Read supports translation into 15 languages including Portuguese, Spanish, French, German, Italian, Japanese, Chinese, Korean, Russian, Arabic, Hindi, Dutch, Polish, Turkish, and English.",
  },
  {
    question: "Does text-to-speech work in every language?",
    answer:
      "TTS uses your browser or operating system voices. When you enable TTS, Fast Read automatically selects a voice matching the text language — if one is available on your device. You can download additional voices through your system settings.",
  },
];

export default function AboutPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <article className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header>
        <h1>About Fast Read</h1>
        <p className={styles.subtitle}>
          A free, open-source speed reading application with voice and translation
        </p>
      </header>

      <section>
        <h2>What is Fast Read?</h2>
        <p>
          Fast Read is a speed reading tool that uses{" "}
          <strong>RSVP (Rapid Serial Visual Presentation)</strong> to display text
          one word at a time. By eliminating the need for eye movement across
          lines, your brain can process words significantly faster.
        </p>
        <p>
          Available as both a <strong>web app</strong> and a{" "}
          <strong>desktop app</strong> (Windows, macOS, Linux via Tauri), Fast
          Read works entirely offline — your documents never leave your device.
        </p>
      </section>

      <section>
        <h2>How does RSVP work?</h2>
        <p>
          Traditional reading requires your eyes to scan left-to-right across
          each line, then jump back to the start of the next line. These eye
          movements (saccades) consume about 20% of your reading time. RSVP
          eliminates this overhead by presenting words in a fixed position.
        </p>
        <p>
          Fast Read also highlights the{" "}
          <strong>Optimal Recognition Point (ORP)</strong> in each word — the
          character position where your eye naturally focuses for fastest
          recognition.
        </p>
      </section>

      <section>
        <h2>Features</h2>

        <h3>Speed Reading</h3>
        <ul>
          <li>Adjustable speed from 60 to 1500 WPM</li>
          <li>Optimal Recognition Point (ORP) highlighting</li>
          <li>Context preview showing surrounding words</li>
          <li>Full text view with click-to-jump navigation</li>
          <li>
            <strong>Study mode</strong> — pauses on code blocks and images for
            review
          </li>
          <li>
            <strong>Speed mode</strong> — skips non-text content for
            uninterrupted reading
          </li>
        </ul>

        <h3>Text-to-Speech</h3>
        <ul>
          <li>Read-aloud with your system voices</li>
          <li>
            Automatic voice selection based on the text language
          </li>
          <li>Speed synchronized with your WPM setting</li>
          <li>Grouped voice picker organized by language</li>
        </ul>

        <h3>Built-in Translation</h3>
        <ul>
          <li>Click any word to instantly translate it</li>
          <li>
            Double-click words in context preview or full text view to translate
          </li>
          <li>Select a phrase (click-and-drag) to translate multiple words</li>
          <li>
            Listen to the original and translated text with language-matched
            voices
          </li>
          <li>
            15 target languages — Portuguese, Spanish, French, German, Italian,
            Japanese, Chinese, Korean, Russian, Arabic, Hindi, Dutch, Polish,
            Turkish, and English
          </li>
          <li>Translation cache for instant repeat lookups</li>
        </ul>

        <h3>Privacy &amp; Security</h3>
        <ul>
          <li>All document processing happens in your browser</li>
          <li>No files are uploaded to any server</li>
          <li>Preferences stored locally in your browser</li>
          <li>Content Security Policy and security headers enabled</li>
        </ul>
      </section>

      <section>
        <h2>Supported Formats</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Format</th>
              <th>Extension</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Plain Text</td>
              <td>.txt</td>
              <td>Direct text reading</td>
            </tr>
            <tr>
              <td>Markdown</td>
              <td>.md</td>
              <td>Parsed with heading and code block detection</td>
            </tr>
            <tr>
              <td>PDF</td>
              <td>.pdf</td>
              <td>Text extraction via pdf.js</td>
            </tr>
            <tr>
              <td>EPUB</td>
              <td>.epub</td>
              <td>Full ebook support</td>
            </tr>
            <tr>
              <td>HTML</td>
              <td>.html</td>
              <td>DOM parsing with structure preservation</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>How to Use</h2>
        <ol>
          <li>Paste text or drag and drop a document file</li>
          <li>Click the Play button to start speed reading</li>
          <li>Adjust speed with Up/Down arrow keys or the slider</li>
          <li>Use Left/Right arrows to navigate between words</li>
          <li>Press <kbd>T</kbd> to enable text-to-speech</li>
          <li>Press <kbd>M</kbd> to toggle between Study and Speed modes</li>
          <li>Click any word to translate it; double-click or select a phrase in full text view</li>
        </ol>
      </section>

      <section>
        <h2>Keyboard Shortcuts</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><kbd>Space</kbd></td>
              <td>Play / Pause</td>
            </tr>
            <tr>
              <td><kbd>←</kbd> / <kbd>→</kbd></td>
              <td>Previous / Next word</td>
            </tr>
            <tr>
              <td><kbd>↑</kbd> / <kbd>↓</kbd></td>
              <td>Increase / Decrease speed</td>
            </tr>
            <tr>
              <td><kbd>T</kbd></td>
              <td>Toggle text-to-speech</td>
            </tr>
            <tr>
              <td><kbd>M</kbd></td>
              <td>Toggle reading mode (Study / Speed)</td>
            </tr>
            <tr>
              <td><kbd>R</kbd></td>
              <td>Restart from beginning</td>
            </tr>
            <tr>
              <td><kbd>Esc</kbd></td>
              <td>Close overlay / tooltip</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map(({ question, answer }) => (
          <div key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Fast Read. All rights reserved.</p>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </article>
  );
}
