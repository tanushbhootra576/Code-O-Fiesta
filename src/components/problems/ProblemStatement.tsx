'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { IDEMode, CodeConstraint } from '@/types/problem';

interface ProblemStatementProps {
  statement: string;
  mode?: IDEMode;
  activeConstraints?: CodeConstraint[];
}

export default function ProblemStatement({ statement, mode, activeConstraints }: ProblemStatementProps) {
  return (
    <div className="flex flex-col gap-6 text-sm text-slate-200 select-text leading-relaxed font-sans pb-8">
      {/* Markdown Content */}
      <div className="prose prose-invert prose-xs max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            pre: ({ node, ...props }) => (
              <pre className="p-4 bg-[#0d0d1f] border border-[var(--border-subtle)] rounded-lg overflow-x-auto font-mono text-xs text-slate-300" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="px-1.5 py-0.5 bg-[#0d0d1f] text-cyan-400 rounded font-mono text-xs" {...props} />
            ),
            h1: ({ node, ...props }) => <h3 className="text-base font-bold font-mono text-white mt-4 mb-2" {...props} />,
            h2: ({ node, ...props }) => <h4 className="text-sm font-bold font-mono text-white mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-3 text-xs" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-xs flex flex-col gap-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 text-xs flex flex-col gap-1" {...props} />,
            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          }}
        >
          {statement}
        </ReactMarkdown>
      </div>

      {/* Constraint Crucible rules section */}
      {mode === 'constraint' && activeConstraints && activeConstraints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
            Crucible Constraint Rules
          </h3>
          <div className="flex flex-col gap-2">
            {activeConstraints.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-cyan-950/15 border border-cyan-500/20 flex gap-2.5 items-start"
              >
                <div className="mt-0.5 text-cyan-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white mb-0.5">
                    {c.label}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 leading-normal">
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
