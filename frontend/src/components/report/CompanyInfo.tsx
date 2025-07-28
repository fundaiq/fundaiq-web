'use client';
import { useGlobalStore } from '@/store/globalStore';

export default function CompanyInfoSection() {
  const CompanyInfo = useGlobalStore((s) => s.company_info);

  return (
    <section className="mb-10" id="company-info">
      <h2 className="text-xl font-semibold mb-2">🏢 Company Info</h2>
      <p><strong>Name:</strong> {CompanyInfo?.name}</p>
      <p><strong>Ticker:</strong> {CompanyInfo?.ticker}</p>
      <p><strong>Sector:</strong> {CompanyInfo?.sector}</p>
      <p><strong>Industry:</strong> {CompanyInfo?.industry}</p>
      <p className="text-sm text-gray-600 mt-2">{CompanyInfo?.description}</p>
      
    </section>
  );
}
