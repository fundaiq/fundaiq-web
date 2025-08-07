'use client';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function ProfitabilitySummary({ metrics }) {
  const actualMargin = metrics?.ebitda_margin?.at(-1);
  const assumedMargin = metrics?.ebit_margin;

  const verdict =
    assumedMargin > actualMargin + 5
      ? 'Assumed margin is optimistic. Check for justification.'
      : assumedMargin < actualMargin - 5
      ? 'Assumed margin is conservative.'
      : 'Assumed margin is aligned with recent performance.';

  return (
    <section>
      <p>
        Current EBIT Margin:{' '}
        <strong>{actualMargin?.toFixed(1) || 'N/A'}%</strong>. Assumed EBIT
        Margin: <strong>{assumedMargin?.toFixed(1) || 'N/A'}%</strong>.
      </p>
      <p>{verdict}</p>
    </section>
  );
}
