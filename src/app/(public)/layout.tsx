import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";
import MobileMenuAutoClose from "@/components/MobileMenuAutoClose";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <>
      <MobileMenuAutoClose />
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm border-b border-outline-variant/20 transition-all duration-300">
        <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <Link className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-fixed dark:text-primary-fixed-dim scale-95 active:scale-90 transition-transform hover:backdrop-brightness-125" href="/">
              ArchAlgo
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/dsa">DSA</Link>
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/system-design">System Design</Link>
              <Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-label-sm text-label-sm" href="/topics/web3">Web3</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Actions Row */}
            <div className="hidden lg:flex items-center gap-4">
              <form action="/search" method="GET" className="relative group">
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
                    <div className="absolute right-0 top-9 bg-surface-container border border-outline-variant/30 rounded shadow-lg p-2.5 hidden group-hover:block w-40 hover:block z-50 space-y-1">
                      <p className="text-[10px] text-on-surface-variant font-label-sm px-2 mb-2 truncate">{user.name || "Signed In"}</p>
                      <Link href="/library" className="w-full text-left font-label-sm text-label-sm text-on-surface hover:text-primary-fixed hover:bg-surface-container-high transition-colors flex items-center gap-1.5 px-2 py-1.5 rounded">
                        <span className="material-symbols-outlined text-sm">bookmark</span> My Library
                      </Link>
                      <div className="border-t border-outline-variant/20 my-1"></div>
                      <LogoutButton variant="desktop" />
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

            {/* Responsive Hamburger Toggle trigger */}
            <label htmlFor="mobile-menu-toggle" className="lg:hidden flex items-center justify-center p-2 text-on-surface-variant hover:text-primary-fixed cursor-pointer rounded-lg transition-colors border border-outline-variant/20 hover:border-primary-fixed">
              <span className="material-symbols-outlined menu-icon text-[20px]">menu</span>
              <span className="material-symbols-outlined close-icon text-[20px] hidden">close</span>
            </label>
          </div>
        </div>

        {/* Overlay backdrop to close menu on click outside */}
        <label
          htmlFor="mobile-menu-toggle"
          className="hidden peer-checked:block lg:peer-checked:hidden fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-[1px] transition-opacity duration-300 cursor-default"
        />

        {/* Responsive Mobile Drawer Menu - Toggled seamlessly via CSS peer checkbox */}
        <div className="hidden peer-checked:block lg:peer-checked:hidden absolute top-16 left-0 right-0 z-40 bg-surface/95 dark:bg-surface/95 backdrop-blur-xl border-b border-outline-variant/20 p-6 space-y-6 shadow-xl animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <form action="/search" method="GET" className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input name="q" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-DEFAULT pl-9 pr-4 py-2.5 font-code-block text-on-surface focus:outline-none focus:border-surface-tint transition-all" placeholder="Search articles..." type="text" />
          </form>

          <div className="space-y-3">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Category Topics</div>
            <div className="flex flex-col gap-3 pl-1">
              <Link className="text-on-surface hover:text-primary-fixed font-label-sm text-sm" href="/topics/dsa">DSA</Link>
              <Link className="text-on-surface hover:text-primary-fixed font-label-sm text-sm" href="/topics/system-design">System Design</Link>
              <Link className="text-on-surface hover:text-primary-fixed font-label-sm text-sm" href="/topics/web3">Web3</Link>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/10 space-y-4">
            {user ? (
              <>
                {/* Premium Member Profile Card */}
                <div className="flex items-center gap-3 p-3 bg-surface-container-high/60 border border-outline-variant/20 rounded-xl">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User Profile"}
                      width={40}
                      height={40}
                      className="rounded-full border border-outline-variant/40 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-xs font-bold text-on-surface font-label-sm">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-on-surface text-sm truncate">{user.name || "Member"}</span>
                    <span className="text-[10px] text-on-surface-variant truncate">{user.email}</span>
                  </div>
                  <div className="ml-auto">
                    {user.role === "ADMIN" ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-primary-fixed/10 text-primary-fixed uppercase tracking-wider">Admin</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-surface-container-highest text-on-surface-variant uppercase tracking-wider">Member</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Link href="/library" className="w-full justify-center font-label-sm text-label-sm text-on-surface hover:text-primary-fixed transition-colors flex items-center gap-1.5 py-2.5 border border-outline-variant/30 hover:border-primary-fixed rounded bg-surface-container-high/40">
                    <span className="material-symbols-outlined text-sm">bookmark</span> My Library
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="w-full justify-center font-label-sm text-label-sm text-primary-fixed hover:text-primary-fixed-dim transition-colors flex items-center gap-1.5 py-2.5 border border-primary-fixed/30 hover:border-primary-fixed rounded bg-primary-fixed/5">
                      <span className="material-symbols-outlined text-sm">dashboard</span> Admin Dashboard
                    </Link>
                  )}

                  <LogoutButton variant="mobile" />

                  <button className="w-full justify-center font-label-sm text-label-sm bg-primary-container text-on-primary-fixed py-2.5 rounded font-bold hover:bg-surface-tint transition-colors">
                    Subscribe to Journal
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/api/auth/signin" className="w-full justify-center font-label-sm text-label-sm text-on-surface hover:text-primary-fixed transition-colors flex items-center gap-1.5 py-2.5 border border-outline-variant/30 hover:border-primary-fixed rounded bg-surface-container-high/40">
                  <span className="material-symbols-outlined text-sm">login</span> Sign In to Account
                </Link>

                <button className="w-full justify-center font-label-sm text-label-sm bg-primary-container text-on-primary-fixed py-2.5 rounded font-bold hover:bg-surface-tint transition-colors">
                  Subscribe to Journal
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>


      <main className="flex-grow pt-24 pb-section-gap px-1 sm:px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
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
              <li><Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/privacy-policy">Privacy</Link></li>
              <li><Link className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/terms-of-service">Terms</Link></li>
              <li><a className="text-on-surface-variant hover:text-primary-fixed transition-colors font-body-md text-body-md text-sm block" href="/feed.xml">RSS Feed</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
