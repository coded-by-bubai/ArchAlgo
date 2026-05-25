import { Metadata } from 'next'
import { getArticleBySlug } from '@/actions/articles'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/auth'
import ArticlesContent from './ArticlesContent'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ topic: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: `${article.title} | ArchAlgo`,
    description: article.excerpt || article.content.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      authors: [article.author.name || ''],
      images: article.coverImage ? [article.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160),
      images: article.coverImage ? [article.coverImage] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { topic, slug } = await params;
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Canonical Redirect: Enforce correct topic category in URL to prevent duplicate content SEO penalties
  const hasMatchingTag = article.tags.some(t => t.slug === topic.toLowerCase())
  if (!hasMatchingTag && article.tags.length > 0) {
    const canonicalTopic = article.tags[0].slug
    redirect(`/${canonicalTopic}/${slug}`)
  }

  const session = await auth()
  const sessionUser = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role || 'USER'
  } : null

  const tagSlugs = article.tags.map(t => t.slug)
  const relatedArticles = tagSlugs.length > 0
    ? await db.article.findMany({
      where: {
        published: true,
        id: { not: article.id },
        tags: {
          some: {
            slug: { in: tagSlugs }
          }
        }
      },
      take: 3,
      include: {
        tags: true,
        author: { select: { name: true } }
      }
    })
    : []

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: article.author.name,
      url: `${baseUrl}/author/${article.authorId}`
    }]
  }

  return (
    <div className="w-full max-w-container-max mx-auto py-10 px-4 md:px-margin-desktop">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {article.coverImage && (
        <div className="relative w-full h-[300px] md:h-[450px] mb-12 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-lg">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
        </div>
      )}

      <ArticlesContent article={article} sessionUser={sessionUser} relatedArticles={relatedArticles} />
    </div>
  )
}
