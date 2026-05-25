import { auth, signIn, signOut } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user

  // Strict Server-Side Auth Check: Block any user who is not signed in or not an ADMIN
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center px-4 relative font-body-md">
        {/* Deep red glowing background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel border border-red-500/20 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden bg-surface-container-low/50">
          {/* Top warning light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20"></div>

          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <h1 className="font-headline-lg text-[26px] text-on-surface mb-2 tracking-tight">
              ArchAlgo Admin Gateway
            </h1>
            <p className="font-body-md text-on-surface-variant text-xs leading-relaxed max-w-xs mx-auto">
              Private access point for editorial administrators. Administrative members must sign in with their secure credentials.
            </p>
          </div>

          {/* Conditional Role Block (Authenticated as normal user but unauthorized) */}
          {user ? (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
              <div className="flex items-center gap-1.5 mb-1.5 text-red-400 font-label-sm font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">lock</span>
                Access Blocked
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                You are currently signed in as <strong className="text-on-surface">{user.email}</strong>, which lacks administrative authority.
              </p>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/admin" })
                }}
              >
                <button
                  type="submit"
                  className="w-full text-center py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-colors font-bold font-label-sm cursor-pointer border border-red-500/30"
                >
                  Sign Out & Try Again
                </button>
              </form>
            </div>
          ) : (
            /* Guest / Unauthenticated: Present Secure Email & Password Admin Credentials Login */
            <div className="space-y-4 mb-6">
              <form
                action={async (formData) => {
                  "use server"
                  const email = formData.get("email") as string
                  const password = formData.get("password") as string

                  try {
                    await signIn("credentials", { email, password, redirectTo: "/admin" })
                  } catch (err: any) {
                    if (err && (err.message === "NEXT_REDIRECT" || (err.digest && err.digest.startsWith("NEXT_REDIRECT")))) {
                      throw err
                    }
                    return redirect("/admin?error=AdminFailed")
                  }
                }}
                className="space-y-4"
              >
                {/* Email Address */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider pl-1">Admin Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">mail</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="admin-email@archalgo.com"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-outline-variant"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider pl-1">Secret Key / Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">lock</span>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-outline-variant"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-label-sm font-bold text-sm py-3.5 px-4 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
                >
                  <span className="material-symbols-outlined text-lg">vpn_key</span>
                  Access Administrative Console
                </button>
              </form>
            </div>
          )}

          <div className="pt-6 border-t border-outline-variant/10 text-center">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-primary-fixed transition-colors inline-flex items-center gap-1.5 font-label-sm"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to ArchAlgo Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authorized Admin access
  return <>{children}</>
}
