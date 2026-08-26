'use client';

import React from 'react';

export interface HookTitleProps {
  className?: string;
  isVisible?: boolean;
}

export default function HookTitle({ className = '', isVisible = true }: HookTitleProps) {
  return (
    <div
      className={`flex flex-col items-center text-center select-none transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      } ${className}`}
    >
      {/* VITC Subheading / Chapter Tag */}
      <div className="flex items-center gap-3 mb-2">
        <span className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#e63946]" />
        <span className="text-xs sm:text-sm md:text-base font-mono font-extrabold uppercase tracking-[0.35em] text-[var(--accent)] drop-shadow-[0_2px_10px_rgba(6,182,212,0.5)]">
          VITC STUDENT CHAPTER
        </span>
        <span className="h-[2px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#e63946]" />
      </div>

      {/* Main Dominant Title: CODE-O-FIESTA */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-none my-1 font-sans text-white drop-shadow-[0_10px_35px_rgba(230,57,70,0.6)]">
        CODE<span className="text-rose-500 font-black">-</span>O<span className="text-rose-500 font-black">-</span>FIESTA
      </h1>

      {/* Subtitle / Edition Badge */}
      <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-4">
        <span className="px-3.5 py-1 text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.25em] rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10">
          FRESHERS&apos; EDITION 2026
        </span>
      </div>
    </div>
  );
}
