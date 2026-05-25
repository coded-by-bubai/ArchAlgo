import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm border-b border-outline-variant/20 transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <Link className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-fixed dark:text-primary-fixed-dim scale-95 active:scale-90 transition-transform hover:backdrop-brightness-125" href="/">
              ArchAlgo
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/dsa">DSA</Link>
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/system-design">System Design</Link>
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/web3">Web3</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <form action="/search" method="GET" className="hidden md:flex relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm group-focus-within:text-surface-tint transition-colors">search</span>
              <input name="q" className="bg-surface-container-low border border-outline-variant/30 rounded-DEFAULT pl-9 pr-4 py-1.5 font-code-block text-code-block text-on-surface focus:outline-none focus:border-surface-tint focus:ring-1 focus:ring-surface-tint transition-all w-48 focus:w-64" placeholder="Search articles..." type="text" />
            </form>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="font-label-sm text-label-sm text-primary-fixed hover:text-primary-fixed-dim transition-colors flex items-center gap-1 px-2.5 py-1 border border-primary-fixed/30 hover:border-primary-fixed rounded">
                    <span className="material-symbols-outlined text-sm">dashboard</span> Admin
                  </Link>
                )}
                <div className="group relative flex items-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User Profile"}
                      width={32}
                      height={32}
                      className="rounded-full border border-outline-variant/40 cursor-pointer object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-xs font-bold text-on-surface font-label-sm cursor-pointer">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {/* Subtle hover menu/dropdown or popover */}
                  <div className="absolute right-0 top-9 bg-surface-container border border-outline-variant/30 rounded shadow-lg p-2.5 hidden group-hover:block w-36 hover:block z-50">
                    <p className="text-[10px] text-on-surface-variant font-label-sm mb-2 truncate">{user.name || "Signed In"}</p>
                    <form action={async () => { "use server"; await signOut() }}>
                      <button type="submit" className="w-full text-left font-label-sm text-xs text-error hover:text-red-400 cursor-pointer flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/api/auth/signin" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-fixed transition-colors px-3 py-1.5 border border-outline-variant/30 hover:border-primary-fixed rounded-DEFAULT scale-95 active:scale-90">
                Sign In
              </Link>
            )}

            <button className="font-label-sm text-label-sm bg-primary-container text-on-primary-fixed px-4 py-1.5 rounded-DEFAULT font-bold hover:bg-surface-tint transition-colors scale-95 active:scale-90">
              Subscribe
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {children}
      </main>

      <footer className="w-full mt-section-gap border-t border-outline-variant/10 bg-surface-container-lowest dark:bg-surface-container-lowest">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter py-section-gap px-gutter max-w-container-max mx-auto flat no shadows">
          <div className="col-span-1 md:col-span-2">
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">ArchAlgo</div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md">
              Premium editorial content for software engineers. Master the complexities of modern system design and algorithms.
            </p>
            <div className="text-on-surface-variant text-sm opacity-80 hover:opacity-100 font-label-sm text-label-sm">
              © 2026 ArchAlgo Technical Editorial. All rights reserved.
            </div>
          </div>
          <div className="col-span-1">
            <h5 className="font-label-sm text-label-sm text-on-surface mb-4 uppercase tracking-wider">Topics</h5>
            <ul className="space-y-3">
              <li><Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/topics/dsa">DSA</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/topics/system-design">System Design</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/topics/web3">Web3</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h5 className="font-label-sm text-label-sm text-on-surface mb-4 uppercase tracking-wider">Legal</h5>
            <ul className="space-y-3">
              <li><a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="#">Privacy</a></li>
              <li><a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="#">Terms</a></li>
              <li><a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="#">RSS Feed</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
