export default function ArticleDetailsLoading() {
  return (
    <div className="w-full py-10">
      {/* Cover Image Skeleton with Shimmer */}
      <div className="relative w-full h-36 sm:h-44 md:h-[180px] lg:h-[220px] mb-8 rounded-none sm:rounded-xl overflow-hidden border-y sm:border border-outline-variant/20 shadow-lg shimmer-skeleton"></div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Main Column */}
        <div className="col-span-1 lg:col-span-10 w-full">
          {/* Header Section */}
          <header className="mb-12 px-4 sm:px-0 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 rounded shimmer-skeleton"></div>
              <div className="h-4 w-24 rounded shimmer-skeleton"></div>
            </div>

            {/* Title bars */}
            <div className="space-y-3">
              <div className="h-8 sm:h-10 w-full rounded shimmer-skeleton"></div>
              <div className="h-8 sm:h-10 w-4/6 rounded shimmer-skeleton"></div>
            </div>

            {/* Author row placeholder */}
            <div className="flex items-center gap-4 py-6 border-y border-outline-variant/10">
              <div className="rounded-full w-12 h-12 shimmer-skeleton flex-shrink-0"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 w-32 rounded shimmer-skeleton"></div>
                <div className="h-3 w-48 rounded shimmer-skeleton"></div>
              </div>
            </div>
          </header>

          {/* Content Area Paragraphs Skeleton */}
          <div className="space-y-8 px-4 sm:px-0 mb-12">
            <div className="space-y-3">
              <div className="h-4 w-full rounded shimmer-skeleton"></div>
              <div className="h-4 w-full rounded shimmer-skeleton"></div>
              <div className="h-4 w-11/12 rounded shimmer-skeleton"></div>
              <div className="h-4 w-5/6 rounded shimmer-skeleton"></div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded shimmer-skeleton"></div>
              <div className="h-4 w-full rounded shimmer-skeleton"></div>
              <div className="h-4 w-3/4 rounded shimmer-skeleton"></div>
            </div>

            {/* Big blockquote / callout placeholder */}
            <div className="h-28 w-full rounded-r-lg border-l-2 border-primary-fixed/30 my-8 shimmer-skeleton"></div>

            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded shimmer-skeleton"></div>
              <div className="h-4 w-5/6 rounded shimmer-skeleton"></div>
            </div>
          </div>

          {/* Discussion Header Placeholder */}
          <section className="mt-16 pt-12 border-t border-outline-variant/10">
            <div className="h-7 w-36 rounded mb-8 shimmer-skeleton mx-4 sm:mx-0"></div>

            {/* Comment Form Skeleton */}
            <div className="flex gap-3 sm:gap-4 mb-10 px-4 sm:px-0">
              <div className="rounded-full w-8 h-8 sm:w-10 sm:h-10 shimmer-skeleton flex-shrink-0"></div>
              <div className="flex-1 h-28 border border-outline-variant/20 rounded-xl shimmer-skeleton"></div>
            </div>

            {/* Comments List Skeleton */}
            <div className="space-y-6 px-4 sm:px-0">
              <div className="flex gap-3 sm:gap-4">
                <div className="rounded-full w-8 h-8 sm:w-10 sm:h-10 shimmer-skeleton flex-shrink-0"></div>
                <div className="flex-1 border border-outline-variant/10 rounded-xl p-4 sm:p-5 space-y-3.5 shimmer-skeleton">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-white/5 rounded"></div>
                    <div className="h-3 w-16 bg-white/5 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-full bg-white/5 rounded"></div>
                    <div className="h-3.5 w-4/5 bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar Skeletons */}
        <aside className="hidden lg:block lg:col-span-2 relative">
          <div className="sticky top-32 space-y-6">
            {/* Table of Contents card placeholder */}
            <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 space-y-4">
              <div className="h-4 w-24 bg-white/5 rounded shimmer-skeleton"></div>
              <div className="space-y-3.5 pt-2">
                <div className="h-3 w-full bg-white/5 rounded shimmer-skeleton"></div>
                <div className="h-3 w-5/6 bg-white/5 rounded shimmer-skeleton"></div>
                <div className="h-3 w-4/6 bg-white/5 rounded shimmer-skeleton"></div>
              </div>
            </div>

            {/* Related articles card placeholder */}
            <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 space-y-4">
              <div className="h-4 w-28 bg-white/5 rounded shimmer-skeleton"></div>
              <div className="space-y-4.5 pt-2">
                <div className="space-y-1.5 pb-3.5 border-b border-outline-variant/10">
                  <div className="h-3 w-10 bg-white/5 rounded-sm shimmer-skeleton"></div>
                  <div className="h-3.5 w-full bg-white/5 rounded shimmer-skeleton"></div>
                  <div className="h-3 w-2/3 bg-white/5 rounded shimmer-skeleton"></div>
                  <div className="h-2 w-16 bg-white/5 rounded-sm shimmer-skeleton mt-1"></div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-12 bg-white/5 rounded-sm shimmer-skeleton"></div>
                  <div className="h-3.5 w-full bg-white/5 rounded shimmer-skeleton"></div>
                  <div className="h-3 w-3/4 bg-white/5 rounded shimmer-skeleton"></div>
                  <div className="h-2 w-16 bg-white/5 rounded-sm shimmer-skeleton mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
