// app/reset-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setStatus(sp.get('status'));
    setToken(sp.get('token'));
  }, [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!token) return setMsg('Missing reset token.');
    if (pw1.length < 8) return setMsg('Password must be at least 8 characters.');
    if (pw1 !== pw2) return setMsg('Passwords do not match.');

    try {
      setBusy(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/reset-password/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, new_password: pw1 }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        // ✅ FIXED: Show success message and redirect to login
        setSuccess(true);
        setMsg(data.message || 'Password reset successfully!');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth?message=password_reset_success');
        }, 3000);
      } else {
        setMsg(data.message || 'Unable to reset password. The link may be invalid or expired.');
      }
    } catch {
      setMsg('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (status === 'invalid') {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Reset link invalid or expired</h1>
        <Link href="/forgot-password" className="underline text-sm">Request a new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Password Reset Successful!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your password has been updated successfully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
        
        <Link 
          href="/auth?message=password_reset_success"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Set a new password</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Choose a strong password for your account.
      </p>
      
      {msg && (
        <div className={`mb-4 p-3 rounded text-sm ${
          msg.includes('success') 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={pw1}
            onChange={e=>setPw1(e.target.value)}
            placeholder="Enter new password"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={busy}
          />
          <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={pw2}
            onChange={e=>setPw2(e.target.value)}
            placeholder="Confirm new password"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={busy}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={busy || pw1 !== pw2 || pw1.length < 8} 
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
        >
          {busy ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <Link href="/auth" className="text-blue-600 hover:text-blue-700 underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}