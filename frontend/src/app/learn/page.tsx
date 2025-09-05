// app/learn/page.tsx
"use client";

import styles from '@/styles/learn-page.module.css';

const cards = [
  {
    title: "FAQ",
    desc: "Quick answers about Funda-IQ, data sources, features, and how-to steps.",
    href: "/learn/faq",
    icon: "❓",
    colorClass: "cardFaq"
  },
  {
    title: "Beginners Guide to Stock Market",
    desc: "Start here: accounts, orders, indices, risks, and basic strategies.",
    href: "/learn/beginners",
    icon: "📘",
    colorClass: "cardBeginners"
  },
  {
    // Better title for "Learn from Greatest Investors"
    title: "Lessons from Legendary Investors",
    desc: "Buffett, Lynch, Munger & more — their principles and how to apply them.",
    href: "/learn/legendary-investors",
    icon: "🏆",
    colorClass: "cardLegendary"
  },
  {
    title: "Macro Economics Impact on Stock Market",
    desc: "Inflation, rates, GDP, currency & commodities — what moves markets.",
    href: "/learn/macro",
    icon: "🌍",
    colorClass: "cardMacro"
  },
  {
    title: "Stock Valuation Methods",
    desc: "DCF, PE/PB/EV-EBITDA, PEG, Sum-of-Parts, and when to use which.",
    href: "/learn/valuation-methods",
    icon: "📊",
    colorClass: "cardValuation"
  },
];

export default function LearnPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>📚</span>
          <span className={styles.titleText}>Learn</span>
        </h1>
        <p className={styles.subtitle}>
          Curated guides, FAQs, and tutorials to help you think and value better.
        </p>
      </header>

      <section className={styles.cardsGrid}>
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className={`${styles.card} ${styles[c.colorClass]}`}
          >
            <div className={styles.cardIcon}>{c.icon}</div>
            <h3 className={styles.cardTitle}>{c.title}</h3>
            <p className={styles.cardDescription}>{c.desc}</p>
            <div className={styles.cardAction}>Explore →</div>
          </a>
        ))}
      </section>
    </div>
  );
}