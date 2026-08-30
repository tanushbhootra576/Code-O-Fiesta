'use client';

import React, { useState } from 'react';
import ShapeCard, { ShapeType } from './ShapeCard';
import ShapeConfirmation from './ShapeConfirmation';

const PATHS: { id: number; shape: ShapeType }[] = [
  { id: 1, shape: 'triangle' },
  { id: 2, shape: 'circle' },
  { id: 3, shape: 'square' },
  { id: 4, shape: 'star' },
];

interface PathProps {
  onPathConfirmed?: (pathId: number) => void;
}

export default function Path({ onPathConfirmed }: PathProps) {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    if (selectedPath !== null) {
      onPathConfirmed?.(selectedPath);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1e224d] bg-[#0d0e24]">
        {/* Background portal image area */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-purple-900/40 to-transparent" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1">
            <div className="text-[11px] font-mono text-purple-400 font-bold tracking-widest uppercase mb-1">
              ROUND 1
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
              THE PATH OF FATE
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Four mysterious paths lie ahead. Each path leads to a different domain.
              Choose wisely — once confirmed, your path is locked.
            </p>
          </div>

          {/* Decorative portal illustration */}
          <div className="hidden lg:flex items-center justify-center w-56 h-40 relative">
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-purple-900/30 to-transparent" />
            <div className="w-24 h-32 rounded-t-full border-2 border-purple-400/60 bg-purple-950/50 relative overflow-hidden">
              <div className="absolute inset-2 rounded-t-full border border-purple-300/30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-purple-400/20 rounded-t-full" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-purple-500/30 blur-sm rounded-full" />
          </div>
        </div>
      </div>

      {/* Choose your path */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500/50" />
          <span className="text-xs font-mono tracking-[0.2em] text-purple-300 uppercase">
            CHOOSE YOUR PATH
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500/50" />
        </div>
      </div>

      {/* Shape cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PATHS.map((path) => (
          <ShapeCard
            key={path.id}
            pathNumber={path.id}
            shape={path.shape}
            selected={selectedPath === path.id}
            onSelect={() => setSelectedPath(path.id)}
          />
        ))}
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
        <div className="mt-0.5 text-cyan-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Once you confirm your path, the domain will be revealed and you cannot change it.
        </p>
      </div>

      {/* Confirm button */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          type="button"
          disabled={selectedPath === null}
          onClick={() => setShowConfirm(true)}
          className={`
            relative px-10 py-3.5 rounded-xl font-bold text-sm tracking-wide
            transition-all duration-300
            ${selectedPath !== null
              ? 'bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-[1.02]'
              : 'bg-[#1a1d42] text-slate-500 cursor-not-allowed'}
          `}
        >
          CONFIRM YOUR PATH →
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your choice will be final and locked
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && selectedPath !== null && (
        <ShapeConfirmation
          pathId={selectedPath}
          shape={PATHS.find((p) => p.id === selectedPath)!.shape}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}