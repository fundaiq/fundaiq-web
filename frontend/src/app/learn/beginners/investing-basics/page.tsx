"use client";

import styles from '@/styles/learn-page.module.css';

export default function InvestingBasicsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>💡</span>
          <span className={styles.titleText}>Basics of Investing</span>
        </h1>
        <p className={styles.subtitle}>
          Investing vs trading, compounding, and the risk–return trade-off.
        </p>
      </header>

      <section>
        <h2>Investing vs Trading</h2>
        <ul>
          <li><strong>Investing:</strong> Long-term ownership based on fundamentals</li>
          <li><strong>Trading:</strong> Short-term price moves and technicals</li>
        </ul>
      </section>

      <section>
        <h2>The Power of Compounding</h2>
        <p>
          Reinvesting gains creates growth-on-growth. Starting early and staying invested
          matters more than timing perfection.
        </p>
      </section>

      <section>
        <h2>Risk vs Return</h2>
        <ul>
          <li>Higher potential returns usually come with higher volatility</li>
          <li>Match investments to your risk capacity and time horizon</li>
        </ul>
      </section>

      <section>
        <h2>Asset Allocation</h2>
        <ul>
          <li>Diversify across equity, debt, and cash as per goals</li>
          <li>Rebalance periodically to maintain target mix</li>
        </ul>
      </section>
    </div>
  );
}
