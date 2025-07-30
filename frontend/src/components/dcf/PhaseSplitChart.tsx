'use client';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function PhaseSplitChart({
  phase1 = 0,
  phase2 = 0,
  phase3 = 0,
  total = 1
}: {
  phase1?: number;
  phase2?: number;
  phase3?: number;
  total?: number;
}) {
  const safeValue = (v: number) => isNaN(v) || !isFinite(v) ? 0 : v;
  const percent = (v: number) =>
    total ? `${((safeValue(v) / total) * 100).toFixed(0)}%` : '0%';
  const format = (v: number) =>
    `₹${safeValue(v).toFixed(1)} (${percent(v)})`;

  const data = {
    labels: [''],
    datasets: [
      {
        label: 'Phase 1',
        data: [safeValue(phase1)],
        backgroundColor: 'rgba(59, 130, 246, 0.8)' // blue-500
      },
      {
        label: 'Phase 2',
        data: [safeValue(phase2)],
        backgroundColor: 'rgba(168, 85, 247, 0.8)' // purple-500
      },
      {
        label: 'Terminal',
        data: [safeValue(phase3)],
        backgroundColor: 'rgba(34, 197, 94, 0.8)' // green-500
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      bar: {
        borderSkipped: false,
        borderRadius: 4,
      }
    },
    scales: {
      x: { stacked: true, display: false },
      y: { stacked: true, display: false }
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Top label line */}
      <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        <div>Phase 1 – {format(phase1)}</div>
        <div>Phase 2 – {format(phase2)}</div>
        <div>Terminal – {format(phase3)}</div>
      </div>

      {/* Full-width stacked bar */}
      <div className="h-[32px] w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
