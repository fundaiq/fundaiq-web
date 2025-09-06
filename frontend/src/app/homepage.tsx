import styles from '@/styles/HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>

      {/* Hero Section with Animated Background */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          
          {/* Main Headline */}
          <h1 className={styles.headline}>
            Learn{" "}
            <span className={styles.brandText}>
              Smart Investing
            </span>
            <br />
            Made Simple
          </h1>

          {/* Subheading */}
          <p className={styles.subheading}>
            Master DCF models, learn valuation techniques, and build your financial knowledge with institutional-grade educational tools.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaContainer}>
            <a
              href="/report"
              className={styles.primaryCta}
            >
              🚀 Start Learning Free
            </a>            
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            How It Works
          </h2>
          <p className={styles.sectionSubtitle}>
            Learn professional financial analysis in three simple steps
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {/* Step 1 */}
          <div className={styles.stepCard}>
            <div className={`${styles.stepIcon} ${styles.stepIcon1}`}>
              🎯
            </div>
            <h3 className={styles.stepTitle}>
              1. Choose Your Path
            </h3>
            <p className={styles.stepDescription}>
              Start with beginner basics or dive into advanced topics like DCF modeling and valuation methods.
            </p>
          </div>

          {/* Step 2 */}
          <div className={styles.stepCard}>
            <div className={`${styles.stepIcon} ${styles.stepIcon2}`}>
              🔍
            </div>
            <h3 className={styles.stepTitle}>
              2. Practice
            </h3>
            <p className={styles.stepDescription}>
              Use real company data to practice valuation techniques and build your analytical skills with hands-on examples.
            </p>
          </div>

          {/* Step 3 */}
          <div className={styles.stepCard}>
            <div className={`${styles.stepIcon} ${styles.stepIcon3}`}>
              🎓
            </div>
            <h3 className={styles.stepTitle}>
              3. Master
            </h3>
            <p className={styles.stepDescription}>
              Apply your knowledge to make informed investment decisions with confidence and professional-grade analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className={styles.learningPathsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Choose Your Learning Path
          </h2>
          <p className={styles.sectionSubtitle}>
            Structured courses designed for every skill level
          </p>
        </div>

        <div className={styles.pathsGrid}>
          {/* Beginners Path */}
          <div className={styles.pathCard}>
            <div className={styles.pathBadge}>Beginner</div>
            <div className={styles.pathEmoji}>🌱</div>
            <h3 className={styles.pathTitle}>
              Investment Basics
            </h3>
            <p className={styles.pathDescription}>
              Start your journey with fundamental concepts, basic analysis, and essential investment principles.
            </p>
            <ul className={styles.pathFeatures}>
              <li>Stock market fundamentals</li>
              <li>Basic financial statements</li>
              <li>Risk and return concepts</li>
            </ul>
            <a href="/learn/beginners" className={styles.pathButton}>
              Start Learning
            </a>
          </div>

          {/* Intermediate Path */}
          <div className={styles.pathCard}>
            <div className={styles.pathBadge}>Intermediate</div>
            <div className={styles.pathEmoji}>⚡</div>
            <h3 className={styles.pathTitle}>
              Valuation Methods
            </h3>
            <p className={styles.pathDescription}>
              Master different valuation techniques and learn to analyze companies like a professional.
            </p>
            <ul className={styles.pathFeatures}>
              <li>DCF modeling techniques</li>
              <li>Multiple valuation methods</li>
              <li>Financial ratio analysis</li>
            </ul>
            <a href="/learn/ValuationMethods" className={styles.pathButton}>
              Explore Methods
            </a>
          </div>

          {/* Advanced Path */}
          <div className={styles.pathCard}>
            <div className={styles.pathBadge}>Advanced</div>
            <div className={styles.pathEmoji}>🎯</div>
            <h3 className={styles.pathTitle}>
              Legendary Investors
            </h3>
            <p className={styles.pathDescription}>
              Learn strategies and wisdom from history's most successful investors and fund managers.
            </p>
            <ul className={styles.pathFeatures}>
              <li>Warren Buffett's approach</li>
              <li>Value investing principles</li>
              <li>Investment philosophy</li>
            </ul>
            <a href="/learn/legendary-investors" className={styles.pathButton}>
              Learn from Masters
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything You Need to Learn Investing
          </h2>
          <p className={styles.sectionSubtitle}>
            Educational tools and resources to build your investment knowledge
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {/* DCF Valuation */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📊</div>
            <h3 className={styles.featureTitle}>
              DCF Valuation
            </h3>
            <p className={styles.featureDescription}>
              Learn to build sophisticated discounted cash flow models with step-by-step guidance and real examples.
            </p>
          </div>

          {/* EPS Projections */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📈</div>
            <h3 className={styles.featureTitle}>
              EPS Analysis
            </h3>
            <p className={styles.featureDescription}>
              Master earnings per share projections and understand how to analyze company growth potential.
            </p>
          </div>

          {/* Interactive Learning */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>🎯</div>
            <h3 className={styles.featureTitle}>
              Interactive Learning
            </h3>
            <p className={styles.featureDescription}>
              Practice with real market data and get instant feedback on your analysis and calculations.
            </p>
          </div>

          {/* Financial Health */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>🏥</div>
            <h3 className={styles.featureTitle}>
              Financial Health
            </h3>
            <p className={styles.featureDescription}>
              Learn to analyze profitability, leverage, growth, and balance sheet strength like a professional.
            </p>
          </div>

          {/* Learning Resources */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📚</div>
            <h3 className={styles.featureTitle}>
              Learning Resources
            </h3>
            <p className={styles.featureDescription}>
              Access guides, tutorials, and lessons from legendary investors to accelerate your learning journey.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📊</div>
            <h3 className={styles.featureTitle}>
              Track Progress
            </h3>
            <p className={styles.featureDescription}>
              Monitor your learning journey and see how your investment analysis skills improve over time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Ready to Become a Smarter Investor?
          </h2>
          <p className={styles.ctaSubtitle}>
            Join thousands learning professional investment analysis techniques.
          </p>
          
          <div className={styles.ctaButtons}>
            <a
              href="/learn"
              className={styles.ctaPrimary}
            >
              Start Learning
            </a>
            <a
              href="/report"
              className={styles.ctaSecondary}
            >
              Try Analysis Tool
            </a>
          </div>
          
          <p className={styles.ctaNote}>
            No credit card required • Free educational resources
          </p>
        </div>
      </section>
    </div>
  );
}