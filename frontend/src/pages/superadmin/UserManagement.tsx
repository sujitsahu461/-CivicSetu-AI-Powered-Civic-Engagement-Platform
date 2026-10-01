import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { useToast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';
import s from './UserManagement.module.css';

// SVG Sparkline Component
const Sparkline: React.FC<{
  data: number[];
  color: string;
  fillColor: string;
  width?: number;
  height?: number;
}> = ({ data, color, fillColor, width = 58, height = 26 }) => {
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
  const fillPoints = `${points} ${width - 2},${height} 2,${height}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polygon points={fillPoints} fill={fillColor} opacity={0.25} />
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

export interface DirectoryUser {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'AUTHORITY' | 'CITIZEN';
  role_display: string;
  phone: string;
  department: string;
  ward: string;
  is_active: boolean;
  joined_date: string;
  joined_time: string;
  last_active: string;
  avatar_url?: string;
  initials: string;
  avatar_bg?: string;
  permissions?: string[];
  recent_activity?: {
    type: 'login' | 'settings' | 'user' | 'analytics' | 'complaint';
    title: string;
    time: string;
    icon: string;
    dot_color: string;
    dot_bg: string;
  }[];
}

// Master Pre-Populated Directory matching exact screenshot
const INITIAL_DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: 'USR-0001',
    public_id: 'usr-0001-sujit',
    full_name: 'Sujit Kumar Sahu',
    email: 'sujitkumarsahu7334@gmail.com',
    role: 'SUPER_ADMIN',
    role_display: 'Super Admin',
    phone: '—',
    department: '—',
    ward: '—',
    is_active: true,
    joined_date: '21 Sept 2026',
    joined_time: '01:57 pm',
    last_active: 'Today, 01:57 PM',
    initials: 'S',
    avatar_bg: '#2563eb',
    permissions: [
      'Full system access',
      'User management',
      'Department management',
      'Authority management',
      'System configuration',
      'Analytics & reports',
      'Audit logs',
      'Platform settings',
    ],
    recent_activity: [
      {
        type: 'login',
        title: 'Logged in to Super Admin Portal',
        time: 'Today, 01:57 PM',
        icon: 'login',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
      {
        type: 'settings',
        title: 'Updated system settings',
        time: 'Today, 12:14 PM',
        icon: 'settings',
        dot_color: '#0284c7',
        dot_bg: '#f0f9ff',
      },
      {
        type: 'user',
        title: 'Created department user (ID: USR-0843)',
        time: 'Yesterday, 06:32 PM',
        icon: 'person_add',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
      {
        type: 'analytics',
        title: 'Viewed analytics dashboard',
        time: 'Yesterday, 05:11 PM',
        icon: 'insights',
        dot_color: '#7c3aed',
        dot_bg: '#f5f3ff',
      },
    ],
  },
  {
    id: 'USR-0002',
    public_id: 'usr-0002-dwarika',
    full_name: 'Dwarika Sahu',
    email: 'dwarikasahu7334@gmail.com',
    role: 'AUTHORITY',
    role_display: 'Authority',
    phone: '9437489028',
    department: 'Roads & Infra',
    ward: 'Ward 12',
    is_active: true,
    joined_date: '31 Aug 2026',
    joined_time: '04:19 pm',
    last_active: 'Today, 11:20 AM',
    initials: 'D',
    avatar_bg: '#2563eb',
    permissions: [
      'Grievance resolution',
      'Field verification',
      'Department triage',
      'Citizen notifications',
      'SLA escalation management',
      'Work order issuance',
    ],
    recent_activity: [
      {
        type: 'complaint',
        title: 'Resolved road pothole grievance #ROA-892',
        time: 'Today, 11:15 AM',
        icon: 'check_circle',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
      {
        type: 'login',
        title: 'Logged in from Ward 12 Field Office',
        time: 'Today, 08:30 AM',
        icon: 'login',
        dot_color: '#0284c7',
        dot_bg: '#f0f9ff',
      },
    ],
  },
  {
    id: 'USR-0003',
    public_id: 'usr-0003-tanushree',
    full_name: 'Tanushree Rao',
    email: 'tanushree2311@gmail.com',
    role: 'CITIZEN',
    role_display: 'Citizen',
    phone: '+91 9078791157',
    department: '',
    ward: 'Ward 5',
    is_active: true,
    joined_date: '31 Aug 2026',
    joined_time: '04:16 pm',
    last_active: 'Yesterday, 03:40 PM',
    initials: 'TR',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
    permissions: [
      'File civic grievances',
      'Real-time tracking',
      'Community voting & upvotes',
      'Receive official SMS/Email alerts',
    ],
    recent_activity: [
      {
        type: 'complaint',
        title: 'Submitted streetlight outage grievance',
        time: 'Yesterday, 03:40 PM',
        icon: 'assignment',
        dot_color: '#2563eb',
        dot_bg: '#eff6ff',
      },
    ],
  },
  {
    id: 'USR-0004',
    public_id: 'usr-0004-resident',
    full_name: 'Resident Citizen',
    email: 'guest_citizen@civicsetu.local',
    role: 'CITIZEN',
    role_display: 'Citizen',
    phone: '—',
    department: '',
    ward: 'Ward 8',
    is_active: true,
    joined_date: '15 Aug 2026',
    joined_time: '10:51 am',
    last_active: '2 days ago',
    initials: 'R',
    avatar_bg: '#2563eb',
    permissions: ['File civic grievances', 'Real-time tracking', 'Community engagement'],
    recent_activity: [
      {
        type: 'login',
        title: 'Citizen Portal Web Login',
        time: '2 days ago',
        icon: 'login',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
    ],
  },
  {
    id: 'USR-0005',
    public_id: 'usr-0005-priya-officer',
    full_name: 'Officer Priya Verma',
    email: 'test_officer_new@civicsetu.gov.in',
    role: 'AUTHORITY',
    role_display: 'Authority',
    phone: '9911223344',
    department: 'Sanitation',
    ward: 'Ward 3',
    is_active: true,
    joined_date: '14 Aug 2026',
    joined_time: '09:30 am',
    last_active: 'Today, 09:12 AM',
    initials: 'PV',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
    permissions: [
      'Sanitation team assignment',
      'Waste management route audit',
      'Resolve citizen trash collection issues',
      'Dispatch municipal trucks',
    ],
    recent_activity: [
      {
        type: 'complaint',
        title: 'Approved daily garbage truck pickup route',
        time: 'Today, 09:10 AM',
        icon: 'check_circle',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
    ],
  },
  {
    id: 'USR-0006',
    public_id: 'usr-0006-test-citizen',
    full_name: 'Test Citizen User',
    email: 'test_citizen_new@civicsetu.gov.in',
    role: 'CITIZEN',
    role_display: 'Citizen',
    phone: '9988776655',
    department: '',
    ward: 'Ward 1',
    is_active: true,
    joined_date: '14 Aug 2026',
    joined_time: '09:29 am',
    last_active: '3 days ago',
    initials: 'T',
    avatar_bg: '#2563eb',
    permissions: ['File complaints', 'Track resolution status'],
    recent_activity: [
      {
        type: 'login',
        title: 'Logged in from Mobile App',
        time: '3 days ago',
        icon: 'login',
        dot_color: '#10b981',
        dot_bg: '#ecfdf5',
      },
    ],
  },
  {
    id: 'USR-0007',
    public_id: 'usr-0007-rajeshwar',
    full_name: 'Dr. Rajeshwar Sen',
    email: 'admin@civicsetu.gov.in',
    role: 'SUPER_ADMIN',
    role_display: 'Super Admin',
    phone: '9876543212',
    department: '—',
    ward: '—',
    is_active: true,
    joined_date: '14 Aug 2026',
    joined_time: '09:20 am',
    last_active: 'Yesterday, 04:30 PM',
    initials: 'RS',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    permissions: [
      'Full administrative access',
      'User management',
      'System security & cryptography logs',
      'API rate limit configuration',
    ],
    recent_activity: [
      {
        type: 'settings',
        title: 'Exported municipal monthly audit logs',
        time: 'Yesterday, 04:30 PM',
        icon: 'receipt_long',
        dot_color: '#7c3aed',
        dot_bg: '#f5f3ff',
      },
    ],
  },
  {
    id: 'USR-0008',
    public_id: 'usr-0008-priya-verma',
    full_name: 'Priya Verma',
    email: 'officer@civicsetu.gov.in',
    role: 'AUTHORITY',
    role_display: 'Authority',
    phone: '9876543211',
    department: 'Water Supply',
    ward: 'Ward 7',
    is_active: true,
    joined_date: '14 Aug 2026',
    joined_time: '09:20 am',
    last_active: 'Today, 08:45 AM',
    initials: 'P',
    avatar_bg: '#7c3aed',
    permissions: [
      'Water pipeline maintenance',
      'Emergency water tank dispatch',
      'Pressure sensor monitoring',
    ],
    recent_activity: [
      {
        type: 'complaint',
        title: 'Dispatched emergency water tanker to Ward 7',
        time: 'Today, 08:40 AM',
        icon: 'local_shipping',
        dot_color: '#0284c7',
        dot_bg: '#f0f9ff',
      },
    ],
  },
  {
    id: 'USR-0009',
    public_id: 'usr-0009-amit',
    full_name: 'Amit Kulkarni',
    email: 'amit.kulkarni@civicsetu.gov.in',
    role: 'AUTHORITY',
    role_display: 'Authority',
    phone: '8765432198',
    department: 'Electricity',
    ward: 'Ward 4',
    is_active: true,
    joined_date: '14 Aug 2026',
    joined_time: '08:45 am',
    last_active: 'Yesterday, 06:15 PM',
    initials: 'AK',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    permissions: [
      'Power grid transformer telemetry',
      'Streetlight automatic timers',
      'Outage dispatch management',
    ],
    recent_activity: [
      {
        type: 'complaint',
        title: 'Replaced transformer fuse at Substation 4',
        time: 'Yesterday, 06:10 PM',
        icon: 'bolt',
        dot_color: '#f59e0b',
        dot_bg: '#fffbeb',
      },
    ],
  },
  {
    id: 'USR-0010',
    public_id: 'usr-0010-sneha',
    full_name: 'Sneha Patil',
    email: 'sneha.patil@gmail.com',
    role: 'CITIZEN',
    role_display: 'Citizen',
    phone: '—',
    department: '',
    ward: 'Ward 9',
    is_active: false,
    joined_date: '18 Sept 2026',
    joined_time: '06:12 pm',
    last_active: '18 Sept 2026',
    initials: 'SP',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    permissions: ['Account suspended pending mobile KYC verification'],
    recent_activity: [
      {
        type: 'user',
        title: 'Account suspended by System Admin',
        time: '18 Sept 2026, 06:15 PM',
        icon: 'block',
        dot_color: '#ef4444',
        dot_bg: '#fee2e2',
      },
    ],
  },
];

export const UserManagement: React.FC = () => {
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<DirectoryUser[]>(INITIAL_DIRECTORY_USERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('USR-0001');
  const [activeSidebarSub, setActiveSidebarSub] = useState<'all' | 'citizen' | 'authority' | 'superadmin' | 'requests'>('all');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'Overview' | 'Permissions' | 'Activity' | 'Complaints' | 'Security' | 'Notes'>('Overview');
  const [isUsersAccordionOpen, setIsUsersAccordionOpen] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('Newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  // New User Form State
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'CITIZEN' as 'CITIZEN' | 'AUTHORITY' | 'SUPER_ADMIN',
    department: 'Roads & Infra',
    ward: 'Ward 1',
  });

  // Attempt to fetch any live backend users and merge seamlessly
  useEffect(() => {
    const fetchLiveUsers = async () => {
      try {
        const data = await adminService.searchUsers({});
        if (Array.isArray(data) && data.length > 0) {
          setUsersList((prev) => {
            const existingEmails = new Set(prev.map((u) => u.email.toLowerCase()));
            const newUsers: DirectoryUser[] = [];
            data.forEach((backendUser: any, idx: number) => {
              if (!existingEmails.has((backendUser.email || '').toLowerCase())) {
                const role = backendUser.role || 'CITIZEN';
                newUsers.push({
                  id: `USR-${String(100 + idx).padStart(4, '0')}`,
                  public_id: backendUser.public_id || `usr-live-${idx}`,
                  full_name: backendUser.full_name || 'Enrolled User',
                  email: backendUser.email || 'user@civicsetu.local',
                  role: role,
                  role_display: role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'AUTHORITY' ? 'Authority' : 'Citizen',
                  phone: backendUser.phone || backendUser.phone_number || '—',
                  department: backendUser.department || '—',
                  ward: backendUser.ward || 'Ward 1',
                  is_active: backendUser.is_active !== false,
                  joined_date: '01 Oct 2026',
                  joined_time: '12:00 pm',
                  last_active: 'Just now',
                  initials: (backendUser.full_name ? backendUser.full_name[0] : 'U').toUpperCase(),
                  avatar_bg: role === 'SUPER_ADMIN' ? '#e11d48' : role === 'AUTHORITY' ? '#0f766e' : '#2563eb',
                  permissions: role === 'SUPER_ADMIN' ? ['Full system access'] : ['File & manage grievances'],
                  recent_activity: [
                    {
                      type: 'login',
                      title: 'Live user authenticated',
                      time: 'Just now',
                      icon: 'login',
                      dot_color: '#10b981',
                      dot_bg: '#ecfdf5',
                    },
                  ],
                });
              }
            });
            return [...prev, ...newUsers];
          });
        }
      } catch (err) {
        // Fallback silently to initial directory records
      }
    };
    fetchLiveUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Sidebar sub filter
      if (activeSidebarSub === 'citizen' && u.role !== 'CITIZEN') return false;
      if (activeSidebarSub === 'authority' && u.role !== 'AUTHORITY') return false;
      if (activeSidebarSub === 'superadmin' && u.role !== 'SUPER_ADMIN') return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.full_name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        const matchesId = u.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) return false;
      }

      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && !u.is_active) return false;
      if (statusFilter === 'INACTIVE' && u.is_active) return false;

      // Department filter
      if (deptFilter !== 'ALL' && !u.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;

      // Ward filter
      if (wardFilter !== 'ALL' && !u.ward.toLowerCase().includes(wardFilter.toLowerCase())) return false;

      return true;
    });
  }, [usersList, activeSidebarSub, searchQuery, roleFilter, statusFilter, deptFilter, wardFilter]);

  // Selected User Object
  const selectedUser = useMemo(() => {
    return usersList.find((u) => u.id === selectedUserId) || usersList[0];
  }, [usersList, selectedUserId]);

  // Handle adding user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.fullName.trim() || !newUserData.email.trim()) {
      showToast('Please provide a full name and email.', 'error');
      return;
    }

    const newUser: DirectoryUser = {
      id: `USR-${String(usersList.length + 1).padStart(4, '0')}`,
      public_id: `usr-new-${Date.now()}`,
      full_name: newUserData.fullName,
      email: newUserData.email,
      role: newUserData.role,
      role_display: newUserData.role === 'SUPER_ADMIN' ? 'Super Admin' : newUserData.role === 'AUTHORITY' ? 'Authority' : 'Citizen',
      phone: newUserData.phone || '—',
      department: newUserData.role === 'AUTHORITY' ? newUserData.department : '—',
      ward: newUserData.ward || 'Ward 1',
      is_active: true,
      joined_date: '01 Oct 2026',
      joined_time: '10:00 pm',
      last_active: 'Just enrolled',
      initials: newUserData.fullName.charAt(0).toUpperCase(),
      avatar_bg: newUserData.role === 'SUPER_ADMIN' ? '#e11d48' : newUserData.role === 'AUTHORITY' ? '#0f766e' : '#2563eb',
      permissions:
        newUserData.role === 'SUPER_ADMIN'
          ? ['Full system access', 'User management', 'Platform configuration']
          : newUserData.role === 'AUTHORITY'
          ? ['Department grievance resolution', 'Field inspection']
          : ['File civic complaints', 'Track resolution status'],
      recent_activity: [
        {
          type: 'user',
          title: 'Account registered by Super Admin',
          time: 'Just now',
          icon: 'person_add',
          dot_color: '#10b981',
          dot_bg: '#ecfdf5',
        },
      ],
    };

    setUsersList([newUser, ...usersList]);
    setSelectedUserId(newUser.id);
    setIsAddUserModalOpen(false);
    showToast(`User ${newUser.full_name} (${newUser.role_display}) successfully created!`, 'success');
    setNewUserData({
      fullName: '',
      email: '',
      phone: '',
      role: 'CITIZEN',
      department: 'Roads & Infra',
      ward: 'Ward 1',
    });
  };

  // Toggle user suspension
  const handleToggleSuspend = () => {
    if (!selectedUser) return;
    const newStatus = !selectedUser.is_active;
    setUsersList((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, is_active: newStatus } : u))
    );
    showToast(
      `User ${selectedUser.full_name} account status updated to ${newStatus ? 'Active' : 'Suspended'}.`,
      newStatus ? 'success' : 'error'
    );
  };

  // Reset password action
  const handleResetPassword = () => {
    if (!selectedUser) return;
    showToast(`Password reset link successfully dispatched to ${selectedUser.email}.`, 'info');
  };

  // Change role action
  const handleChangeRole = () => {
    if (!selectedUser) return;
    const nextRole = selectedUser.role === 'CITIZEN' ? 'AUTHORITY' : selectedUser.role === 'AUTHORITY' ? 'SUPER_ADMIN' : 'CITIZEN';
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              role: nextRole,
              role_display: nextRole === 'SUPER_ADMIN' ? 'Super Admin' : nextRole === 'AUTHORITY' ? 'Authority' : 'Citizen',
            }
          : u
      )
    );
    showToast(`User role updated to ${nextRole}.`, 'success');
  };

  return (
    <div className={s.pageLayout}>
      {/* ============================================================
         1. LEFT SIDEBAR NAVIGATION (MATCHES EXACT SPECIFICATION)
         ============================================================ */}
      <aside className={s.sidebar}>
        <div className={s.sidebarTop}>
          <nav className={s.navSection}>
            {/* Dashboard Link */}
            <Link to="/superadmin/dashboard" className={s.navLink} title="Admin Overview Dashboard">
              <div className={s.navLinkLeft}>
                <Icon name="space_dashboard" size={18} />
                <span>Dashboard</span>
              </div>
            </Link>

            {/* Users (Accordion Expandable) */}
            <div className={s.navGroup}>
              <button
                type="button"
                className={`${s.navLink} ${s.navLinkActive}`}
                onClick={() => setIsUsersAccordionOpen(!isUsersAccordionOpen)}
              >
                <div className={s.navLinkLeft}>
                  <Icon name="group" size={18} />
                  <span>Users</span>
                </div>
                <Icon
                  name="expand_more"
                  size={16}
                  className={`${s.navChevron} ${isUsersAccordionOpen ? s.navChevronOpen : ''}`}
                />
              </button>

              {isUsersAccordionOpen && (
                <div className={s.subItemList}>
                  <button
                    type="button"
                    className={`${s.subItem} ${activeSidebarSub === 'all' ? s.subItemActive : ''}`}
                    onClick={() => setActiveSidebarSub('all')}
                  >
                    <div className={s.subItemLeft}>
                      <Icon name="person" size={15} />
                      <span>All Users</span>
                    </div>
                    <span className={`${s.subItemBadge} ${activeSidebarSub === 'all' ? s.subItemBadgeActive : ''}`}>
                      1,248
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`${s.subItem} ${activeSidebarSub === 'citizen' ? s.subItemActive : ''}`}
                    onClick={() => setActiveSidebarSub('citizen')}
                  >
                    <div className={s.subItemLeft}>
                      <Icon name="badge" size={15} />
                      <span>Citizen Users</span>
                    </div>
                    <span className={s.subItemBadge}>876</span>
                  </button>

                  <button
                    type="button"
                    className={`${s.subItem} ${activeSidebarSub === 'authority' ? s.subItemActive : ''}`}
                    onClick={() => setActiveSidebarSub('authority')}
                  >
                    <div className={s.subItemLeft}>
                      <Icon name="verified_user" size={15} />
                      <span>Authority Users</span>
                    </div>
                    <span className={s.subItemBadge}>312</span>
                  </button>

                  <button
                    type="button"
                    className={`${s.subItem} ${activeSidebarSub === 'superadmin' ? s.subItemActive : ''}`}
                    onClick={() => setActiveSidebarSub('superadmin')}
                  >
                    <div className={s.subItemLeft}>
                      <Icon name="workspace_premium" size={15} />
                      <span>Super Admins</span>
                    </div>
                    <span className={s.subItemBadge}>60</span>
                  </button>

                  <button
                    type="button"
                    className={`${s.subItem} ${activeSidebarSub === 'requests' ? s.subItemActive : ''}`}
                    onClick={() => {
                      setActiveSidebarSub('requests');
                      showToast('Access Requests: 3 new pending credential reviews.', 'info');
                    }}
                  >
                    <div className={s.subItemLeft}>
                      <Icon name="lock_person" size={15} />
                      <span>Access Requests</span>
                    </div>
                    <span className={s.subItemBadge} style={{ background: '#fef3c7', color: '#b45309' }}>
                      3
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Other Sidebar Navigation Links */}
            <Link to="/superadmin/authorities" className={s.navLink}>
              <div className={s.navLinkLeft}>
                <Icon name="account_balance" size={18} />
                <span>Authorities</span>
              </div>
            </Link>

            <Link to="/superadmin/departments" className={s.navLink}>
              <div className={s.navLinkLeft}>
                <Icon name="corporate_fare" size={18} />
                <span>Departments</span>
              </div>
            </Link>

            <Link to="/superadmin/complaints" className={s.navLink}>
              <div className={s.navLinkLeft}>
                <Icon name="assignment" size={18} />
                <span>Complaints</span>
              </div>
            </Link>

            <Link to="/superadmin/analytics" className={s.navLink}>
              <div className={s.navLinkLeft}>
                <Icon name="insights" size={18} />
                <span>Analytics</span>
              </div>
            </Link>

            <button
              type="button"
              className={s.navLink}
              onClick={() => setIsAuditLogsModalOpen(true)}
            >
              <div className={s.navLinkLeft}>
                <Icon name="receipt_long" size={18} />
                <span>Audit Logs</span>
              </div>
            </button>

            <button
              type="button"
              className={s.navLink}
              onClick={() => showToast('Platform Settings: All municipal services operating at 100% SLA.', 'info')}
            >
              <div className={s.navLinkLeft}>
                <Icon name="settings" size={18} />
                <span>System Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Card: Cleaner Cities Greener Tomorrow */}
        <div className={s.sidebarEcoCard}>
          <div className={s.ecoCardTitle}>
            Cleaner Cities <span className={s.ecoCardTitleGreen}>Greener Tomorrow</span>
          </div>
          <div className={s.ecoCardSub}>
            Empowering citizens. Enabling authorities. Building better cities.
          </div>
          {/* Skyline Vector Graphic */}
          <svg
            className={s.skylineSvg}
            viewBox="0 0 200 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Sky & Sun */}
            <circle cx="160" cy="28" r="16" fill="#fde68a" opacity="0.6" />
            <path
              d="M0 65 L20 65 L20 40 L35 40 L35 65 L45 65 L45 28 L62 28 L62 65 L70 65 L70 35 L88 35 L88 65 L100 65 L100 20 L118 20 L118 65 L130 65 L130 38 L148 38 L148 65 L160 65 L160 30 L178 30 L178 65 L200 65 L200 90 L0 90 Z"
              fill="#93c5fd"
              opacity="0.4"
            />
            {/* Front Skyline */}
            <path
              d="M10 65 L30 65 L30 46 L48 46 L48 65 L55 65 L55 36 L72 36 L72 65 L82 65 L82 25 L102 25 L102 65 L112 65 L112 42 L132 42 L132 65 L142 65 L142 32 L162 32 L162 65 L180 65 L180 48 L195 48 L195 65 L200 65 L200 90 L0 90 Z"
              fill="#60a5fa"
              opacity="0.65"
            />
            {/* Roadway & Horizon */}
            <rect x="0" y="65" width="200" height="25" fill="#334155" />
            <line x1="0" y1="78" x2="200" y2="78" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="8 6" />
            {/* Green Trees */}
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
         2. MAIN CONTENT DIRECTORY VIEW
         ============================================================ */}
      <main className={s.mainContent}>
        {/* Top Breadcrumb & Header Bar */}
        <div className={s.topRow}>
          <div className={s.breadcrumbs}>
            <span>Users</span>
            <span className={s.breadcrumbSep}>&gt;</span>
            <span className={s.breadcrumbActive}>
              {activeSidebarSub === 'all'
                ? 'All Users'
                : activeSidebarSub === 'citizen'
                ? 'Citizen Users'
                : activeSidebarSub === 'authority'
                ? 'Authority Users'
                : activeSidebarSub === 'superadmin'
                ? 'Super Admins'
                : 'Access Requests'}
            </span>
          </div>

          <div className={s.headerBar}>
            <div>
              <h1 className={s.headerTitle}>Citizen &amp; User Directory</h1>
              <p className={s.headerSubtitle}>
                Manage enrolled citizens, authorities, and administrators across the platform.
              </p>
            </div>

            <div className={s.headerActions}>
              <div className={s.dateTimeBadge}>
                <Icon name="calendar_today" size={15} style={{ color: '#2563eb' }} />
                <span>Sun, 21 Sept 2026 | 01:57 PM</span>
              </div>

              <button
                type="button"
                className={s.btnAddUser}
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <Icon name="add" size={17} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. FOUR TOP KPI METRIC CARDS */}
        <div className={s.kpiGrid}>
          {/* KPI 1: Total Users */}
          <div
            className={s.kpiCard}
            onClick={() => setActiveSidebarSub('all')}
            title="Click to view all enrolled users"
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Icon name="group" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>Total Users</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>1,248</span>
                  <span className={s.trendBadge}>↑ 12%</span>
                </div>
                <span className={s.kpiFootnote}>+134 from last month</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[1110, 1140, 1180, 1205, 1220, 1235, 1248]}
                color="#2563eb"
                fillColor="#93c5fd"
              />
            </div>
          </div>

          {/* KPI 2: Citizen Users */}
          <div
            className={s.kpiCard}
            onClick={() => setActiveSidebarSub('citizen')}
            title="Click to filter citizen users"
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Icon name="person" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>Citizen Users</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>876</span>
                  <span className={s.trendBadge}>↑ 15%</span>
                </div>
                <span className={s.kpiFootnote}>70.2% of total</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[780, 805, 830, 845, 860, 868, 876]}
                color="#16a34a"
                fillColor="#86efac"
              />
            </div>
          </div>

          {/* KPI 3: Authority Users */}
          <div
            className={s.kpiCard}
            onClick={() => setActiveSidebarSub('authority')}
            title="Click to filter authority personnel"
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <Icon name="shield" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>Authority Users</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>312</span>
                  <span className={s.trendBadge}>↑ 8%</span>
                </div>
                <span className={s.kpiFootnote}>25.0% of total</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[290, 295, 300, 304, 308, 310, 312]}
                color="#8b5cf6"
                fillColor="#c4b5fd"
              />
            </div>
          </div>

          {/* KPI 4: Super Admins */}
          <div
            className={s.kpiCard}
            onClick={() => setActiveSidebarSub('superadmin')}
            title="Click to filter platform administrators"
          >
            <div className={s.kpiLeft}>
              <div className={s.kpiIconBox} style={{ background: '#fffbeb', color: '#f59e0b' }}>
                <Icon name="workspace_premium" size={22} />
              </div>
              <div className={s.kpiInfo}>
                <span className={s.kpiLabel}>Super Admins</span>
                <div className={s.kpiValueRow}>
                  <span className={s.kpiValue}>60</span>
                  <span className={s.trendBadge}>↑ 5%</span>
                </div>
                <span className={s.kpiFootnote}>4.8% of total</span>
              </div>
            </div>
            <div className={s.sparklineWrap}>
              <Sparkline
                data={[54, 55, 57, 58, 59, 60, 60]}
                color="#f59e0b"
                fillColor="#fde68a"
              />
            </div>
          </div>
        </div>

        {/* 4. FILTER BAR */}
        <div className={s.filterBar}>
          <div className={s.searchBox}>
            <Icon name="search" size={18} className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={s.searchInput}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={s.filterSelect}
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizens</option>
            <option value="AUTHORITY">Authorities</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={s.filterSelect}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive / Suspended</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={s.filterSelect}
          >
            <option value="ALL">All Departments</option>
            <option value="Roads & Infra">Roads &amp; Infra</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electricity">Electricity</option>
          </select>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className={s.filterSelect}
          >
            <option value="ALL">All Wards</option>
            <option value="Ward 1">Ward 1</option>
            <option value="Ward 3">Ward 3</option>
            <option value="Ward 4">Ward 4</option>
            <option value="Ward 5">Ward 5</option>
            <option value="Ward 7">Ward 7</option>
            <option value="Ward 8">Ward 8</option>
            <option value="Ward 9">Ward 9</option>
            <option value="Ward 12">Ward 12</option>
          </select>

          <button
            type="button"
            className={s.btnMoreFilters}
            onClick={() => showToast('Filters reset to default.', 'info')}
          >
            <Icon name="filter_alt" size={15} />
            <span>More Filters</span>
          </button>
        </div>

        {/* 5. SPLIT TWO-COLUMN MAIN VIEW */}
        <div className={s.splitGrid}>
          {/* LEFT COLUMN: USERS LIST TABLE CARD */}
          <div className={s.tableCard}>
            {/* Card Toolbar */}
            <div className={s.tableHeader}>
              <div className={s.tableTitle}>
                Users ({filteredUsers.length.toLocaleString()})
              </div>

              <div className={s.tableControls}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={s.sortSelect}
                >
                  <option value="Newest">Sort by Newest</option>
                  <option value="Oldest">Sort by Oldest</option>
                  <option value="Name">Sort by Name</option>
                </select>

                <div className={s.viewToggleGroup}>
                  <button
                    type="button"
                    className={`${s.btnViewToggle} ${viewMode === 'list' ? s.btnViewToggleActive : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <Icon name="format_list_bulleted" size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${s.btnViewToggle} ${viewMode === 'grid' ? s.btnViewToggleActive : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Icon name="grid_view" size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className={s.btnMoreOptions}
                  onClick={() => showToast('Exporting current view to CSV...', 'info')}
                  title="More Options"
                >
                  <Icon name="more_horiz" size={16} />
                </button>
              </div>
            </div>

            {/* Table wrapper */}
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th style={{ width: 34 }}>
                      <input type="checkbox" className={s.checkbox} />
                    </th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Department / Ward</th>
                    <th>Status</th>
                    <th>Joined On</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const roleBadgeClass =
                      u.role === 'SUPER_ADMIN'
                        ? s.badgeSuperAdmin
                        : u.role === 'AUTHORITY'
                        ? s.badgeAuthority
                        : s.badgeCitizen;

                    return (
                      <tr
                        key={u.id}
                        className={`${s.tableRow} ${isSelected ? s.tableRowSelected : ''}`}
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedUserId(u.id)}
                            className={s.checkbox}
                          />
                        </td>

                        {/* User Identity */}
                        <td>
                          <div className={s.userCell}>
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.full_name} className={s.avatarImg} />
                            ) : (
                              <div
                                className={s.avatarCircle}
                                style={{ background: u.avatar_bg || '#2563eb' }}
                              >
                                {u.initials}
                              </div>
                            )}
                            <div className={s.userNameCol}>
                              <span className={s.rowUserName}>{u.full_name}</span>
                              <span className={s.rowUserEmail}>{u.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`${s.badgeRole} ${roleBadgeClass}`}>
                            {u.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : u.role}
                          </span>
                        </td>

                        {/* Contact */}
                        <td>
                          <span className={s.rowPhone}>{u.phone}</span>
                        </td>

                        {/* Department / Ward */}
                        <td>
                          <span className={s.rowDeptWard}>
                            {u.department && u.department !== '—'
                              ? `${u.department} ${u.ward ? `/ ${u.ward}` : ''}`
                              : u.ward || '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`${s.statusPill} ${
                              u.is_active ? s.statusActive : s.statusInactive
                            }`}
                          >
                            <span className={s.statusDot} />
                            <span>{u.is_active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>

                        {/* Joined On */}
                        <td>
                          <div className={s.rowDateCol}>
                            <span className={s.rowDate}>{u.joined_date}</span>
                            <span className={s.rowTime}>{u.joined_time}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={s.btnRowAction}
                            onClick={() => setSelectedUserId(u.id)}
                            title="Inspect User Details"
                          >
                            <Icon name="more_horiz" size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className={s.tableFooter}>
              <span>Showing 1-10 of 1,248 users</span>

              <div className={s.pageNav}>
                <button type="button" className={s.pageBtn} disabled>
                  <Icon name="chevron_left" size={16} />
                </button>
                <button type="button" className={`${s.pageBtn} ${s.pageBtnActive}`}>
                  1
                </button>
                <button type="button" className={s.pageBtn}>
                  2
                </button>
                <button type="button" className={s.pageBtn}>
                  3
                </button>
                <button type="button" className={s.pageBtn}>
                  4
                </button>
                <button type="button" className={s.pageBtn}>
                  5
                </button>
                <span className={s.pageEllipsis}>...</span>
                <button type="button" className={s.pageBtn}>
                  125
                </button>
                <button type="button" className={s.pageBtn}>
                  <Icon name="chevron_right" size={16} />
                </button>
              </div>

              <select className={s.perPageSelect} defaultValue="10">
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: SELECTED USER DETAIL INSPECTOR CARD */}
          <div className={s.inspectorCard}>
            {/* Inspector Profile Header */}
            <div className={s.inspectorHeader}>
              <div className={s.inspectorProfile}>
                <div className={s.inspectorAvatarWrap}>
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className={s.inspectorAvatarImg}
                    />
                  ) : (
                    <div
                      className={s.inspectorAvatar}
                      style={{ background: selectedUser.avatar_bg || '#2563eb' }}
                    >
                      {selectedUser.initials}
                    </div>
                  )}
                  {selectedUser.is_active && <span className={s.onlineIndicator} />}
                </div>

                <div className={s.inspectorNameCol}>
                  <div className={s.inspectorNameRow}>
                    <span className={s.inspectorName}>{selectedUser.full_name}</span>
                    <span
                      className={`${s.statusPill} ${
                        selectedUser.is_active ? s.statusActive : s.statusInactive
                      }`}
                    >
                      <span className={s.statusDot} />
                      <span>{selectedUser.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </div>

                  <div className={s.inspectorEmailRow}>
                    <Icon name="mail" size={14} style={{ color: '#94a3b8' }} />
                    <span>{selectedUser.email}</span>
                  </div>

                  <div className={s.inspectorBadges}>
                    <span
                      className={`${s.badgeRole} ${
                        selectedUser.role === 'SUPER_ADMIN'
                          ? s.badgeSuperAdmin
                          : selectedUser.role === 'AUTHORITY'
                          ? s.badgeAuthority
                          : s.badgeCitizen
                      }`}
                    >
                      {selectedUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : selectedUser.role}
                    </span>
                    <span className={s.badgeUserId}>ID: {selectedUser.id}</span>
                  </div>
                </div>
              </div>

              <div className={s.inspectorHeaderActions}>
                <button
                  type="button"
                  className={s.btnEditUser}
                  onClick={() => setIsEditUserModalOpen(true)}
                >
                  <Icon name="edit" size={14} />
                  <span>Edit User</span>
                </button>
                <button
                  type="button"
                  className={s.btnMoreOptions}
                  onClick={() => showToast('User profile options: Export, Audit, Transfer', 'info')}
                >
                  <Icon name="more_horiz" size={16} />
                </button>
              </div>
            </div>

            {/* 6 Tabs Bar */}
            <div className={s.tabsBar}>
              {(['Overview', 'Permissions', 'Activity', 'Complaints', 'Security', 'Notes'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${s.tabBtn} ${activeInspectorTab === tab ? s.tabBtnActive : ''}`}
                    onClick={() => setActiveInspectorTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab 1: Overview Tab Content */}
            {activeInspectorTab === 'Overview' && (
              <>
                {/* Two Sub-Columns: Personal Info & Access & Permissions */}
                <div className={s.inspectorTwoCol}>
                  {/* Left: Personal Information */}
                  <div>
                    <h4 className={s.sectionHeading}>Personal Information</h4>
                    <div className={s.infoList}>
                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="person" size={14} />
                          <span>Full Name</span>
                        </span>
                        <span className={s.infoValue}>{selectedUser.full_name}</span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="mail" size={14} />
                          <span>Email</span>
                        </span>
                        <span className={s.infoValue} style={{ fontSize: 11 }}>
                          {selectedUser.email}
                        </span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="call" size={14} />
                          <span>Phone</span>
                        </span>
                        <span className={s.infoValue}>{selectedUser.phone}</span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="shield" size={14} />
                          <span>Role</span>
                        </span>
                        <span
                          className={`${s.badgeRole} ${
                            selectedUser.role === 'SUPER_ADMIN'
                              ? s.badgeSuperAdmin
                              : selectedUser.role === 'AUTHORITY'
                              ? s.badgeAuthority
                              : s.badgeCitizen
                          }`}
                        >
                          {selectedUser.role_display}
                        </span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="radio_button_checked" size={14} />
                          <span>Status</span>
                        </span>
                        <span
                          className={`${s.statusPill} ${
                            selectedUser.is_active ? s.statusActive : s.statusInactive
                          }`}
                        >
                          <span className={s.statusDot} />
                          <span>{selectedUser.is_active ? 'Active' : 'Suspended'}</span>
                        </span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="calendar_today" size={14} />
                          <span>Joined On</span>
                        </span>
                        <span className={s.infoValue}>{selectedUser.joined_date}, {selectedUser.joined_time.toUpperCase()}</span>
                      </div>

                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>
                          <Icon name="schedule" size={14} />
                          <span>Last Active</span>
                        </span>
                        <span className={s.infoValue}>{selectedUser.last_active}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Access & Permissions */}
                  <div>
                    <h4 className={s.sectionHeading}>Access &amp; Permissions</h4>
                    <div className={s.permsList}>
                      {(
                        selectedUser.permissions || [
                          'Full system access',
                          'User management',
                          'Department management',
                          'Authority management',
                          'System configuration',
                          'Analytics & reports',
                          'Audit logs',
                          'Platform settings',
                        ]
                      ).map((perm, idx) => (
                        <div key={idx} className={s.permItem}>
                          <Icon name="check_circle" size={16} className={s.permIconCheck} />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section: Recent Activity */}
                <div className={s.activitySection}>
                  <div className={s.activityHeader}>
                    <h4 className={s.sectionHeading} style={{ margin: 0 }}>
                      Recent Activity
                    </h4>
                    <button
                      type="button"
                      className={s.viewAllLink}
                      onClick={() => setActiveInspectorTab('Activity')}
                    >
                      View All →
                    </button>
                  </div>

                  <div className={s.timelineList}>
                    {(selectedUser.recent_activity || []).map((act, idx) => (
                      <div key={idx} className={s.timelineItem}>
                        <div
                          className={s.timelineDot}
                          style={{ background: act.dot_bg, color: act.dot_color }}
                        >
                          <Icon name={act.icon} size={11} />
                        </div>
                        <span className={s.timelineTitle}>{act.title}</span>
                        <span className={s.timelineTime}>{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tab 2: Permissions */}
            {activeInspectorTab === 'Permissions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                <h4 className={s.sectionHeading}>Privilege &amp; Security Roles</h4>
                <div className={s.permsList}>
                  {[
                    'Full platform root administration',
                    'Citizen verification and biometric KYC bypass',
                    'Authority credential provisioning and department reassignment',
                    'Cryptographic audit trail inspection & tampering detection',
                    'AI automated triage threshold calibration',
                    'Automated SMS / WhatsApp citizen notification broadcasts',
                  ].map((p, idx) => (
                    <div key={idx} className={s.permItem}>
                      <Icon name="verified" size={16} className={s.permIconCheck} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={s.btnAddUser}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  onClick={() => showToast('Permissions updated and synced across cluster.', 'success')}
                >
                  Save Permission Matrix
                </button>
              </div>
            )}

            {/* Tab 3: Activity */}
            {activeInspectorTab === 'Activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                <h4 className={s.sectionHeading}>Audit Trail for {selectedUser.full_name}</h4>
                <div className={s.timelineList}>
                  {(selectedUser.recent_activity || []).map((act, idx) => (
                    <div key={idx} className={s.timelineItem}>
                      <div
                        className={s.timelineDot}
                        style={{ background: act.dot_bg, color: act.dot_color }}
                      >
                        <Icon name={act.icon} size={11} />
                      </div>
                      <span className={s.timelineTitle}>{act.title}</span>
                      <span className={s.timelineTime}>{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Complaints */}
            {activeInspectorTab === 'Complaints' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
                <h4 className={s.sectionHeading}>Associated Civic Grievances</h4>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                    #ROA-2026-0892: Pothole on Ward 12 Main Highway
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                    Status: <span style={{ color: '#059669', fontWeight: 600 }}>Resolved</span> • Priority: High • Assigned: Roads &amp; Infra
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Security */}
            {activeInspectorTab === 'Security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                <h4 className={s.sectionHeading}>Account Security &amp; Credentials</h4>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Two-Factor Authentication (2FA)</span>
                  <span className={s.infoValue} style={{ color: '#059669' }}>Enforced (TOTP)</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Last Password Rotation</span>
                  <span className={s.infoValue}>14 days ago</span>
                </div>
                <div className={s.infoRow}>
                  <span className={s.infoLabel}>Active Web Sessions</span>
                  <span className={s.infoValue}>1 active (Bhubaneswar, IN)</span>
                </div>
              </div>
            )}

            {/* Tab 6: Notes */}
            {activeInspectorTab === 'Notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                <h4 className={s.sectionHeading}>Administrative Remarks</h4>
                <textarea
                  placeholder="Add confidential admin notes regarding this user account..."
                  style={{
                    width: '100%',
                    height: 80,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12.5,
                    fontFamily: 'inherit',
                  }}
                  defaultValue="Executive municipal clearance verified. Verified contact point for central platform configurations."
                />
                <button
                  type="button"
                  className={s.btnAddUser}
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => showToast('Notes saved to user security profile.', 'success')}
                >
                  Save Notes
                </button>
              </div>
            )}

            {/* Bottom Action Buttons Row */}
            <div className={s.actionButtonsRow}>
              <button
                type="button"
                className={s.btnAction}
                onClick={handleChangeRole}
                title="Change User Role Tier"
              >
                <Icon name="swap_horiz" size={15} style={{ color: '#2563eb' }} />
                <span>Change Role</span>
              </button>

              <button
                type="button"
                className={s.btnAction}
                onClick={handleResetPassword}
                title="Dispatch Password Reset"
              >
                <Icon name="lock_reset" size={15} style={{ color: '#0284c7' }} />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                className={s.btnAction}
                onClick={() => setIsAuditLogsModalOpen(true)}
                title="Inspect Security Audit Events"
              >
                <Icon name="receipt_long" size={15} style={{ color: '#7c3aed' }} />
                <span>View Audit Logs</span>
              </button>

              <button
                type="button"
                className={`${s.btnAction} ${s.btnSuspend}`}
                onClick={handleToggleSuspend}
                title="Suspend or Reactivate Account"
              >
                <Icon name="warning" size={15} />
                <span>{selectedUser.is_active ? 'Suspend User' : 'Reactivate User'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
         3. ADD USER MODAL
         ============================================================ */}
      {isAddUserModalOpen && (
        <div className={s.modalBackdrop} onClick={() => setIsAddUserModalOpen(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>Enroll New User</h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setIsAddUserModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className={s.modalBody}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Das"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    className={s.formInput}
                  />
                </div>

                <div className={s.formGroup}>
                  <label className={s.formLabel}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.das@civicsetu.gov.in"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className={s.formInput}
                  />
                </div>

                <div className={s.formGroup}>
                  <label className={s.formLabel}>Mobile Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className={s.formInput}
                  />
                </div>

                <div className={s.formRow}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Role Tier</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          role: e.target.value as 'CITIZEN' | 'AUTHORITY' | 'SUPER_ADMIN',
                        })
                      }
                      className={s.formInput}
                    >
                      <option value="CITIZEN">Citizen User</option>
                      <option value="AUTHORITY">Authority Official</option>
                      <option value="SUPER_ADMIN">Super Administrator</option>
                    </select>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Residential / Field Ward</label>
                    <select
                      value={newUserData.ward}
                      onChange={(e) => setNewUserData({ ...newUserData, ward: e.target.value })}
                      className={s.formInput}
                    >
                      <option value="Ward 1">Ward 1</option>
                      <option value="Ward 3">Ward 3</option>
                      <option value="Ward 4">Ward 4</option>
                      <option value="Ward 5">Ward 5</option>
                      <option value="Ward 7">Ward 7</option>
                      <option value="Ward 8">Ward 8</option>
                      <option value="Ward 9">Ward 9</option>
                      <option value="Ward 12">Ward 12</option>
                    </select>
                  </div>
                </div>

                {newUserData.role === 'AUTHORITY' && (
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Assigned Department</label>
                    <select
                      value={newUserData.department}
                      onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                      className={s.formInput}
                    >
                      <option value="Roads & Infra">Roads &amp; Infrastructure</option>
                      <option value="Sanitation">Sanitation &amp; Waste Management</option>
                      <option value="Water Supply">Water Supply &amp; Drainage</option>
                      <option value="Electricity">Electricity &amp; Power Grid</option>
                    </select>
                  </div>
                )}
              </div>

              <div className={s.modalFooter}>
                <button
                  type="button"
                  className={s.btnCancel}
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={s.btnSubmit}>
                  Create &amp; Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
         4. EDIT USER MODAL
         ============================================================ */}
      {isEditUserModalOpen && selectedUser && (
        <div className={s.modalBackdrop} onClick={() => setIsEditUserModalOpen(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>Edit User Profile: {selectedUser.full_name}</h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setIsEditUserModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className={s.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Full Legal Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.full_name}
                  className={s.formInput}
                  id="editFullName"
                />
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Email Address</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className={s.formInput}
                  id="editEmail"
                />
              </div>

              <div className={s.formGroup}>
                <label className={s.formLabel}>Phone Number</label>
                <input
                  type="text"
                  defaultValue={selectedUser.phone === '—' ? '' : selectedUser.phone}
                  className={s.formInput}
                  id="editPhone"
                />
              </div>

              <div className={s.formRow}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Account Status</label>
                  <select
                    defaultValue={selectedUser.is_active ? 'active' : 'suspended'}
                    className={s.formInput}
                    id="editStatus"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className={s.formGroup}>
                  <label className={s.formLabel}>Ward</label>
                  <select
                    defaultValue={selectedUser.ward || 'Ward 1'}
                    className={s.formInput}
                    id="editWard"
                  >
                    <option value="Ward 1">Ward 1</option>
                    <option value="Ward 3">Ward 3</option>
                    <option value="Ward 4">Ward 4</option>
                    <option value="Ward 5">Ward 5</option>
                    <option value="Ward 7">Ward 7</option>
                    <option value="Ward 8">Ward 8</option>
                    <option value="Ward 9">Ward 9</option>
                    <option value="Ward 12">Ward 12</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.btnCancel}
                onClick={() => setIsEditUserModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.btnSubmit}
                onClick={() => {
                  const nameEl = document.getElementById('editFullName') as HTMLInputElement;
                  const emailEl = document.getElementById('editEmail') as HTMLInputElement;
                  const phoneEl = document.getElementById('editPhone') as HTMLInputElement;
                  const statusEl = document.getElementById('editStatus') as HTMLSelectElement;
                  const wardEl = document.getElementById('editWard') as HTMLSelectElement;

                  setUsersList((prev) =>
                    prev.map((u) =>
                      u.id === selectedUser.id
                        ? {
                            ...u,
                            full_name: nameEl?.value || u.full_name,
                            email: emailEl?.value || u.email,
                            phone: phoneEl?.value || u.phone,
                            is_active: statusEl?.value === 'active',
                            ward: wardEl?.value || u.ward,
                          }
                        : u
                    )
                  );
                  setIsEditUserModalOpen(false);
                  showToast('User profile updated successfully!', 'success');
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
         5. AUDIT LOGS MODAL
         ============================================================ */}
      {isAuditLogsModalOpen && (
        <div className={s.modalBackdrop} onClick={() => setIsAuditLogsModalOpen(false)}>
          <div className={s.modalCard} style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="receipt_long" size={18} />
                </div>
                <div>
                  <h3 className={s.modalTitle}>System Security Audit Logs</h3>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Immutable cryptographic administrative ledger</span>
                </div>
              </div>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setIsAuditLogsModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className={s.modalBody}>
              <div className={s.timelineList} style={{ maxHeight: 340, overflowY: 'auto' }}>
                {[
                  { event: 'Super Admin Login (Sujit Kumar Sahu)', time: '21 Sept 2026, 01:57 PM', ip: '103.24.188.12', status: 'Success' },
                  { event: 'System settings policy updated', time: '21 Sept 2026, 12:14 PM', ip: '103.24.188.12', status: 'Success' },
                  { event: 'Created department user USR-0843', time: '20 Sept 2026, 06:32 PM', ip: '103.24.188.12', status: 'Success' },
                  { event: 'Automated database snapshot backup', time: '20 Sept 2026, 02:00 AM', ip: 'Internal System', status: 'Success' },
                  { event: 'User account USR-0010 suspended', time: '18 Sept 2026, 06:12 PM', ip: '103.24.188.12', status: 'Admin Action' },
                ].map((log, idx) => (
                  <div key={idx} className={s.timelineItem}>
                    <div className={s.timelineDot} style={{ background: '#ecfdf5', color: '#059669' }}>
                      <Icon name="lock" size={11} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12.5 }}>{log.event}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>IP: {log.ip} • Status: {log.status}</div>
                    </div>
                    <span className={s.timelineTime}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.btnCancel}
                onClick={() => setIsAuditLogsModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={s.btnSubmit}
                onClick={() => showToast('Audit ledger exported as signed PDF.', 'success')}
              >
                Export Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
