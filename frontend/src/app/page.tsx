// src/app/homepage.tsx - Updated to use HeroSection component
import React from 'react';
import HeroSection from '@/components/ui/HeroSection';
import styles from '@/styles/HomePage.module.css';
import MobileBottomSearch from '@/components/ui/MobileBottomSearch';
import DemoGauge from '@/components/ui/DemoGauge';
import { 
  Download, 
  Upload, 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  Target,
  FileSpreadsheet,
  Play,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className={styles.HomePageContainer}>
      {/* Reusable Hero Section */}
      <HeroSection variant="homepage" />
      {/* Demo Gauge Section - Using your existing component */}
      <section className={styles.gaugeSection}>
        <div className={styles.gaugeContainer}>
          <div className={styles.demoHeader}>
            <h3 className={styles.demoTitle}>Live Valuation Example</h3>
            <p className={styles.demoSubtitle}>See how our analysis works with sample company data</p>
          </div>
          
          {/* Your actual DemoGauge component */}
          <DemoGauge 
            fairValue={2800} 
            currentPrice={2500} 
            epsValue={2750} 
          />
          
          <p className={styles.gaugeLabel}>
            This stock appears undervalued - upload your Excel file to get real analysis!
          </p>

          <div className={styles.demoCTA}>
            <button className={styles.demoButton}>
              <Play size={18} />
              Try Demo Analysis
            </button>
          </div>
        </div>
      </section>
      {/* Process Flow Section */}
      <section className={styles.processSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Simple 5-Step Process</h2>
          <p className={styles.sectionSubtitle}>
            From raw data to investment decision - all enabling you to make informed analysis with detailed insights
          </p>
        </div>

        <div className={styles.processGrid}>
          {/* Step 1 */}
          <div className={styles.processCard}>
            <div className={styles.stepNumber} data-step="1">1</div>
            <div className={styles.processIcon} style={{ backgroundColor: '#667eea20', color: '#667eea' }}>
              <Download size={24} />
            </div>
            <h3 className={styles.processTitle}>Download Excel from Screener.in</h3>
            <p className={styles.processDescription}>
              Get your company's financial data in Excel format from Screener.in
            </p>
          </div>

          {/* Step 2 */}
          <div className={styles.processCard}>
            <div className={styles.stepNumber} data-step="2">2</div>
            <div className={styles.processIcon} style={{ backgroundColor: '#764ba220', color: '#764ba2' }}>
              <Upload size={24} />
            </div>
            <h3 className={styles.processTitle}>Upload Excel File Here</h3>
            <p className={styles.processDescription}>
              Simply drag and drop or browse your Excel file to our secure platform
            </p>
          </div>

          {/* Step 3 */}
          <div className={styles.processCard}>
            <div className={styles.stepNumber} data-step="3">3</div>
            <div className={styles.processIcon} style={{ backgroundColor: '#f093fb20', color: '#f093fb' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className={styles.processTitle}>Analyze Financial Trends</h3>
            <p className={styles.processDescription}>
              View interactive charts showing financial performance trends and patterns
            </p>
          </div>

          {/* Step 4 */}
          <div className={styles.processCard}>
            <div className={styles.stepNumber} data-step="4">4</div>
            <div className={styles.processIcon} style={{ backgroundColor: '#f5576c20', color: '#f5576c' }}>
              <Calculator size={24} />
            </div>
            <h3 className={styles.processTitle}>Calculate DCF Fair Value</h3>
            <p className={styles.processDescription}>
              Get professional DCF analysis with controllable assumptions and sensitivity results
            </p>
          </div>

          {/* Step 5 */}
          <div className={styles.processCard}>
            <div className={styles.stepNumber} data-step="5">5</div>
            <div className={styles.processIcon} style={{ backgroundColor: '#4facfe20', color: '#4facfe' }}>
              <TrendingUp size={24} />
            </div>
            <h3 className={styles.processTitle}>EPS Projections & Fair Values</h3>
            <p className={styles.processDescription}>
              Calculate earnings projections and see comprehensive sensitivity analysis
            </p>
          </div>
        </div>
      </section>

      

      {/* Enhanced Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose FundaIQ?</h2>
        </div>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Minutes, Not Hours</h3>
            <p className={styles.featureText}>
              Get comprehensive financial analysis in minutes instead of spending hours building models manually
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Professional Grade</h3>
            <p className={styles.featureText}>
              Institutional-quality DCF models and EPS projections used by professional analysts
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔧</div>
            <h3 className={styles.featureTitle}>Controllable Assumptions</h3>
            <p className={styles.featureText}>
              Adjust key assumptions and see real-time sensitivity analysis to test different scenarios
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✅</div>
            <h3 className={styles.featureTitle}>Decision Ready</h3>
            <p className={styles.featureText}>
              Clear buy/hold/sell indicators with detailed analysis to support your investment decisions
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        </div>

        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>Is my financial data secure?</h3>
            <p className={styles.faqAnswer}>
              Yes, all data is processed securely and never stored permanently. Your Excel files are analyzed 
              in real-time and deleted immediately after processing.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>What Excel format does it support?</h3>
            <p className={styles.faqAnswer}>
              We support standard Screener.in Excel exports (.xlsx and .xls formats). The tool automatically 
              recognizes the data structure and processes it accordingly.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>Is this investment advice?</h3>
            <p className={styles.faqAnswer}>
              No, FundaIQ is an educational and analytical tool. All analysis is for informational purposes 
              only and should not be considered as investment advice.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>How accurate are the DCF calculations?</h3>
            <p className={styles.faqAnswer}>
              Our DCF models use industry-standard methodologies. However, valuations depend on assumptions 
              and market conditions. We provide sensitivity analysis to help you understand different scenarios.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Analyze Your Investment?</h2>
          <p className={styles.ctaSubtitle}>
            Upload your Excel file now and get professional-grade financial analysis in minutes
          </p>
          <button className={styles.ctaButton}>
            <Upload size={20} />
            Start Analysis Now
          </button>
        </div>
      </section>

      {/* Mobile Bottom Upload - Always visible on mobile */}
      <MobileBottomSearch />
    </div>
  );
}