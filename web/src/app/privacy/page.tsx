import type { Metadata } from "next";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Fast Read",
  description: "Privacy policy for Fast Read speed reading application.",
};

export default function PrivacyPage() {
  return (
    <article className={styles.container}>
      <header>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: August 8, 2026</p>
      </header>

      <section>
        <h2>Overview</h2>
        <p>
          Fast Read is committed to protecting your privacy. This policy explains how we handle
          your data when you use our speed reading application.
        </p>
      </section>

      <section>
        <h2>Data Collection</h2>
        <p>
          <strong>We do not collect any personal data.</strong> Fast Read processes all documents
          entirely within your browser. No files, text content, or reading data are ever sent to
          our servers.
        </p>
      </section>

      <section>
        <h2>Local Storage</h2>
        <p>
          Fast Read stores your preferences (theme, font size, reading speed) in your browser&#39;s
          localStorage. This data never leaves your device and can be cleared at any time through
          your browser settings.
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          The web version is hosted on Vercel. Vercel may collect standard web server logs
          (IP address, browser type, access times) as described in their privacy policy.
          We do not have access to this data.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Fast Read does not use cookies. We do not track your browsing activity or use
          any analytics services.
        </p>
      </section>

      <section>
        <h2>Document Processing</h2>
        <p>
          All document parsing (PDF, EPUB, Markdown, HTML, TXT) happens client-side using
          JavaScript libraries running in your browser. Your documents are never uploaded
          to any server.
        </p>
      </section>

      <section>
        <h2>Text-to-Speech</h2>
        <p>
          The text-to-speech feature uses your browser&#39;s built-in SpeechSynthesis API.
          No text is sent to external services for speech generation.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Any changes will be reflected
          on this page with an updated date.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, please open an issue on our
          GitHub repository.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Fast Read. All rights reserved.</p>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </footer>
    </article>
  );
}
