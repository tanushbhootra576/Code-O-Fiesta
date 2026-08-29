'use client';

import React, { useEffect } from 'react';

interface RunButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isRunning: boolean;
}

export default function RunButton({ onClick, disabled, isRunning }: RunButtonProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !isRunning) {
          onClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, disabled, isRunning]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRunning}
      type="button"
      className="px-5 py-2 font-mono font-bold text-xs uppercase tracking-wider rounded-lg border transition-all duration-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] focus:outline-none focus:ring-1 focus:ring-cyan-500"
    >
      {isRunning ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Running...</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Run</span>
        </>
      )}
    </button>
  );
}
