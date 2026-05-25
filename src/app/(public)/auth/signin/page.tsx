import { signIn } from "@/auth"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center px-4 md:px-margin-desktop relative">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-fixed/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel border border-outline-variant/30 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden bg-surface-container-low/50">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-4xl text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              developer_board
            </span>
          </Link>
          <h1 className="font-headline-lg text-[28px] text-on-surface mb-2 tracking-tight">
            Welcome to ArchAlgo
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm">
            Sign in to join the technical discussion, publish articles, and engage with the community.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left flex gap-3 items-start animate-fade-in">
            <span className="material-symbols-outlined text-red-400 shrink-0">error</span>
            <div className="text-xs font-body-md leading-relaxed text-red-400">
              {error === "AdminBlocked" ? (
                <>
                  <strong>Administrative Block:</strong> Administrative logins are strictly restricted to the secure <Link href="/admin" className="underline hover:text-white font-bold">/admin gateway</Link>. Public login forms are user/author-only.
                </>
              ) : (
                <>
                  <strong>Sign In Failed:</strong> Invalid credentials or login attempt rejected. Please check your inputs and try again.
                </>
              )}
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-[#24292F] hover:bg-[#24292F]/90 text-white font-label-md py-3.5 px-4 rounded-xl transition-all shadow-sm border border-[#24292F]/20 cursor-pointer group"
            >
              <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" className="fill-current transition-transform group-hover:scale-110">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              Continue with GitHub
            </button>
          </form>

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-label-md py-3.5 px-4 rounded-xl transition-all shadow-sm border border-gray-200 cursor-pointer group"
            >
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="transition-transform group-hover:scale-110">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <div className="mt-10 text-center border-t border-outline-variant/10 pt-6">
          <p className="text-xs text-on-surface-variant font-body-md">
            By signing in, you agree to our <a href="#" className="underline hover:text-primary-fixed">Terms of Service</a> and <a href="#" className="underline hover:text-primary-fixed">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
