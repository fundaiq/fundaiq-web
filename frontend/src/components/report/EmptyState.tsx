'use client';

import { Search, TrendingUp, BarChart3, Calculator, ArrowUp, Sparkles } from 'lucide-react';
import styles from '@/styles/emptyState.module.css';

export default function EmptyState() {
  const features = [
    {
      icon: Calculator,
      title: "DCF Valuation",
      description: "Advanced discounted cash flow analysis with multiple scenarios and sensitivity testing"
    },
    {
      icon: BarChart3,
      title: "Financial Health",
      description: "Comprehensive financial metrics analysis including profitability, liquidity, and solvency ratios"
    },
    {
      icon: TrendingUp,
      title: "Stock Performance",
      description: "Real-time price charts, historical performance data, and market trend analysis"
    }
  ];

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus on search input after scroll
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Find a stock"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 500);
  };

  return (
    <div className={styles.emptyStateContainer}>
      {/* Main Illustration */}
      <div className={styles.illustrationContainer}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoCircle}>
            <img 
              src="/icon.png" 
              alt="Funda-IQ" 
              className={styles.logo}
            />
          </div>
          <div className={styles.statusBadge}>
            <Sparkles className={styles.statusIcon} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentSection}>
        <h1 className={styles.title}>
          Ready to Analyze Your Next Investment?
        </h1>
        
        <p className={styles.subtitle}>
          Get comprehensive financial analysis, valuation models, and investment insights 
          for any stock. Start by searching for a company above.
        </p>
        
        <button 
          onClick={scrollToSearch}
          className={styles.ctaButton}
          aria-label="Go to search"
        >
          <Search className={styles.ctaIcon} />
          Find a Stock to Analyze
        </button>
      </div>

      {/* Features Grid */}
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <feature.icon size={24} />
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Additional CTA */}
      <div className={styles.contentSection}>
        <p className={styles.additionalInfo}>
          ✨ Professional-grade financial analysis • 📊 Real-time data • 🎯 Investment insights
        </p>
      </div>
    </div>
  );
}