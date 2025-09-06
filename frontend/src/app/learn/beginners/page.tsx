// app/learn/beginners/page.tsx
"use client";

import styles from '@/styles/learn-page.module.css';

const topics = [
  {
    title: "Introduction & Basics",
    desc: "What the stock market is, how it works, and who the key players are.",
    href: "/learn/beginners/introduction",
    icon: "📖",
    colorClass: "cardBeginners",
  },
  {
    title: "Getting Started",
    desc: "Open a demat/trading account, pick a broker, and understand market timings.",
    href: "/learn/beginners/getting-started",
    icon: "🚀",
    colorClass: "cardFaq",
  },
  {
    title: "Understanding Stocks",
    desc: "Shares, IPOs, dividends, and types of market caps explained simply.",
    href: "/learn/beginners/stocks",
    icon: "🏢",
    colorClass: "cardValuation",
  },
  {
    title: "Basics of Investing",
    desc: "Investing vs trading, power of compounding, and risk vs return.",
    href: "/learn/beginners/investing-basics",
    icon: "💡",
    colorClass: "cardMacro",
  },
  {
    title: "Fundamental Concepts",
    desc: "PE, PB, dividend yield, and intro to financial statements.",
    href: "/learn/beginners/fundamentals",
    icon: "📊",
    colorClass: "cardLegendary",
  },
  {
    title: "Practical Tips",
    desc: "Common mistakes to avoid, diversification, and emotional discipline.",
    href: "/learn/beginners/practical-tips",
    icon: "✅",
    colorClass: "cardFaq",
  },
];

export default function BeginnersGuidePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>📘</span>
          <span className={styles.titleText}>Beginners Guide to Stock Market</span>
        </h1>
        <p className={styles.subtitle}>
          Kickstart your investing journey with these step-by-step guides.
        </p>
      </header>

      <section className={styles.cardsGrid}>
        {topics.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`${styles.card} ${styles[t.colorClass]}`}
          >
            <div className={styles.cardIcon}>{t.icon}</div>
            <h3 className={styles.cardTitle}>{t.title}</h3>
            <p className={styles.cardDescription}>{t.desc}</p>
            <div className={styles.cardAction}>Explore →</div>
          </a>
        ))}
      </section>
    </div>
  );
}
