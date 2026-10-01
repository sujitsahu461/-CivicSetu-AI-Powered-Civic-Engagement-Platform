import React, { useEffect, useState } from 'react';
import adminService from '../../services/admin.service';
import { useToast } from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import { User, UserRole } from '../../types/user';
import { formatDate } from '../../utils/formatters';
import s from './UserManagement.module.css';

export const UserManagement: React.FC = () => {
  const { error: toastError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.searchUsers({
        q: searchTerm || undefined,
        role: roleFilter || undefined,
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load user directory:', err);
      toastError(err?.response?.data?.detail || err?.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openUserDetail = (u: User) => {
    setSelectedUser(u);
    setIsDetailModalOpen(true);
  };

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'danger';
      case 'AUTHORITY':
        return 'authority';
      case 'CITIZEN':
      default:
        return 'citizen';
    }
  };

  return (
    <div className={s.container}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Citizen & User Directory</h1>
          <p className={s.subtitle}>
            Manage enrolled citizen accounts, access tiers, and security verification.
          </p>
        </div>

        <div className={s.countBadge}>
          <Icon name="people" size={16} />
          <span>Total Records: {users.length}</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className={s.filterBar}>
        <form onSubmit={handleSearchSubmit} className={s.searchForm}>
          <Input
            placeholder="Search by full name, email address, or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Icon name="search" size={18} />}
          />
        </form>

        <div className={s.selectWrapper}>
          <Select
            options={[
              { value: '', label: 'All Roles' },
              { value: 'CITIZEN', label: 'Citizens Only' },
              { value: 'AUTHORITY', label: 'Authorities Only' },
              { value: 'SUPER_ADMIN', label: 'Super Administrators' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
      </div>

      {/* User Directory Table */}
      {isLoading ? (
        <div className={s.loadingBox}>
          <span className={s.spinner}></span>
          <span>Querying user records...</span>
        </div>
      ) : users.length === 0 ? (
        <div className={s.emptyBox}>
          <Icon name="person_search" size={40} style={{ color: '#64748b' }} />
          <h3>No User Records Found</h3>
          <p>Try clearing your filter parameters or search keyword.</p>
        </div>
      ) : (
        <div className={s.tableCard}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Role Tier</th>
                <th>Contact Phone</th>
                <th>Status</th>
                <th>Enrolled Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.public_id}>
                  <td className={s.identityCell}>
                    <div className={s.avatar}>
                      {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className={s.userName}>{u.full_name || 'Citizen User'}</div>
                      <div className={s.userEmail}>{u.email}</div>
                    </div>
                  </td>

                  <td>
                    <Badge variant={getRoleVariant(u.role)}>{u.role}</Badge>
                  </td>

                  <td>
                    <span className={s.phoneText}>{u.phone || u.phone_number || '—'}</span>
                  </td>

                  <td>
                    <Badge variant={u.is_active ? 'success' : 'neutral'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  <td>
                    <span className={s.dateText}>{formatDate(u.created_at)}</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={s.btnInspect}
                      onClick={() => openUserDetail(u)}
                      title="Inspect User Details"
                    >
                      <Icon name="visibility" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Account Details"
      >
        {selectedUser && (
          <div className={s.modalBody}>
            <div className={s.userHeader}>
              <div className={s.largeAvatar}>
                {selectedUser.full_name ? selectedUser.full_name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className={s.modalName}>{selectedUser.full_name || 'Citizen User'}</h3>
                <p className={s.modalEmail}>{selectedUser.email}</p>
                <div className={s.badgeRow}>
                  <Badge variant={getRoleVariant(selectedUser.role)}>{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.is_active ? 'success' : 'neutral'}>
                    {selectedUser.is_active ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className={s.infoGrid}>
              <div className={s.infoBox}>
                <span className={s.infoLabel}>User UUID</span>
                <span className={s.infoVal} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {selectedUser.public_id}
                </span>
              </div>
              <div className={s.infoBox}>
                <span className={s.infoLabel}>Mobile Number</span>
                <span className={s.infoVal}>{selectedUser.phone || selectedUser.phone_number || 'Not provided'}</span>
              </div>
              <div className={s.infoBox}>
                <span className={s.infoLabel}>Residential Ward / Address</span>
                <span className={s.infoVal}>{selectedUser.address || 'Not assigned'}</span>
              </div>
              <div className={s.infoBox}>
                <span className={s.infoLabel}>Account Registered</span>
                <span className={s.infoVal}>{formatDate(selectedUser.created_at)}</span>
              </div>
            </div>

            {selectedUser.bio && (
              <div className={s.bioBox}>
                <span className={s.infoLabel}>Bio Notes</span>
                <p className={s.bioText}>{selectedUser.bio}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
