import { Metadata } from 'next'
import { getArticleBySlug } from '@/actions/articles'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import ArticlesContent from './ArticlesContent'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ topic: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic, slug } = await params;
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    alternates: {
      canonical: `/${topic}/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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

interface QuizFAQ {
  question: string
  answer: string
  explanation: string
}

function extractQuizzes(content: string): QuizFAQ[] {
  const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)\n```/g
  const quizzes: QuizFAQ[] = []
  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[1]
    const normalizedText = code.trim().toLowerCase()
    const isQuiz = (normalizedText.startsWith('question:') || normalizedText.startsWith('[question')) && normalizedText.includes('answer:')
    if (isQuiz) {
      const lines = code.split('\n')
      let currentQuestion = ""
      let currentExplanation = ""
      let currentAnswer = ""
      
      const pushQuiz = () => {
        if (currentQuestion) {
          quizzes.push({
            question: currentQuestion,
            answer: currentAnswer,
            explanation: currentExplanation,
          })
        }
        currentQuestion = ""
        currentExplanation = ""
        currentAnswer = ""
      }

      for (let line of lines) {
        line = line.trim()
        if (!line) continue
        const lowerLine = line.toLowerCase()
        
        if (lowerLine.startsWith('[question') && lowerLine.endsWith(']')) {
          pushQuiz()
          continue
        }
        if (lowerLine.startsWith('question:')) {
          currentQuestion = line.substring(9).trim()
        } else if (lowerLine.startsWith('answer:')) {
          currentAnswer = line.substring(7).trim()
        } else if (lowerLine.startsWith('explanation:')) {
          currentExplanation = line.substring(12).trim()
        } else if (currentExplanation && !line.match(/^\[?[A-D]\]?[\s)..-]+/i)) {
          currentExplanation += " " + line
        }
      }
      pushQuiz()
    }
  }
  return quizzes
}


export async function generateStaticParams() {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      select: {
        slug: true,
        tags: {
          take: 1,
          select: { slug: true }
        }
      }
    })

    return articles.map((article) => {
      const topic = article.tags[0]?.slug || 'uncategorized'
      return {
        topic,
        slug: article.slug,
      }
    })
  } catch (error) {
    console.error("Error in generateStaticParams:", error)
    return []
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

  const wordCount = article.content.split(/\s+/).filter(Boolean).length
  const sections = article.tags.map(t => t.name).join(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${topic}/${slug}`,
    },
    headline: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: article.author.name,
      url: `${baseUrl}/author/${article.authorId}`
    }],
    publisher: {
      '@type': 'Organization',
      name: 'ArchAlgo',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/og-default.png`
      }
    },
    wordCount,
    articleSection: sections || 'Software Engineering'
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': topic.toUpperCase(),
        'item': `${baseUrl}/topics/${topic.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.title,
        'item': `${baseUrl}/${topic}/${slug}`,
      },
    ],
  }

  const quizzes = extractQuizzes(article.content)
  const faqJsonLd = quizzes.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': quizzes.map((q) => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Answer: ${q.answer}. Explanation: ${q.explanation}`,
      },
    })),
  } : null

  return (
    <div className="w-full pt-0 pb-10">
      {article.coverImage && (
        <link rel="preload" as="image" href={article.coverImage} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ArticlesContent article={article} sessionUser={sessionUser} relatedArticles={relatedArticles} />
    </div>
  )
}
