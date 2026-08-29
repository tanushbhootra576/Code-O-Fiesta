'use client';

import React, { useState } from 'react';
import { SupportedLanguage, IDEMode } from '@/types/problem';
import LanguageSelector from './LanguageSelector';
import Modal from '@/components/common/Modal';

interface EditorToolbarProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onResetCode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  mode: IDEMode;
}

export default function EditorToolbar({
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  onResetCode,
  isFullscreen,
  onToggleFullscreen,
  mode,
}: EditorToolbarProps) {
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleResetConfirm = () => {
    onResetCode();
    setIsResetOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#080814] border-b border-[var(--border)]">
      {/* Left side actions */}
      <div className="flex items-center gap-3">
        <LanguageSelector currentLanguage={language} onChange={onLanguageChange} />

        {/* Font size stepper */}
        <div className="flex items-center bg-[#0a0a18] border border-[var(--border)] rounded-full px-2 py-0.5">
          <button
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
            className="text-[var(--text-secondary)] hover:text-white px-1.5 py-0.5 text-xs font-mono disabled:opacity-30"
            disabled={fontSize <= 12}
            title="Decrease Font Size"
          >
            A-
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold px-1 select-none">
            {fontSize}px
          </span>
          <button
            onClick={() => onFontSizeChange(Math.min(20, fontSize + 1))}
            className="text-[var(--text-secondary)] hover:text-white px-1.5 py-0.5 text-xs font-mono disabled:opacity-30"
            disabled={fontSize >= 20}
            title="Increase Font Size"
          >
            A+
          </button>
        </div>

        {/* Reset code */}
        <button
          onClick={() => setIsResetOpen(true)}
          className="px-3 py-1 bg-[#0a0a18] border border-[var(--border)] hover:border-red-500/30 hover:text-red-400 rounded-full font-mono text-[10px] text-[var(--text-secondary)] transition-all duration-300"
        >
          Reset Code
        </button>
      </div>

      {/* Right side status / hint */}
      <div className="flex items-center gap-4">
        {mode === 'constraint' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/20 border border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            CONSTRAINTS ACTIVE
          </div>
        )}

        {/* Shortcuts Hints (hidden on smaller displays) */}
        <div className="hidden xl:flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
          <div>
            <kbd className="px-1.5 py-0.5 bg-[#0a0a18] border border-[var(--border)] rounded text-slate-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#0a0a18] border border-[var(--border)] rounded text-slate-400">Enter</kbd> Run
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 bg-[#0a0a18] border border-[var(--border)] rounded text-slate-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#0a0a18] border border-[var(--border)] rounded text-slate-400">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-[#0a0a18] border border-[var(--border)] rounded text-slate-400">Enter</kbd> Submit
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-1 rounded hover:bg-slate-800/40 text-[var(--text-secondary)] hover:text-white transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m6 0V4m0 6L3 3m14 7h6m-6 0V4m0 6l7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4" />
            </svg>
          )}
        </button>
      </div>

      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Code?"
        description="Are you sure you want to reset the editor content?"
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={handleResetConfirm}
        variant="danger"
      >
        <p className="font-mono text-xs">
          This will wipe your current code for {language === 'cpp' ? 'C++' : language === 'c' ? 'C' : language === 'python' ? 'Python' : language === 'java' ? 'Java' : language === 'go' ? 'Go' : 'JavaScript'} and restore the default template.
        </p>
      </Modal>
    </div>
  );
}
