"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function MobileMenuAutoCloseInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const toggle = document.getElementById("mobile-menu-toggle") as HTMLInputElement | null
    if (toggle) {
      toggle.checked = false
    }
  }, [pathname, searchParams])

  return null
}

export default function MobileMenuAutoClose() {
  return (
    <Suspense fallback={null}>
      <MobileMenuAutoCloseInner />
    </Suspense>
  )
}
