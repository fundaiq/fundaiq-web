"use client";

import styles from '@/styles/learn-page.module.css';

export default function FundamentalsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          <span className={styles.titleText}>Fundamental Concepts</span>
        </h1>
        <p className={styles.subtitle}>
          Key ratios and the 3 financial statements — decoded for beginners.
        </p>
      </header>

      <section>
        <h2>Core Ratios (Simple Meanings)</h2>
        <ul>
          <li><strong>P/E:</strong> Price you pay per ₹1 of earnings</li>
          <li><strong>P/B:</strong> Price vs book value (net assets)</li>
          <li><strong>Dividend Yield:</strong> Cash return relative to price</li>
          <li><strong>ROE/ROCE:</strong> Profitability on equity / capital employed</li>
          <li><strong>Debt-to-Equity:</strong> Balance-sheet leverage</li>
        </ul>
      </section>

      <section>
        <h2>The Three Statements</h2>
        <ul>
          <li><strong>Profit & Loss (P&amp;L):</strong> Revenue → Expenses = Profit</li>
          <li><strong>Balance Sheet:</strong> Assets = Equity + Liabilities</li>
          <li><strong>Cash Flow:</strong> Operating, Investing, Financing cash</li>
        </ul>
      </section>

      <section>
        <h2>Quality Signals</h2>
        <ul>
          <li>Consistent revenue & earnings growth</li>
          <li>Healthy margins, cash generation, sensible debt</li>
          <li>Management integrity & capital allocation</li>
        </ul>
      </section>
    </div>
  );
}
