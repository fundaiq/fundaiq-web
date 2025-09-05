// app/terms/page.tsx
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface-secondary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-xl shadow-theme p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">Terms of Service</h1>
            <p className="text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">1. Introduction</h2>
              <p className="text-secondary mb-4">
                Welcome to Funda-IQ ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our investment analysis and portfolio management platform ("Service") operated by Funda-IQ.
              </p>
              <p className="text-secondary">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">2. Service Description</h2>
              <p className="text-secondary mb-4">
                Funda-IQ provides:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Investment analysis tools including DCF (Discounted Cash Flow) and EPS (Earnings Per Share) valuation models</li>
                <li>Portfolio tracking and management capabilities</li>
                <li>Financial data analysis and reporting</li>
                <li>Market data and company information visualization</li>
                <li>Investment research and educational content</li>
              </ul>
            </section>

            {/* Investment Disclaimer */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">3. Investment Disclaimer</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  ⚠️ IMPORTANT: Funda-IQ is an educational and analytical tool only.
                </p>
              </div>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li><strong>Not Financial Advice:</strong> Our Service does not provide investment advice, recommendations, or suggestions to buy or sell securities</li>
                <li><strong>No Guarantees:</strong> Past performance does not guarantee future results. All investments carry risk of loss</li>
                <li><strong>Your Responsibility:</strong> You are solely responsible for your investment decisions</li>
                <li><strong>Consult Professionals:</strong> Always consult with qualified financial advisors before making investment decisions</li>
                <li><strong>Data Accuracy:</strong> While we strive for accuracy, we cannot guarantee the completeness or accuracy of financial data</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">4. User Accounts</h2>
              <p className="text-secondary mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized account use</li>
              </ul>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">5. Prohibited Uses</h2>
              <p className="text-secondary mb-4">You may not use our Service:</p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To transmit or procure the sending of any advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate the company, employees, another user, or any other person or entity</li>
                <li>To engage in any automated use of the system or collect usernames, passwords, email addresses, or other data</li>
                <li>To interfere with, disrupt, or create an undue burden on the Service or networks connected to the Service</li>
              </ul>
            </section>

            {/* Data and Privacy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">6. Data and Privacy</h2>
              <p className="text-secondary mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>We collect only necessary information to provide our services</li>
                <li>Your portfolio data remains private and secure</li>
                <li>We do not sell or share your personal investment information</li>
                <li>You retain ownership of your data and can export or delete it at any time</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">7. Intellectual Property</h2>
              <p className="text-secondary mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Funda-IQ and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">8. Limitation of Liability</h2>
              <p className="text-secondary mb-4">
                In no event shall Funda-IQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">9. Termination</h2>
              <p className="text-secondary mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-secondary">
                If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">10. Changes to Terms</h2>
              <p className="text-secondary mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">11. Governing Law</h2>
              <p className="text-secondary mb-4">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Funda-IQ operates, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">12. Contact Information</h2>
              <p className="text-secondary mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                  Email: fundaiq@outlook.com<br />
                  Website: https://fundaiq.com<br />
                  
                </p>
              </div>
            </section>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8 pt-8 border-t border-default">
            <a
              href="/"
              className="inline-flex items-center text-accent hover:underline"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}