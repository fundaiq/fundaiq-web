import { PieChart, Pie, Cell, Sector } from 'recharts';

export default function ValuationGauge({ fairValue, currentPrice, epsValue }: { fairValue: number; currentPrice: number; epsValue?: number }) {
  const maxValue = Math.max(fairValue, currentPrice) * 1.5;
  const minValue = 0;

  const safety = ((fairValue - currentPrice) / currentPrice) * 100;
  const meterValue = (currentPrice / maxValue) * 100;

  const colorBands = [
    { range: [0, 20], color: '#2ecc71', label: 'Undervalued' },
    { range: [20, 40], color: '#27ae60' },
    { range: [40, 60], color: '#f1c40f', label: 'Fair Value' },
    { range: [60, 80], color: '#f39c12' },
    { range: [80, 100], color: '#e74c3c', label: 'Overvalued' },
  ];

  const sectors = colorBands.map((band, i) => ({
    name: band.label || '',
    value: band.range[1] - band.range[0],
    fill: band.color,
  }));

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
      {/* Left side: Gauge + Stock Price */}
      <div className="flex flex-col items-center">
        <PieChart width={280} height={140}>
          <Pie
            data={sectors}
            cx={140}
            cy={140}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={100}
            paddingAngle={1}
            dataKey="value"
          >
            {sectors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          {/* Custom Arrow Indicator */}
          <Sector
            cx={140}
            cy={140}
            innerRadius={0}
            outerRadius={55}
            startAngle={180 - (meterValue * 1.8) - 2}
            endAngle={180 - (meterValue * 1.8) + 2}
            fill="#001f3f"
          />
        </PieChart>

        <p className="text-sm font-semibold text-gray-700 mt-1">
          Stock Price: <span className="text-black font-bold">₹{currentPrice.toFixed(2)}</span>
        </p>
      </div>

      {/* Right side: Fair Value, EPS Value, and Margin */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <h3 className="text-sm font-medium text-gray-600 mb-1">DCF Fair Value</h3>
        <p className="text-xl font-bold text-gray-800 mb-2">₹{fairValue.toFixed(2)}</p>

        {epsValue !== undefined && (
          <>
            <h3 className="text-sm font-medium text-gray-600 mb-1">EPS Fair Value</h3>
            <p className="text-xl font-bold text-gray-800 mb-2">₹{epsValue.toFixed(2)}</p>
          </>
        )}

        <p className={`text-md font-bold ${safety >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          Margin of Safety: {safety >= 0 ? '+' : ''}{safety.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
