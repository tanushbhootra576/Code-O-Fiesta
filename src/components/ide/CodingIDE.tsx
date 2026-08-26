'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Hooks
import { useProblemState } from '@/hooks/useProblemState';
import { useCodingIDE } from '@/hooks/useCodingIDE';

// Types
import { RoundIDEConfig } from '@/types/problem';

// Services
import { problemsService } from '@/services/problems';

// Subcomponents
import ProblemPanel from '@/components/problems/ProblemPanel';
import EditorToolbar from './EditorToolbar';
import EditorStatus from './EditorStatus';
import EditorLockOverlay from './EditorLockOverlay';
import ConsolePanel from './ConsolePanel';
import CustomInput from './CustomInput';
import OutputPanel from './OutputPanel';
import VerdictPanel from '@/components/submissions/VerdictPanel';
import RunButton from './RunButton';
import SubmitButton from './SubmitButton';
import SubmissionController from '@/components/submissions/SubmissionController';
import SubmissionResult from '@/components/submissions/SubmissionResult';
import SubmissionHistory from '@/components/submissions/SubmissionHistory';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

// Round 2 Overlays
import ForcedSwitchOverlay from '@/components/round2/ForcedSwitchOverlay';
import ActiveMemberIndicator from '@/components/round2/ActiveMemberIndicator';
import RelayStatus from '@/components/round2/RelayStatus';
import ConstraintPanel from '@/components/round3/ConstraintPanel';

const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false });

interface CodingIDEProps {
  problemId: string;
  roundNumber: 1 | 2 | 3;
  mode: 'standard' | 'relay' | 'constraint';
  roundConfig?: RoundIDEConfig;
  onSolve?: (submissionId: string) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  hideProblemStatement?: boolean;
}

