"use client";
import TransactionsTable from "@/components/portfolio/TransactionsTable";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-primary">Transactions</h2>
        <TransactionsTable pid={params.id} />
      </div>
    </div>
  );
}