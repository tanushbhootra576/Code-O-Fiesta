import { apiCall } from '@/lib/api';
import { RunResult, SubmissionResult } from '@/types/submission';

export const submissionsService = {
  runCode: async (params: {
    problemId: string;
    code: string;
    language: string;
    customInput?: string;
    mode?: 'examples' | 'custom';
  }): Promise<RunResult> => {
    return apiCall('/api/submissions/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        mode: params.mode || (params.customInput ? 'custom' : 'examples'),
      }),
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
