"use client";

import styles from '@/styles/learn-page.module.css';

export default function PracticalTipsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✅</span>
          <span className={styles.titleText}>Practical Tips</span>
        </h1>
        <p className={styles.subtitle}>
          Avoid common pitfalls, diversify smartly, and build emotional discipline.
        </p>
      </header>

      <section>
        <h2>Common Mistakes</h2>
        <ul>
          <li>Chasing tips and hype without research</li>
          <li>Panic selling during volatility</li>
          <li>Concentrating in one sector/stock</li>
          <li>Ignoring fees, taxes, and liquidity</li>
        </ul>
      </section>

      <section>
        <h2>Diversification & Sizing</h2>
        <ul>
          <li>Own multiple sectors & market caps</li>
          <li>Position size based on conviction and risk</li>
        </ul>
      </section>

      <section>
        <h2>Build a Simple Process</h2>
        <ul>
          <li>Watchlist → Research → Thesis → Buy → Review</li>
          <li>Write your thesis in 3–5 points (why buy, risks, valuation)</li>
          <li>Set review triggers (earnings, guidance changes, red flags)</li>
        </ul>
      </section>

      <section>
        <h2>Mindset & Habits</h2>
        <ul>
          <li>Long-term horizon beats timing obsession</li>
          <li>Keep a journal of decisions and learnings</li>
          <li>Use SIPs/DCA to remove emotion</li>
        </ul>
      </section>
    </div>
  );
}
