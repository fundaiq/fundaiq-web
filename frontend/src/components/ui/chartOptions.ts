// chartOptions.ts

export const getThemeAwareChartOptions = (isDark: boolean = false) => {
  const colors = {
    light: {
      gridColor: 'rgba(229, 231, 235, 0.4)',        // Light gray, subtle and dotted-like
      tickColor: '#6B7280',                         // Gray-500
      labelColor: '#374151',                        // Gray-700
      backgroundColor: 'rgba(255, 255, 255, 0.9)',  // Semi-transparent white
    },
    dark: {
      gridColor: 'rgba(75, 85, 99, 0.3)',          // Dark gray, very subtle
      tickColor: '#9CA3AF',                         // Gray-400
      labelColor: '#D1D5DB',                        // Gray-300
      backgroundColor: 'rgba(15, 23, 42, 0.9)',     // Semi-transparent dark
    }
  };

  const currentColors = isDark ? colors.dark : colors.light;

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: currentColors.labelColor,
          font: {
            size: 12,
            weight: '500',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: currentColors.backgroundColor,
        titleColor: currentColors.labelColor,
        bodyColor: currentColors.labelColor,
        borderColor: currentColors.gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: currentColors.tickColor,
          font: {
            size: 11,
            weight: '400',
          },
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
          font: {
            size: 11,
            weight: '400',
          },
        },
        grid: {
          color: currentColors.gridColor,
          lineWidth: 1,
          drawOnChartArea: true,
          drawTicks: false,
        },
      },
    },
  };
};

// Default options for backward compatibility
export const defaultChartOptions = getThemeAwareChartOptions(false);

// Utility function to detect current theme
export const getCurrentTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'dark' : 'light';
  }
  return 'light';
};