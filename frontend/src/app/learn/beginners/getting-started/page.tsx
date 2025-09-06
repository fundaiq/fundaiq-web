"use client";

import styles from '@/styles/learn-page.module.css';

export default function GettingStartedPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🚀</span>
          <span className={styles.titleText}>Getting Started</span>
        </h1>
        <p className={styles.subtitle}>
          Open your accounts, pick a broker, and understand market logistics.
        </p>
      </header>

      <section>
        <h2>Accounts You Need</h2>
        <ul>
          <li><strong>Demat Account:</strong> Stores your shares electronically</li>
          <li><strong>Trading Account:</strong> Places buy/sell orders via a broker</li>
          <li><strong>Bank Account:</strong> Funds your trades</li>
        </ul>
      </section>

      <section>
        <h2>Choosing a Broker</h2>
        <ul>
          <li><strong>Discount Broker:</strong> Low fees, DIY research</li>
          <li><strong>Full-Service:</strong> Advisory & reports, higher fees</li>
          <li>Check: brokerage, platform reliability, support, order types</li>
        </ul>
      </section>

      <section>
        <h2>Market Basics</h2>
        <ul>
          <li><strong>Symbols/Tickers:</strong> e.g., TCS.NS</li>
          <li><strong>Indices:</strong> Nifty 50, Sensex, sectoral indices</li>
          <li><strong>Timings:</strong> Pre-open, Regular (Mon–Fri), Post-close</li>
          <li><strong>Settlement:</strong> India follows T+1</li>
        </ul>
      </section>

      <section>
        <h2>First Steps</h2>
        <ul>
          <li>Start with small amount (e.g., ₹1,000–₹5,000)</li>
          <li>Use watchlists and paper trades to learn</li>
          <li>Document your reasons for every buy</li>
        </ul>
      </section>
    </div>
  );
}
