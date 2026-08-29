import { apiCall } from '@/lib/api';
import { Problem, RoundProblem } from '@/types/problem';

export const problemsService = {
  fetchProblem: async (id: string): Promise<Problem> => {
    return apiCall(`/api/problems/${id}`);
  },

  fetchProblemState: async (id: string): Promise<{ solved: boolean }> => {
    return apiCall(`/api/problems/${id}/state`);
  },

  fetchRoundProblems: async (roundNumber: number): Promise<RoundProblem[]> => {
    return apiCall(`/api/rounds/${roundNumber}/questions`);
  },

  fetchRoundPathStatus: async (roundNumber: number): Promise<{ locked: boolean; path: string | null }> => {
    return apiCall(`/api/rounds/${roundNumber}/path`);
  },

  saveRoundPath: async (roundNumber: number, path: string): Promise<any> => {
    return apiCall(`/api/rounds/${roundNumber}/path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
  },

  startRound: async (roundNumber: number): Promise<any> => {
    return apiCall(`/api/rounds/${roundNumber}/start`, { method: 'POST' });
  },

  fetchRoundState: async (roundNumber: number): Promise<any> => {
    return apiCall(`/api/rounds/${roundNumber}/state`);
  },
};
