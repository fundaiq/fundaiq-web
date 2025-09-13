// MetricLineChart.tsx - SIMPLIFIED with CSS Custom Properties
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
import styles from '@/styles/FinancialHealthSection.module.css';

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
  const [colors, setColors] = useState({
    gridColor: '',
    tickColor: '',
    lineColor: '',
    backgroundColor: '',
    pointColor: '',
    labelColor: '',
  });

  useEffect(() => {
    // Get colors from CSS custom properties
    const updateColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                    document.documentElement.classList.contains('dark');
      
      const suffix = isDark ? 'dark' : 'light';
      const computedStyle = getComputedStyle(document.documentElement);
      
      const newColors = {
        gridColor: computedStyle.getPropertyValue(`--chart-grid-${suffix}`).trim(),
        tickColor: computedStyle.getPropertyValue(`--chart-tick-${suffix}`).trim(),
        lineColor: computedStyle.getPropertyValue(`--chart-line-${suffix}`).trim(),
        backgroundColor: computedStyle.getPropertyValue(`--chart-bg-${suffix}`).trim(),
        pointColor: computedStyle.getPropertyValue(`--chart-point-${suffix}`).trim(),
        labelColor: computedStyle.getPropertyValue(`--chart-label-${suffix}`).trim(),
      };

      
      
      setColors(newColors);
    };

    updateColors();

    // Listen for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme', 'class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Multi-layer conditional formatting for scaling (skip scaling for percentage data)
  const getScalingInfo = (data: number[]) => {
    // Don't scale percentage data
    if (percent) {
      return {
        scaleFactor: 1,
        unitLabel: '',
        shouldScale: false
      };
    }
    
    const maxAbsValue = Math.max(...data.map(value => Math.abs(value)));
    
    if (maxAbsValue >= 1000) {
      return {
        scaleFactor: 1000,
        unitLabel: '(₹ 1000 Cr)',
        shouldScale: true
      };
    } else if (maxAbsValue >= 100) {
      return {
        scaleFactor: 100,
        unitLabel: '(₹ 100 Cr)',
        shouldScale: true
      };
    } else {
      return {
        scaleFactor: 1,
        unitLabel: '',
        shouldScale: false
      };
    }
  };

  const { scaleFactor, unitLabel, shouldScale } = getScalingInfo(data);

  // Scale down data if needed
  const scaledData = shouldScale ? data.map(value => value / scaleFactor) : data;

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data: scaledData,
        fill: false,
        borderColor: colors.lineColor || 'rgba(34, 197, 94, 1)',
        backgroundColor: colors.backgroundColor || 'rgba(34, 197, 94, 0.1)',
        pointBackgroundColor: colors.pointColor || 'rgba(34, 197, 94, 1)',
        pointBorderColor: colors.pointColor || 'rgba(34, 197, 94, 1)',
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
          color: colors.labelColor || '#374151',
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
          color: colors.tickColor || '#6B7280',
          autoSkip: false,
          maxRotation: 45,
          font: { size: 11 }
        },
        grid: { 
          color: colors.gridColor || 'rgba(229, 231, 235, 0.4)',
          lineWidth: 1,
          drawOnChartArea: true,
          drawTicks: false,
        },
      },
      y: {
        ticks: {
          color: colors.tickColor,
          font: { size: 11 },
          callback: (value: string | number) =>
            percent ? `${Number(value).toFixed(0)}%` : Number(value).toFixed(0),
        },
        grid: { 
          color: colors.gridColor,
          lineWidth: 1,
          drawOnChartArea: true,
          drawTicks: false,
        },
        beginAtZero: true,
        suggestedMax: Math.max(...scaledData) * 1.15,
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
      <div className="flex items-center justify-between mb-1">
        <h5 className="text-xs font-medium text-tertiary">{label}</h5>
        {unitLabel && (
          <span className="text-xs font-medium text-gray-500">{unitLabel}</span>
        )}
      </div>
      <div className={`relative w-full h-[200px] ${styles.chartContainer}`}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};