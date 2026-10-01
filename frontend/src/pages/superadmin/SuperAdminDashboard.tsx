import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService, { DepartmentItem } from '../../services/admin.service';
import useAuthStore from '../../store/authStore';
import { Complaint } from '../../types/complaint';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTimeAgo, truncateText } from '../../utils/formatters';
import s from './SuperAdminDashboard.module.css';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userCount, setUserCount] = useState({ citizens: 0, officers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [deptData, cmpData, usersData] = await Promise.all([
        adminService.getDepartments(),
        adminService.getSystemComplaints(),
        adminService.searchUsers(),
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : []);

      const cmpList = Array.isArray(cmpData) ? cmpData : cmpData?.results || [];
      setComplaints(cmpList);

      const safeUsers = Array.isArray(usersData) ? usersData : usersData?.results || [];
      const citizens = safeUsers.filter((u: any) => u.role === 'CITIZEN').length;
      const officers = safeUsers.filter((u: any) => u.role === 'AUTHORITY' || u.role === 'SUPER_ADMIN').length;
      setUserCount({ citizens, officers });
    } catch {
      // Fallback
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(false);
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 4000);
    window.addEventListener('focus', () => loadDashboardData(true));
    return () => {
      clearInterval(interval);
    };
  }, []);

  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const urgentCount = complaints.filter((c) => c.priority === 'URGENT' && c.status !== 'RESOLVED').length;
  const resolutionRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(1) : '100';

  return (
    <div className={s.container}>
      {/* Super Admin Top Header */}
      <div className={s.headerBanner}>
        <div className={s.bannerMeta}>
          <div className={s.adminBadge}>
            <Icon name="verified_user" size={24} />
          </div>
          <div>
            <span className={s.govTag}>NATIONAL GOVERNANCE PORTAL</span>
            <h1 className={s.bannerTitle}>Super Administration Console</h1>
            <p className={s.bannerSub}>
              Logged in as {user?.full_name || 'System Admin'} ● Municipal Oversight & Multi-Ward Control
            </p>
          </div>
        </div>

        <div className={s.headerActions}>
          <Link to="/superadmin/departments" className={s.btnPrimary}>
            <Icon name="add_business" size={18} />
            <span>Manage Departments</span>
          </Link>
          <Link to="/superadmin/authorities" className={s.btnSecondary}>
            <Icon name="person_add" size={18} />
            <span>Officer Provisioning</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Counters */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiIconBox} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Icon name="groups" size={24} />
          </div>
          <div className={s.kpiData}>
            <span className={s.kpiLabel}>Enrolled Citizens</span>
            <span className={s.kpiVal}>{isLoading ? '...' : userCount.citizens || 1}</span>
            <span className={s.kpiFoot}>Verified Voters & Residents</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiIconBox} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Icon name="badge" size={24} />
          </div>
          <div className={s.kpiData}>
            <span className={s.kpiLabel}>Nodal Officers</span>
            <span className={s.kpiVal}>{isLoading ? '...' : userCount.officers || 1}</span>
            <span className={s.kpiFoot}>Across 8 Civic Departments</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiIconBox} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Icon name="folder_open" size={24} />
          </div>
          <div className={s.kpiData}>
            <span className={s.kpiLabel}>Total Grievances</span>
            <span className={s.kpiVal}>{isLoading ? '...' : totalComplaints}</span>
            <span className={s.kpiFoot}>Pending: {pendingCount} | WIP: {inProgressCount}</span>
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiIconBox} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Icon name="task_alt" size={24} />
          </div>
          <div className={s.kpiData}>
            <span className={s.kpiLabel}>Platform SLA Adherence</span>
            <span className={s.kpiVal} style={{ color: '#34d399' }}>
              {isLoading ? '...' : `${resolutionRate}%`}
            </span>
            <span className={s.kpiFoot}>{resolvedCount} Resolved Complaints</span>
          </div>
        </div>
      </div>

      {/* Department Health Overview */}
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <div>
            <h2 className={s.sectionTitle}>Municipal Departments Directory</h2>
            <p className={s.sectionSub}>Active civic departments registered in the municipal jurisdiction</p>
          </div>
          <Link to="/superadmin/departments" className={s.viewAllLink}>
            <span>Manage All Departments</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className={s.loadingBox}>
            <span className={s.spinner}></span>
            <span>Loading department nodes...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className={s.emptyDept}>
            <Icon name="domain_disabled" size={36} />
            <p>No departments configured. Click "Manage Departments" to create municipal units.</p>
          </div>
        ) : (
          <div className={s.deptGrid}>
            {departments.map((dept) => (
              <div key={dept.public_id} className={s.deptCard}>
                <div className={s.deptTop}>
                  <div className={s.deptIconBox}>
                    <Icon name="account_balance" size={20} />
                  </div>
                  <Badge variant={dept.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {dept.status}
                  </Badge>
                </div>

                <h3 className={s.deptName}>{dept.name}</h3>
                <p className={s.deptDesc}>
                  {dept.description ? truncateText(dept.description, 70) : 'Standard municipal works and service maintenance.'}
                </p>

                <div className={s.deptFooter}>
                  <div className={s.deptMeta}>
                    <Icon name="person" size={14} />
                    <span>{dept.authority_count ?? 1} Officers Assigned</span>
                  </div>
                  <Link
                    to={`/superadmin/departments?id=${dept.public_id}`}
                    className={s.deptActionLink}
                  >
                    <span>Config</span>
                    <Icon name="chevron_right" size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Recent Grievances & Quick Governance */}
      <div className={s.bottomGrid}>
        <div className={s.recentCard}>
          <div className={s.recentHeader}>
            <h3 className={s.recentTitle}>System Incident Registry (Recent)</h3>
            <Link to="/superadmin/complaints" className={s.viewAllLink}>
              <span>Full Archive</span>
              <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className={s.emptyRecent}>No recent platform grievances recorded.</div>
          ) : (
            <div className={s.recentList}>
              {complaints.slice(0, 5).map((c) => (
                <div key={c.public_id || c.tracking_code} className={s.recentItem}>
                  <div className={s.recentMain}>
                    <div className={s.recentMeta}>
                      <span className={s.recentCode}>{c.tracking_code}</span>
                      <Badge
                        variant={
                          c.status === 'RESOLVED'
                            ? 'success'
                            : c.status === 'PENDING'
                            ? 'warning'
                            : 'authority'
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className={s.recentCategory}>{c.category_display || c.category}</span>
                    </div>
                    <div className={s.recentTitleText}>{c.title}</div>
                    <div className={s.recentAddress}>
                      <Icon name="location_on" size={12} />
                      <span>{truncateText(c.location_address, 45)}</span>
                    </div>
                  </div>
                  <div className={s.recentTime}>{formatTimeAgo(c.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Governance Center */}
        <div className={s.govCard}>
          <h3 className={s.govTitle}>Governance Quick Actions</h3>

          <div className={s.govLinks}>
            <Link to="/superadmin/departments" className={s.govItem}>
              <div className={s.govIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Icon name="domain_add" size={20} />
              </div>
              <div className={s.govText}>
                <span className={s.govHead}>Add New Department</span>
                <span className={s.govSub}>Configure municipal ward & SLA targets</span>
              </div>
            </Link>

            <Link to="/superadmin/authorities" className={s.govItem}>
              <div className={s.govIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Icon name="person_add" size={20} />
              </div>
              <div className={s.govText}>
                <span className={s.govHead}>Provision Officer Credentials</span>
                <span className={s.govSub}>Enroll nodal officers and assign department head</span>
              </div>
            </Link>

            <Link to="/superadmin/users" className={s.govItem}>
              <div className={s.govIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Icon name="manage_accounts" size={20} />
              </div>
              <div className={s.govText}>
                <span className={s.govHead}>Citizen & User Directory</span>
                <span className={s.govSub}>Inspect accounts, verify emails & toggle status</span>
              </div>
            </Link>

            <Link to="/superadmin/analytics" className={s.govItem}>
              <div className={s.govIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Icon name="query_stats" size={20} />
              </div>
              <div className={s.govText}>
                <span className={s.govHead}>City-Wide SLA Diagnostics</span>
                <span className={s.govSub}>Inter-departmental performance index</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
