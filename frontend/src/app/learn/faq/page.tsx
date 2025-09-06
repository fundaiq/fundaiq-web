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
    a: "Yes—core features are free. We'll introduce premium features later, but you'll always have a free path for analysis.",
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
    q: "What's inside Financial Health?",
    a: "Growth (Sales/EPS), Profitability (EBIT/EBITDA, margins), Solvency (Debt/Equity, Interest Coverage), CapEx (Net Block, CWIP), Efficiency (ROE/ROCE), and Cash Flow quality.",
  },
  {
    category: "Financial Health",
    q: "Why do some charts show 0s or missing data?",
    a: "Sometimes Yahoo Finance doesn't provide all rows. We handle missing values gracefully and clearly flag them.",
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
    a: "Absolutely. Tell us what would help, and we'll prioritize it in the Learn roadmap.",
  },
];

// Category icons mapping
const categoryIcons = {
  "Getting Started": "🚀",
  "Data": "📊",
  "Valuation": "💰",
  "Financial Health": "🏥",
  "Portfolios": "📈",
  "Product & UX": "🎨",
  "Accuracy & Scope": "🎯",
  "Accounts & Security": "🔒",
  "Learn Section": "📚"
};

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

  // Get category stats
  const categoryStats = useMemo(() => {
    const stats = {};
    ALL_FAQS.forEach(faq => {
      stats[faq.category] = (stats[faq.category] || 0) + 1;
    });
    return stats;
  }, []);

  return (
    <div className="container mx-auto" style={{ paddingTop: 'calc(64px + var(--space-lg))' }}>
      <Breadcrumbs />

      {/* Beautiful Header */}
      <div className="text-center mb-5 px-4 py-5 bg-brand rounded-2xl text-white shadow-lg">
        <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">❓</span>
          <span>Frequently Asked Questions</span>
        </h1>
        <p className="text-xl font-medium">
          Find answers about data, valuation, portfolios, and your account
        </p>
        <div className="mt-4 text-sm opacity-90">
          <span className="bg-white/20 px-3 py-1 rounded-full">
            {ALL_FAQS.length} questions answered
          </span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card-base mb-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-secondary mb-2">
              🔍 Search Questions
            </label>
            <input
              className="input-base w-full"
              placeholder="Search questions (e.g., DCF, EPS, portfolio)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-secondary mb-2">
              📁 Filter by Category
            </label>
            <select
              className="input-base w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : `${categoryIcons[c] || "📄"} ${c}`}
                  {c !== "All" && ` (${categoryStats[c] || 0})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        {query || category !== "All" ? (
          <div className="mt-4 pt-4 border-t border-default">
            <p className="text-sm text-secondary">
              Showing <span className="font-semibold text-primary">{filtered.length}</span> of {ALL_FAQS.length} questions
              {category !== "All" && (
                <span> in <span className="font-semibold brand-text">{category}</span></span>
              )}
              {query && (
                <span> matching "<span className="font-semibold brand-text">{query}</span>"</span>
              )}
            </p>
          </div>
        ) : null}
      </div>

      {/* Category Quick Links */}
      {!query && category === "All" && (
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-primary mb-3">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.slice(1).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="bg-surface-secondary hover:bg-surface-tertiary border border-default rounded-lg p-3 text-left transition-all hover:shadow-sm hover:scale-105"
              >
                <div className="text-2xl mb-1">{categoryIcons[cat] || "📄"}</div>
                <div className="font-medium text-primary text-sm">{cat}</div>
                <div className="text-xs text-secondary">{categoryStats[cat]} questions</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {filtered.map((f, idx) => {
          const id = `${f.category}-${idx}`;
          const expanded = open === id;
          return (
            <div
              key={id}
              className="card-base !p-0 overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full text-left p-4 hover:bg-surface-secondary flex items-start justify-between gap-4 transition-colors"
                onClick={() => setOpen(expanded ? null : id)}
                aria-expanded={expanded}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryIcons[f.category] || "📄"}</span>
                    <span className="text-xs font-medium brand-text bg-surface-secondary px-2 py-1 rounded-full">
                      {f.category}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-primary leading-tight">
                    {f.q}
                  </div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-surface-secondary rounded-full flex items-center justify-center text-lg font-bold text-secondary transition-transform duration-200" 
                     style={{ transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                  +
                </div>
              </button>
              
              {expanded && (
                <div className="px-4 pb-4 bg-surface-secondary/50 border-t border-default">
                  <div className="pt-4 text-secondary leading-relaxed">
                    {f.a}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card-base text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No results found</h3>
            <p className="text-secondary mb-4">
              Try a different keyword or browse all categories
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className="btn-base btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-5 card-base text-center">
        <h3 className="text-xl font-bold text-primary mb-3">Still have questions?</h3>
        <p className="text-secondary mb-4">
          Can't find what you're looking for? We're here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-base btn-primary">
            Contact Support
          </button>
          <button className="btn-base btn-secondary">
            Request New FAQ
          </button>
        </div>
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