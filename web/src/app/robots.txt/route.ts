import { NextResponse } from "next/server";

const SITE_URL = "https://fastread.marcelodiani.online";

const ROBOTS_TXT = `User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new NextResponse(ROBOTS_TXT, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
