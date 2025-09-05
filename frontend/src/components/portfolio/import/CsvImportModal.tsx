'use client';

import { useEffect, useMemo, useState } from "react";
import { UploadIcon } from "lucide-react";
import UploadStep from "./UploadStep";
import MapStep, { MappingRow } from "./MapStep";
import PreviewStep from "./PreviewStep";
import { ValidationError } from "@/lib/csvParser";
import { loadTickers, TickerRow } from "@/lib/symbolResolver";
import { loadRegistry, RegistryEntry } from "@/lib/symbolRegistry";
import { NewTransaction } from "@/types/portfolio";

type Step = 'upload' | 'map' | 'preview';

type Props = {
  show: boolean;
  onClose: () => void;
  onImport: (transactions: NewTransaction[]) => void;
  importing: boolean;
};

export default function CsvImportModal({ show, onClose, onImport, importing }: Props) {
  const [step, setStep] = useState<Step>('upload');

  const [transactions, setTransactions] = useState<NewTransaction[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const [tickers, setTickers] = useState<TickerRow[]>([]);
  const [registry, setRegistry] = useState<Record<string, RegistryEntry>>({});

  const [rows, setRows] = useState<MappingRow[]>([]);

  useEffect(() => {
    if (!show) return;
    (async () => setTickers(await loadTickers()))();
    setRegistry(loadRegistry());
    setStep('upload');
    setRows([]);
    setTransactions([]);
    setErrors([]);
  }, [show]);

  const uniqueSymbols = useMemo(() => Array.from(new Set(transactions.map(t => t.symbol))), [transactions]);

  const handleParsed = (txs: NewTransaction[], errs: ValidationError[]) => {
    setTransactions(txs);
    setErrors(errs);
    if (errs.length === 0 && txs.length > 0) setStep('map');
  };

  const handleConfirmMappings = (finalRows: MappingRow[]) => {
    // rewrite transactions to selected tickers
    const remapped = transactions.map(tx => {
      const m = finalRows.find(r => r.broker_symbol === tx.symbol);
      const finalTicker = m?.selected || tx.symbol; // Yahoo-formatted symbols were selected==broker
      return { ...tx, symbol: finalTicker };
    });
    setTransactions(remapped);
    setStep('preview');
  };

  const closeAll = () => {
    onClose();
    // state resets happen on next open
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card shadow-xl w-full max-w-5xl p-8 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-primary mb-6 flex items-center">
          <UploadIcon className="w-6 h-6 mr-3 text-accent" />
          Import Transactions from CSV
        </h3>

        {step === 'upload' && (
          <UploadStep onParsed={handleParsed} />
        )}

        {step === 'map' && (
          <MapStep
            uniqueSymbols={uniqueSymbols}
            tickers={tickers}
            registry={registry}
            rows={rows}
            setRows={setRows}
            onReady={handleConfirmMappings}
          />
        )}

        {step === 'preview' && (
          <PreviewStep transactions={transactions} />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-default">
          <button
            onClick={
              step === 'preview' ? () => setStep('map') :
              step === 'map' ? () => setStep('upload') :
              closeAll
            }
            className="px-6 py-3 text-secondary hover:bg-surface-secondary rounded-xl transition-colors"
            disabled={importing}
          >
            {step === 'preview' ? 'Back' : step === 'map' ? 'Back' : 'Cancel'}
          </button>

          {step === 'preview' && (
            <button
              onClick={() => onImport(transactions)}
              disabled={importing || transactions.length === 0}
              className="px-6 py-3 btn-primary rounded-xl transition-all duration-200 flex items-center disabled:opacity-50 shadow-theme"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing {transactions.length} transaction(s)...
                </>
              ) : (
                <>Import {transactions.length} Transaction(s)</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}