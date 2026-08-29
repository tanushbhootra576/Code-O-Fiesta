import { apiCall } from '@/lib/api';
import { RunResult, SubmissionResult } from '@/types/submission';

export const submissionsService = {
  runCode: async (payload: {
    problemId: string;
    code: string;
    language: string;
    customInput?: string;
  }): Promise<RunResult> => {
    return apiCall('/api/submissions/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  submitCode: async (payload: {
    problemId: string;
    code: string;
    language: string;
    roundNumber?: number;
    isFirstAttempt?: boolean;
  }): Promise<{ submissionId: string }> => {
    return apiCall('/api/submissions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  getSubmission: async (id: string): Promise<SubmissionResult> => {
    return apiCall(`/api/submissions/${id}`);
  },

  getHistory: async (problemId: string): Promise<SubmissionResult[]> => {
    return apiCall(`/api/submissions/history?problemId=${problemId}`);
  },
};
