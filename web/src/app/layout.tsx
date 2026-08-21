import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://fastread.marcelodiani.online";
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

  return (
    <html lang="en">
      <head>
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
