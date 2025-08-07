'use client';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function SolvencySummary({ metrics }) {
  const d2e = metrics?.debt_to_equity?.at(-1);
  const icr = metrics?.interest_coverage?.at(-1);

  const verdict =
    d2e < 1 && icr > 3
      ? 'Financial position is healthy.'
      : d2e > 1
      ? 'High leverage — financial risk present.'
      : 'Moderate solvency. Monitor cash flows.';

  return (
    <section>
      <p>
        Debt/Equity: <strong>{d2e?.toFixed(2) || 'N/A'}</strong>, Interest
        Coverage: <strong>{icr?.toFixed(1) || 'N/A'}x</strong>
      </p>
      <p>{verdict}</p>
    </section>
  );
}
