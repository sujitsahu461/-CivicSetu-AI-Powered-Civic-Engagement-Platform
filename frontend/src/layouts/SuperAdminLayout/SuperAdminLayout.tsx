import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Icon from '../../components/ui/Icon';
import s from './SuperAdminLayout.module.css';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: 'space_dashboard' },
    { label: 'Departments', path: '/superadmin/departments', icon: 'domain' },
    { label: 'Authorities', path: '/superadmin/authorities', icon: 'badge' },
    { label: 'Users', path: '/superadmin/users', icon: 'group' },
    { label: 'Complaints', path: '/superadmin/complaints', icon: 'folder_open' },
    { label: 'Analytics', path: '/superadmin/analytics', icon: 'insights' },
  ];

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Admin';
  const avatarLetter = user?.full_name ? user.full_name.trim()[0].toUpperCase() : 'S';

  return (
    <div className={s.layoutContainer}>
      {/* ================= TOP NAVBAR ================= */}
      <header className={s.navbar}>
        <div className={s.navInner}>
          {/* Left: Brand & Slogan */}
          <Link to="/superadmin/dashboard" className={s.brandGroup} title="CivicSetu Super Admin Portal">
            <div className={s.brandLogo}>
              <img src="/logo-mark.png" alt="CivicSetu Logo" className={s.brandLogoImg} />
            </div>
            <div className={s.brandText}>
              <div className={s.brandTitleRow}>
                <span className={s.brandName}>CivicSetu</span>
                <span className={s.brandBadge}>
                  <span className={s.pulseDot}></span>
                  Super Admin
                </span>
              </div>
              <span className={s.brandSubtitle}>Municipal Administration Platform</span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className={s.navLinks}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${s.navLink} ${isActive ? s.activeNavLink : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Controls */}
          <div className={s.navRight}>
            <div className={s.userDropdownWrap} ref={dropdownRef}>
              <button
                type="button"
                className={s.userTrigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User Menu"
              >
                <div className={s.userAvatar}>{avatarLetter}</div>
                <span className={s.userName}>{displayName}</span>
                <Icon
                  name="expand_more"
                  size={18}
                  className={`${s.chevronIcon} ${dropdownOpen ? s.chevronOpen : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className={s.dropdownMenu}>
                  <div className={s.dropdownHeader}>
                    <div className={s.dropdownUserName}>{user?.full_name || 'System Admin'}</div>
                    <div className={s.dropdownUserEmail}>{user?.email || 'admin@civicsetu.gov'}</div>
                    <div className={s.dropdownDeptTag}>Super Administrator</div>
                  </div>

                  {navLinks.slice(0, 3).map((item) => (
                    <Link key={item.path} to={item.path} className={s.dropdownItem}>
                      <Icon name={item.icon} size={17} />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className={s.dropdownDivider} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${s.dropdownItem} ${s.dropdownLogout}`}
                  >
                    <Icon name="logout" size={17} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={s.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`${s.mobileMenu} ${mobileMenuOpen ? s.open : ''}`}>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={s.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className={`${s.mobileNavLink} ${s.dropdownLogout}`}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <Icon name="logout" size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* ================= MAIN WORKSPACE ================= */}
      <main className={s.mainWorkspace}>
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerTop}>
            <div className={s.footerBrand}>
              <div className={s.footerLogoRow}>
                <div className={s.brandLogo} style={{ width: 28, height: 28 }}>
                  <img src="/logo-mark.png" alt="CivicSetu" className={s.brandLogoImg} />
                </div>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>CivicSetu</strong>
              </div>
              <p className={s.footerDesc}>
                Super Administration Console — Municipal oversight, department management,
                and system-wide governance controls.
              </p>
            </div>

            <div className={s.footerHelplineBox}>
              <span className={s.helplineTitle}>Admin Support</span>
              <div className={s.helplineNumbers}>
                <div className={s.helplineItem}>
                  <Icon name="call" size={15} style={{ color: '#2563eb' }} />
                  <span>Municipal Control: <strong>1913</strong></span>
                </div>
                <div className={s.helplineItem}>
                  <Icon name="local_police" size={15} style={{ color: '#16a36a' }} />
                  <span>Emergency: <strong>112</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className={s.footerBottom}>
            <div>
              &copy; {new Date().getFullYear()} CivicSetu. Municipal Administration Platform.
            </div>
            <div className={s.footerLinks}>
              <Link to="/superadmin/dashboard" className={s.footerLink}>Dashboard</Link>
              <Link to="/superadmin/departments" className={s.footerLink}>Departments</Link>
              <Link to="/superadmin/analytics" className={s.footerLink}>Analytics</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdminLayout;
