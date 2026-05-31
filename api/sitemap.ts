import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchArtworks } from "../lib/artworks.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://museum.jaxsenville.com").replace(/\/$/, "");

  const artworks = await fetchArtworks();

  const today = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: base, priority: "1.0", changefreq: "weekly", lastmod: today },
    ...artworks.map((a) => ({
      loc: `${base}/artwork/${a.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: a.date,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(xml);
}
