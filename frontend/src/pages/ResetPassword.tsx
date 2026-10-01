import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import s from './Login.module.css';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuthStore();
  const { success, error: toastError } = useToast();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() && (!uid || !token)) {
      setFormError('Please enter your registered account email address.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('New password and confirm password do not match.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: email.trim() || undefined,
        uid: uid || undefined,
        token: token || undefined,
        new_password: password,
      });

      setIsDone(true);
      success('Password successfully reset! You can now log in with your new password.');
    } catch (err: any) {
      const msg =
        err.message ||
        err.email ||
        err.detail ||
        'Failed to reset password. Please check your registered email address.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toastError(typeof msg === 'string' ? msg : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      {/* Left Panel: Government SaaS Visual Brand */}
      <div className={s.leftPanel}>
        <div className={s.geometricGrid}></div>
        <div className={s.leftGlow}></div>

        <div className={s.brandHeader}>
          <div className={s.brandLogo}>
            <img src="/logo-mark.png" alt="CivicSetu Logo" className={s.brandLogoImg} />
          </div>
          <div className={s.brandMeta}>
            <span className={s.brandName}>CivicSetu</span>
            <span className={s.brandBadge}>SECURITY & ACCESS RECOVERY</span>
          </div>
        </div>

        <div className={s.leftContent}>
          <div className={s.complianceTag}>
            <Icon name="verified_user" size={16} style={{ color: '#10b981' }} />
            <span>Official Identity & Access Management ● ISO 27001</span>
          </div>

          <h1 className={s.leftTitle}>
            Account Security & Direct Password Reset.
          </h1>

          <p className={s.leftSubtitle}>
            Direct digital credential update for CivicSetu users. Enter your registered account email and set your new password to regain access instantly.
          </p>

          <div className={s.metricGrid}>
            <div className={s.metricCard}>
              <span className={s.metricValue}>Instant</span>
              <span className={s.metricLabel}>Direct Reset</span>
            </div>
            <div className={s.metricCard}>
              <span className={s.metricValue}>256-bit</span>
              <span className={s.metricLabel}>PBKDF2 Encryption</span>
            </div>
            <div className={s.metricCard}>
              <span className={s.metricValue}>Zero Wait</span>
              <span className={s.metricLabel}>No Email Queue</span>
            </div>
          </div>
        </div>

        <div className={s.leftFooter}>
          <span>Protected under National Data Governance Framework © 2026</span>
        </div>
      </div>

      {/* Right Panel: Reset Password Form */}
      <div className={s.rightPanel}>
        <div className={s.formWrapper}>
          <div className={s.formHeader}>
            <h2 className={s.title}>Reset Account Password</h2>
            <p className={s.subtitle}>
              Enter your registered email and choose a strong new password to update your account immediately.
            </p>
          </div>

          {isDone ? (
            <div className={s.modalSuccess}>
              <div className={s.modalSuccessIcon}>✓</div>
              <h4>Password Updated Successfully!</h4>
              <p>
                Your password has been updated in the system. You can now sign in to your dashboard with your new credentials.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className={s.modalCloseBtn}
                style={{ marginTop: '20px' }}
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <>
              {formError && (
                <div className={s.errorBanner}>
                  <Icon name="error" size={18} />
                  <span>{formError}</span>
                </div>
              )}


              <form className={s.form} onSubmit={handleSubmit}>
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="e.g. yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Icon name="mail" size={18} />}
                />

                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Icon name="lock" size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                    </button>
                  }
                />

                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  leftIcon={<Icon name="lock_reset" size={18} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} size={18} />
                    </button>
                  }
                />

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  isLoading={loading}
                  rightIcon={<Icon name="arrow_forward" size={18} />}
                  className={s.submitBtn}
                >
                  Update Password Now
                </Button>
              </form>

              <div className={s.footerText} style={{ marginTop: 24 }}>
                Remember your credentials?{' '}
                <Link to="/login" className={s.signupLink}>
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
