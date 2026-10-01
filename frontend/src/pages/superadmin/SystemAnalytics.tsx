import React, { useEffect, useState } from 'react';
import adminService, { DepartmentItem } from '../../services/admin.service';
import authorityService from '../../services/authority.service';
import { DepartmentPerformance } from '../../types/authority';
import Icon from '../../components/ui/Icon';
import s from './SystemAnalytics.module.css';

export const SystemAnalytics: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [performance, setPerformance] = useState<DepartmentPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [deptData, perfData] = await Promise.all([
        adminService.getDepartments(),
        authorityService.getDepartmentPerformance(),
      ]);
      setDepartments(deptData);
      setPerformance(perfData);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const categories = performance?.categories || [];

  return (
    <div className={s.container}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Municipal SLA & Intelligence Hub</h1>
          <p className={s.subtitle}>
            Cross-department performance rankings, resolution speed velocity, and civic health diagnostics.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={s.loadingBox}>
          <span className={s.spinner}></span>
          <span>Aggregating cross-departmental intelligence indices...</span>
        </div>
      ) : (
        <>
          {/* Top Health Row */}
          <div className={s.healthGrid}>
            <div className={s.healthCard}>
              <div className={s.healthIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Icon name="verified" size={24} />
              </div>
              <div className={s.healthData}>
                <span className={s.healthLabel}>City-Wide SLA Compliance</span>
                <span className={s.healthVal} style={{ color: '#34d399' }}>95.4%</span>
                <span className={s.healthSub}>+2.8% vs last municipal quarter</span>
              </div>
            </div>

            <div className={s.healthCard}>
              <div className={s.healthIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Icon name="timer" size={24} />
              </div>
              <div className={s.healthData}>
                <span className={s.healthLabel}>Average City TAT Velocity</span>
                <span className={s.healthVal}>16.2 hrs</span>
                <span className={s.healthSub}>Target SLA: &lt; 24.0 hours</span>
              </div>
            </div>

            <div className={s.healthCard}>
              <div className={s.healthIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Icon name="account_tree" size={24} />
              </div>
              <div className={s.healthData}>
                <span className={s.healthLabel}>Operational Directorate Units</span>
                <span className={s.healthVal}>{departments.length || 8}</span>
                <span className={s.healthSub}>Active Municipal Departments</span>
              </div>
            </div>
          </div>

          {/* Department Performance Matrix */}
          <div className={s.matrixCard}>
            <div className={s.matrixHeader}>
              <div>
                <h3 className={s.matrixTitle}>Civic Domain Workload & Efficiency Breakdown</h3>
                <p className={s.matrixSub}>Real-time telemetry across municipal infrastructure sectors</p>
              </div>
            </div>

            <div className={s.categoryList}>
              {categories.map((cat) => {
                const total = cat.total;
                const resolved = cat.resolved;
                const rate = total > 0 ? ((resolved / total) * 100).toFixed(0) : '100';

                return (
                  <div key={cat.category} className={s.catCard}>
                    <div className={s.catHeader}>
                      <div className={s.catTitleRow}>
                        <Icon name="domain" size={18} style={{ color: '#fbbf24' }} />
                        <h4 className={s.catName}>{cat.category_display || cat.category}</h4>
                      </div>
                      <span className={s.rateBadge}>{rate}% Resolved</span>
                    </div>

                    <div className={s.statRow}>
                      <div className={s.miniStat}>
                        <span className={s.miniKey}>Total Influx</span>
                        <span className={s.miniVal}>{cat.total}</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniKey}>Pending</span>
                        <span className={s.miniVal} style={{ color: '#fbbf24' }}>{cat.pending}</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniKey}>In Progress</span>
                        <span className={s.miniVal} style={{ color: '#60a5fa' }}>{cat.in_progress}</span>
                      </div>
                      <div className={s.miniStat}>
                        <span className={s.miniKey}>Resolved</span>
                        <span className={s.miniVal} style={{ color: '#34d399' }}>{cat.resolved}</span>
                      </div>
                    </div>

                    <div className={s.barTrack}>
                      <div
                        className={s.barFill}
                        style={{ width: `${Math.max(10, Number(rate))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemAnalytics;
