'use client';
import {DollarSign, TrendingUp, Clock, Infinity } from 'lucide-react';
import styles from '@/styles/PhaseSplitChart.module.css';

export default function PhaseSplitChart({
  phase0 = 0,
  phase1 = 0,
  phase2 = 0,
  phase3 = 0,
  total = 1
}: {
  phase0?: number;
  phase1?: number;
  phase2?: number;
  phase3?: number;
  total?: number;
}) {
  const safeValue = (v: number) => isNaN(v) || !isFinite(v) ? 0 : v;
  const percent = (v: number) =>
    total ? ((safeValue(v) / total) * 100).toFixed(1) : '0.0';
  const format = (v: number) =>
    `₹${safeValue(v).toFixed(1)}`;

  // Calculate percentages for bar widths
  const p0Percent = parseFloat(percent(phase0));
  const p1Percent = parseFloat(percent(phase1));
  const p2Percent = parseFloat(percent(phase2));
  const p3Percent = parseFloat(percent(phase3));

  return (
    <div className={styles.container}>
      {/* Enhanced Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <TrendingUp size={16} />
        </div>
        <h4 className={styles.headerTitle}>DCF Value Breakdown</h4>
        <div className={styles.totalValue}>₹{safeValue(total).toFixed(1)}</div>
      </div>

      {/* Enhanced Visual Bar */}
      <div className={styles.visualBar}>
        <div 
          className={styles.phase0Segment}
          style={{ width: `${p0Percent}%` }}
        />
        <div 
          className={styles.phase1Segment}
          style={{ width: `${p1Percent}%` }}
        />
        <div 
          className={styles.phase2Segment}
          style={{ width: `${p2Percent}%` }}
        />
        <div 
          className={styles.phase3Segment}
          style={{ width: `${p3Percent}%` }}
        />
      </div>

      {/* Enhanced Phase Cards */}
      <div className={styles.phaseCards}>
        {/* Phase 0 Card */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseCardHeader}>
            <div className={`${styles.phaseIcon} ${styles.phase0Icon}`}>
              <DollarSign size={14} />
            </div>
            <div className={styles.phaseInfo}>
              <div className={styles.phaseTitle}>Phase 0</div>
              <div className={styles.phaseSubtitle}>Debt/Cash as of Today</div>
            </div>
          </div>
          <div className={styles.phaseMetrics}>
            <div className={styles.phaseValue}>{format(phase0)}</div>
            <div className={`${styles.phasePercent} ${styles.phase0Percent}`}>
              {percent(phase0)}%
            </div>
          </div>
        </div>

        {/* Phase 1 Card */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseCardHeader}>
            <div className={`${styles.phaseIcon} ${styles.phase1Icon}`}>
              <Clock size={14} />
            </div>
            <div className={styles.phaseInfo}>
              <div className={styles.phaseTitle}>Phase 1</div>
              <div className={styles.phaseSubtitle}>Years 1-3</div>
            </div>
          </div>
          <div className={styles.phaseMetrics}>
            <div className={styles.phaseValue}>{format(phase1)}</div>
            <div className={`${styles.phasePercent} ${styles.phase1Percent}`}>
              {percent(phase1)}%
            </div>
          </div>
        </div>

        {/* Phase 2 Card */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseCardHeader}>
            <div className={`${styles.phaseIcon} ${styles.phase2Icon}`}>
              <TrendingUp size={14} />
            </div>
            <div className={styles.phaseInfo}>
              <div className={styles.phaseTitle}>Phase 2</div>
              <div className={styles.phaseSubtitle}>Years 4-10</div>
            </div>
          </div>
          <div className={styles.phaseMetrics}>
            <div className={styles.phaseValue}>{format(phase2)}</div>
            <div className={`${styles.phasePercent} ${styles.phase2Percent}`}>
              {percent(phase2)}%
            </div>
          </div>
        </div>

        {/* Terminal Card */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseCardHeader}>
            <div className={`${styles.phaseIcon} ${styles.phase3Icon}`}>
              <Infinity size={14} />
            </div>
            <div className={styles.phaseInfo}>
              <div className={styles.phaseTitle}>Terminal</div>
              <div className={styles.phaseSubtitle}>Year 10+</div>
            </div>
          </div>
          <div className={styles.phaseMetrics}>
            <div className={styles.phaseValue}>{format(phase3)}</div>
            <div className={`${styles.phasePercent} ${styles.phase3Percent}`}>
              {percent(phase3)}%
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Projection Period</span>
          <span className={styles.summaryValue}>10 Years</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Terminal Contribution</span>
          <span className={styles.summaryValue}>{percent(phase3)}%</span>
        </div>
      </div>
    </div>
  );
}