import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — Fast Read",
  description: "Learn about Fast Read, a free RSVP speed reading app that helps you read faster.",
};

export default function AboutPage() {
  return (
    <article className={styles.container}>
      <header>
        <h1>About Fast Read</h1>
        <p className={styles.subtitle}>
          A free, open-source speed reading application
        </p>
      </header>

      <section>
        <h2>What is Fast Read?</h2>
        <p>
          Fast Read is a speed reading tool that uses <strong>RSVP (Rapid Serial Visual Presentation)</strong> to
          display text one word at a time. By eliminating the need for eye movement across lines,
          your brain can process words significantly faster.
        </p>
      </section>

      <section>
        <h2>How does RSVP work?</h2>
        <p>
          Traditional reading requires your eyes to scan left-to-right across each line, then jump
          back to the start of the next line. These eye movements (saccades) consume about 20% of
          your reading time. RSVP eliminates this overhead by presenting words in a fixed position.
        </p>
        <p>
          Fast Read also highlights the <strong>Optimal Recognition Point (ORP)</strong> in each word —
          the character position where your eye naturally focuses for fastest recognition.
        </p>
      </section>

      <section>
        <h2>What formats are supported?</h2>
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
        <h2>How to use Fast Read?</h2>
        <ol>
          <li>Paste text or drag and drop a document file</li>
          <li>Click the Play button to start speed reading</li>
          <li>Adjust speed with Up/Down arrow keys or the slider</li>
          <li>Use Left/Right arrows to navigate words</li>
          <li>Press M to toggle between Study and Speed modes</li>
        </ol>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        <h3>How fast can I read with RSVP?</h3>
        <p>
          Most users start at 300 WPM and can increase to 500-800 WPM with practice.
          Advanced users may reach 1000+ WPM for familiar material.
        </p>

        <h3>Does speed reading reduce comprehension?</h3>
        <p>
          At moderate speeds (300-500 WPM), comprehension remains high. Above 600 WPM,
          comprehension may decrease for complex material. Use Study mode for technical content.
        </p>

        <h3>Is my data private?</h3>
        <p>
          Yes. All document processing happens entirely in your browser. No files are uploaded
          to any server. Your reading preferences are stored locally.
        </p>

        <h3>Can I use it on mobile?</h3>
        <p>
          Yes. The web version works on any modern browser. A desktop version built with Tauri
          is also available for Windows, macOS, and Linux.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Fast Read. All rights reserved.</p>
        <nav>
          <a href="/">Home</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </footer>
    </article>
  );
}
