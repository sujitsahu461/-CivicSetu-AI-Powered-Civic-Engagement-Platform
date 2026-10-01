import React, { useEffect, useState } from 'react';
import authorityService from '../../services/authority.service';
import {
  CitizenFeedbackItem,
  ComplaintStats,
  CategoryPerformanceItem,
  PriorityBreakdown,
} from '../../types/authority';
import Icon from '../../components/ui/Icon';
import { formatTimeAgo, truncateText } from '../../utils/formatters';
import s from './AuthorityAnalytics.module.css';

export const AuthorityAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [categories, setCategories] = useState<CategoryPerformanceItem[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityBreakdown | null>(null);
  const [feedbacks, setFeedbacks] = useState<CitizenFeedbackItem[]>([]);
  const [periodDays, setPeriodDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [statsRes, perfRes, prioRes, fbRes] = await Promise.all([
        authorityService.getAnalyticsStats(periodDays),
        authorityService.getDepartmentPerformance(periodDays),
        authorityService.getPriorityBreakdown(),
        authorityService.getFeedbacks().catch(() => []),
      ]);
      setStats(statsRes);

      // Handle both array response and { categories: [...] } response
      const rawCategories: CategoryPerformanceItem[] = Array.isArray(perfRes)
        ? perfRes
        : (perfRes?.categories || []);
      const activeCats = rawCategories.filter((c) => c.total > 0);
      setCategories(activeCats.length > 0 ? activeCats : rawCategories);

      setPriorityData(prioRes);
      setFeedbacks(Array.isArray(fbRes) ? fbRes : []);
    } catch {
      // Fallback
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(false);
    // Real-time polling every 4 seconds
    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 4000);

    const onFocus = () => loadAnalytics(true);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [periodDays]);

  const statusBreakdown = stats?.status_breakdown || {};

  return (
    <div className={s.container}>
      {/* Header & Period Switcher */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Department Intelligence & Analytics</h1>
          <p className={s.subtitle}>
            Live resolution velocity, SLA adherence, and verified citizen feedback stream.
          </p>
        </div>

        <div className={s.periodTabs}>
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              className={`${s.periodBtn} ${periodDays === days ? s.periodActive : ''}`}
              onClick={() => setPeriodDays(days)}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={s.loadingBox}>
          <span className={s.spinner}></span>
          <span>Computing departmental performance indices...</span>
        </div>
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className={s.metricsRow}>
            {/* 1. Average Resolution Time */}
            <div className={s.metricCard}>
              <div className={s.metricIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Icon name="speed" size={24} />
              </div>
              <div className={s.metricData}>
                <span className={s.metricLabel}>Average Resolution Time</span>
                <span className={s.metricVal}>
                  {stats?.avg_resolution_hours !== null && stats?.avg_resolution_hours !== undefined
                    ? `${stats.avg_resolution_hours.toFixed(1)} hrs`
                    : '0.0 hrs'}
                </span>
                <span className={s.metricSub}>SLA Benchmark: &lt; 24.0 hrs</span>
              </div>
            </div>

            {/* 2. Real-time SLA Compliance Rate */}
            <div className={s.metricCard}>
              <div className={s.metricIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Icon name="verified" size={24} />
              </div>
              <div className={s.metricData}>
                <span className={s.metricLabel}>SLA Compliance Rate</span>
                <span className={s.metricVal} style={{ color: '#34d399' }}>
                  {stats?.sla_compliance_rate !== undefined ? `${stats.sla_compliance_rate.toFixed(1)}%` : '100.0%'}
                </span>
                <span className={s.metricSub}>
                  {stats?.sla_compliance_rate !== undefined && stats.sla_compliance_rate >= 90
                    ? 'Target benchmark achieved (≤ 24 hrs)'
                    : 'Target benchmark: ≥ 90%'}
                </span>
              </div>
            </div>

            {/* 3. Total Grievances Processed */}
            <div className={s.metricCard}>
              <div className={s.metricIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Icon name="receipt_long" size={24} />
              </div>
              <div className={s.metricData}>
                <span className={s.metricLabel}>Total Grievances Processed</span>
                <span className={s.metricVal}>{stats?.total_complaints ?? 0}</span>
                <span className={s.metricSub}>Across active reporting window</span>
              </div>
            </div>

            {/* 4. Citizen Satisfaction & Star Rating */}
            <div className={s.metricCard}>
              <div className={s.metricIcon} style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#f59e0b' }}>
                <Icon name="star" size={24} />
              </div>
              <div className={s.metricData}>
                <span className={s.metricLabel}>Citizen Satisfaction</span>
                <span className={s.metricVal} style={{ color: '#fbbf24' }}>
                  {stats?.average_rating && stats.average_rating > 0
                    ? `★ ${stats.average_rating.toFixed(1)} / 5.0`
                    : '★ 5.0 / 5.0'}
                </span>
                <span className={s.metricSub}>
                  {feedbacks.length} Verified Citizen Review{feedbacks.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts & Breakdown Grid */}
          <div className={s.chartsGrid}>
            {/* Status Breakdown Bar Card */}
            <div className={s.chartCard}>
              <h3 className={s.chartTitle}>Grievance Lifecycle Distribution</h3>
              <p className={s.chartSub}>Status proportion for active reporting window</p>

              <div className={s.statusList}>
                {Object.entries(statusBreakdown).map(([key, val]) => (
                  <div key={key} className={s.statusItem}>
                    <div className={s.statusItemHeader}>
                      <span className={s.statusKey}>{key.replace('_', ' ')}</span>
                      <span className={s.statusCount}>
                        {val.count} ({val.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className={s.barTrack}>
                      <div
                        className={s.barFill}
                        style={{
                          width: `${Math.max(val.percentage, 3)}%`,
                          background:
                            key === 'RESOLVED'
                              ? '#10b981'
                              : key === 'IN_PROGRESS'
                              ? '#3b82f6'
                              : key === 'PENDING'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div className={s.chartCard}>
              <h3 className={s.chartTitle}>Category Workload & Volume</h3>
              <p className={s.chartSub}>Grievance intake grouped by municipal domain</p>

              {categories.length === 0 ? (
                <div className={s.noData}>No category data logged for this period.</div>
              ) : (
                <div className={s.categoryList}>
                  {categories.map((cat) => (
                    <div key={cat.category} className={s.catItem}>
                      <div className={s.catLeft}>
                        <span className={s.catName}>{cat.category_display || cat.category}</span>
                        <div className={s.catMeta}>
                          <span>Pending: {cat.pending}</span>
                          <span>In Progress: {cat.in_progress}</span>
                          <span>Resolved: {cat.resolved}</span>
                        </div>
                      </div>
                      <div className={s.catRight}>
                        <span className={s.catTotal}>{cat.total}</span>
                        <span className={s.catTotalLabel}>Grievance{cat.total === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend Overview */}
          {stats?.daily_trend && stats.daily_trend.length > 0 && (
            <div className={s.trendCard}>
              <h3 className={s.chartTitle}>Daily Incident Influx Trend</h3>
              <p className={s.chartSub}>Grievances reported per day over the selected window</p>

              <div className={s.trendBars}>
                {stats.daily_trend.slice(-14).map((d) => (
                  <div key={d.date} className={s.trendCol}>
                    <div className={s.barWrapper}>
                      <div
                        className={s.trendBar}
                        style={{ height: `${Math.min(100, Math.max(15, d.count * 28))}%` }}
                        title={`${d.date}: ${d.count} grievances`}
                      >
                        <span className={s.barVal}>{d.count}</span>
                      </div>
                    </div>
                    <span className={s.trendDate}>{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Feedback & Reviews Section */}
          <div className={s.feedbackSectionCard}>
            <div className={s.feedbackSectionHeader}>
              <div>
                <h3 className={s.chartTitle}>Citizen Feedback & Star Ratings</h3>
                <p className={s.chartSub}>Real-time public satisfaction scores and comments received from citizens</p>
              </div>
              <div className={s.feedbackOverallBadge}>
                <span className={s.feedbackStarGold}>★</span>
                <span className={s.feedbackScoreNumber}>
                  {stats?.average_rating && stats.average_rating > 0
                    ? stats.average_rating.toFixed(1)
                    : feedbacks.length > 0
                    ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
                    : '5.0'}
                </span>
                <span className={s.feedbackScoreMax}>/ 5.0</span>
              </div>
            </div>

            {feedbacks.length === 0 ? (
              <div className={s.noData}>
                <Icon name="rate_review" size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <p>No citizen reviews received yet for this window.</p>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  When citizens rate resolved grievances, their star ratings, comments, and satisfaction levels appear here in real time.
                </span>
              </div>
            ) : (
              <div className={s.feedbackList}>
                {feedbacks.map((fb) => (
                  <div key={fb.public_id} className={s.feedbackCardItem}>
                    <div className={s.feedbackTopRow}>
                      <div className={s.citizenInfoCol}>
                        <div className={s.citizenAvatarSmall}>
                          {fb.citizen_name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className={s.citizenNameTitle}>{fb.citizen_name || 'Verified Citizen'}</div>
                          <div className={s.complaintCodeLink}>
                            <span>{fb.complaint_tracking_code}</span>
                            {fb.complaint_title && (
                              <span className={s.complaintTitleDot}>
                                • {truncateText(fb.complaint_title, 32)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={s.starsWrapper}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= fb.rating ? s.starGold : s.starGray}
                          >
                            ★
                          </span>
                        ))}
                        <span className={s.ratingNumText}>{fb.rating}.0</span>
                      </div>
                    </div>

                    <div className={s.feedbackCommentBox}>
                      "{fb.comments || 'Citizen confirmed successful grievance resolution without additional comments.'}"
                    </div>

                    <div className={s.feedbackBottomMeta}>
                      <div className={s.feedbackPills}>
                        {fb.satisfaction_level && (
                          <span className={s.feedbackMetaPill}>
                            {fb.satisfaction_level.replace('_', ' ')}
                          </span>
                        )}
                        {fb.timeliness && (
                          <span className={s.feedbackMetaPill}>
                            {fb.timeliness.replace('_', ' ')}
                          </span>
                        )}
                        {fb.is_issue_resolved && (
                          <span className={`${s.feedbackMetaPill} ${s.resolvedPill}`}>
                            <Icon name="check_circle" size={12} /> Resolved
                          </span>
                        )}
                      </div>
                      <span className={s.feedbackDate}>{formatTimeAgo(fb.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AuthorityAnalytics;
