import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://fast-read.vercel.app";
const SITE_NAME = "Fast Read";
const DESCRIPTION =
  "Free RSVP speed reading app with text-to-speech and built-in translation. Read one word at a time at up to 1500 WPM. Supports PDF, EPUB, Markdown, HTML, and TXT.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a1a2e",
};

export const metadata: Metadata = {
  title: {
    default: "Fast Read — RSVP Speed Reading",
    template: "%s | Fast Read",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: [
    "speed reading",
    "RSVP",
    "rapid serial visual presentation",
    "read faster",
    "PDF reader",
    "EPUB reader",
    "text-to-speech",
    "translation",
    "speed reader app",
    "free reading app",
  ],
  verification: {
    google: "6vzZD0heq5T-PiL170brMzDEgK9_S_cOhpkvsqUvDuM",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fast Read — RSVP Speed Reading",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fast Read — Speed Reading App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast Read — RSVP Speed Reading",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  authors: [{ name: "Fast Read Team" }],
  creator: "Fast Read Team",
  publisher: "Fast Read",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    featureList: [
      "RSVP speed reading up to 1500 WPM",
      "Text-to-speech with auto language detection",
      "Built-in word and phrase translation (15 languages)",
      "PDF, EPUB, Markdown, HTML, and TXT support",
      "Study and Speed reading modes",
      "Optimal Recognition Point highlighting",
      "Keyboard shortcuts for full control",
      "Privacy-first: all processing in-browser",
    ],
    dateModified: new Date().toISOString().split("T")[0],
  };

  const criticalCss = `
:root{--color-background:#1a1a2e;--color-surface:#25253e;--color-text:#e0e0e0;--color-text-muted:#8888aa;--color-accent:#ff6b6b;--color-border:#35355a}
:root[data-theme="light"]{--color-background:#ffffff;--color-surface:#f5f5f5;--color-text:#1a1a1a;--color-text-muted:#666666;--color-accent:#e63946;--color-border:#e0e0e0}
:root[data-theme="sepia"]{--color-background:#f4ecd8;--color-surface:#ebe3cf;--color-text:#5c4033;--color-text-muted:#8b7355;--color-accent:#c0392b;--color-border:#d4c9b0}
:root[data-theme="high-contrast"]{--color-background:#000000;--color-surface:#111111;--color-text:#ffffff;--color-text-muted:#cccccc;--color-accent:#ffff00;--color-border:#333333}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background-color:var(--color-background);color:var(--color-text)}
`.trim();

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <h1>Fast Read — RSVP Speed Reading</h1>
          <p>{DESCRIPTION}</p>
          <p>This application requires JavaScript to run.</p>
        </noscript>
        {children}
      </body>
    </html>
  );
}
