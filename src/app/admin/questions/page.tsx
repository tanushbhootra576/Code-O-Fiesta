'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminNav from '@/components/admin/AdminNav';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

import { ProblemDifficulty, ProblemTopic } from '@/constants/event';

// Basic interfaces for the UI
interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface ProblemData {
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  roundNumber: number;
  topic: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  allowedLanguages: string[];
  round3Constraints: {
    recursionRequired: boolean;
    noLoops: boolean;
    maxLines: number | null;
  };
  cpuTimeLimit: number;
  memoryLimit: number;
  isActive: boolean;
}

const defaultProblem: ProblemData = {
  title: '',
  description: '',
  difficulty: ProblemDifficulty.EASY,
  roundNumber: 1,
  topic: ProblemTopic.BASIC_MATH_NUMBERS,
  constraints: '',
  inputFormat: '',
  outputFormat: '',
  examples: [],
  visibleTestCases: [],
  hiddenTestCases: [],
  allowedLanguages: ['cpp', 'c', 'java', 'python', 'javascript', 'go'],
  round3Constraints: {
    recursionRequired: false,
    noLoops: false,
    maxLines: null,
  },
  cpuTimeLimit: 2.0,
  memoryLimit: 128000,
  isActive: true,
};

export default function AdminQuestionsPage() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [roundFilter, setRoundFilter] = useState<string>('all');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const url = roundFilter === 'all' 
        ? '/api/admin/problems' 
        : `/api/admin/problems?roundNumber=${roundFilter}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch problems');
      }
      
      const data = await res.json();
      setProblems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [roundFilter]);

  const handleOpenModal = (problem?: ProblemData) => {
    if (problem) {
      setEditingProblem({ ...problem });
    } else {
      setEditingProblem({ ...defaultProblem });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProblem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    
    setIsSaving(true);
    try {
      const isNew = !editingProblem._id;
      const url = isNew 
        ? '/api/admin/problems' 
        : `/api/admin/problems/${editingProblem._id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProblem),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save problem');
      }
      
      await fetchProblems();
      handleCloseModal();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete problem');
      
      await fetchProblems();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Helper to handle nested state changes
  const updateEditingProblem = (field: keyof ProblemData, value: any) => {
    setEditingProblem(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateRound3Constraints = (field: keyof ProblemData['round3Constraints'], value: any) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        round3Constraints: {
          ...prev.round3Constraints,
          [field]: value
        }
      };
    });
  };

  const updateArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases', index: number, field: string, value: any) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newArray = [...prev[arrayField]] as any[];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayField]: newArray };
    });
  };

  const addArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases') => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newItem = arrayField === 'examples' 
        ? { input: '', output: '', explanation: '' }
        : { input: '', expectedOutput: '' };
      
      return { ...prev, [arrayField]: [...prev[arrayField], newItem] as any };
    });
  };

  const removeArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases', index: number) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newArray = [...prev[arrayField]];
      newArray.splice(index, 1);
      return { ...prev, [arrayField]: newArray };
    });
  };

  if (loading && problems.length === 0) {
    return (
      <AdminLayout title="Question Manager" nav={<AdminNav />}>
        <LoadingState message="Loading problems..." mode="full-page" />
      </AdminLayout>
    );
  }

  if (error && problems.length === 0) {
    return (
      <AdminLayout title="Question Manager" nav={<AdminNav />}>
        <ErrorState
          title="Failed to load problems"
          message={error}
          onRetry={fetchProblems}
          variant="connection"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Question Manager" 
      subtitle="Manage contest problems, test cases, and constraints"
      nav={<AdminNav />}
      actions={
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Create Problem
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="flex gap-4 items-center bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <span className="text-sm font-medium text-slate-300">Filter by Round:</span>
          <select 
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="bg-[#0a0b1a] border border-[#1e224d] text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
          </select>
        </div>

        {/* Problems List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <div key={problem._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full ${problem.isActive ? 'bg-green-500' : 'bg-slate-600'}`} />
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 mr-2">
                    R{problem.roundNumber}
                  </span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    problem.difficulty === 'EASY' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                    problem.difficulty === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                    'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(problem)} className="text-slate-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(problem._id!)} className="text-slate-400 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-white mt-1">{problem.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{problem.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  {problem.visibleTestCases.length + problem.hiddenTestCases.length} Tests
                </div>
                {problem.roundNumber === 3 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AST Modifiers
                  </div>
                )}
              </div>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              No problems found. Create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d0e24] border border-[#1e224d] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1e224d] bg-[#131538]">
              <h2 className="text-xl font-bold text-white">
                {editingProblem._id ? 'Edit Problem' : 'Create Problem'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="problem-form" onSubmit={handleSave} className="flex flex-col gap-8">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400 border-b border-[#1e224d] pb-2">Basic Info</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Title</label>
                      <input 
                        required
                        type="text" 
                        value={editingProblem.title} 
                        onChange={(e) => updateEditingProblem('title', e.target.value)}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Topic</label>
                      <select 
                        value={editingProblem.topic} 
                        onChange={(e) => updateEditingProblem('topic', e.target.value)}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="BASIC_MATH_NUMBERS">BASIC_MATH_NUMBERS (△ Triangle)</option>
                        <option value="STRING_MANIPULATION">STRING_MANIPULATION (○ Circle)</option>
                        <option value="ARRAYS_LOGIC">ARRAYS_LOGIC (□ Square)</option>
                        <option value="LOOPS_PATTERNS">LOOPS_PATTERNS (☆ Star)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Difficulty</label>
                      <select 
                        value={editingProblem.difficulty} 
                        onChange={(e) => updateEditingProblem('difficulty', e.target.value)}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        {Object.values(ProblemDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Round Number</label>
                      <select 
                        value={editingProblem.roundNumber} 
                        onChange={(e) => updateEditingProblem('roundNumber', parseInt(e.target.value, 10))}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                        <option value={3}>Round 3</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={editingProblem.isActive}
                      onChange={(e) => updateEditingProblem('isActive', e.target.checked)}
                      className="w-4 h-4 rounded bg-[#0a0b1a] border-[#1e224d] text-purple-600 focus:ring-purple-500 focus:ring-offset-[#0d0e24]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Active (Visible in contest)</label>
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400 border-b border-[#1e224d] pb-2">Resource Limits (Judge0)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">CPU Time Limit (Seconds)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={editingProblem.cpuTimeLimit ?? 2.0} 
                        onChange={(e) => updateEditingProblem('cpuTimeLimit', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Memory Limit (KB)</label>
                      <input 
                        type="number"
                        required
                        value={editingProblem.memoryLimit ?? 128000} 
                        onChange={(e) => updateEditingProblem('memoryLimit', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-500">Default: 128000 KB (128 MB)</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400 border-b border-[#1e224d] pb-2">Problem Statement</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Description (Markdown)</label>
                    <textarea 
                      required
                      value={editingProblem.description} 
                      onChange={(e) => updateEditingProblem('description', e.target.value)}
                      rows={6}
                      className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Input Format</label>
                      <textarea 
                        required
                        value={editingProblem.inputFormat} 
                        onChange={(e) => updateEditingProblem('inputFormat', e.target.value)}
                        rows={3}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-300">Output Format</label>
                      <textarea 
                        required
                        value={editingProblem.outputFormat} 
                        onChange={(e) => updateEditingProblem('outputFormat', e.target.value)}
                        rows={3}
                        className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Constraints</label>
                    <textarea 
                      required
                      value={editingProblem.constraints} 
                      onChange={(e) => updateEditingProblem('constraints', e.target.value)}
                      rows={2}
                      className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Round 3 Constraints (Conditional) */}
                {editingProblem.roundNumber === 3 && (
                  <div className="space-y-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-400 border-b border-purple-500/20 pb-2">Round 3 AST Constraints</h3>
                    
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={editingProblem.round3Constraints.recursionRequired}
                          onChange={(e) => updateRound3Constraints('recursionRequired', e.target.checked)}
                          className="w-4 h-4 rounded bg-[#0a0b1a] border-[#1e224d] text-purple-600 focus:ring-purple-500 focus:ring-offset-[#0d0e24]"
                        />
                        <span className="text-sm font-medium text-slate-300">Require Recursion (Ouroboros)</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={editingProblem.round3Constraints.noLoops}
                          onChange={(e) => updateRound3Constraints('noLoops', e.target.checked)}
                          className="w-4 h-4 rounded bg-[#0a0b1a] border-[#1e224d] text-purple-600 focus:ring-purple-500 focus:ring-offset-[#0d0e24]"
                        />
                        <span className="text-sm font-medium text-slate-300">Disallow Loops (for, while, do-while)</span>
                      </label>

                      <div className="flex flex-col gap-1.5 mt-2 max-w-xs">
                        <label className="text-sm font-medium text-slate-300">Max Line Limit (Short & Sweet)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 50" 
                          value={editingProblem.round3Constraints.maxLines || ''} 
                          onChange={(e) => updateRound3Constraints('maxLines', e.target.value ? parseInt(e.target.value, 10) : null)}
                          className="bg-[#0a0b1a] border border-[#1e224d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Examples */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1e224d] pb-2">
                    <h3 className="text-lg font-semibold text-purple-400">Examples (Visible to user)</h3>
                    <button type="button" onClick={() => addArrayItem('examples')} className="text-xs bg-[#1e224d] hover:bg-[#2a2f66] text-white px-2 py-1 rounded">
                      + Add Example
                    </button>
                  </div>
                  
                  {editingProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-[#0a0b1a] border border-[#1e224d] rounded-xl flex flex-col gap-3 relative group">
                      <button type="button" onClick={() => removeArrayItem('examples', idx)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Input</label>
                          <textarea value={ex.input} onChange={(e) => updateArrayItem('examples', idx, 'input', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-slate-400">Output</label>
                          <textarea value={ex.output} onChange={(e) => updateArrayItem('examples', idx, 'output', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Explanation</label>
                        <textarea value={ex.explanation} onChange={(e) => updateArrayItem('examples', idx, 'explanation', e.target.value)} rows={1} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.examples.length === 0 && <p className="text-sm text-slate-500 italic">No examples added.</p>}
                </div>

                {/* Visible Test Cases */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1e224d] pb-2">
                    <h3 className="text-lg font-semibold text-purple-400">Visible Test Cases (Run before submit)</h3>
                    <button type="button" onClick={() => addArrayItem('visibleTestCases')} className="text-xs bg-[#1e224d] hover:bg-[#2a2f66] text-white px-2 py-1 rounded">
                      + Add Visible Test Case
                    </button>
                  </div>
                  
                  {editingProblem.visibleTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0b1a] border border-[#1e224d] rounded-xl flex gap-4 items-start relative group pr-8">
                      <button type="button" onClick={() => removeArrayItem('visibleTestCases', idx)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Input</label>
                        <textarea value={tc.input} onChange={(e) => updateArrayItem('visibleTestCases', idx, 'input', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Expected Output</label>
                        <textarea value={tc.expectedOutput} onChange={(e) => updateArrayItem('visibleTestCases', idx, 'expectedOutput', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.visibleTestCases.length === 0 && <p className="text-sm text-slate-500 italic">No visible test cases added.</p>}
                </div>

                {/* Hidden Test Cases */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1e224d] pb-2">
                    <h3 className="text-lg font-semibold text-purple-400">Hidden Test Cases (Used for grading)</h3>
                    <button type="button" onClick={() => addArrayItem('hiddenTestCases')} className="text-xs bg-[#1e224d] hover:bg-[#2a2f66] text-white px-2 py-1 rounded">
                      + Add Hidden Test Case
                    </button>
                  </div>
                  
                  {editingProblem.hiddenTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-[#0a0b1a] border border-[#1e224d] rounded-xl flex gap-4 items-start relative group pr-8">
                      <button type="button" onClick={() => removeArrayItem('hiddenTestCases', idx)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Input</label>
                        <textarea value={tc.input} onChange={(e) => updateArrayItem('hiddenTestCases', idx, 'input', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400">Expected Output</label>
                        <textarea value={tc.expectedOutput} onChange={(e) => updateArrayItem('hiddenTestCases', idx, 'expectedOutput', e.target.value)} rows={2} required className="bg-[#131538] border border-[#1e224d] rounded text-white px-2 py-1 text-sm font-mono focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.hiddenTestCases.length === 0 && <p className="text-sm text-slate-500 italic">No hidden test cases added.</p>}
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#1e224d] bg-[#131538] flex justify-end gap-3">
              <button 
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="problem-form"
                disabled={isSaving}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Problem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
