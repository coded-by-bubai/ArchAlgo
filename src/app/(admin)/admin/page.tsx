"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { createArticle, updateArticle, getArticleBySlug } from "@/actions/articles"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import 'highlight.js/styles/github-dark.css'

function AdminWriteArticleContent() {
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>(["System Design"])
  const [newTagInput, setNewTagInput] = useState("")
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit")
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get("slug")

  const availableTags = ["DSA", "System Design", "Web3"]

  useEffect(() => {
    if (editSlug) {
      const loadArticle = async () => {
        const article = await getArticleBySlug(editSlug)
        if (article) {
          setEditingArticleId(article.id)
          setTitle(article.title)
          setContent(article.content)
          setCoverImage(article.coverImage || "")
          setSelectedTags(article.tags.map(t => t.name))
        }
      }
      loadArticle()
    } else {
      // Clear fields if returning to create mode
      Promise.resolve().then(() => {
        setEditingArticleId(null)
        setTitle("")
        setContent("")
        setCoverImage("")
        setSelectedTags(["System Design"])
      })
    }
  }, [editSlug])

  // Toggle selected tags
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Add a new custom tag
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagInput.trim()) return
    const formattedTag = newTagInput.trim()
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags([...selectedTags, formattedTag])
    }
    setNewTagInput("")
    setShowCustomTagInput(false)
  }

  // Handle cursor insertion of markdown formatting
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after

    setContent(text.substring(0, start) + replacement + text.substring(end))

    // Maintain cursor focus and highlight range
    textarea.focus()
    setTimeout(() => {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  // Handle Cover Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setCoverImage(data.url)
    } catch (error) {
      alert("Failed to upload image")
      console.error(error)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Submit and Publish/Update Article
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      return alert("Title and content are required")
    }
    setLoading(true)
    try {
      // Clean excerpt from markdown syntax, keeping only plain text
      const cleanContent = content
        .replace(/!\[[^\]]*\]\s*\([^)]*\)?/g, "") // Remove Markdown images aggressively with optional whitespace (including truncated ones)
        .replace(/\[([^\]]*)\]\s*\([^)]*\)?/g, "$1") // Remove Markdown links aggressively with optional whitespace (including truncated ones)
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/https?:\/\/[^\s]+/g, "") // Remove raw URLs
        .replace(/(?:^|\n)(?:#{1,6}\s+)/g, "\n") // Remove headers
        .replace(/[*_`~#]/g, "") // Remove inline formatting

      const lines = cleanContent.split("\n").map(l => l.trim()).filter(l => l.length > 0)
      const excerpt = (lines[0] || "").substring(0, 150)

      let article;
      if (editingArticleId) {
        article = await updateArticle(editingArticleId, {
          title,
          content,
          coverImage: coverImage.trim(), // Allows clearing the cover image by sending an empty string
          excerpt: excerpt || undefined,
          published: true,
          tags: selectedTags,
        })
        alert("Changes saved successfully!")
        router.push(`/admin?slug=${article.slug}`)
      } else {
        article = await createArticle({
          title,
          content,
          coverImage: coverImage.trim(), // Allows empty string for no cover image
          excerpt: excerpt || undefined,
          published: true,
          tags: selectedTags,
        })
        const primaryTag = selectedTags[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized'
        router.push(`/${primaryTag}/${article.slug}`)
      }
    } catch (error: any) {
      alert(error.message || "Failed to save article")
    } finally {
      setLoading(false)
    }
  }

  // Custom Markdown overrides to style components inside editor preview
  const previewComponents = {
    h2: ({ children, ...props }: any) => (
      <h2 className="font-headline-lg text-headline-lg text-on-surface mt-10 mb-5 border-b border-outline-variant/10 pb-2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="font-headline-lg text-[22px] text-on-surface mt-8 mb-4" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-6 leading-relaxed text-on-surface/90" {...props}>
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-2 border-primary-fixed pl-5 py-1.5 my-6 bg-surface-container-low/40 rounded-r italic text-on-surface-variant" {...props}>
        {children}
      </blockquote>
    ),
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

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md flex flex-col relative pb-24">
      {/* Top Contextual Navigation (Context: Admin Write) */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <Link className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-fixed dark:text-primary-fixed-dim hover:backdrop-brightness-125 transition-all duration-300 scale-95 active:scale-90 flex items-center gap-2" href="/">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit_square</span>
              ArchAlgo Admin
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="font-label-sm text-label-sm text-primary-fixed dark:text-primary-fixed-dim border-b-2 border-primary-fixed pb-1">
              {editingArticleId ? "Edit Article" : "Write Article"}
            </span>
            <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed transition-colors" href="/admin/dashboard">Dashboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-1 scale-95 active:scale-90">
              <span className="material-symbols-outlined text-[18px]">close</span>
              Exit
            </Link>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="font-label-sm text-label-sm bg-primary-container text-on-primary-fixed px-5 py-1.5 rounded-DEFAULT font-bold hover:bg-surface-tint transition-colors scale-95 active:scale-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : (editingArticleId ? "Save Changes" : "Publish")}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-24 px-gutter max-w-container-max mx-auto w-full max-w-4xl">
        <header className="mb-12 space-y-8 animate-fade-in mt-6">
          {/* Cover Image URL zone */}
          {coverImage ? (
            <div className="relative group w-full h-48 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
              <Image
                src={coverImage}
                alt="Cover Preview"
                fill
                className="object-cover opacity-80"
              />
              <button
                onClick={() => setCoverImage("")}
                className="absolute right-3 top-3 bg-background/80 hover:bg-background text-on-surface p-1.5 rounded-full border border-outline-variant/30 flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ) : (
            <div
              className="relative group w-full rounded-xl border border-dashed border-outline-variant/50 hover:border-primary-fixed bg-surface-container-low/40 p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 group-hover:text-primary-fixed transition-colors">
                {uploadingImage ? "hourglass_empty" : "add_photo_alternate"}
              </span>
              <p className="bg-transparent border-none text-center font-label-sm text-xs text-on-surface-variant group-hover:text-primary-fixed outline-none w-full max-w-md">
                {uploadingImage ? "Uploading..." : "Click to upload Cover Image"}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {/* Title Input */}
          <div className="relative">
            <input
              className="w-full bg-transparent border-none border-b-2 border-outline-variant/30 py-4 outline-none text-on-surface transition-all focus:border-primary-fixed font-headline-xl text-headline-xl font-bold tracking-tighter"
              placeholder="Article Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Tags Multi-select */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
              Topic Tags:
            </span>
            {availableTags.map(tag => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all font-label-sm text-xs cursor-pointer ${active
                      ? "border-primary-fixed bg-primary-fixed/10 text-primary-fixed"
                      : "border-outline-variant/30 hover:border-primary-fixed hover:text-primary-fixed text-on-surface bg-surface-container-lowest"
                    }`}
                >
                  {tag}
                  {active && <span className="material-symbols-outlined text-[12px]">close</span>}
                </button>
              )
            })}

            {/* Custom Tag Input Toggle */}
            {showCustomTagInput ? (
              <form onSubmit={handleAddCustomTag} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Custom tag name..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 rounded pl-2.5 pr-2 py-0.5 font-label-sm text-xs text-on-surface focus:outline-none focus:border-primary-fixed w-36"
                  autoFocus
                />
                <button type="submit" className="text-primary-fixed hover:text-primary-container p-1 font-bold text-xs font-label-sm">Add</button>
                <button type="button" onClick={() => setShowCustomTagInput(false)} className="text-on-surface-variant hover:text-on-surface p-1 text-xs font-label-sm">Cancel</button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomTagInput(true)}
                className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-outline-variant/50 hover:border-primary-fixed text-on-surface-variant hover:text-primary-fixed transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            )}

            {/* Custom tags output */}
            {selectedTags.filter(t => !availableTags.includes(t)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-primary-fixed bg-primary-fixed/5 text-primary-fixed font-label-sm text-xs cursor-pointer"
              >
                #{tag}
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            ))}
          </div>
        </header>

        {/* Editor Workspace Component */}
        <div className="glass-panel rounded-xl flex flex-col min-h-[500px] mb-12 shadow-sm border border-outline-variant/30 overflow-hidden">
          {/* Editor Header / Toolbars */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/30">
            {/* Toolbar Insertion Helpers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Bold"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">format_bold</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Italic"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">format_italic</span>
              </button>
              <div className="w-px h-4 bg-outline-variant/30 mx-2"></div>
              <button
                type="button"
                onClick={() => insertMarkdown("```javascript\n", "\n```")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Code Block"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">code_blocks</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Link"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">link</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("![alt](", ")")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Image"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">image</span>
              </button>
            </div>

            {/* Toggle Writing vs Real-time Preview */}
            <div className="flex bg-surface-container rounded p-0.5 border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setPreviewMode("edit")}
                className={`px-3 py-1 font-label-sm text-xs rounded transition-colors cursor-pointer ${previewMode === "edit"
                    ? "bg-surface text-primary-fixed font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("preview")}
                className={`px-3 py-1 font-label-sm text-xs rounded transition-colors cursor-pointer ${previewMode === "preview"
                    ? "bg-surface text-primary-fixed font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Text Area vs Live Markdown Render Frame */}
          <div className="w-full flex-grow flex">
            {previewMode === "edit" ? (
              <textarea
                ref={textareaRef}
                className="w-full flex-grow p-6 bg-transparent font-body-md text-body-md text-on-surface outline-none resize-none hide-scrollbar min-h-[400px] leading-relaxed placeholder-outline-variant/60"
                placeholder="Start writing article content in Markdown format..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="w-full p-6 prose prose-invert max-w-none text-body-md font-body-md overflow-y-auto leading-relaxed max-h-[600px] hide-scrollbar select-text">
                {content.trim() ? (
                  <Markdown components={previewComponents} rehypePlugins={[rehypeHighlight]}>
                    {content}
                  </Markdown>
                ) : (
                  <p className="text-on-surface-variant italic text-sm">Nothing to preview. Go back to Write and start drafting!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminWriteArticle() {
  return (
    <Suspense fallback={
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center font-body-md">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary-fixed">sync</span>
          <p className="text-sm text-on-surface-variant font-label-sm">Loading workspace...</p>
        </div>
      </div>
    }>
      <AdminWriteArticleContent />
    </Suspense>
  )
}
