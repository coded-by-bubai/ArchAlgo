"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { deleteArticle } from "@/actions/articles"
import { useRouter } from "next/navigation"

export default function DashboardClient({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return

    startTransition(async () => {
      try {
        await deleteArticle(id)
        setArticles(prev => prev.filter(a => a.id !== id))
        router.refresh()
      } catch {
        alert("Failed to delete article.")
      }
    })
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md flex flex-col relative pb-24">
      {/* Top Contextual Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <Link className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-fixed dark:text-primary-fixed-dim hover:backdrop-brightness-125 transition-all duration-300 scale-95 active:scale-90 flex items-center gap-2" href="/">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              ArchAlgo Admin
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="font-label-sm text-label-sm text-primary-fixed dark:text-primary-fixed-dim border-b-2 border-primary-fixed pb-1">Dashboard</span>
            <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed transition-colors" href="/admin">Write Article</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-1 scale-95 active:scale-90">
              <span className="material-symbols-outlined text-[18px]">close</span>
              Exit
            </Link>
            <Link href="/admin" className="font-label-sm text-label-sm bg-primary-container text-on-primary-fixed px-5 py-1.5 rounded-DEFAULT font-bold hover:bg-surface-tint transition-colors scale-95 active:scale-90 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Article
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-32 px-gutter max-w-container-max mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface">Content Dashboard</h1>
            <p className="text-on-surface-variant mt-2 font-body-md">Manage your published articles and drafts.</p>
          </div>
        </div>

        <div className="glass-panel border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-sm border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="py-4 px-6 font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">Title</th>
                  <th className="py-4 px-6 font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">Status</th>
                  <th className="py-4 px-6 font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">Date</th>
                  <th className="py-4 px-6 font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">Views</th>
                  <th className="py-4 px-6 font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-on-surface-variant italic">No articles found. Start writing!</td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-medium text-on-surface mb-1.5">{article.title}</div>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {article.tags.map((tag: any) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {article.published ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">Published</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-outline-variant/20 text-on-surface-variant border border-outline-variant/30">Draft</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {article.views}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin?slug=${article.slug}`} className="p-1.5 text-on-surface-variant hover:text-primary-fixed transition-colors rounded" title="Edit Article">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          {article.published && (() => {
                            const primaryTag = (article.tags && article.tags[0]?.slug) || "uncategorized";
                            return (
                              <Link href={`/${primaryTag}/${article.slug}`} className="p-1.5 text-on-surface-variant hover:text-primary-fixed transition-colors rounded" title="View Live">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </Link>
                            );
                          })()}
                          <button
                            disabled={isPending}
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded" title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
