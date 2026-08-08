import type { Metadata } from "next";
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — Fast Read",
  description: "Terms of service for Fast Read speed reading application.",
};

export default function TermsPage() {
  return (
    <article className={styles.container}>
      <header>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: August 8, 2026</p>
      </header>

      <section>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Fast Read, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the application.
        </p>
      </section>

      <section>
        <h2>Description of Service</h2>
        <p>
          Fast Read is a free, open-source speed reading application that processes documents
          locally in your browser. The service is provided &quot;as is&quot; without warranties of any kind.
        </p>
      </section>

      <section>
        <h2>User Responsibilities</h2>
        <p>You are responsible for:</p>
        <ol>
          <li>Ensuring you have the right to read any content you upload to the application</li>
          <li>Using the application in compliance with all applicable laws</li>
          <li>Not attempting to circumvent any security measures</li>
        </ol>
      </section>

      <section>
        <h2>Intellectual Property</h2>
        <p>
          Fast Read is open-source software. The application code is available under its
          respective license. Documents you process remain your property and are never stored
          on our servers.
        </p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>
          Fast Read is provided for educational and personal productivity purposes. We are not
          liable for any damages arising from the use of this application, including but not
          limited to loss of data or interruption of service.
        </p>
      </section>

      <section>
        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the
          application after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          For questions about these terms or the application, please open an issue on our
          GitHub repository.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Fast Read. All rights reserved.</p>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </footer>
    </article>
  );
}
