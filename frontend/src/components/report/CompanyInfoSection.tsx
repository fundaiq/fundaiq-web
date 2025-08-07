'use client';
import { useGlobalStore } from '@/store/globalStore';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function CompanyInfoSection() {
  const CompanyInfo = useGlobalStore((s) => s.companyInfo);

  return (
    <section className="mb-2" id="company-info">
      <p><strong>Name:</strong> {CompanyInfo?.name}</p>
      <p><strong>Ticker:</strong> {CompanyInfo?.ticker}</p>
      <p><strong>Sector:</strong> {CompanyInfo?.sector}</p>
      <p><strong>Industry:</strong> {CompanyInfo?.industry}</p>
      <p className="text-sm text-gray-600 mt-2">{CompanyInfo?.description}</p>
    
    </section>
  );
}
