// src/components/report/EmptyState.tsx - Updated to use HeroSection component
'use client';

import React from 'react';
import HeroSection from '@/components/ui/HeroSection';
import { 
  Download, 
  Upload, 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  FileSpreadsheet
} from 'lucide-react';
import styles from '@/styles/emptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.emptyStateContainer}>
      {/* Reusable Hero Section with process steps */}
      <HeroSection 
        variant="empty-state" 
        showProcessSteps={true}
      />

      {/* Quick Process Overview */}
      <div className={styles.processSection}>
        <h2 className={styles.processTitle}>How It Works</h2>
        <div className={styles.processGrid}>
          {[
            {
              step: 1,
              icon: <Download size={20} />,
              title: "Download from Screener.in",
              description: "Get financial data in Excel format"
            },
            {
              step: 2,
              icon: <Upload size={20} />,
              title: "Upload Excel File",
              description: "Drag & drop your file here"
            },
            {
              step: 3,
              icon: <BarChart3 size={20} />,
              title: "Analyze Trends",
              description: "View interactive charts"
            },
            {
              step: 4,
              icon: <Calculator size={20} />,
              title: "DCF Analysis",
              description: "Get fair value calculations"
            },
            {
              step: 5,
              icon: <TrendingUp size={20} />,
              title: "EPS Projections",
              description: "See sensitivity analysis"
            }
          ].map((item, index) => (
            <div key={index} className={styles.processCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <div className={styles.processIcon}>
                {item.icon}
              </div>
              <h3 className={styles.processCardTitle}>{item.title}</h3>
              <p className={styles.processCardDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why Choose FundaIQ?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Minutes, Not Hours</h3>
            <p className={styles.featureDescription}>
              Get comprehensive analysis in minutes instead of hours
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Professional Grade</h3>
            <p className={styles.featureDescription}>
              Institutional-quality DCF models and EPS projections
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔧</div>
            <h3 className={styles.featureTitle}>Controllable Assumptions</h3>
            <p className={styles.featureDescription}>
              Adjust assumptions and see real-time sensitivity analysis
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✅</div>
            <h3 className={styles.featureTitle}>Decision Ready</h3>
            <p className={styles.featureDescription}>
              Clear indicators to support your investment decisions
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to Start?</h2>
        <p className={styles.ctaDescription}>
          Upload your Excel file now and get professional-grade financial analysis
        </p>
        <button className={styles.ctaButton}>
          <FileSpreadsheet size={18} />
          Choose Excel File
        </button>
      </div>

      {/* Additional Info */}
      <div className={styles.additionalInfo}>
        <p>
          <strong>Secure & Private:</strong> Your data is processed in real-time and never stored permanently.
        </p>
        <p>
          <strong>Educational Tool:</strong> For analysis purposes only, not investment advice.
        </p>
      </div>
    </div>
  );
}