'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '@/types/problem';
import Modal from '@/components/common/Modal';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

export default function LanguageSelector({ currentLanguage, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<SupportedLanguage | null>(null);

  const languages: { val: SupportedLanguage; label: string }[] = [
    { val: 'c', label: 'C (GCC 11)' },
    { val: 'cpp', label: 'C++ 17' },
    { val: 'java', label: 'Java 17' },
    { val: 'python', label: 'Python 3' },
    { val: 'go', label: 'Go 1.21' },
  ];

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SupportedLanguage;
    if (val === currentLanguage) return;
    setPendingLang(val);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (pendingLang) {
      onChange(pendingLang);
    }
    setIsOpen(false);
    setPendingLang(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingLang(null);
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage}
        onChange={handleSelect}
        className="appearance-none font-mono font-bold text-xs bg-[#0a0a18] text-[var(--text-secondary)] border border-[var(--border)] px-4 py-1.5 pr-8 rounded-full outline-none cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_8px_rgba(139,92,246,0.15)] focus:border-purple-500 focus:shadow-[0_0_12px_rgba(139,92,246,0.4)]"
      >
        {languages.map((l) => (
          <option key={l.val} value={l.val} className="bg-[#0d0e24] text-white">
            {l.label}
          </option>
        ))}
      </select>
      
      {/* Down arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-muted)]">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Switch Language?"
        description="Switching language will clear your current code in the editor."
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        variant="warning"
      >
        <p className="font-mono">
          Your unsaved progress in {languages.find(l => l.val === currentLanguage)?.label} will be replaced with the default code template for {languages.find(l => l.val === pendingLang)?.label}.
        </p>
      </Modal>
    </div>
  );
}
