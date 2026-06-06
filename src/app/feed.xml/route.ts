import { db } from '@/lib/db'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      tags: {
        select: { slug: true }
      },
      author: {
        select: { name: true }
      }
    }
  })

  const lastBuildDate = new Date().toUTCString()

  let itemsXml = ''
  for (const article of articles) {
    const topic = article.tags[0]?.slug || 'uncategorized'
    const url = `${baseUrl}/${topic}/${article.slug}`
    const excerpt = article.excerpt || article.content.substring(0, 160)
    
    // Escape XML special characters
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    itemsXml += `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(excerpt)}</description>
      <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
      <author>${escapeXml(article.author.name || 'ArchAlgo Author')}</author>
    </item>`
  }

  const rssXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ArchAlgo</title>
    <link>${baseUrl}</link>
    <description>Deep dives into Data Structures, Algorithms, and System Design.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`.trim()

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
