// components/ui/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLE_MAP: Record<string, string> = {
  learn: "Learn",
  faq: "FAQ",
  beginners: "Beginners Guide",
  "legendary-investors": "Lessons from Legendary Investors",
  macro: "Macro Economics",
  "valuation-methods": "Stock Valuation Methods",
  report: "Company Report",
  portfolios: "Portfolios",
};

function titleize(segment: string) {
  return TITLE_MAP[segment] || segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = (pathname || "/").split("/").filter(Boolean);

  // Build cumulative hrefs
  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const label = titleize(seg);
    return { href, label, isLast: i === parts.length - 1 };
  });

  return (
    <nav className="text-sm text-secondary mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-accent">Home</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {c.isLast ? (
              <span className="text-primary font-medium">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-accent">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
