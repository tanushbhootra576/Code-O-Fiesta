'use client';

import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'general' | 'connection' | 'unauthorized' | 'access-denied';
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't process your request or load the competition state.",
  onRetry,
  variant = 'general',
  className = '',
}: ErrorStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'connection':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30',
          titleColor: 'text-amber-400',
          icon: (
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m10.607 2.121a6 6 0 010 8.485m-8.485 0a6 6 0 010-8.485m4.243 1.414a2 2 0 010 2.828" />
            </svg>
          ),
        };
      case 'unauthorized':
      case 'access-denied':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30',
          titleColor: 'text-purple-400',
          icon: (
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        };
      case 'general':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30',
          titleColor: 'text-rose-400',
          icon: (
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className={`p-6 rounded-lg border flex flex-col items-center text-center max-w-lg mx-auto my-4 ${style.bg} ${className}`}>
      <div className="mb-3">{style.icon}</div>
      <h3 className={`text-base font-bold font-mono ${style.titleColor}`}>{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-xs font-mono font-semibold rounded bg-[var(--surface-elevated)] hover:bg-[var(--surface-interactive)] text-[var(--text-primary)] border border-[var(--border)] transition-colors focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        >
          TRY AGAIN
        </button>
      )}
    </div>
  );
}
