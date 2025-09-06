"use client";

import styles from '@/styles/learn-page.module.css';

export default function UnderstandingStocksPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🏢</span>
          <span className={styles.titleText}>Understanding Stocks</span>
        </h1>
        <p className={styles.subtitle}>
          Shares, IPOs, dividends, and market-cap buckets — explained simply.
        </p>
      </header>

      <section>
        <h2>What is a Share?</h2>
        <p>
          A share is a slice of ownership in a company. As an owner, you benefit when profits grow and
          the market values the company higher over time.
        </p>
      </section>

      <section>
        <h2>Ways You Earn</h2>
        <ul>
          <li><strong>Capital Gains:</strong> Share price goes up over time</li>
          <li><strong>Dividends:</strong> Company distributes part of its profits</li>
        </ul>
      </section>

      <section>
        <h2>IPOs in a Nutshell</h2>
        <ul>
          <li>Company raises money and lists shares on an exchange</li>
          <li>Retail investors can apply within the price band</li>
          <li>Allotment depends on demand/subscriptions</li>
        </ul>
      </section>

      <section>
        <h2>Market-Cap Categories</h2>
        <ul>
          <li><strong>Large Cap:</strong> Stable, established, lower volatility</li>
          <li><strong>Mid Cap:</strong> Balance of growth & risk</li>
          <li><strong>Small/Micro Cap:</strong> High growth potential, higher risk</li>
        </ul>
      </section>

      <section>
        <h2>Share Classes</h2>
        <ul>
          <li><strong>Common Equity:</strong> Voting rights, residual claims</li>
          <li><strong>Preferred:</strong> Priority dividends, limited voting</li>
        </ul>
      </section>
    </div>
  );
}
