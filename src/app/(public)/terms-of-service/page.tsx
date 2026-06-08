import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Understand your rights and responsibilities when reading technical articles, bookmarking content, or contributing comments on ArchAlgo.',
}

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="text-on-surface-variant font-body-md text-sm sm:text-base">
          Last Updated: {lastUpdated} • Please read our terms carefully before using the editorial journal platform.
        </p>
      </header>

      {/* Main Content inside a rich glassmorphic panel */}
      <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 sm:p-10 card-gradient space-y-8 text-on-surface-variant font-body-md leading-relaxed">
        
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">gavel</span> 1. Agreement to Terms
          </h2>
          <p>
            By accessing or using the <strong>ArchAlgo</strong> platform, you agree to be bound by these Terms of Service and our associated Privacy Policy. If you do not agree with any part of these terms, you must immediately cease all access, viewing, or writing activities on our site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">menu_book</span> 2. Intellectual Property Rights
          </h2>
          <p>
            Unless otherwise indicated, the ArchAlgo website, including all source code, design systems, illustrations, technical articles, algorithmic deep-dives, database schemas, and text structures (collectively, the &ldquo;Content&rdquo;), is our proprietary property or is licensed to us.
          </p>
          <p>
            You are granted a limited license to access, read, and bookmark the Content for your personal, non-commercial professional reference only. <strong>You may not republish, scrape, copy, or redistribute our technical content</strong> onto other sites, blogs, or AI training corpuses without our explicit prior written consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">person_pin</span> 3. User Accounts & Registrations
          </h2>
          <p>
            When you create an account on ArchAlgo using our OAuth authenticators (such as Google or GitHub), you agree to maintain the security of your account and take full responsibility for all activities occurring under your credentials. You agree to provide accurate registration info and keep it up-to-date. We reserve the right to suspend or terminate accounts that violate our community standards or pose security threats.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">forum</span> 4. Code of Conduct & Comment Rules
          </h2>
          <p>
            ArchAlgo features technical discussion, allowing users to submit comments, replies, and programming code blocks. By contributing to the platform, you agree to post content that is respectful, constructive, and relevant to the respective technical articles. You explicitly agree not to post:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any abusive, hateful, harassing, or defamatory language.</li>
            <li>Promotional advertisements, spam, referral codes, or affiliate links.</li>
            <li>Malicious code, exploits, or materials that infringe third-party intellectual property or copyrights.</li>
          </ul>
          <p>
            We retain absolute moderation discretion. Administrators reserve the right to edit, hide, or delete comments and replies without warning, and ban violating accounts immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">warning</span> 5. Disclaimer of Warranties
          </h2>
          <p>
            The technical articles, architectural guides, systems documentation, and code snippets published on ArchAlgo are provided <strong>&ldquo;as is&rdquo;</strong> for general educational and informational purposes only. While we strive to present accurate, high-performance, and secure code patterns, we make no representations or warranties of any kind regarding their applicability to production servers or software security.
          </p>
          <p>
            You assume full responsibility and risk for applying any code snippets or architectures found on this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">report_problem</span> 6. Limitation of Liability
          </h2>
          <p>
            In no event shall ArchAlgo, its developers, authors, or moderators be liable for any direct, indirect, incidental, consequential, or punitive damages, including but not limited to loss of profits, system downtime, data corruption, or server security breaches arising out of your use of or inability to use the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface font-headline-lg flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-primary-fixed">edit_calendar</span> 7. Changes to Terms
          </h2>
          <p>
            We reserve the right to revise or modify these Terms of Service at any time. When we make updates, we will update the &ldquo;Last Updated&rdquo; timestamp at the top of this page. Your continued use of the platform following the posting of changes constitutes your acceptance of the updated terms.
          </p>
        </section>

      </div>
    </div>
  )
}
