'use client';
import { useRef, useState } from "react";
import { FileTextIcon, DownloadIcon, UploadIcon, XCircleIcon } from "lucide-react";
import { parseCsv, ValidationError } from "@/lib/csvParser";
import { NewTransaction } from "@/types/portfolio";

type Props = {
  onParsed: (transactions: NewTransaction[], errors: ValidationError[]) => void;
};

export default function UploadStep({ onParsed }: Props) {
  const [csvData, setCsvData] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `trade_date,symbol,side,quantity,price,fees,trade_ccy,fx_rate
2024-01-15,TCS.NS,BUY,100,3500.00,25.50,INR,
2024-01-16,RELIANCE.NS,BUY,50,2800.00,15.75,INR,
2024-01-17,INFY.NS,SELL,25,1600.00,12.25,INR,`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transaction_template.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      setCsvData(content);
      const res = parseCsv(content);
      setErrors(res.errors);
      onParsed(res.transactions, res.errors);
    };
    reader.readAsText(f);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Need a template?</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Download our CSV template to get started.</p>
            </div>
          </div>
          <button onClick={downloadTemplate} className="px-4 py-2 btn-primary rounded-lg transition-colors flex items-center">
            <DownloadIcon className="w-4 h-4 mr-2" /> Download Template
          </button>
        </div>
      </div>

      <div className="bg-surface-secondary rounded-xl p-4">
        <h4 className="font-medium text-primary mb-3">Required CSV Format</h4>
        <div className="text-sm text-secondary space-y-1">
          <p><strong>Headers:</strong> trade_date,symbol,side,quantity,price,fees,trade_ccy,fx_rate</p>
          <p><strong>Date format:</strong> YYYY-MM-DD</p>
          <p><strong>Symbol examples:</strong> TCS.NS, RELIANCE.NS, AAPL</p>
          <p><strong>Side values:</strong> BUY, SELL, DIV, SPLIT, BONUS, FEE</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
        <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-primary mb-2">Upload CSV File</h4>
        <p className="text-secondary mb-4">Choose a CSV file from your computer</p>
        <button onClick={() => fileRef.current?.click()} className="px-6 py-3 btn-primary rounded-xl transition-colors">
          Choose File
        </button>
      </div>

      <div className="text-center text-tertiary">or</div>
      <div>
        <label className="block text-sm font-medium text-secondary mb-2">Paste CSV Data</label>
        <textarea
          className="w-full h-40 px-4 py-3 border-default border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 font-mono text-sm bg-surface text-primary placeholder:text-tertiary"
          placeholder="Paste your CSV data here..."
          value={csvData}
          onChange={(e) => {
            const v = e.target.value;
            setCsvData(v);
            if (v.trim()) {
              const res = parseCsv(v);
              setErrors(res.errors);
              onParsed(res.transactions, res.errors);
            } else {
              setErrors([]);
              onParsed([], []);
            }
          }}
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <h4 className="font-medium text-red-900 dark:text-red-200 mb-3 flex items-center"><XCircleIcon className="w-5 h-5 mr-2" /> Validation Errors</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {errors.map((err, i) => (
              <div key={i} className="text-sm text-red-700 dark:text-red-300">
                <strong>Row {err.row}:</strong> {err.message}
                {err.value && <span className="ml-2 font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">"{err.value}"</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}