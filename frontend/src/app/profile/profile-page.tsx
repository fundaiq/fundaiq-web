'use client';

import { useState, useEffect } from 'react';
import { updateProfile, getMe } from '@/app/lib/api';
import styles from '@/styles/profile.module.css';

type UserProfile = {
  id: string | number;
  email: string;
  name?: string;
  is_verified?: boolean;
  created_at?: string;
  avatar_url?: string;
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getMe();
      setUserProfile(profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setErr('Failed to load profile information');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErr('Name is required');
      return;
    }

    setLoading(true);
    setErr(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        name: formData.name.trim(),
      });
      
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile(); // Refresh profile data
    } catch (error: any) {
      setErr(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
    });
    setErr(null);
  };

  if (!userProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.card}>
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid var(--brand-primary)',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-md)'
              }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initial = (userProfile.name?.trim()?.[0] || userProfile.email?.trim()?.[0] || 'U').toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Profile" 
                  className={styles.avatar}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div className={styles.avatar}>
                  {initial}
                </div>
              )}
              
              <div className={styles.userDetails}>
                <h1 className={styles.userName}>
                  {userProfile.name || 'Anonymous User'}
                </h1>
                <p className={styles.userEmail}>
                  {userProfile.email}
                </p>
                <div className={styles.userMeta}>
                  <span className={`${styles.badge} ${
                    userProfile.is_verified ? styles.badgeVerified : styles.badgeUnverified
                  }`}>
                    {userProfile.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                  </span>
                  {userProfile.created_at && (
                    <span className={styles.memberSince}>
                      Member since {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={styles.editButton}
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isEditing 
                    ? "M6 18L18 6M6 6l12 12" 
                    : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  } 
                />
              </svg>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {(err || successMsg) && (
          <div className={`${styles.message} ${
            err ? styles.messageError : styles.messageSuccess
          }`}>
            <svg className={styles.messageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={err 
                  ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                } 
              />
            </svg>
            <span>{err || successMsg}</span>
          </div>
        )}

        <div className={styles.grid}>
          {/* Profile Information */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Display Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your display name"
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  className={styles.input}
                  value={userProfile.name || 'Not set'}
                  disabled
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                className={styles.input}
                value={userProfile.email}
                disabled
              />
              <p style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--text-tertiary)', 
                marginTop: 'var(--space-xs)' 
              }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {isEditing && (
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleSave}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            
            <div className={styles.quickActions}>
              <a href="/report" className={styles.actionItem}>
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Investment Analysis</div>
                  <div className={styles.actionDescription}>
                    Analyze stocks with DCF and EPS valuation models
                  </div>
                </div>
              </a>

              <a href="/learn" className={styles.actionItem}>
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Learning Center</div>
                  <div className={styles.actionDescription}>
                    Guides, tutorials, and investment education
                  </div>
                </div>
              </a>

              <a href="/reset-password" className={styles.actionItem}>
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>Change Password</div>
                  <div className={styles.actionDescription}>
                    Update your account password securely
                  </div>
                </div>
              </a>

              {!userProfile.is_verified && (
                <a href="/auth/verify" className={styles.actionItem}>
                  <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className={styles.actionContent}>
                    <div className={styles.actionTitle}>Verify Email</div>
                    <div className={styles.actionDescription}>
                      Verify your email to unlock all features
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}