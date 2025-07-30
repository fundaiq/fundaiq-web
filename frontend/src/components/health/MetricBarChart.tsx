'use client';

import {
  Chart as ChartJS,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Props {
  label: string;
  data: number[];
  labels: string[];
  percent?: boolean;
}

export const MetricBarChart = ({ label, data, labels, percent = false }: Props) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // ✅ matches Tailwind indigo-500
        borderRadius: 4,
        datalabels: {
          anchor: 'end',
          align: (ctx) => (ctx.dataset.data[ctx.dataIndex] < 0 ? 'bottom' : 'top'),
          offset: 4,
          font: {
            size: 10,
            weight: 'bold',
          },
          formatter: (value: number) =>
            percent ? `${value.toFixed(1)}%` : value.toFixed(1),
          color: '#374151',
        },
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#4B5563' },
        grid: { color: '#E5E7EB' },
      },
      y: {
        ticks: {
          color: '#4B5563',
          callback: (value: string | number) =>
            percent ? `${Number(value).toFixed(1)}%` : Number(value).toFixed(1),
        },
        grid: { color: '#E5E7EB' },
        beginAtZero: true,
        suggestedMax: Math.max(...data) * 1.15, // 👈 give 15% headroom for labels
      }
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: true },
    },
  };

  return (
    <div className="w-full">
      <h5 className="text-xs font-medium mb-1 text-muted-foreground">{label}</h5>
      <div className="h-[200px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
