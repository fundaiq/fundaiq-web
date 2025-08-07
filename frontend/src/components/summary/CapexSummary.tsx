'use client';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function CapexSummary({ metrics }) {
  const assumedCapex = metrics?.capex_pct;

  return (
    <section>
      <p>
        Recent CapEx: <strong>N/A</strong> (not available). Assumed CapEx:{' '}
        <strong>{assumedCapex?.toFixed(1) || 'N/A'}%</strong>
      </p>
      <p>
        CapEx assumption is within historical norms or needs to be cross-checked
        manually.
      </p>
    </section>
  );
}
