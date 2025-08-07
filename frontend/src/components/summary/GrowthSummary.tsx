'use client';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function GrowthSummary({ metrics }) {
  const revGrowth = metrics?.revenue_growth?.at(-1);
  const futureGrowth = metrics?.growth_x;

  const verdict =
    revGrowth && futureGrowth
      ? futureGrowth > revGrowth + 5
        ? 'Aggressive future growth assumption — consider revising.'
        : futureGrowth < revGrowth - 5
        ? 'Conservative future growth — may underestimate potential.'
        : 'Future growth assumption aligns with past trend.'
      : 'Growth data incomplete.';

  return (
    <section>
      <p>
        Past Revenue Growth: <strong>{revGrowth?.toFixed(1) || 'N/A'}%</strong>.
        Future Assumed Growth:{' '}
        <strong>{futureGrowth?.toFixed(1) || 'N/A'}%</strong>.
      </p>
      <p>{verdict}</p>
    </section>
  );
}
