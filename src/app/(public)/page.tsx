import { getArticles } from "@/actions/articles"
import Link from "next/link"
import Image from "next/image"
import LoadMoreArticles from "./LoadMoreArticles"
import { getReadingTime } from "@/lib/utils"

function cleanString(text: string | null) {
  if (!text) return ""
  return text
    .replace(/!\[[^\]]*\]\s*\([^)]*\)?/g, "") // Remove Markdown images aggressively with optional whitespace (including truncated ones)
    .replace(/\[([^\]]*)\]\s*\([^)]*\)?/g, "$1") // Remove Markdown links aggressively with optional whitespace (including truncated ones)
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/https?:\/\/[^\s]+/g, "") // Remove raw URLs
    .replace(/(?:^|\n)(?:#{1,6}\s+)/g, "\n") // Remove headers
    .replace(/[*_`~#]/g, "") // Remove inline formatting
    .replace(/\s+/g, " ") // Collapse whitespaces
    .trim()
}

function getCleanExcerpt(text: string | null, limit: number, fallbackText?: string | null) {
  const cleanPrimary = cleanString(text)
  if (cleanPrimary.length >= 30) {
    return cleanPrimary.substring(0, limit)
  }
  if (fallbackText) {
    return cleanString(fallbackText).substring(0, limit)
  }
  return cleanPrimary.substring(0, limit)
}

export default async function Home() {
  const { articles, totalPages } = await getArticles(10, 1)

  const featuredArticle = articles[0]
  const recentArticles = articles.slice(1)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <section className="py-12 md:py-20 flex flex-col items-center text-center">
        <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-headline-xl text-on-surface mb-6 max-w-3xl leading-tight sm:leading-none">
          Master Software Engineering
        </h1>
        <p className="font-body-md text-sm sm:text-base md:text-body-md text-on-surface-variant max-w-2xl mb-10">
          Deep dives into Data Structures, Algorithms, and System Design. Elevate your technical craft with premium editorial content built for high-performance developers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={featuredArticle ? `/${featuredArticle.tags[0]?.slug || 'uncategorized'}/${featuredArticle.slug}` : '/articles'}
            className="bg-primary-container text-on-primary-fixed font-label-sm text-label-sm font-bold px-6 py-3 rounded-DEFAULT hover:bg-surface-tint transition-colors flex items-center justify-center cursor-pointer"
          >
            Start Reading
          </Link>
          <a
            href="#topics"
            className="glass-panel border border-outline-variant/30 text-on-surface font-label-sm text-label-sm px-6 py-3 rounded-DEFAULT hover:bg-surface-container-highest transition-colors neon-glow flex items-center justify-center cursor-pointer"
          >
            Explore Topics
          </a>
        </div>
      </section>

      {featuredArticle && (
        <section className="mb-section-gap">
          <Link href={`/${featuredArticle.tags[0]?.slug || 'uncategorized'}/${featuredArticle.slug}`}>
            <div className="glass-panel rounded-xl overflow-hidden group cursor-pointer border border-outline-variant/30 hover:border-primary-fixed/50 transition-all duration-300 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
                <div className="h-64 md:h-auto w-full bg-surface-container-high relative overflow-hidden">
                  <Image 
                    alt={featuredArticle.title} 
                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" 
                    src={featuredArticle.coverImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuDFgrwq4YaE6KtuRexP4D0hM_6zcnvlk1T0QeNCU1UzM05QsAa-bDjK0qhqid2x3692lqfaMy8a6tKI4CmrXTd3-82jH-D-wZwWNB1xZ7QiNyW8yON9JEgIwgsFK2hrGJ05fH03QxHsRRcdbgECAx3-h7mVsyPqz8iEc1SycajZfuKZZyQS3B4JNTy-rmuk8kSZhrrIV4eNiOkL58jg9tfjRWomF6iotFqHBtGklOsIcAYGXHnus-JI-hoUUZfYadKKM5KCvK7nzO9C"}
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:from-transparent md:to-transparent"></div>
                </div>
                <div className="p-6 md:p-12 flex flex-col justify-center card-gradient relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    {featuredArticle.tags && featuredArticle.tags[0] && (
                      <span className="inline-flex items-center justify-center px-2 py-1 border border-primary-fixed bg-primary-fixed/10 text-primary-fixed font-label-sm text-label-sm rounded uppercase tracking-wider">
                        {featuredArticle.tags[0].name}
                      </span>
                    )}
                    <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {getReadingTime(featuredArticle.content)} min read
                    </span>
                  </div>
                  <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4 group-hover:text-primary-fixed transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 line-clamp-3">
                    {getCleanExcerpt(featuredArticle.excerpt, 150, featuredArticle.content)}...
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    {featuredArticle.author?.image && (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 relative">
                        <Image alt="Author" className="object-cover" src={featuredArticle.author.image} fill />
                      </div>
                    )}
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface font-bold">{featuredArticle.author?.name || 'Anonymous'}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{new Date(featuredArticle.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Explore Topics Grid Section */}
      <section id="topics" className="mb-section-gap scroll-mt-24">
        <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-8">
          Explore Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/topics/dsa" className="glass-panel border border-outline-variant/30 rounded-2xl p-6 card-gradient hover:border-primary-fixed/55 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/10 flex items-center justify-center text-primary-fixed mb-4 border border-primary-fixed/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">schema</span>
              </div>
              <h4 className="font-headline-lg-mobile text-lg text-on-surface mb-2 group-hover:text-primary-fixed transition-colors">
                Data Structures & Algorithms
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                Master array, list, tree, graph algorithms, complex programming heuristics, and optimal runtime analysis.
              </p>
            </div>
            <div className="text-[10px] text-primary-fixed font-bold font-label-sm uppercase tracking-wider flex items-center gap-1 mt-6">
              Browse DSA <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </Link>

          <Link href="/topics/system-design" className="glass-panel border border-outline-variant/30 rounded-2xl p-6 card-gradient hover:border-primary-fixed/55 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/10 flex items-center justify-center text-primary-fixed mb-4 border border-primary-fixed/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <h4 className="font-headline-lg-mobile text-lg text-on-surface mb-2 group-hover:text-primary-fixed transition-colors">
                System Design
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                Understand scalability patterns, microservices architectures, caching, rate limiting, and high availability systems.
              </p>
            </div>
            <div className="text-[10px] text-primary-fixed font-bold font-label-sm uppercase tracking-wider flex items-center gap-1 mt-6">
              Browse Systems <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </Link>

          <Link href="/topics/web3" className="glass-panel border border-outline-variant/30 rounded-2xl p-6 card-gradient hover:border-primary-fixed/55 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/10 flex items-center justify-center text-primary-fixed mb-4 border border-primary-fixed/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">toll</span>
              </div>
              <h4 className="font-headline-lg-mobile text-lg text-on-surface mb-2 group-hover:text-primary-fixed transition-colors">
                Web3 & Decentralization
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body-md">
                Explore blockchain consensus, Ethereum Virtual Machine internals, smart contracts auditing, and peer-to-peer protocols.
              </p>
            </div>
            <div className="text-[10px] text-primary-fixed font-bold font-label-sm uppercase tracking-wider flex items-center gap-1 mt-6">
              Browse Web3 <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </Link>
        </div>
      </section>

      {recentArticles.length > 0 && (
        <section className="mb-section-gap">
          <div className="flex justify-between items-end mb-8">
            <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Recent Articles</h3>
            <Link className="text-primary-fixed font-label-sm text-label-sm hover:underline flex items-center gap-1" href="/articles">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar snap-x">
            {recentArticles.map(article => (
              <Link key={article.id} href={`/${article.tags[0]?.slug || 'uncategorized'}/${article.slug}`}>
                <article className="glass-panel border border-outline-variant/30 rounded-lg p-6 min-w-[270px] w-[270px] sm:min-w-[320px] sm:w-[320px] md:min-w-[350px] md:w-[350px] flex flex-col min-h-[280px] h-auto card-gradient hover:-translate-y-1 transition-transform duration-300 neon-glow cursor-pointer snap-start group">
                  <div className="flex justify-between items-start mb-4">
                    {article.tags && article.tags[0] && (
                      <span className="inline-flex px-2 py-0.5 border border-primary-fixed/50 text-primary-fixed font-label-sm text-label-sm rounded uppercase tracking-wider text-[10px]">
                        {article.tags[0].name}
                      </span>
                    )}
                    <span className="text-on-surface-variant font-code-block text-code-block text-xs">
                      {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-headline-lg-mobile text-[20px] text-on-surface mb-3 group-hover:text-primary-fixed transition-colors">
                    {article.title}
                  </h4>
                  <p className="font-body-md text-on-surface-variant text-sm mb-6 line-clamp-3 flex-grow">
                    {getCleanExcerpt(article.excerpt, 140, article.content)}...
                  </p>
                  <div className="flex items-center gap-2 text-on-surface-variant mt-auto font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">terminal</span> Read Article
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <LoadMoreArticles totalPages={totalPages} />
        </section>
      )}
    </>
  );
}
