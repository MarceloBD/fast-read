import { NextResponse } from "next/server";

const SITE_URL = "https://fastread.marcelodiani.online";

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      ({ url, lastModified, changeFrequency, priority }) =>
        `  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function GET() {
  const entries: SitemapEntry[] = [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date("2026-08-08").toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2026-08-08").toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const xml = buildSitemapXml(entries);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
