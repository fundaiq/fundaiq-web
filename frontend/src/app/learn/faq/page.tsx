// app/learn/faq/page.tsx
"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

type QA = { q: string; a: string; category: string };

const ALL_FAQS: QA[] = [
  // Getting Started
  {
    category: "Getting Started",
    q: "What is Funda-IQ?",
    a: "Funda-IQ is a valuation-first stock analysis tool. It lets you fetch financial data from Yahoo Finance, run DCF and EPS projections, review Financial Health dashboards, and generate professional company reports.",
  },
  {
    category: "Getting Started",
    q: "Is Funda-IQ free?",
    a: "Yes—core features are free. We’ll introduce premium features later, but you’ll always have a free path for analysis.",
  },
  {
    category: "Getting Started",
    q: "Which markets are supported?",
    a: "Primarily Indian equities (NSE/BSE tickers via Yahoo Finance, e.g., TCS.NS).",
  },
  {
    category: "Getting Started",
    q: "Do I need an account to try it?",
    a: "You can try the report demo without an account. To save portfolios, preferences, and custom assumptions, sign in.",
  },

  // Data
  {
    category: "Data",
    q: "What data sources are used?",
    a: "We fetch financials directly from Yahoo Finance APIs.",
  },
  {
    category: "Data",
    q: "Why are some numbers different from other websites?",
    a: "Different sources define metrics differently (TTM vs FY, consolidated vs standalone). We clearly display the source and years; you can override assumptions anytime.",
  },
  {
    category: "Data",
    q: "Do you support quarterly data?",
    a: "Yes. Yahoo Finance provides quarterly data, which we include for trend charts and future features like seasonality.",
  },

  // Valuation
  {
    category: "Valuation",
    q: "How does the DCF work here?",
    a: "We use a 3-phase setup: 1) High growth (years 1–3), 2) Moderate growth (years 4–10), and 3) Terminal growth after year 10. You can set EBIT margin, tax, CapEx %, working capital, WACC, and growth rates.",
  },
  {
    category: "Valuation",
    q: "What assumptions can I change?",
    a: "Revenue, EBIT margin, tax rate, CapEx %, depreciation, change in working capital, WACC, 3/7/terminal growth rates, net debt, and shares outstanding.",
  },
  {
    category: "Valuation",
    q: "Do you show sensitivity tables?",
    a: "Yes. DCF sensitivity across growth and margins; EPS sensitivity across PE multiples and growth.",
  },
  {
    category: "Valuation",
    q: "How is EPS projection calculated?",
    a: "We project revenue and EBIT margins, subtract interest (optionally as a % of EBIT), apply tax, then divide by shares.",
  },

  // Financial Health
  {
    category: "Financial Health",
    q: "What’s inside Financial Health?",
    a: "Growth (Sales/EPS), Profitability (EBIT/EBITDA, margins), Solvency (Debt/Equity, Interest Coverage), CapEx (Net Block, CWIP), Efficiency (ROE/ROCE), and Cash Flow quality.",
  },
  {
    category: "Financial Health",
    q: "Why do some charts show 0s or missing data?",
    a: "Sometimes Yahoo Finance doesn’t provide all rows. We handle missing values gracefully and clearly flag them.",
  },

  // Portfolios
  {
    category: "Portfolios",
    q: "How do portfolios work?",
    a: "Create multiple portfolios, add transactions, and see consolidated returns vs benchmarks (e.g., Nifty 50/500).",
  },
  {
    category: "Portfolios",
    q: "Do you support editing transactions?",
    a: "Yes—inline editing for existing transactions is supported.",
  },

  // Product & UX
  {
    category: "Product & UX",
    q: "Do you have dark mode?",
    a: "The toggle exists, but dark styles are paused while we refine the theming.",
  },
  {
    category: "Product & UX",
    q: "Can I save my assumptions?",
    a: "Yes—assumptions persist via localStorage and global store. You can reset to defaults, and fields that differ are highlighted.",
  },
  {
    category: "Product & UX",
    q: "Why is there a Calculate button in assumptions?",
    a: "To ensure both DCF and EPS recompute reliably if automatic recalculation is interrupted.",
  },

  // Accuracy & Scope
  {
    category: "Accuracy & Scope",
    q: "Is this investment advice?",
    a: "No. Funda-IQ is an educational and analytical tool. Final decisions are yours.",
  },
  {
    category: "Accuracy & Scope",
    q: "Do you guarantee data accuracy?",
    a: "We rely on Yahoo Finance. We do sanity checks, but you should validate critical numbers before acting.",
  },

  // Accounts & Security
  {
    category: "Accounts & Security",
    q: "How do you handle security?",
    a: "We follow modern best practices. Your data is processed securely and not shared.",
  },
  {
    category: "Accounts & Security",
    q: "Can I delete my data?",
    a: "Yes—contact us to request deletion of account data.",
  },
  {
    category: "Accounts & Security",
    q: "Do you send verification emails?",
    a: "Yes. Email verification is part of sign-up.",
  },

  // Learn Section
  {
    category: "Learn Section",
    q: "What will I find in the Learn pages?",
    a: "FAQs, Beginners Guide to Stock Market, Lessons from Legendary Investors, Macro Economics impact on markets, and Stock Valuation Methods—each with structured, practical content.",
  },
  {
    category: "Learn Section",
    q: "Can I request topics?",
    a: "Absolutely. Tell us what would help, and we’ll prioritize it in the Learn roadmap.",
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(ALL_FAQS.map((f) => f.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_FAQS.filter((f) => {
      const matchCat = category === "All" || f.category === category;
      const matchText =
        !q ||
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [query, category]);

  // Build a small FAQ schema (top 10 visible items) for SEO
  const schemaItems = filtered.slice(0, 10).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  }));
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: schemaItems,
  };

  return (
    <div style={{paddingTop: '80px'}} className="py-8">
      <Breadcrumbs />

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">FAQ</h1>
        <p className="text-secondary mt-2">
          Answers about data, valuation, portfolios, and your account.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
        <input
          className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-default bg-surface"
          placeholder="Search questions (e.g., DCF, EPS, portfolio)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-secondary">Category</label>
          <select
            className="px-3 py-2 rounded-lg border border-default bg-surface"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((f, idx) => {
          const id = `${f.category}-${idx}`;
          const expanded = open === id;
          return (
            <div
              key={id}
              className="rounded-lg border border-default bg-surface overflow-hidden"
            >
              <button
                className="w-full text-left px-4 py-3 hover:bg-surface-secondary flex items-start justify-between gap-4"
                onClick={() => setOpen(expanded ? null : id)}
                aria-expanded={expanded}
              >
                <div>
                  <div className="text-xs text-accent font-medium">{f.category}</div>
                  <div className="text-lg font-semibold text-primary">{f.q}</div>
                </div>
                <div className="text-2xl leading-none select-none">{expanded ? "−" : "+"}</div>
              </button>
              {expanded && (
                <div className="px-4 pb-4 -mt-1 text-secondary">
                  <p className="pt-1">{f.a}</p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-secondary text-sm">No results. Try another keyword.</div>
        )}
      </div>

      {/* SEO: JSON-LD */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
