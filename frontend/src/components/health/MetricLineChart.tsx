// MetricLineChart.tsx
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';

ChartJS.register(
  LineElement,
  PointElement,
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

export const MetricLineChart = ({ label, data, labels, percent = false }: Props) => {
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
      lineColor: 'rgba(34, 197, 94, 1)',           // Green-500
      backgroundColor: 'rgba(34, 197, 94, 0.1)',   // Green with low opacity
      pointColor: 'rgba(34, 197, 94, 1)',          // Solid green points
      labelColor: '#374151',                        // Gray-700
    },
    dark: {
      gridColor: 'rgba(75, 85, 99, 0.3)',          // Dark gray, very subtle
      tickColor: '#9CA3AF',                         // Gray-400
      lineColor: 'rgba(74, 222, 128, 1)',          // Green-400 (brighter for dark)
      backgroundColor: 'rgba(74, 222, 128, 0.1)',   // Green with low opacity
      pointColor: 'rgba(74, 222, 128, 1)',         // Solid bright green
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
        fill: false,
        borderColor: currentColors.lineColor,
        backgroundColor: currentColors.backgroundColor,
        pointBackgroundColor: currentColors.pointColor,
        pointBorderColor: currentColors.pointColor,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        datalabels: {
          align: 'top',
          anchor: 'end',
          offset: 6,
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

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: currentColors.tickColor,
          autoSkip: false,
          maxRotation: 45,
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
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
      },
    },
  };

  return (
    <div className="w-full">
      <h5 className="text-xs font-medium mb-1 text-tertiary">{label}</h5>
      <div className="relative w-full h-[200px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};