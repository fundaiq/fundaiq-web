import Image from 'next/image';
import StockSearchNav from '@/components/ui/StockSearchNav';
import styles from '@/styles/HomePage.module.css';
import MobileBottomSearch from '@/components/ui/MobileBottomSearch';
import DemoGauge from '@/components/ui/DemoGauge';
export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Hero Banner - Clean and Focused */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          
          {/* Logo Icon */}
          <div className={styles.heroLogo}>
            <img 
              src="/icon.png" 
              alt="Funda-IQ Logo" 
              className={styles.heroLogoIcon}
            />
          </div>
          {/* Stock Search - The Main CTA */}
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <StockSearchNav className={styles.mainSearch} />
            </div>
            <p className={styles.searchHint}>
              Search any stock (e.g., TCS.NS, RELIANCE.NS, TATAMOTORS.NS)
            </p>
          </div>
          {/* Main Headline - Direct and Action-Focused */}
          <h1 className={styles.headline}>
            Find Your Stock's 
            <span className={styles.brandText}> True Value</span>
          </h1>

          {/* Simple Subheading */}
          <p className={styles.subheading}>
            Get instant DCF and EPS analysis with fair value calculations
          </p>

          
        </div>
      </section>

      {/* Gauge Meter Section - Interactive Demo */}
      <section className={styles.gaugeSection}>
        <div className={styles.gaugeContainer}>
          <div className={styles.demoHeader}>
            <h3 className={styles.demoTitle}>Live Valuation Example</h3>
            <p className={styles.demoSubtitle}>See how our analysis works with sample data</p>
          </div>
          
          {/* Demo Gauge with real component */}
          <DemoGauge 
            fairValue={2800} 
            currentPrice={2500} 
            epsValue={2750} 
          />
          
          <div className={styles.demoDetails}>
            <div className={styles.demoPrice}>
              <span className={styles.demoLabel}>Current Price:</span>
              <span className={styles.demoValue}>₹2,500</span>
            </div>
            <div className={styles.demoPrice}>
              <span className={styles.demoLabel}>Fair Value:</span>
              <span className={styles.demoValue}>₹2,800</span>
            </div>
          </div>
          
          <p className={styles.gaugeLabel}>
            This stock appears undervalued - search any stock to get real analysis!
          </p>
        </div>
      </section>

      {/* Quick Features - Just the Essentials */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>DCF Analysis</h3>
            <p className={styles.featureText}>Instant discounted cash flow calculations</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3 className={styles.featureTitle}>EPS Projections</h3>
            <p className={styles.featureText}>Earnings per share growth analysis</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Fair Value</h3>
            <p className={styles.featureText}>Quick valuation with visual indicators</p>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Search - Always visible on mobile */}
      <MobileBottomSearch />
    </div>
  );
}