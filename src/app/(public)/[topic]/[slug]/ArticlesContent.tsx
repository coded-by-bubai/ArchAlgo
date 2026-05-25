"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import 'highlight.js/styles/github-dark.css'
import { postComment } from "@/actions/comments"
import { useRouter } from "next/navigation"

interface CommentWithAuthor {
  id: string
  content: string
  createdAt: Date
  authorId: string
  author: {
    name: string | null
    image: string | null
  }
}

interface ArticleWithRelations {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  coverImage: string | null
  views: number
  createdAt: Date
  authorId: string
  author: {
    name: string | null
    image: string | null
  }
  tags: { id: string; name: string; slug: string }[]
  comments: CommentWithAuthor[]
}

interface RelatedArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  createdAt: Date
  tags: { id: string; name: string; slug: string }[]
  author: { name: string | null }
}

interface ArticlesContentProps {
  article: ArticleWithRelations
  sessionUser: { id: string; name?: string | null; image?: string | null; role: "USER" | "ADMIN" } | null
  relatedArticles?: RelatedArticle[]
}

export default function ArticlesContent({ article, sessionUser, relatedArticles = [] }: ArticlesContentProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(12) // Initial count simulation
  const [commentText, setCommentText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize likes/bookmarks states from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLiked = localStorage.getItem(`archalgo_liked_${article.slug}`) === "true"
      const isBookmarked = localStorage.getItem(`archalgo_bookmarked_${article.slug}`) === "true"
      Promise.resolve().then(() => {
        setLiked(isLiked)
        setBookmarked(isBookmarked)
        if (isLiked) setLikeCount(prev => prev + 1)
      })
    }
  }, [article.slug])

  // Handle Like Toggle
  const handleLike = () => {
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)
    localStorage.setItem(`archalgo_liked_${article.slug}`, String(newLikedState))
  }

  // Handle Bookmark Toggle
  const handleBookmark = () => {
    const newBookmarkedState = !bookmarked
    setBookmarked(newBookmarkedState)
    localStorage.setItem(`archalgo_bookmarked_${article.slug}`, String(newBookmarkedState))
  }

  // Handle Share URL Copy
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      alert("Article link copied to clipboard!")
    }
  }

  // Parse Headings for TOC
  const getHeadingText = (node: any): string => {
    if (!node) return ""
    if (typeof node === "string") return node
    if (Array.isArray(node)) return node.map(getHeadingText).join("")
    if (node.props && node.props.children) return getHeadingText(node.props.children)
    return ""
  }

  const parseHeadings = (content: string) => {
    const lines = content.split("\n")
    const headings: { text: string; id: string; level: number }[] = []
    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        headings.push({ text, id, level })
      }
    })
    return headings
  }

  const headings = parseHeadings(article.content)

  // Custom Markdown overrides to assign IDs to headers for TOC anchoring
  const markdownComponents = {
    h2: ({ children, ...props }: any) => {
      const text = getHeadingText(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      return <h2 id={id} className="font-headline-lg text-headline-lg text-on-surface mt-12 mb-6" {...props}>{children}</h2>
    },
    h3: ({ children, ...props }: any) => {
      const text = getHeadingText(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      return <h3 id={id} className="font-headline-lg text-[24px] text-on-surface mt-10 mb-4" {...props}>{children}</h3>
    },
    p: ({ children, ...props }: any) => {
      return <p className="mb-6 leading-relaxed text-on-surface/90" {...props}>{children}</p>
    },
    blockquote: ({ children, ...props }: any) => {
      return (
        <blockquote className="border-l-2 border-primary-fixed pl-6 py-2 my-8 glass-panel rounded-r italic text-on-surface-variant" {...props}>
          {children}
        </blockquote>
      )
    },
    ul: ({ children, ...props }: any) => {
      return <ul className="list-disc pl-6 mb-6 space-y-2 text-on-surface/95" {...props}>{children}</ul>
    },
    ol: ({ children, ...props }: any) => {
      return <ol className="list-decimal pl-6 mb-6 space-y-2 text-on-surface/95" {...props}>{children}</ol>
    },
    a: ({ children, href, ...props }: any) => {
      const isImageUrl = href && (/\.(jpeg|jpg|gif|png|webp|svg|bmp)(?:\?.*)?$/i.test(href) || href.includes("googleusercontent.com"))

      if (isImageUrl) {
        return (
          <span className="block my-8 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-lg max-w-full">
            <img
              src={href}
              alt={typeof children === 'string' ? children : "Article Image"}
              className="w-full object-cover max-h-[450px] opacity-90 hover:opacity-100 transition-opacity duration-300"
              {...props}
            />
          </span>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-fixed hover:underline underline-offset-4 decoration-primary-fixed/30 hover:decoration-primary-fixed transition-all font-medium cursor-pointer"
          {...props}
        >
          {children}
        </a>
      )
    },
    img: ({ src, alt, ...props }: any) => (
      <span className="block my-8 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-lg max-w-full">
        <img
          src={src}
          alt={alt}
          className="w-full object-cover max-h-[450px] opacity-90 hover:opacity-100 transition-opacity duration-300"
          {...props}
        />
      </span>
    ),
  }

  // Handle Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setErrorMessage("")

    startTransition(async () => {
      try {
        await postComment(article.id, commentText)
        setCommentText("")
        router.refresh() // Pull updated comments from database
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to submit comment. Please sign in.")
      }
    })
  }

  // Helper toolbar for comments text insertion
  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    setCommentText(text.substring(0, start) + replacement + text.substring(end))
    textarea.focus()
    // Select the inserted text range
    setTimeout(() => {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Floating Action Bar (Left Sidebar on Desktop) */}
      <aside className="hidden lg:block lg:col-span-1 relative">
        <div className="sticky top-32 flex flex-col items-center gap-4 py-4 glass-panel rounded-full w-12 mx-auto border border-outline-variant/30">
          <button
            aria-label="Like"
            onClick={handleLike}
            className={`transition-colors group relative p-2 ${liked ? "text-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: liked ? "'FILL' 1" : undefined }}>
              favorite
            </span>
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-surface-container-low px-2 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-label-sm border border-outline-variant/30">
              {likeCount}
            </span>
          </button>
          <div className="w-6 h-px bg-outline-variant/30"></div>
          <button
            aria-label="Bookmark"
            onClick={handleBookmark}
            className={`transition-colors group relative p-2 ${bookmarked ? "text-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : undefined }}>
              bookmark
            </span>
          </button>
          <div className="w-6 h-px bg-outline-variant/30"></div>
          <button
            aria-label="Share"
            onClick={handleShare}
            className="text-on-surface-variant hover:text-primary-fixed transition-colors group relative p-2"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
              share
            </span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="col-span-1 lg:col-span-8 max-w-[65ch] mx-auto w-full">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {article.tags && article.tags[0] && (
              <Link href={`/topics/${article.tags[0].slug}`} className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed bg-primary-fixed/10 border border-primary-fixed/20 px-2.5 py-1 rounded hover:bg-primary-fixed/20 transition-colors">
                {article.tags[0].name}
              </Link>
            )}
            <span className="text-on-surface-variant text-sm flex items-center gap-1 font-body-md">
              <span className="material-symbols-outlined text-[16px]">schedule</span> 12 min read
            </span>
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 py-6 border-y border-outline-variant/20">
            {article.author.image && (
              <Image
                src={article.author.image}
                alt={article.author.name || "Author"}
                width={48}
                height={48}
                className="rounded-full object-cover border border-outline-variant/50"
              />
            )}
            <div>
              <div className="font-medium text-on-surface font-body-md">{article.author.name || "Anonymous"}</div>
              <div className="text-on-surface-variant text-sm font-body-md">
                Published {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {article.views} views
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="prose prose-invert max-w-none text-body-md font-body-md">
          <Markdown components={markdownComponents} rehypePlugins={[rehypeHighlight]}>
            {article.content}
          </Markdown>
        </div>

        {/* Footer actions for mobile view */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 flex lg:hidden justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <Link key={tag.id} href={`/topics/${tag.slug}`} className="font-label-sm text-label-sm border border-outline-variant px-3 py-1 rounded-full text-on-surface-variant hover:border-primary-fixed hover:text-primary-fixed transition-colors">
                #{tag.name.toUpperCase()}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button onClick={handleLike} className={`p-1.5 rounded ${liked ? "text-primary-fixed" : "hover:text-primary-fixed"}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : undefined }}>favorite</span>
            </button>
            <button onClick={handleBookmark} className={`p-1.5 rounded ${bookmarked ? "text-primary-fixed" : "hover:text-primary-fixed"}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : undefined }}>bookmark</span>
            </button>
            <button onClick={handleShare} className="p-1.5 rounded hover:text-primary-fixed">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        {/* Discussion Board / Comments Section */}
        <section className="mt-16 pt-12 border-t border-outline-variant/20">
          <h3 className="font-headline-lg text-headline-lg text-[24px] text-on-surface mb-8">
            Discussion ({article.comments.length})
          </h3>

          {/* Comment submission form */}
          {sessionUser ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
              {sessionUser.image && (
                <Image
                  src={sessionUser.image}
                  alt={sessionUser.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full border border-outline-variant/50 object-cover w-10 h-10 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="glass-panel rounded-lg border border-outline-variant/50 focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden bg-surface-container-low">
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent border-none text-on-surface placeholder-outline/50 p-4 font-body-md text-body-md focus:ring-0 resize-none min-h-[100px] outline-none"
                    placeholder="Add to the discussion... (Markdown supported)"
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isPending}
                  />
                  <div className="bg-surface border-t border-outline-variant/30 px-4 py-2 flex justify-between items-center">
                    <div className="flex gap-2 text-on-surface-variant">
                      <button type="button" onClick={() => insertText("**", "**")} className="hover:text-primary-fixed p-1" title="Bold">
                        <span className="material-symbols-outlined text-[18px]">format_bold</span>
                      </button>
                      <button type="button" onClick={() => insertText("`", "`")} className="hover:text-primary-fixed p-1" title="Code">
                        <span className="material-symbols-outlined text-[18px]">code</span>
                      </button>
                      <button type="button" onClick={() => insertText("[", "](url)")} className="hover:text-primary-fixed p-1" title="Link">
                        <span className="material-symbols-outlined text-[18px]">link</span>
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isPending || !commentText.trim()}
                      className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold px-4 py-1.5 rounded hover:bg-primary-container disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isPending ? "Posting..." : "Comment"}
                    </button>
                  </div>
                </div>
                {errorMessage && (
                  <p className="text-error text-xs mt-2">{errorMessage}</p>
                )}
              </div>
            </form>
          ) : (
            <div className="glass-panel rounded-lg border border-outline-variant/30 p-6 text-center mb-10 flex flex-col items-center gap-3">
              <p className="text-on-surface-variant font-body-md text-sm">
                You must be logged in to participate in the technical discussions.
              </p>
              <Link href="/api/auth/signin" className="bg-primary-container text-on-primary-fixed font-label-sm text-xs font-bold px-5 py-2 rounded-DEFAULT hover:bg-surface-tint transition-colors">
                Sign In to Comment
              </Link>
            </div>
          )}

          {/* Comments Feed */}
          <div className="space-y-6">
            {article.comments.length > 0 ? (
              article.comments.map(comment => {
                const isAuthor = comment.authorId === article.authorId
                return (
                  <div key={comment.id} className="flex gap-4">
                    {comment.author.image && (
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full border border-outline-variant/40 object-cover w-10 h-10 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface text-sm">{comment.author.name || "Anonymous"}</span>
                          {isAuthor && (
                            <span className="text-[9px] uppercase font-extrabold tracking-wider bg-primary-fixed/20 text-primary-fixed px-1.5 py-0.5 rounded border border-primary-fixed/30">
                              Author
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-on-surface/90 text-[14px] leading-relaxed break-words whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-on-surface-variant italic font-body-md text-sm text-center py-6">
                No discussions yet. Be the first to start the conversation!
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Table of Contents (Right Sidebar on Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 relative">
        <div className="sticky top-32 space-y-6">
          <div className="glass-panel border border-outline-variant/30 rounded-xl p-6">
            <h4 className="font-label-sm text-label-sm text-on-surface mb-4 uppercase tracking-wider">
              On this page
            </h4>
            {headings.length > 0 ? (
              <ul className="space-y-3 text-xs text-on-surface-variant font-body-md">
                {headings.map((heading, i) => (
                  <li key={i} style={{ paddingLeft: heading.level === 3 ? "12px" : "0" }}>
                    <a
                      href={`#${heading.id}`}
                      className="hover:text-primary-fixed transition-colors border-l border-transparent hover:border-primary-fixed pl-2 block text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-on-surface-variant italic">
                No sections detected.
              </p>
            )}
          </div>

          {/* Related Articles Card */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="glass-panel border border-outline-variant/30 rounded-xl p-6">
              <h4 className="font-label-sm text-label-sm text-on-surface mb-4 uppercase tracking-wider">
                Related Articles
              </h4>
              <ul className="space-y-4">
                {relatedArticles.map((rel) => (
                  <li key={rel.id} className="group">
                    <Link href={`/${rel.tags[0]?.slug || "uncategorized"}/${rel.slug}`}>
                      <span className="text-xs text-on-surface-variant group-hover:text-primary-fixed transition-colors font-medium line-clamp-2 leading-relaxed block">
                        {rel.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
