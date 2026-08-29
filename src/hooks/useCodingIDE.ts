import { useState, useEffect, useRef } from 'react';
import { IDEMode, RoundIDEConfig, SupportedLanguage } from '@/types/problem';
import { RunResult, SubmissionResult } from '@/types/submission';
import { submissionsService } from '@/services/submissions';

export function getDefaultCode(language: SupportedLanguage): string {
  switch (language) {
    case 'cpp':
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // write your code here\n    return 0;\n}`;
    case 'python':
      return `# write your code here\n`;
    case 'java':
      return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write your code here\n    }\n}`;
    case 'javascript':
      return `// write your code here\n`;
    default:
      return '';
  }
}

export function useCodingIDE(
  problemId: string,
  mode: IDEMode,
  roundNumber: number,
  roundConfig?: RoundIDEConfig,
  readOnly?: boolean
) {
  const [language, setLanguageState] = useState<SupportedLanguage>('cpp');
  const [code, setCodeState] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmissionResult | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load code from localStorage on mount or problemId/language change
  useEffect(() => {
    if (problemId && language) {
      const key = `problem_${problemId}_${language}`;
      const savedCode = localStorage.getItem(key);
      if (savedCode !== null) {
        setCodeState(savedCode);
      } else {
        setCodeState(getDefaultCode(language));
      }
    }
  }, [problemId, language]);

  // Save code to localStorage when it changes
  const setCode = (newCode: string) => {
    setCodeState(newCode);
    if (problemId && language) {
      localStorage.setItem(`problem_${problemId}_${language}`, newCode);
    }
  };

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
  };

  // Fetch submission history
  const fetchHistory = async () => {
    if (!problemId) return;
    try {
      const history = await submissionsService.getHistory(problemId);
      setSubmissionHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [problemId]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Determine locking
  // relay mode: not your turn
  // readOnly: already solved (or readOnly prop is true)
  const isLocked = (() => {
    if (readOnly) return true;
    if (mode === 'relay') {
      if (!roundConfig) return false;
      const { activeTeamMember, currentUserId } = roundConfig;
      // Map member1/member2 to the userId comparison.
      // activeTeamMember can be 'member1' or 'member2'.
      // If activeTeamMember !== currentUserId, lock it.
      return activeTeamMember !== currentUserId;
    }
    return false;
  })();

  const resetCode = () => {
    const defaultCode = getDefaultCode(language);
    setCode(defaultCode);
  };

  const run = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunResult(null);
    setErrorMsg(null);
    try {
      const res = await submissionsService.runCode({
        problemId,
        code,
        language,
        customInput,
      });
      setRunResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Run failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Comments check helper for Round 2 Relay
  const hasComments = (codeString: string, lang: SupportedLanguage): boolean => {
    if (lang === 'python') {
      // Look for # comment pattern, but exclude # in strings or template formats if basic.
      // Let's check for any # character.
      return /#/.test(codeString);
    } else {
      // C++, Java, JS use // or /* */
      return /\/\/|\/\*/.test(codeString);
    }
  };

  const submit = async (onSolveCallback?: (id: string) => void) => {
    if (isSubmitting) return;

    setErrorMsg(null);
    setSubmitResult(null);

    // Round 2 comments prohibited enforcement
    if (mode === 'relay' && hasComments(code, language)) {
      setErrorMsg('Comments are not allowed in Round 2');
      return;
    }

    setIsSubmitting(true);

    try {
      const isFirstAttempt = submissionHistory.length === 0;
      const submitRes = await submissionsService.submitCode({
        problemId,
        code,
        language,
        roundNumber,
        isFirstAttempt,
      });

      const submissionId = submitRes.submissionId;

      // Poll until verdict is complete
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await submissionsService.getSubmission(submissionId);
          if (statusRes.status !== 'pending' && statusRes.status !== 'processing') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setSubmitResult(statusRes);
            setIsSubmitting(false);
            fetchHistory(); // Refresh history

            if (statusRes.status === 'accepted') {
              if (onSolveCallback) {
                onSolveCallback(submissionId);
              }
            }
          }
        } catch (err: any) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setErrorMsg(err.message || 'Evaluation polling failed');
          setIsSubmitting(false);
        }
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
