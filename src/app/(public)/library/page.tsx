"use client"

import { useState, useEffect, startTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { getBookmarkedArticles } from "@/actions/articles"
import { getReadingTime } from "@/lib/utils"

interface BookmarkedArticle {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  author: {
    name: string | null
    image: string | null
  }
  tags: { id: string; name: string; slug: string }[]
}

export default function LibraryPage() {
  const [articles, setArticles] = useState<BookmarkedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch bookmarks from localStorage and query details from DB
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSlugs: string[] = []
      
      // Iterate through localStorage keys to extract all bookmarked slugs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("archalgo_bookmarked_")) {
          const isBookmarked = localStorage.getItem(key) === "true"
          if (isBookmarked) {
            const slug = key.replace("archalgo_bookmarked_", "")
            savedSlugs.push(slug)
          }
        }
      }

      if (savedSlugs.length > 0) {
        startTransition(async () => {
          try {
            const fetched = await getBookmarkedArticles(savedSlugs)
            // Transform date strings back to Date objects
            const parsed = fetched.map(art => ({
              ...art,
              createdAt: new Date(art.createdAt)
            }))
            setArticles(parsed)
          } catch (err) {
            console.error("Failed to load library bookmarks", err)
          } finally {
            setLoading(false)
          }
        })
      } else {
        Promise.resolve().then(() => {
          setArticles([])
          setLoading(false)
        })
      }
    }
  }, [])

  // Handle removing a bookmark instantly
  const handleRemoveBookmark = (slug: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (typeof window !== "undefined") {
      localStorage.removeItem(`archalgo_bookmarked_${slug}`)
      setArticles(prev => prev.filter(art => art.slug !== slug))
    }
  }

  // Filter articles based on real-time search input
  const filteredArticles = articles.filter(art => {
    const query = searchQuery.toLowerCase()
    return (
      art.title.toLowerCase().includes(query) ||
      (art.excerpt && art.excerpt.toLowerCase().includes(query)) ||
      art.tags.some(t => t.name.toLowerCase().includes(query))
    )
  })

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      
      {/* Header section with technical style */}
      <header className="mb-10 border-b border-outline-variant/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link href="/" className="text-xs text-primary-fixed hover:underline flex items-center gap-1 font-label-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Editorial Journal
            </Link>
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface mb-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary-fixed">bookmark_manager</span> My Library
          </h1>
          <p className="text-on-surface-variant font-body-md text-sm sm:text-base">
            Your personal, curated queue of system architectures, algorithms design guides, and Web3 analyses.
          </p>
        </div>

        {/* Live Filter input */}
        {articles.length > 0 && (
          <div className="relative group w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base group-focus-within:text-primary-fixed transition-colors">filter_list</span>
            <input
              type="text"
              placeholder="Search saved articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
            />
          </div>
        )}
      </header>

      {/* Primary responsive grid framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Info Section */}
        <aside className="col-span-1 lg:col-span-3 space-y-6 lg:sticky lg:top-24 overflow-hidden animate-fade-in">
          <div className="glass-panel border border-outline-variant/30 rounded-2xl p-6 card-gradient space-y-6">
            <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4">
              <span className="material-symbols-outlined text-primary-fixed text-2xl">local_library</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface font-label-sm uppercase tracking-wider">Metrics Panel</h4>
                <p className="text-[10px] text-on-surface-variant">Syncing with LocalStorage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-body-md">Bookmarks Count:</span>
                <span className="font-bold font-mono text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 rounded border border-primary-fixed/20">{articles.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-body-md">Active Filters:</span>
                <span className="font-bold text-on-surface">{searchQuery ? "Active" : "None"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant font-body-md">Storage Engine:</span>
                <span className="font-mono text-[10px] text-surface-tint uppercase font-bold tracking-wider">HTML5 Client</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/15 pt-4 text-[10px] text-on-surface-variant leading-relaxed">
              * Bookmarked technical deep-dives are securely tied to your active browser environment. Clearing browser cache or local database assets will reset this directory view.
            </div>
          </div>
        </aside>

        {/* Dashboard Feed Area */}
        <main className="col-span-1 lg:col-span-9 w-full lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto pr-0 lg:pr-3 library-scroll">
          
          {loading ? (
            /* Shimmer Skeleton Loaders Grid */
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel border border-outline-variant/20 rounded-2xl p-5 flex flex-col md:flex-row gap-5 shimmer-skeleton h-44 w-full"></div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            /* Breathtaking Empty State */
            <div className="glass-panel border border-outline-variant/30 rounded-2xl p-10 sm:p-16 text-center card-gradient max-w-2xl mx-auto flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 text-on-surface-variant shadow-lg animate-pulse">
                <span className="material-symbols-outlined text-4xl text-primary-fixed">auto_stories</span>
              </div>
              <div>
                <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface mb-2">Your library is completely clear</h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Deep-dives, systems architecture tutorials, and algorithmic analyses you bookmark while reading will collect here for high-priority off-line references.
                </p>
              </div>
              <Link href="/articles" className="mt-2 bg-primary-container text-on-primary-fixed font-label-sm text-xs font-bold px-6 py-3 rounded-xl hover:bg-surface-tint transition-all scale-95 hover:scale-100 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-sm">explore</span> Explore technical catalog
              </Link>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* No Results Found State */
            <div className="glass-panel border border-outline-variant/20 rounded-2xl p-12 text-center text-on-surface-variant max-w-md mx-auto space-y-3">
              <span className="material-symbols-outlined text-4xl text-surface-tint">search_off</span>
              <h4 className="font-bold text-sm text-on-surface font-label-sm uppercase tracking-wide">No saved articles match query</h4>
              <p className="font-body-md text-xs leading-relaxed">
                Check spelling or filter by another structural tag. We found 0 matching matches out of your {articles.length} bookmarked deep-dives.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary-fixed font-bold font-label-sm underline hover:text-primary-container transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            /* Books List Grid Feed */
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/${article.tags[0]?.slug || "uncategorized"}/${article.slug}`}>
                  <div className="glass-panel border border-outline-variant/30 rounded-2xl p-5 flex flex-col md:flex-row gap-5 card-gradient hover:border-primary-fixed/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    
                    {/* Compact Image banner */}
                    {article.coverImage && (
                      <div className="relative w-full md:w-48 h-32 md:h-32 bg-surface-container-high rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/15 select-none pointer-events-none">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                    )}

                    {/* Content block details */}
                    <div className="flex flex-col justify-between flex-grow min-w-0 pr-0 md:pr-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          {article.tags && article.tags[0] && (
                            <span className="inline-flex px-2 py-0.5 border border-primary-fixed/55 text-primary-fixed font-label-sm text-[10px] rounded uppercase tracking-wider bg-primary-fixed/5">
                              {article.tags[0].name}
                            </span>
                          )}
                          <span className="text-on-surface-variant font-body-md text-[10px] sm:text-xs flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px] sm:text-[14px]">schedule</span> {getReadingTime(article.content)} min read
                          </span>
                        </div>
                        
                        <h3 className="font-headline-lg-mobile text-lg sm:text-xl text-on-surface mb-2 group-hover:text-primary-fixed transition-colors truncate">
                          {article.title}
                        </h3>
                        
                        <p className="font-body-md text-on-surface-variant text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {article.excerpt || article.content.substring(0, 140).replace(/<[^>]*>/g, "")}...
                        </p>
                      </div>

                      {/* Author credentials footer */}
                      <div className="flex items-center gap-2.5 mt-4 border-t border-outline-variant/10 pt-3">
                        {article.author.image && (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-outline-variant/40 relative">
                            <Image alt="Author" className="object-cover" src={article.author.image} fill />
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-on-surface font-label-sm">{article.author.name || "Anonymous"}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">• Published {article.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Floating Delete action bubble in card */}
                    <button
                      onClick={(e) => handleRemoveBookmark(article.slug, e)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-outline-variant/20 hover:border-error/40 bg-surface/50 hover:bg-error/10 text-on-surface-variant hover:text-error transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer opacity-80 md:opacity-0 md:group-hover:opacity-100"
                      title="Remove Bookmark"
                    >
                      <span className="material-symbols-outlined text-lg">bookmark_remove</span>
                    </button>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
