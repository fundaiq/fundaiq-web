'use client';
import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/CompanyInfoSection.module.css';

export default function CompanyInfoSection() {
  const CompanyInfo = useGlobalStore((s) => s.companyInfo);

  return (
    <section className={styles.container} id="company-info">
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Company Information
          </h3>
        </div>

        <div className={styles.content}>
          {/* Primary Company Info */}
          <div className={`${styles.infoGroup} ${styles.primaryInfo}`}>
            <div className={styles.infoItem}>
              <p className={styles.label}>Company Name</p>
              <p className={styles.value}>{CompanyInfo?.name}</p>
            </div>
            
            <div className={styles.infoItem}>
              <p className={styles.label}>Ticker Symbol</p>
              <p className={styles.value}>{CompanyInfo?.ticker}</p>
            </div>
          </div>

          {/* Secondary Company Info */}
          <div className={`${styles.infoGroup} ${styles.secondaryInfo}`}>
            <div className={styles.infoItem}>
              <p className={styles.label}>Sector</p>
              <p className={styles.value}>{CompanyInfo?.sector}</p>
            </div>
            
            <div className={styles.infoItem}>
              <p className={styles.label}>Industry</p>
              <p className={styles.value}>{CompanyInfo?.industry}</p>
            </div>
          </div>

          {/* Company Description */}
          {CompanyInfo?.description && (
            <div className={styles.description}>
              <h4 className={styles.descriptionTitle}>Company Overview</h4>
              <p className={styles.descriptionText}>{CompanyInfo.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}