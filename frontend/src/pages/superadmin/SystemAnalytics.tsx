import React, { useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';
import s from './SystemAnalytics.module.css';

// SVG Sparkline Component
const Sparkline: React.FC<{
  data: number[];
  color: string;
  fillColor?: string;
  width?: number;
  height?: number;
}> = ({ data, color, fillColor, width = 54, height = 24 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {fillColor && (
        <polygon
          points={`${points} ${width - 2},${height} 2,${height}`}
          fill={fillColor}
          opacity={0.25}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SystemAnalytics: React.FC = () => {
  const { showToast } = useToast();

  const [activeSidebarNav, setActiveSidebarNav] = useState('Analytics Overview');
  const [activeDomainTab, setActiveDomainTab] = useState<'Complaints' | 'Resolution Rate' | 'Avg. TAT'>('Complaints');
  const [dateRange, setDateRange] = useState('01 Sep 2026 – 30 Sep 2026');

  // Handle Export Report
  const handleExportReport = () => {
    showToast('Municipal SLA & Intelligence Report exported successfully as PDF/CSV.', 'success');
  };

  // 6 Domain Workload Bars Data
  const domainData = [
    {
      label: 'Roads & Infra',
      value: 642,
      rate: '93.1%',
      tat: '18.4h',
      height: 155,
      gradient: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19 L8 5 L16 5 L20 19" />
          <line x1="12" y1="8" x2="12" y2="10" />
          <line x1="12" y1="13" x2="12" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Drainage & Sewage',
      value: 412,
      rate: '91.7%',
      tat: '20.1h',
      height: 102,
      gradient: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
    },
    {
      label: 'Water Supply',
      value: 368,
      rate: '92.9%',
      tat: '16.8h',
      height: 90,
      gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 12h12M12 6v12M9 19h6" />
        </svg>
      ),
    },
    {
      label: 'Electricity',
      value: 298,
      rate: '87.6%',
      tat: '28.4h',
      height: 74,
      gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      label: 'Sanitation & Solid Waste',
      value: 524,
      rate: '96.6%',
      tat: '12.3h',
      height: 128,
      gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
    },
    {
      label: 'Others',
      value: 242,
      rate: '89.3%',
      tat: '24.7h',
      height: 60,
      gradient: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  // Department Table Rows
  const departmentRows = [
    {
      rank: 1,
      name: 'Roads & Infrastructure',
      icon: 'add_road',
      total: 642,
      resolved: 598,
      sla: '93.1%',
      isSlaGood: true,
      tat: '18.4 hrs',
      trend: [12, 14, 15, 17, 18, 19, 18.4],
      trendColor: '#10b981',
    },
    {
      rank: 2,
      name: 'Sanitation & Solid Waste',
      icon: 'delete',
      total: 524,
      resolved: 506,
      sla: '96.6%',
      isSlaGood: true,
      tat: '12.3 hrs',
      trend: [16, 15, 14, 13, 13, 12.5, 12.3],
      trendColor: '#10b981',
    },
    {
      rank: 3,
      name: 'Drainage & Sewage',
      icon: 'water_drop',
      total: 412,
      resolved: 378,
      sla: '91.7%',
      isSlaGood: true,
      tat: '20.1 hrs',
      trend: [18, 19, 19, 20, 20.5, 20.1, 20.1],
      trendColor: '#10b981',
    },
    {
      rank: 4,
      name: 'Water Supply',
      icon: 'water',
      total: 368,
      resolved: 342,
      sla: '92.9%',
      isSlaGood: true,
      tat: '16.8 hrs',
      trend: [19, 18, 18, 17, 17, 16.9, 16.8],
      trendColor: '#10b981',
    },
    {
      rank: 5,
      name: 'Electricity',
      icon: 'bolt',
      total: 298,
      resolved: 261,
      sla: '87.6%',
      isSlaGood: false,
      tat: '28.4 hrs',
      trend: [22, 24, 25, 26, 27, 28, 28.4],
      trendColor: '#ef4444',
    },
    {
      rank: 6,
      name: 'Others',
      icon: 'more_horiz',
      total: 242,
      resolved: 216,
      sla: '89.3%',
      isSlaGood: false,
      tat: '24.7 hrs',
      trend: [21, 22, 23, 23.5, 24, 24.5, 24.7],
      trendColor: '#ef4444',
    },
  ];

  return (
    <div className={s.pageLayout}>
      {/* ============================================================
         1. LEFT SIDEBAR NAVIGATION
         ============================================================ */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <nav className={s.navSection}>
            {[
              { label: 'Analytics Overview', icon: 'bar_chart' },
              { label: 'SLA Performance', icon: 'timer' },
              { label: 'Department Analysis', icon: 'corporate_fare' },
              { label: 'Complaint Trends', icon: 'trending_up' },
              { label: 'Category Insights', icon: 'category' },
              { label: 'Geographic Analysis', icon: 'place' },
              { label: 'Authority Performance', icon: 'badge' },
              { label: 'Citizen Satisfaction', icon: 'favorite' },
              { label: 'Predictive Insights', icon: 'auto_awesome' },
              { label: 'Reports & Exports', icon: 'description' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`${s.navItem} ${activeSidebarNav === item.label ? s.navItemActive : ''}`}
                onClick={() => {
                  setActiveSidebarNav(item.label);
                  if (item.label !== 'Analytics Overview') {
                    showToast(`Filtered SLA view: ${item.label}`, 'info');
                  }
                }}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Card */}
        <div className={s.sidebarEcoCard}>
          <div className={s.ecoCardTitle}>
            Cleaner Cities <span className={s.ecoCardTitleGreen}>Greener Tomorrow</span>
          </div>
          <div className={s.ecoCardSub}>
            Data-driven governance for a smarter, healthier community.
          </div>
          {/* Skyline Vector Graphic */}
          <svg
            className={s.skylineSvg}
            viewBox="0 0 200 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="160" cy="28" r="16" fill="#fde68a" opacity="0.6" />
            <path
              d="M0 65 L20 65 L20 40 L35 40 L35 65 L45 65 L45 28 L62 28 L62 65 L70 65 L70 35 L88 35 L88 65 L100 65 L100 20 L118 20 L118 65 L130 65 L130 38 L148 38 L148 65 L160 65 L160 30 L178 30 L178 65 L200 65 L200 90 L0 90 Z"
              fill="#93c5fd"
              opacity="0.4"
            />
            <path
              d="M10 65 L30 65 L30 46 L48 46 L48 65 L55 65 L55 36 L72 36 L72 65 L82 65 L82 25 L102 25 L102 65 L112 65 L112 42 L132 42 L132 65 L142 65 L142 32 L162 32 L162 65 L180 65 L180 48 L195 48 L195 65 L200 65 L200 90 L0 90 Z"
              fill="#60a5fa"
              opacity="0.65"
            />
            <rect x="0" y="65" width="200" height="25" fill="#334155" />
            <line x1="0" y1="78" x2="200" y2="78" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="8 6" />
            <circle cx="20" cy="62" r="7" fill="#10b981" />
            <circle cx="36" cy="61" r="9" fill="#059669" />
            <circle cx="78" cy="62" r="8" fill="#10b981" />
            <circle cx="94" cy="60" r="10" fill="#059669" />
            <circle cx="140" cy="62" r="8" fill="#10b981" />
            <circle cx="156" cy="60" r="10" fill="#059669" />
            <circle cx="185" cy="62" r="7" fill="#10b981" />
          </svg>
        </div>
      </aside>

      {/* ============================================================
         2. MAIN CONTENT AREA
         ============================================================ */}
      <main className={s.mainContent}>
        {/* Top Header Row */}
        <div className={s.headerBar}>
          <div>
            <h1 className={s.headerTitle}>Municipal SLA &amp; Intelligence Hub</h1>
            <p className={s.headerSubtitle}>
              Cross-department performance rankings, resolution speed velocity, and civic health diagnostics.
            </p>
          </div>

          <div className={s.headerActions}>
            <div
              className={s.dateRangePicker}
              onClick={() => showToast('Calendar range: September 2026 Active', 'info')}
            >
              <Icon name="calendar_today" size={15} style={{ color: '#2563eb' }} />
              <span>{dateRange}</span>
              <Icon name="expand_more" size={16} style={{ color: '#94a3b8' }} />
            </div>

            <button
              type="button"
              className={s.btnExportReport}
              onClick={handleExportReport}
            >
              <Icon name="download" size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* 3. TOP 4 KPI CARDS */}
        <div className={s.kpiGrid}>
          {/* Card 1: City-Wide SLA Compliance */}
          <div
            className={s.kpiCard}
            onClick={() => showToast('City-Wide SLA Compliance: 95.4% adherence across 14 municipal sectors.', 'success')}
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Icon name="verified_user" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>CITY-WIDE SLA COMPLIANCE</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue} style={{ color: '#059669' }}>
                    95.4%
                  </span>
                  <span className={s.trendBadge}>↑ 2.8%</span>
                </div>
                <span className={s.kpiFootnote}>vs last municipal quarter</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[92.0, 92.8, 93.4, 94.1, 94.8, 95.1, 95.4]}
                color="#10b981"
                fillColor="#86efac"
              />
            </div>
          </div>

          {/* Card 2: Average City TAT Velocity */}
          <div
            className={s.kpiCard}
            onClick={() => showToast('Average City TAT Velocity: 16.2 hours (Benchmark: < 24 hrs).', 'info')}
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Icon name="schedule" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>AVERAGE CITY TAT VELOCITY</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>16.2 hrs</span>
                  <span className={s.trendBadge}>↓ 18%</span>
                </div>
                <span className={s.kpiFootnote}>Target SLA: &lt; 24.0 hours</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[19.8, 19.1, 18.4, 17.5, 17.0, 16.5, 16.2]}
                color="#2563eb"
                fillColor="#93c5fd"
              />
            </div>
          </div>

          {/* Card 3: Total Complaints Processed */}
          <div
            className={s.kpiCard}
            onClick={() => showToast('Total Complaints Processed: 2,486 issues triaged this cycle.', 'info')}
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <Icon name="layers" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>TOTAL COMPLAINTS PROCESSED</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>2,486</span>
                  <span className={s.trendBadge}>↑ 14%</span>
                </div>
                <span className={s.kpiFootnote}>vs previous period</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[2150, 2200, 2280, 2350, 2410, 2450, 2486]}
                color="#8b5cf6"
                fillColor="#c4b5fd"
              />
            </div>
          </div>

          {/* Card 4: Operational Directorate Units */}
          <div
            className={s.kpiCard}
            onClick={() => showToast('6 Active Municipal Departments fully connected.', 'info')}
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <Icon name="account_tree" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>OPERATIONAL DIRECTORATE UNITS</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>6</span>
                </div>
                <span className={s.kpiFootnote}>Active Municipal Departments</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[6, 6, 6, 6, 6, 6, 6]}
                color="#f59e0b"
                fillColor="#fde68a"
              />
            </div>
          </div>
        </div>

        {/* 4. ROW 2: DUAL MAIN VISUALIZATIONS */}
        <div className={s.dualChartsRow}>
          {/* Left Chart: Civic Domain Workload */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader}>
              <div>
                <h3 className={s.cardTitle}>Civic Domain Workload &amp; Efficiency Breakdown</h3>
                <p className={s.cardSubtitle}>Real-time telemetry across municipal infrastructure sectors</p>
              </div>

              <div className={s.toggleButtonGroup}>
                {(['Complaints', 'Resolution Rate', 'Avg. TAT'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${s.btnToggle} ${activeDomainTab === tab ? s.btnToggleActive : ''}`}
                    onClick={() => setActiveDomainTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Pill Bar Chart */}
            <div className={s.barsContainer}>
              {/* Horizontal Gridlines */}
              <div className={s.gridLines}>
                {[800, 600, 400, 200, 0].map((tick) => (
                  <div key={tick} className={s.gridLine}>
                    <span className={s.gridLineText}>{tick}</span>
                    <div className={s.gridLineDash} />
                  </div>
                ))}
              </div>

              {/* 6 Pillars */}
              {domainData.map((d, idx) => {
                const displayVal =
                  activeDomainTab === 'Complaints'
                    ? d.value
                    : activeDomainTab === 'Resolution Rate'
                    ? d.rate
                    : d.tat;

                return (
                  <div
                    key={idx}
                    className={s.barCol}
                    onClick={() => showToast(`${d.label}: ${displayVal} (${activeDomainTab})`, 'info')}
                  >
                    <span className={s.barTopVal}>{displayVal}</span>
                    <div
                      className={s.barPillar}
                      style={{
                        height: `${d.height}px`,
                        background: d.gradient,
                      }}
                    >
                      <div className={s.barPillarIcon}>{d.icon}</div>
                    </div>
                    <span className={s.barLabel}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Chart: Complaint Influx vs Resolution Trend */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader}>
              <div>
                <h3 className={s.cardTitle}>Complaint Influx vs Resolution Trend</h3>
                <p className={s.cardSubtitle}>Daily complaint intake vs resolution performance</p>
              </div>

              <div className={s.legendGroup}>
                <div className={s.legendItem}>
                  <span className={s.legendDot} style={{ background: '#2563eb' }} />
                  <span>New Complaints</span>
                </div>
                <div className={s.legendItem}>
                  <span className={s.legendDot} style={{ background: '#10b981' }} />
                  <span>Resolved</span>
                </div>
              </div>
            </div>

            {/* Wave Chart with Tooltip Node */}
            <div className={s.waveChartContainer}>
              {/* Tooltip Box over 20 Sep */}
              <div className={s.tooltipBox}>
                <div className={s.tooltipDate}>20 Sep 2026</div>
                <div className={s.tooltipRow}>
                  <span className={s.legendDot} style={{ background: '#2563eb' }} />
                  <span>New Complaints: 128</span>
                </div>
                <div className={s.tooltipRow}>
                  <span className={s.legendDot} style={{ background: '#10b981' }} />
                  <span>Resolved: 102</span>
                </div>
              </div>

              <svg
                className={s.waveSvg}
                viewBox="0 0 500 200"
                preserveAspectRatio="none"
              >
                {/* Horizontal Dashed Gridlines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="185" x2="500" y2="185" stroke="#e2e8f0" strokeWidth="1" />

                {/* Vertical Dotted Guide Line on 20 Sep */}
                <line x1="330" y1="20" x2="330" y2="185" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Blue Wave: New Complaints */}
                <path
                  d="M0 130 C40 120, 60 100, 80 102 C110 105, 130 85, 160 88 C190 92, 210 110, 240 100 C270 90, 290 105, 310 98 C325 90, 330 65, 340 70 C360 80, 380 65, 410 70 C440 75, 470 60, 500 65 L500 185 L0 185 Z"
                  fill="rgba(37, 99, 235, 0.12)"
                />
                <path
                  d="M0 130 C40 120, 60 100, 80 102 C110 105, 130 85, 160 88 C190 92, 210 110, 240 100 C270 90, 290 105, 310 98 C325 90, 330 65, 340 70 C360 80, 380 65, 410 70 C440 75, 470 60, 500 65"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Green Wave: Resolved Complaints */}
                <path
                  d="M0 160 C40 150, 70 145, 90 148 C120 152, 140 138, 170 140 C200 142, 220 155, 250 145 C280 135, 300 145, 320 135 C328 128, 330 95, 340 102 C360 115, 380 110, 410 115 C440 120, 470 95, 500 100 L500 185 L0 185 Z"
                  fill="rgba(16, 185, 129, 0.2)"
                />
                <path
                  d="M0 160 C40 150, 70 145, 90 148 C120 152, 140 138, 170 140 C200 142, 220 155, 250 145 C280 135, 300 145, 320 135 C328 128, 330 95, 340 102 C360 115, 380 110, 410 115 C440 120, 470 95, 500 100"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Highlight Anchor Dots on 20 Sep */}
                <circle cx="330" cy="70" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="330" cy="102" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className={s.xAxisLabels}>
                <span>01 Sep</span>
                <span>05 Sep</span>
                <span>10 Sep</span>
                <span>15 Sep</span>
                <span>20 Sep</span>
                <span>25 Sep</span>
                <span>30 Sep</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. ROW 3: THREE CARDS (44% / 28% / 28%) */}
        <div className={s.threeCardsRow}>
          {/* Card 1: Department Performance Table */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 8 }}>
              <div>
                <h3 className={s.cardTitle}>Department Performance (SLA Compliance)</h3>
                <p className={s.cardSubtitle}>Resolution rate and average TAT by department</p>
              </div>
              <button
                type="button"
                className={s.viewAllLink}
                onClick={() => showToast('Navigating to full department telemetry matrix...', 'info')}
              >
                View All Departments →
              </button>
            </div>

            <div className={s.deptTableWrapper}>
              <table className={s.deptTable}>
                <thead>
                  <tr>
                    <th style={{ width: 26 }}>#</th>
                    <th>DEPARTMENT</th>
                    <th>TOTAL</th>
                    <th>RESOLVED</th>
                    <th>SLA %</th>
                    <th>AVG. TAT</th>
                    <th>TREND</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRows.map((d) => (
                    <tr key={d.rank}>
                      <td>
                        <span
                          className={`${s.deptNumBadge} ${d.rank === 1 ? s.deptNumBadgeGold : ''}`}
                        >
                          {d.rank}
                        </span>
                      </td>
                      <td>
                        <div className={s.deptNameCell}>
                          <Icon name={d.icon} size={15} className={s.deptIcon} />
                          <span>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.total}</td>
                      <td>{d.resolved}</td>
                      <td>
                        <span className={d.isSlaGood ? s.pillSlaGreen : s.pillSlaRed}>
                          {d.sla}
                        </span>
                      </td>
                      <td>{d.tat}</td>
                      <td>
                        <Sparkline data={d.trend} color={d.trendColor} width={42} height={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Complaint Status Distribution Donut */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 4 }}>
              <div>
                <h3 className={s.cardTitle}>Complaint Status Distribution</h3>
                <p className={s.cardSubtitle}>Current status of all complaints</p>
              </div>
            </div>

            <div className={s.donutWrapper}>
              <div className={s.donutSvgWrap}>
                <svg className={s.donutSvg} viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                  {/* Resolved: 44.7% (green #10b981) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="15"
                    strokeDasharray="107 239"
                    strokeDashoffset="0"
                  />
                  {/* In Progress: 24.6% (purple #8b5cf6) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="15"
                    strokeDasharray="59 239"
                    strokeDashoffset="-107"
                  />
                  {/* Assigned: 19.5% (amber #f59e0b) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="15"
                    strokeDasharray="47 239"
                    strokeDashoffset="-166"
                  />
                  {/* Pending: 8.5% (blue #2563eb) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="15"
                    strokeDasharray="20 239"
                    strokeDashoffset="-213"
                  />
                  {/* Rejected: 2.6% (red #ef4444) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="15"
                    strokeDasharray="6 239"
                    strokeDashoffset="-233"
                  />
                </svg>
                <div className={s.donutCenterText}>
                  <span className={s.donutCenterNum}>2,486</span>
                  <span className={s.donutCenterLabel}>Total</span>
                </div>
              </div>

              <div className={s.donutLegendList}>
                <div className={s.donutLegendRow}>
                  <div className={s.donutLegendLeft}>
                    <span className={s.legendDot} style={{ background: '#2563eb' }} />
                    <span>Pending</span>
                  </div>
                  <span className={s.donutLegendVal}>212 (8.5%)</span>
                </div>

                <div className={s.donutLegendRow}>
                  <div className={s.donutLegendLeft}>
                    <span className={s.legendDot} style={{ background: '#f59e0b' }} />
                    <span>Assigned</span>
                  </div>
                  <span className={s.donutLegendVal}>486 (19.5%)</span>
                </div>

                <div className={s.donutLegendRow}>
                  <div className={s.donutLegendLeft}>
                    <span className={s.legendDot} style={{ background: '#8b5cf6' }} />
                    <span>In Progress</span>
                  </div>
                  <span className={s.donutLegendVal}>612 (24.6%)</span>
                </div>

                <div className={s.donutLegendRow}>
                  <div className={s.donutLegendLeft}>
                    <span className={s.legendDot} style={{ background: '#10b981' }} />
                    <span>Resolved</span>
                  </div>
                  <span className={s.donutLegendVal}>1,112 (44.7%)</span>
                </div>

                <div className={s.donutLegendRow}>
                  <div className={s.donutLegendLeft}>
                    <span className={s.legendDot} style={{ background: '#ef4444' }} />
                    <span>Rejected</span>
                  </div>
                  <span className={s.donutLegendVal}>64 (2.6%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Citizen Satisfaction */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 4 }}>
              <div>
                <h3 className={s.cardTitle}>Citizen Satisfaction ⓘ</h3>
                <p className={s.cardSubtitle}>Based on 482 verified reviews</p>
              </div>
            </div>

            <div className={s.satisfactionBlock}>
              <div className={s.starBadgeBig}>★</div>
              <div className={s.ratingInfoCol}>
                <div className={s.ratingNumRow}>
                  <span className={s.ratingNum}>4.7</span>
                  <span style={{ fontSize: 16, color: '#64748b' }}>/ 5.0</span>
                  <span className={s.trendBadge} style={{ marginLeft: 6 }}>
                    ↑ 0.2
                  </span>
                </div>
                <div className={s.ratingStarsRow}>★★★★★</div>
              </div>
            </div>

            <div className={s.starBarsList}>
              {[
                { stars: '5 ★', pct: 75, count: 362 },
                { stars: '4 ★', pct: 16, count: 77 },
                { stars: '3 ★', pct: 6, count: 29 },
                { stars: '2 ★', pct: 2, count: 9 },
                { stars: '1 ★', pct: 1, count: 5 },
              ].map((row) => (
                <div key={row.stars} className={s.starBarRow}>
                  <span className={s.starBarLabel}>{row.stars}</span>
                  <div className={s.starBarTrack}>
                    <div className={s.starBarFill} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={s.starBarVal}>
                    {row.pct}% ({row.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. ROW 4: THREE INSIGHT CARDS (34% / 36% / 30%) */}
        <div className={s.bottomCardsRow}>
          {/* Card 1: Top 5 Recurring Issues */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 8 }}>
              <div>
                <h3 className={s.cardTitle}>Top 5 Recurring Issues</h3>
                <p className={s.cardSubtitle}>Most reported issues this period</p>
              </div>
              <button
                type="button"
                className={s.viewAllLink}
                onClick={() => showToast('Viewing all recurring incident clusters...', 'info')}
              >
                View All →
              </button>
            </div>

            <div className={s.recurringList}>
              {[
                { rank: 1, title: 'Potholes & Damaged Roads', val: 412, fill: '#f87171', pct: 90, badgeBg: '#fee2e2', badgeCol: '#ef4444' },
                { rank: 2, title: 'Garbage Not Collected', val: 328, fill: '#fb923c', pct: 72, badgeBg: '#ffedd5', badgeCol: '#ea580c' },
                { rank: 3, title: 'Drainage Blockage', val: 286, fill: '#fbbf24', pct: 62, badgeBg: '#fef3c7', badgeCol: '#d97706' },
                { rank: 4, title: 'Street Lights Not Working', val: 214, fill: '#94a3b8', pct: 47, badgeBg: '#f1f5f9', badgeCol: '#475569' },
                { rank: 5, title: 'Water Leakage', val: 198, fill: '#94a3b8', pct: 43, badgeBg: '#f1f5f9', badgeCol: '#475569' },
              ].map((item) => (
                <div key={item.rank} className={s.recurringRow}>
                  <div className={s.recurringLeft}>
                    <span
                      className={s.recurringNum}
                      style={{ background: item.badgeBg, color: item.badgeCol }}
                    >
                      {item.rank}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <div className={s.recurringBarTrack}>
                    <div
                      className={s.recurringBarFill}
                      style={{ width: `${item.pct}%`, background: item.fill }}
                    />
                  </div>
                  <span className={s.recurringVal}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Geographic Distribution (Top Areas) */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 8 }}>
              <div>
                <h3 className={s.cardTitle}>Geographic Distribution (Top Areas)</h3>
                <p className={s.cardSubtitle}>Complaint density by ward/zone</p>
              </div>
              <button
                type="button"
                className={s.viewAllLink}
                onClick={() => showToast('Opening GIS Heatmap telemetry overlay...', 'info')}
              >
                View Map →
              </button>
            </div>

            <div className={s.recurringList}>
              {[
                { area: 'Ward 12 - Modipada', val: 412, fill: '#3b82f6', pct: 90 },
                { area: 'Ward 8 - Ainthapali', val: 320, fill: '#0ea5e9', pct: 70 },
                { area: 'Ward 3 - Sanitation Zone', val: 286, fill: '#14b8a6', pct: 62 },
                { area: 'Ward 7 - Budharaja', val: 214, fill: '#f59e0b', pct: 47 },
                { area: 'Ward 5 - Jyoti Vihar', val: 198, fill: '#64748b', pct: 43 },
              ].map((area) => (
                <div key={area.area} className={s.recurringRow}>
                  <div className={s.recurringLeft} style={{ width: 170 }}>
                    <span>{area.area}</span>
                  </div>
                  <div className={s.recurringBarTrack}>
                    <div
                      className={s.recurringBarFill}
                      style={{ width: `${area.pct}%`, background: area.fill }}
                    />
                  </div>
                  <span className={s.recurringVal}>{area.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: AI Insights & Predictions */}
          <div className={s.chartCard}>
            <div className={s.chartCardHeader} style={{ marginBottom: 8 }}>
              <h3 className={s.cardTitle}>AI Insights &amp; Predictions</h3>
              <span className={s.aiBadge}>
                <Icon name="auto_awesome" size={13} />
                <span>Powered by AI</span>
              </span>
            </div>

            <div className={s.predictionList}>
              <div className={`${s.predictionCard} ${s.predictionCardRed}`}>
                <div className={`${s.predictionIconBox} ${s.predIconRed}`}>
                  <Icon name="trending_up" size={14} />
                </div>
                <span>12% increase in road-related complaints predicted next month (monsoon impact).</span>
              </div>

              <div className={`${s.predictionCard} ${s.predictionCardGreen}`}>
                <div className={`${s.predictionIconBox} ${s.predIconGreen}`}>
                  <Icon name="trending_up" size={14} />
                </div>
                <span>SLA risk detected in Drainage &amp; Sewage department (TAT increasing).</span>
              </div>

              <div className={`${s.predictionCard} ${s.predictionCardAmber}`}>
                <div className={`${s.predictionIconBox} ${s.predIconAmber}`}>
                  <Icon name="lightbulb" size={14} />
                </div>
                <span>Recommend additional field team allocation for Ward 12 and Ward 8.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemAnalytics;
