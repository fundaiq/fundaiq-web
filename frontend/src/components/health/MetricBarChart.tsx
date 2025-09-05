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
import { useEffect, useState } from 'react';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect theme from CSS variables or data attribute
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme-aware colors
  const colors = {
    light: {
      gridColor: 'rgba(229, 231, 235, 0.4)',        // Light gray, subtle
      tickColor: '#6B7280',                         // Gray-500
      backgroundColor: 'rgba(59, 130, 246, 0.6)',   // Blue with opacity
      labelColor: '#374151',                        // Gray-700
    },
    dark: {
      gridColor: 'rgba(75, 85, 99, 0.3)',          // Dark gray, very subtle
      tickColor: '#9CA3AF',                         // Gray-400
      backgroundColor: 'rgba(96, 165, 250, 0.7)',   // Lighter blue for dark
      labelColor: '#D1D5DB',                        // Gray-300
    }
  };

  const currentColors = colors[theme];

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: currentColors.backgroundColor,
        borderRadius: 4,
        datalabels: {
          anchor: 'end',
          align: (ctx: any) => (ctx.dataset.data[ctx.dataIndex] < 0 ? 'bottom' : 'top'),
          offset: 4,
          font: {
            size: 10,
            weight: 'bold',
          },
          formatter: (value: number) =>
            percent ? `${value.toFixed(1)}%` : value.toFixed(1),
          color: currentColors.labelColor,
        },
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { 
          color: currentColors.tickColor,
          font: { size: 11 }
        },
        grid: { 
          color: currentColors.gridColor,
          lineWidth: 1,
          drawOnChartArea: true,
          drawTicks: false,
        },
      },
      y: {
        ticks: {
          color: currentColors.tickColor,
          font: { size: 11 },
          callback: (value: string | number) =>
            percent ? `${Number(value).toFixed(0)}%` : Number(value).toFixed(0),
        },
        grid: { 
          color: currentColors.gridColor,
          lineWidth: 1,
          drawOnChartArea: true,
          drawTicks: false,
        },
        beginAtZero: true,
        suggestedMax: Math.max(...data) * 1.15,
      }
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: true },
    },
  };

  return (
    <div className="w-full">
      <h5 className="text-xs font-medium mb-1 text-tertiary">{label}</h5>
      <div className="h-[200px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