export default function CodingIDE({
  problemId,
  roundNumber,
  mode,
  roundConfig,
  onSolve,
  onError,
  readOnly = false,
  hideProblemStatement = false,
}: CodingIDEProps) {
  // 1. Fetch Problem State
  const {
    problem,
    isLoading: isProblemLoading,
    error: problemError,
    examples,
    constraints,
    isSolved,
    nextProblemId,
    prevProblemId,
  } = useProblemState(problemId, roundNumber);

  // 2. Fetch IDE state
  const {
    code,
    setCode,
    language,
    setLanguage,
    customInput,
    setCustomInput,
    isRunning,
    isSubmitting,
    runResult,
    submitResult,
    submissionHistory,
    isLocked,
    errorMsg,
    run,
    submit,
    resetCode,
    fetchHistory,
  } = useCodingIDE(problemId, mode, roundConfig, readOnly || isSolved);

  // 3. UI and layout states
  const [splitWidth, setSplitWidth] = useState(40); // left panel width %
  const [isLgScreen, setIsLgScreen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const [consoleTab, setConsoleTab] = useState<'input' | 'output' | 'verdict'>('input');
  const [showFullVerdict, setShowFullVerdict] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  // Relay Turn timer countdown (10 minutes default / from roundConfig)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSwitchOverlay, setShowSwitchOverlay] = useState(false);

  const isDraggingSplit = useRef(false);

  // Sync isLgScreen on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsLgScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync turn countdown
  useEffect(() => {
    if (mode === 'relay') {
      const initialMs = roundConfig?.forceSwitchAfterMs || 600_000;
      setTimeLeft(Math.floor(initialMs / 1000));
    }
  }, [mode, roundConfig?.forceSwitchAfterMs, roundConfig?.activeTeamMember]);

  useEffect(() => {
    if (mode !== 'relay' || timeLeft <= 0) {
      if (timeLeft === 0 && mode === 'relay' && roundConfig?.activeTeamMember === 'member1') {
        setShowSwitchOverlay(true);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (roundConfig?.activeTeamMember === 'member1') {
            setShowSwitchOverlay(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, timeLeft, roundConfig?.activeTeamMember]);

  // Auto-switch tabs when actions complete
  useEffect(() => {
    if (runResult) {
      setConsoleTab('output');
      setIsConsoleExpanded(true);
    }
  }, [runResult]);

  useEffect(() => {
    if (submitResult) {
      setConsoleTab('verdict');
      setShowFullVerdict(true);
      setIsConsoleExpanded(true);
    }
  }, [submitResult]);

  useEffect(() => {
    if (isRunning || isSubmitting) {
      setIsConsoleExpanded(true);
    }
  }, [isRunning, isSubmitting]);

  // Error logging prop trigger
  useEffect(() => {
    if (errorMsg && onError) {
      onError(errorMsg);
    }
  }, [errorMsg, onError]);

  // Resizing split panels
  const startSplitDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onSplitDrag);
    document.addEventListener('mouseup', stopSplitDrag);
  };

  const onSplitDrag = (e: MouseEvent) => {
    if (!isDraggingSplit.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 20 && newWidth <= 80) {
      setSplitWidth(newWidth);
    }
  };

  const stopSplitDrag = () => {
    isDraggingSplit.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onSplitDrag);
    document.removeEventListener('mouseup', stopSplitDrag);
  };

  if (isProblemLoading) {
    return <LoadingState message="Loading problems details..." />;
  }

  if (problemError || !problem) {
    return <ErrorState message={problemError || 'Problem details could not be loaded.'} />;
  }

  // Handle restoring code callback from history
  const handleRestoreCode = (restoredCode: string, restoredLang: string) => {
    setCode(restoredCode);
    setLanguage(restoredLang as any);
  };

  // Submission controller values bundle
  const controllerValue = {
    runResult,
    submitResult,
    isRunning,
    isSubmitting,
    submissionHistory,
    isLocked,
    errorMsg,
    run,
    submit: () => submit(onSolve),
    resetCode,
    fetchHistory,
  };

  return (
    <SubmissionController value={controllerValue}>
      {/* Switch overlay for Round 2 */}
      {showSwitchOverlay && (
        <ForcedSwitchOverlay 
          onDismiss={() => setShowSwitchOverlay(false)} 
          targetMember="Member 2" 
        />
      )}

      {/* Main Page Layout Wrapper */}
      <div className={`flex flex-col h-screen lg:h-screen bg-[#0a0a1a] select-none text-white ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''}`}>
        
        {/* Relay Round Info Header */}
        {mode === 'relay' && roundConfig && (
          <div className="flex justify-between items-center px-6 py-2.5 bg-[#080814] border-b border-[var(--border)]">
            <ActiveMemberIndicator activeTeamMember={roundConfig.activeTeamMember} />
            <div className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
              BLIND RELAY ACTIVE
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden relative">
          {/* Left panel: Problem description */}
          <div
            style={{ width: isLgScreen ? `${splitWidth}%` : '100%' }}
            className={`${mobileTab === 'problem' ? 'flex' : 'hidden'} lg:flex flex-col h-full overflow-hidden`}
          >
            <ProblemPanel
              problem={problem}
              mode={mode}
              activeConstraints={roundConfig?.activeConstraints}
              hideProblemStatement={hideProblemStatement}
              prevProblemId={prevProblemId}
              nextProblemId={nextProblemId}
              onNavigate={(id) => {
                // Navigate to next/prev problem using dynamic round path
                window.location.href = `/round-${roundNumber}/problem/${id}`;
              }}
              onUseAsInput={(text) => {
                setCustomInput(text);
                setConsoleTab('input');
              }}
              submissionHistoryChild={
                <SubmissionHistory 
                  history={submissionHistory} 
                  onRestoreCode={handleRestoreCode} 
                />
              }
            />
          </div>

          {/* Separator Line */}
          <div
            onMouseDown={startSplitDrag}
            className="hidden lg:block w-1.5 h-full cursor-col-resize hover:bg-purple-500/40 bg-[#080814] border-l border-r border-[var(--border-subtle)] z-20"
            title="Drag to resize panels"
          />

          {/* Right panel: Editor & Output console */}
          <div
            style={{ width: isLgScreen ? `${100 - splitWidth}%` : '100%' }}
            className={`${mobileTab === 'code' ? 'flex' : 'hidden'} lg:flex flex-col h-full overflow-hidden`}
          >
            <div className="flex flex-col flex-grow relative overflow-hidden">
              <EditorToolbar
                language={language}
                onLanguageChange={setLanguage}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onResetCode={resetCode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(f => !f)}
                mode={mode}
              />

              {/* CodeEditor Wrapper with absolute overlay support */}
              <div className="flex-grow relative overflow-hidden bg-[#0d0d1f]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  fontSize={fontSize}
                  readOnly={isLocked}
                  violations={submitResult?.constraintViolations}
                  onCursorChange={(line, col) => setCursorPosition({ line, column: col })}
                />
                
                {/* Lock Overlay */}
                <EditorLockOverlay
                  locked={isLocked}
                  mode={mode}
                  activeTeamMemberName={roundConfig?.activeTeamMember === 'member1' ? 'Member 1' : 'Member 2'}
                  readOnly={readOnly || isSolved}
                />
              </div>

              <EditorStatus
                language={language}
                cursorPosition={cursorPosition}
                submissionCount={submissionHistory.length}
                timerSeconds={mode === 'relay' ? timeLeft : undefined}
              />
            </div>

            {/* Bottom Console Panel */}
            {isConsoleExpanded && (
              <div className="flex-shrink-0">
                <ConsolePanel
                  activeTab={consoleTab}
                  onTabChange={setConsoleTab}
                  customInputChild={
                    <CustomInput
                      value={customInput}
                      onChange={setCustomInput}
                      exampleInput={examples[0]?.input || ''}
                    />
                  }
                  outputChild={
                    <OutputPanel runResult={runResult} isRunning={isRunning} errorMsg={errorMsg} />
                  }
                  verdictChild={
                    showFullVerdict ? (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Verdict Details</span>
                          <button
                            onClick={() => setShowFullVerdict(false)}
                            type="button"
                            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
                          >
                            Back to Summary
                          </button>
                        </div>
                        <div className="flex-grow overflow-auto">
                          <VerdictPanel 
                            submitResult={submitResult} 
                            submissionCount={submissionHistory.length} 
                            mode={mode} 
                          />
                        </div>
                      </div>
                    ) : (
                      <SubmissionResult
                        submitResult={submitResult}
                        isSubmitting={isSubmitting}
                        onViewFullVerdict={() => setShowFullVerdict(true)}
                        mode={mode}
                        submissionCount={submissionHistory.length}
                      />
                    )
                  }
                />
              </div>
            )}

            {/* Bottom Action buttons bar (Run / Submit) */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#080814] border-t border-[var(--border)] select-none flex-shrink-0">
              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e3a] bg-[#0c0d21] text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-purple-600/10 hover:border-purple-500/30 transition-all cursor-pointer select-none"
              >
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isConsoleExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
                Console
              </button>

              {mode === 'relay' && (
                <div className="mx-auto">
                  <RelayStatus 
                    activeTeamMember={roundConfig?.activeTeamMember || 'member1'} 
                    timeLeftSeconds={timeLeft} 
                  />
                </div>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <RunButton 
                  onClick={run} 
                  disabled={isRunning || isSubmitting} 
                  isRunning={isRunning} 
                />
                <SubmitButton
                  onClick={() => submit(onSolve)}
                  disabled={isRunning || isSubmitting || isLocked}
                  isSubmitting={isSubmitting}
                  isLocked={isLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher Footer */}
        <div className="flex lg:hidden bg-[#080814] border-t border-[var(--border)] h-12 select-none">
          <button
            onClick={() => setMobileTab('problem')}
            className={`flex-1 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              mobileTab === 'problem' ? 'text-purple-400 bg-purple-500/5' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setMobileTab('code')}
            className={`flex-1 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
              mobileTab === 'code' ? 'text-purple-400 bg-purple-500/5' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Code
          </button>
        </div>
      </div>
    </SubmissionController>
  );
}
