'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StarfieldBackground from '@/components/common/StarfieldBackground';
import CursorTrail from '@/components/common/CursorTrail';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('team@test.com');
  const [password, setPassword] = useState('TestPassword123');
  const [teamMember, setTeamMember] = useState('MEMBER_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          teamMember,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-white overflow-hidden flex items-center justify-center px-4 py-12">
      <StarfieldBackground />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.28),transparent_65%)] pointer-events-none" />
      <CursorTrail />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="h-[2px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-purple-500" />
          <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-cyan-400 drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]">
            VITC STUDENT CHAPTER
          </span>
          <span className="h-[2px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-purple-500" />
        </div>

        <div className="relative bg-[var(--surface)]/90 backdrop-blur-sm border border-[var(--border)] rounded-xl shadow-[0_0_40px_rgba(139,92,246,0.15)] overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
            <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                  Authentication
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                  Team Login
                </h1>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium rounded-full border bg-cyan-500/10 border-cyan-500/30 text-cyan-400 px-2.5 py-1">
                <span className="rounded-full w-1.5 h-1.5 bg-cyan-400" />
                Ready
              </span>
            </div>

            <div className="p-4 mb-6 rounded bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <p className="font-mono font-semibold text-purple-400 mb-1">Demo Credentials</p>
              <p>
                Email: <strong className="text-white">team@test.com</strong>
              </p>
              <p>
                Password: <strong className="text-white">TestPassword123</strong>
              </p>
              <p className="mt-2 text-[11px]">
                Select Member 1 or Member 2 as Team Member
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 mb-6 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1 tracking-wide">
                  Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. team@test.com"
                    required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:opacity-50"
                  />
                </div>

                <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1 tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                    required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:opacity-50"
                  />
                </div>

                <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-1 tracking-wide">
                    Team Member
                  </label>
                  <select
                    value={teamMember}
                    onChange={(e) => setTeamMember(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded text-xs text-white focus:outline-none focus:ring-2 focus:ring-[var(--focus)] disabled:opacity-50"
                  >
                    <option value="MEMBER_1">Member 1</option>
                    <option value="MEMBER_2">Member 2</option>
                  </select>
                </div>

            <button
              type="submit"
              disabled={loading}
                className="group relative w-full mt-2 py-3 text-xs font-mono font-extrabold uppercase tracking-[0.15em] rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] transition-all border border-purple-400/40 focus:ring-4 focus:ring-purple-400 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {loading ? (
                  <>
                    <svg
                      className="relative z-10 animate-spin h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="relative z-10">AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">LOGIN TO EVENT</span>
                    <svg
                      className="relative z-10 w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
