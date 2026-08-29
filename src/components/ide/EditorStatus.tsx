'use client';

import React from 'react';
import { SupportedLanguage } from '@/types/problem';

interface EditorStatusProps {
  language: SupportedLanguage;
  cursorPosition: { line: number; column: number };
  submissionCount: number;
  timerSeconds?: number;
}

export default function EditorStatus({
  language,
  cursorPosition,
  submissionCount,
  timerSeconds,
}: EditorStatusProps) {
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displayLang = language === 'cpp' ? 'C++ 17' : language === 'python' ? 'Python 3' : language === 'java' ? 'Java 17' : 'JavaScript';

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-[#080814] border-t border-[var(--border)] text-[10px] font-mono text-slate-500 select-none">
      <div className="flex items-center gap-4">
        <span className="text-purple-400 font-bold uppercase">{displayLang}</span>
        <span className="hover:text-purple-300 transition-colors">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        <span className="hidden sm:inline">UTF-8</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hover:text-purple-300 transition-colors">
          Submissions: <span className="text-purple-400 font-bold">{submissionCount}</span>
        </span>
        {timerSeconds !== undefined && (
          <div className="flex items-center gap-1 text-purple-400 font-bold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(timerSeconds)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
