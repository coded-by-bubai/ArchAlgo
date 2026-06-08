import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how ArchAlgo collects, uses, and safeguards your personal data, code snippets, and account information.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Header Section */}
      <header className="mb-12 border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/" className="text-xs text-primary-fixed hover:underline flex items-center gap-1 font-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Home
          </Link>
        </div>
        <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl text-on-surface mb-3">
          Privacy Policy
        </h1>
        <p className="text-on-surface-variant font-body-md text-sm sm:text-base">
          Last Updated: {lastUpdated} • Read how we collect, process, and protect your information.
        </p>
      </header>

      {/* Main Content inside a rich glassmorphic panel */}
      <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 sm:p-10 card-gradient space-y-8 text-on-surface-variant font-body-md leading-relaxed">
        
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">security</span> 1. Introduction & Overview
          </h2>
          <p>
            Welcome to <strong>ArchAlgo</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring you have a secure experience when visiting our platform. This Privacy Policy details how we collect, store, and safeguard your data, including personal account data, interaction statistics, and comment contributions, in full compliance with global standards.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">database</span> 2. Information We Collect
          </h2>
          <p>
            We collect information that you voluntarily provide to us when you register, sign in using third-party authenticators (such as Google or GitHub), or actively participate in our community discussion features:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Profiles:</strong> Your name, email address, profile avatar image, and unique system identifiers retrieved through OAuth services.
            </li>
            <li>
              <strong>Discussion Logs:</strong> Text contents, technical code snippets, and relational data trees linked directly to comments and nested comment replies you post.
            </li>
            <li>
              <strong>Usage Statistics:</strong> Standard log files including IP addresses, browser agents, page views, and interaction timestamps captured during your read cycles.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">hub</span> 3. How We Use Your Data
          </h2>
          <p>
            ArchAlgo processes gathered data solely to deliver a premium and high-performance technical reading experience:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To personalize your reading feed and track bookmarks or post favorites.</li>
            <li>To publish and display your contributions accurately inside nested article comments.</li>
            <li>To monitor platform stability, compute article read metrics, and optimize server-side database indices.</li>
            <li>To prevent malicious behavior, spam replies, and enforce platform security policies.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">cloud_queue</span> 4. Sharing & Data Disclosures
          </h2>
          <p>
            <strong>We do not sell, lease, trade, or share your personal data with third-party advertisers.</strong> Your information is only shared under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>With Your Consent:</strong> When you sign in using OAuth services (Google/GitHub), data is shared securely with our authenticator providers to verify your session.
            </li>
            <li>
              <strong>Database Hosting:</strong> To our secure cloud database providers (e.g. Neon, Vercel) strictly for hosting the website infrastructure.
            </li>
            <li>
              <strong>Legal Compliance:</strong> When required by law, subpoena, or to protect the safety and rights of ArchAlgo and its users.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">cookie</span> 5. Cookies & Local Storage
          </h2>
          <p>
            We use secure cookies and browser Local Storage to store persistent session state tokens. This enables fast, seamless sign-ins, preserves your bookmark preferences across article pages, and remembers your dark-mode themes without requiring constant backend authentication cycles.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">delete_forever</span> 6. Your Rights & Data Erasure
          </h2>
          <p>
            We respect your digital footprint and support standard privacy rights. You can contact us at any time to request a complete export of your personal information, or request the <strong>complete deletion of your account and all associated comments or replies</strong> from our active databases.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">mail</span> 7. Contact Information
          </h2>
          <p>
            If you have any questions about this Privacy Policy, your personal data, or data protection practices, please contact us by submitting an inquiry to our technical team or reaching out through standard editorial support channels.
          </p>
        </section>

      </div>
    </div>
  )
}
