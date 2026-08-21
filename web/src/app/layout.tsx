import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://fast-read.vercel.app";
const SITE_NAME = "Fast Read";
const DESCRIPTION = "Free RSVP speed reading app. Read one word at a time at up to 1500 WPM. Supports PDF, EPUB, Markdown, and TXT.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Fast Read — RSVP Speed Reading",
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
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
  robots: {
    index: true,
    follow: true,
  },
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
