import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let articleEntries: MetadataRoute.Sitemap = []
  let topicEntries: MetadataRoute.Sitemap = []

  try {
    const articles = await db.article.findMany({
      where: { published: true },
      select: { 
        slug: true, 
        updatedAt: true,
        tags: {
          take: 1,
          select: { slug: true }
        }
      }
    })

    articleEntries = articles.map((article) => {
      const topic = article.tags[0]?.slug || 'uncategorized'
      return {
        url: `${baseUrl}/${topic}/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    })

    // Dynamic tags/topics
    const tags = await db.tag.findMany({
      select: { slug: true }
    })

    topicEntries = tags.map((tag) => ({
      url: `${baseUrl}/topics/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error)
  }

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  ]

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...topicEntries,
    ...staticEntries,
    ...articleEntries,
  ]
}
