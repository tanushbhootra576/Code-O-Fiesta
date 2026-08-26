import { apiCall } from '@/lib/api';
import { Problem } from '@/types/problem';

export const problemsService = {
  fetchProblem: async (id: string): Promise<Problem> => {
    return apiCall(`/api/problems/${id}`);
  },
  
  fetchProblemState: async (id: string): Promise<{ solved: boolean }> => {
    return apiCall(`/api/problems/${id}/state`);
  },

  fetchRoundProblems: async (roundNumber: number): Promise<Problem[]> => {
    return apiCall(`/api/rounds/${roundNumber}/questions`);
  }
};
