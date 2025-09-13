// src/components/ui/HeroSection.tsx - Reusable Hero Component
'use client';

import React from 'react';
import Image from 'next/image';
import ExcelUploadSection from '@/components/ui/ExcelUploadSection';
import { Clock, Users, CheckCircle } from 'lucide-react';
import styles from '@/styles/HeroSection.module.css';

interface HeroSectionProps {
  variant?: 'homepage' | 'empty-state';
  showProcessSteps?: boolean;
  className?: string;
}

export default function HeroSection({ 
  variant = 'homepage', 
  showProcessSteps = false,
  className = '' 
}: HeroSectionProps) {
  return (
    <section className={`${styles.heroSection} ${styles[variant]} ${className}`}>
      <div className={styles.heroContent}>
        
        {/* Logo and Headline in Same Line */}
        <div className={styles.heroHeader}>
          <img 
            src="/icon.png" 
            alt="Funda-IQ Logo" 
            className={styles.heroLogoIcon}
          />
          <h1 className={styles.headline}>
            From Excel to Investment Decision <span className={styles.brandText}>in Minutes</span>
          </h1>
        </div>

        {/* Subheading */}
        <p className={styles.subheading}>
          Transform Screener.in data into professional valuation analysis
        </p>

        {/* Excel Upload Section */}
        <div className={styles.uploadSection}>
          <ExcelUploadSection className={styles.uploadComponent} />          
        </div>

        {/* Trust Indicators */}
        <div className={styles.trustIndicators}>
          <div className={styles.trustItem}>
            <Users size={16} />
            <span> Trusted by Professionals</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={16} />
            <span>Analysis in Minutes</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle size={16} />
            <span>Institutional Grade</span>
          </div>
        </div>

        {/* Optional Process Steps for Empty State */}
        {showProcessSteps && (
          <div className={styles.quickSteps}>
            <div className={styles.quickStepsTitle}>What happens next:</div>
            <div className={styles.quickStepsList}>
              <span className={styles.quickStep}>📊 Analyze trends</span>
              <span className={styles.quickStep}>💰 DCF valuation</span>
              <span className={styles.quickStep}>📈 EPS projections</span>
              <span className={styles.quickStep}>✅ Investment decision</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}