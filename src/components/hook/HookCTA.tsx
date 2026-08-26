'use client';

import React from 'react';
import Link from 'next/link';

export interface HookCTAProps {
  className?: string;
  isVisible?: boolean;
}

export default function HookCTA({ className = '', isVisible = true }: HookCTAProps) {
  return (
    <div
      className={`transition-all duration-700 delay-300 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
      } ${className}`}
    >
      <Link
        href="/login"
        className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 text-sm sm:text-base font-mono font-extrabold uppercase tracking-[0.2em] rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white shadow-[0_0_30px_rgba(230,57,70,0.5)] hover:shadow-[0_0_50px_rgba(230,57,70,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 border border-rose-400/40 focus:ring-4 focus:ring-rose-400 focus:outline-none overflow-hidden"
      >
        {/* Animated Light Sweep Effect on Hover */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <span className="relative z-10 drop-shadow">ENTER THE FIESTA</span>

        {/* Arrow Icon */}
        <svg
          className="relative z-10 w-5 h-5 text-cyan-300 group-hover:translate-x-1.5 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
