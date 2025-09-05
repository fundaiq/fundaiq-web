'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email) return setMsg('Please enter your email.');

    try {
      setBusy(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      // Always 200 on backend to avoid enumeration; show a generic success
      setMsg(data.message || 'If that email exists, we’ve sent a reset link.');
    } catch {
      setMsg('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Forgot your password?</h1>
      <p className="text-sm text-zinc-600 mb-4">
        Enter your email and we’ll send you a reset link.
      </p>
      {msg && <div className="mb-3 text-sm">{msg}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded px-3 py-2 border"
        >
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-4 text-sm">
        <a href="/login" className="underline">Back to login</a>
      </div>
    </div>
  );
}
