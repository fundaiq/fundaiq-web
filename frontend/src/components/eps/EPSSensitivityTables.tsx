'use client';

export default function EPSSensitivityTables({ data }: any) {
  if (!data?.sensitivity_eps && !data?.sensitivity_price) return null;

  return (
    <>
      {data.sensitivity_eps && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2">Sensitivity Table A: EPS</h3>
          <table className="table-auto w-full border border-gray-400 dark:border-zinc-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-700">
                <th className="border border-gray-400 dark:border-zinc-600 px-2 py-1">EBIT \ Growth</th>
                {data.sensitivity_eps.growth_options.map((g: any, j: number) => (
                  <th key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                    {g}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sensitivity_eps.matrix.map((row: any[], i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                    {data.sensitivity_eps.margin_options[i]}%
                  </td>
                  {row.map((val: any, j: number) => (
                    <td key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.sensitivity_price && (
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2">Sensitivity Table B: Target Price</h3>
          <table className="table-auto w-full border border-gray-400 dark:border-zinc-600 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-700">
                <th className="border border-gray-400 dark:border-zinc-600 px-2 py-1">EPS \ PE</th>
                {data.sensitivity_price.pe_options.map((pe: any, j: number) => (
                  <th key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">{pe}x</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sensitivity_price.matrix.map((row: any[], i: number) => (
                <tr key={i} className="text-center">
                  <td className="border border-gray-400 dark:border-zinc-600 px-2 py-1">
                    ₹{data.sensitivity_price.eps_options[i]}
                  </td>
                  {row.map((val: any, j: number) => (
                    <td key={j} className="border border-gray-400 dark:border-zinc-600 px-2 py-1">₹{val}</td>
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
