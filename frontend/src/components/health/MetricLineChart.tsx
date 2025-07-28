'use client';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ✅ NEW

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels // ✅ REGISTER PLUGIN
);

interface Props {
  label: string;
  data: number[];
  labels: string[];
  percent?: boolean;
}

export const MetricLineChart = ({ label, data, labels, percent = false }: Props) => {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
        datalabels: {
          align: 'top',
          anchor: 'end',
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

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#4B5563',
          autoSkip: false,
          maxRotation: 45,
        },
        grid: { color: '#E5E7EB' },
      },
      y: {
        ticks: {
          color: '#4B5563',
          callback: (value: string | number) =>
            percent ? `${Number(value).toFixed(1)}%` : Number(value).toFixed(1),
        },
        grid: { color: '#E5E7EB' },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true, // ✅ ENABLE LABELS
      },
    },
  };

  return (
    <div className="relative w-full h-[200px]">
      <Line data={chartData} options={options} />
    </div>
  );
};
