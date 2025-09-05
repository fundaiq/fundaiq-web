// app/privacy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-secondary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-xl shadow-theme p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">Privacy Policy</h1>
            <p className="text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">1. Introduction</h2>
              <p className="text-secondary mb-4">
                At Funda-IQ ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our investment analysis and portfolio management platform.
              </p>
              <p className="text-secondary">
                By using our Service, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">2. Information We Collect</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-3">2.1 Personal Information</h3>
                <p className="text-secondary mb-3">We collect information you provide directly to us:</p>
                <ul className="list-disc pl-6 text-secondary space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
                  <li><strong>Contact Information:</strong> Email address for communications and support</li>
                  <li><strong>Preferences:</strong> Timezone, display settings, and notification preferences</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-3">2.2 Financial and Portfolio Data</h3>
                <ul className="list-disc pl-6 text-secondary space-y-2">
                  <li><strong>Portfolio Information:</strong> Investment holdings, transactions, portfolio names</li>
                  <li><strong>Analysis Data:</strong> Financial models, assumptions, and calculations you create</li>
                  <li><strong>Market Data Usage:</strong> Which stocks, sectors, or companies you analyze</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-3">2.3 Technical Information</h3>
                <ul className="list-disc pl-6 text-secondary space-y-2">
                  <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                  <li><strong>Log Data:</strong> IP address, access times, and technical error logs</li>
                  <li><strong>Cookies:</strong> Authentication cookies and preferences (no tracking cookies)</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="text-secondary mb-4">We use the information we collect to:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Service Provision</h4>
                  <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                    <li>• Provide and maintain our platform</li>
                    <li>• Process and store your portfolio data</li>
                    <li>• Generate investment analysis reports</li>
                    <li>• Enable data export and import features</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Communication</h4>
                  <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                    <li>• Send account-related notifications</li>
                    <li>• Provide customer support</li>
                    <li>• Send password reset emails</li>
                    <li>• Share important service updates</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Improvement</h4>
                  <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1">
                    <li>• Analyze platform usage patterns</li>
                    <li>• Improve our features and services</li>
                    <li>• Fix technical issues and bugs</li>
                    <li>• Develop new analytical tools</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Security & Legal</h4>
                  <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                    <li>• Protect against fraud and abuse</li>
                    <li>• Ensure platform security</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Enforce our Terms of Service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">4. Information Sharing and Disclosure</h2>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  🔒 We do NOT sell, trade, or rent your personal information to third parties.
                </p>
              </div>
              
              <p className="text-secondary mb-4">We may share your information only in these limited circumstances:</p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (hosting, email delivery, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfer:</strong> In connection with a merger, acquisition, or sale of assets (with user notification)</li>
                <li><strong>Consent:</strong> When you explicitly authorize us to share specific information</li>
                <li><strong>Safety:</strong> To protect the rights, property, or safety of Funda-IQ, our users, or others</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">5. Data Security</h2>
              <p className="text-secondary mb-4">
                We implement robust security measures to protect your information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">Technical Safeguards</h4>
                  <ul className="text-secondary text-sm space-y-1">
                    <li>• HTTPS encryption for all data transmission</li>
                    <li>• Secure password hashing (bcrypt)</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Secure database storage with encryption</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">Access Controls</h4>
                  <ul className="text-secondary text-sm space-y-1">
                    <li>• Multi-factor authentication support</li>
                    <li>• Session management and timeout</li>
                    <li>• Limited employee access to user data</li>
                    <li>• Regular access reviews and monitoring</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">6. Your Rights and Choices</h2>
              <p className="text-secondary mb-4">You have the following rights regarding your personal information:</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 mt-1">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Access and Portability</h4>
                    <p className="text-secondary text-sm">View and export your personal data and portfolio information at any time</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Correction</h4>
                    <p className="text-secondary text-sm">Update or correct your personal information through your account settings</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3 mt-1">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Deletion</h4>
                    <p className="text-secondary text-sm">Request deletion of your account and associated data (some data may be retained for legal purposes)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">7. Cookies and Tracking</h2>
              <p className="text-secondary mb-4">
                We use minimal cookies strictly necessary for platform functionality:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li><strong>Authentication Cookies:</strong> To keep you logged in securely</li>
                <li><strong>Preference Cookies:</strong> To remember your settings (theme, timezone)</li>
                <li><strong>Security Cookies:</strong> To protect against cross-site request forgery</li>
              </ul>
              <p className="text-secondary mt-4">
                <strong>We do NOT use:</strong> Advertising cookies, tracking pixels, or third-party analytics that compromise your privacy.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">8. Data Retention</h2>
              <p className="text-secondary mb-4">We retain your information for as long as necessary to:</p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services (in anonymized form)</li>
              </ul>
              <p className="text-secondary mt-4">
                When you delete your account, we will delete your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">9. International Data Transfers</h2>
              <p className="text-secondary mb-4">
                Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">10. Children's Privacy</h2>
              <p className="text-secondary mb-4">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-secondary mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">12. Contact Us</h2>
              <p className="text-secondary mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Privacy Officer</strong><br />
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