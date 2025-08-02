"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="p-6">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to ArtHouse
        </Link>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
            <p className="text-lg text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
              <p className="text-zinc-300 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, subscribe to our
                newsletter, or contact us. This may include your name, email address, and any other information you
                choose to provide.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
              <p className="text-zinc-300 leading-relaxed">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Send you newsletters and updates about ArtHouse</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, and events</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Information Sharing</h2>
              <p className="text-zinc-300 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this privacy policy. We may share your information with trusted service
                providers who assist us in operating our website and conducting our business.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Data Security</h2>
              <p className="text-zinc-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet is
                100% secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Your Rights</h2>
              <p className="text-zinc-300 leading-relaxed">
                You have the right to access, update, or delete your personal information. You may also unsubscribe from
                our newsletter at any time by clicking the unsubscribe link in our emails or contacting us directly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Cookies</h2>
              <p className="text-zinc-300 leading-relaxed">
                We use cookies and similar technologies to enhance your experience on our website. You can control
                cookies through your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Changes to This Policy</h2>
              <p className="text-zinc-300 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the
                new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you have any questions about this privacy policy, please{" "}
                <Link href="/contact" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  contact us
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 mt-16">
        <div className="flex justify-center space-x-6 text-sm text-zinc-500">
          <Link href="/newsletter" className="hover:text-white transition-colors duration-300">
            Newsletter
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition-colors duration-300">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-white transition-colors duration-300">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  )
}
