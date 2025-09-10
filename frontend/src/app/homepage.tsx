import Image from 'next/image';
import StockSearchNav from '@/components/ui/StockSearchNav';
import styles from '@/styles/HomePage.module.css';
import MobileBottomSearch from '@/components/ui/MobileBottomSearch';

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* Hero Section - Minimal and Focused */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          
          {/* Main Headline - Direct and Action-Focused */}
          <h1 className={styles.headline}>
            Find Your Stock's 
            <span className={styles.brandText}> True Value</span>
          </h1>

          {/* Simple Subheading */}
          <p className={styles.subheading}>
            Get instant DCF and EPS analysis with fair value calculations
          </p>

          {/* Stock Search - The Main CTA */}
          <div className={styles.searchContainer}>
            <StockSearchNav className={styles.mainSearch} />
            <p className={styles.searchHint}>
              Search any stock (e.g., AAPL, TSLA, GOOGL)
            </p>
          </div>
        </div>

        {/* Visual Indicator - Gauge Meter */}
        <div className={styles.gaugeContainer}>
          <Image
            src="/GuageMeter.png"
            alt="Fair Value Gauge"
            width={300}
            height={200}
            className={styles.gaugeImage}
            priority
          />
          <p className={styles.gaugeLabel}>
            See if your stock is undervalued, fairly valued, or overvalued
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