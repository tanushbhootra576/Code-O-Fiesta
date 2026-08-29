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


    </div>
  );
}
