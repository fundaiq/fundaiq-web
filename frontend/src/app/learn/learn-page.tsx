// app/learn/page.tsx
"use client";

const cards = [
  {
    title: "FAQ",
    desc: "Quick answers about Funda-IQ, data sources, features, and how-to steps.",
    href: "/learn/faq",
    icon: "❓",
  },
  {
    title: "Beginners Guide to Stock Market",
    desc: "Start here: accounts, orders, indices, risks, and basic strategies.",
    href: "/learn/beginners",
    icon: "📘",
  },
  {
    // Better title for “Learn from Greatest Investors”
    title: "Lessons from Legendary Investors",
    desc: "Buffett, Lynch, Munger & more — their principles and how to apply them.",
    href: "/learn/legendary-investors",
    icon: "🏆",
  },
  {
    title: "Macro Economics Impact on Stock Market",
    desc: "Inflation, rates, GDP, currency & commodities — what moves markets.",
    href: "/learn/macro",
    icon: "🌍",
  },
  {
    title: "Stock Valuation Methods",
    desc: "DCF, PE/PB/EV-EBITDA, PEG, Sum-of-Parts, and when to use which.",
    href: "/learn/valuation-methods",
    icon: "📊",
  },
];

export default function LearnPage() {
  return (
    <div className="py-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">📚 Learn</h1>
        <p className="text-secondary mt-2">
          Curated guides, FAQs, and tutorials to help you think and value better.
        </p>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="card p-6 rounded-lg bg-surface hover:shadow-lg transition-shadow border-default border"
          >
            <div className="text-3xl mb-3">{c.icon}</div>
            <h3 className="text-xl font-semibold text-primary">{c.title}</h3>
            <p className="text-secondary mt-2">{c.desc}</p>
            <div className="mt-4 text-accent font-medium">Explore →</div>
          </a>
        ))}
      </section>
    </div>
  );
}
