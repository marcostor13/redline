'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/admin/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e13]">
      <div className="w-full max-w-sm">
        <div className="bg-[#ba0013] h-1 mb-0" />
        <div className="bg-white border border-[#e5e7ea] p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#ba0013] mb-2">Redline Installers</p>
            <h1 className="text-2xl font-bold font-display text-[#0a0e13]">Admin Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#e5e7ea] px-3 py-2 text-sm focus:outline-none focus:border-[#ba0013] transition-colors"
                placeholder="admin@redlineinstallers.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e5e7ea] px-3 py-2 text-sm focus:outline-none focus:border-[#ba0013] transition-colors"
              />
            </div>
            {error && <p className="text-sm text-[#ba0013]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ba0013] text-white py-2.5 text-sm font-semibold hover:bg-[#93000d] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
