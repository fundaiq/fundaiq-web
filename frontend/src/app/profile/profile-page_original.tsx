// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiFetch, { getMe } from '@/app/lib/api';
import { useGlobalStore } from '@/store/globalStore';

type UserProfile = {
  id: string;
  email: string;
  name?: string;
  timezone?: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at?: string;
};

export default function ProfilePage() {
  const user = useGlobalStore((s) => s.user);
  const setUser = useGlobalStore((s) => s.setUser);
  const [form, setForm] = useState({ name: '', timezone: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Common timezones
  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney'
  ];

  useEffect(() => {
    (async () => {
      try {
        if (!user) {
          const u = await getMe();
          if (u) {
            setUser(u);
            setForm({
              name: u.name || '',
              timezone: u.timezone || '',
              avatar_url: u.avatar_url || '',
            });
          } else {
            setErr("Not authenticated");
          }
        } else {
          setForm({
            name: user.name || '',
            timezone: (user as any).timezone || '',
            avatar_url: (user as any).avatar_url || '',
          });
        }
      } catch (e: any) {
        console.log("[ProfilePage] Error getting user:", e);
        setErr(e?.message || "Not authenticated");
      }
    })();
  }, [user, setUser]);

  const onSave = async () => {
    if (!form.name.trim()) {
      setErr("Name is required");
      return;
    }

    setSaving(true);
    setErr(null);
    setSuccessMsg(null);

    try {
      const updated = await apiFetch("auth/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setUser(updated);
      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error("Save failed:", e);
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onResendVerification = async () => {
    try {
      await apiFetch("auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: (user as any).email }),
      });
      setSuccessMsg("Verification email sent! Check your inbox.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      setErr("Failed to send verification email: " + (e?.message || "Unknown error"));
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (err && !user) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-surface rounded-xl shadow-theme text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Authentication Required</h2>
          <p className="text-secondary mb-6">Please sign in to view your profile.</p>
          <Link 
            href="/auth" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const userProfile = user as UserProfile;

  return (
    <div className="min-h-screen bg-surface-secondary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-surface rounded-xl shadow-theme p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                {getInitials(userProfile.name || '', userProfile.email)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{userProfile.name || 'User'}</h1>
                <p className="text-secondary">{userProfile.email}</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.is_verified 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                  }`}>
                    {userProfile.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                  </span>
                  {userProfile.created_at && (
                    <span className="text-tertiary text-xs ml-3">
                      Member since {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {(err || successMsg) && (
          <div className={`mb-6 p-4 rounded-lg ${
            err 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
          }`}>
            {err || successMsg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-surface rounded-xl shadow-theme p-6">
            <h2 className="text-xl font-semibold text-primary mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Display Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-default rounded-lg bg-surface text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Enter your name"
                    required
                  />
                ) : (
                  <p className="text-primary py-2">{userProfile.name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <p className="text-primary py-2">{userProfile.email}</p>
                <p className="text-tertiary text-xs">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <select
                    value={form.timezone}
                    onChange={(e) => setForm({...form, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-default rounded-lg bg-surface text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                  >
                    <option value="">Select timezone</option>
                    {commonTimezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-primary py-2">{userProfile.timezone || 'Not set'}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-accent hover:bg-accent/90 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErr(null);
                      // Reset form to original values
                      setForm({
                        name: userProfile.name || '',
                        timezone: userProfile.timezone || '',
                        avatar_url: userProfile.avatar_url || '',
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-6">
            {/* Email Verification */}
            <div className="bg-surface rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Email Verification</h2>
              
              {userProfile.is_verified ? (
                <div className="flex items-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-green-800 dark:text-green-200 font-medium">Email Verified</p>
                    <p className="text-green-700 dark:text-green-300 text-sm">Your email has been verified successfully.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-amber-800 dark:text-amber-200 font-medium">Email Not Verified</p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">Please verify your email to unlock all features.</p>
                    </div>
                  </div>
                  <button
                    onClick={onResendVerification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-xl shadow-theme p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href="/portfolios"
                  className="flex items-center p-3 border border-default rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary">Manage Portfolios</p>
                    <p className="text-sm text-secondary">View and manage your investment portfolios</p>
                  </div>
                </Link>

                <Link
                  href="/report"
                  className="flex items-center p-3 border border-default rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary">Investment Analysis</p>
                    <p className="text-sm text-secondary">Analyze stocks with DCF and EPS models</p>
                  </div>
                </Link>

                <Link
                  href="/forgot-password"
                  className="flex items-center p-3 border border-default rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary">Change Password</p>
                    <p className="text-sm text-secondary">Update your account password</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}