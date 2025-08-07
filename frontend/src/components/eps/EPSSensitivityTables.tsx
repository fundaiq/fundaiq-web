'use client';

export default function EPSSensitivityTables({ data }: any) {
  if (!data?.sensitivity_eps && !data?.sensitivity_price) return null;

  return (
    <>
      {/* EPS Sensitivity Table */}
      {data.sensitivity_eps && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2 dark:text-white">
            🎯 Sensitivity Table A: EPS (EBIT Margin ↓ vs Growth Rate →)
          </h3>
          <table className="table-auto w-full border border-gray-400 dark:border-zinc-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-700">
                <th className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                  EBIT ↓ / Growth →
                </th>
                {data.sensitivity_eps.growth_options.map((g: number, j: number) => (
                  <th key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                    {g.toFixed(1)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sensitivity_eps.matrix.map((row: number[], i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1 font-medium dark:text-white">
                    {data.sensitivity_eps.margin_options[i].toFixed(1)}%
                  </td>
                  {row.map((val: number, j: number) => (
                    <td key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1 text-black dark:text-white">
                      ₹{val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Price Sensitivity Table */}
      {data.sensitivity_price && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2 dark:text-white">
            💰 Sensitivity Table B: Target Price (EPS ↓ vs PE →)
          </h3>
          <table className="table-auto w-full border border-gray-400 dark:border-zinc-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-700">
                <th className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                  EPS ↓ / PE →
                </th>
                {data.sensitivity_price.pe_options.map((pe: number, j: number) => (
                  <th key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                    {pe.toFixed(1)}x
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sensitivity_price.matrix.map((row: number[], i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1 font-medium dark:text-white">
                    ₹{data.sensitivity_price.eps_options[i].toFixed(2)}
                  </td>
                  {row.map((val: number, j: number) => (
                    <td key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1 text-black dark:text-white">
                      ₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
