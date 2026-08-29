export const LANGUAGE_IDS: Record<string, number> = {
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  c: 50, // C (GCC 9.2.0)
  go: 60, // Go (1.13.5)
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
  token: string;
}

const getBaseUrl = () => {
  let url = process.env.JUDGE0_API_URL || '';
  if (url.includes('/:')) {
    url = url.replace('/:', ':');
  }
  return url.replace(/\/$/, '');
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': process.env.JUDGE0_AUTH_TOKEN || '',
  };
};

export async function submitCode(submission: Judge0Submission, wait: boolean = true): Promise<Judge0Result> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/submissions?base64_encoded=true&wait=${wait}`;

  const encodedSubmission = {
    ...submission,
    source_code: Buffer.from(submission.source_code || '').toString('base64'),
    stdin: submission.stdin ? Buffer.from(submission.stdin).toString('base64') : undefined,
    expected_output: submission.expected_output ? Buffer.from(submission.expected_output).toString('base64') : undefined,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(encodedSubmission),
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson);
    } catch (e) {
      errorDetails = await response.text();
    }
    throw new Error(`Judge0 API error: ${response.statusText} - ${errorDetails}`);
  }

  return response.json();
}

export async function submitBatch(submissions: Judge0Submission[]): Promise<{ token: string }[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/submissions/batch?base64_encoded=true`;

  const encodedSubmissions = submissions.map(sub => ({
    ...sub,
    source_code: Buffer.from(sub.source_code || '').toString('base64'),
    stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : undefined,
    expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : undefined,
  }));

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ submissions: encodedSubmissions }),
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson);
    } catch (e) {
      errorDetails = await response.text();
    }
    throw new Error(`Judge0 API error: ${response.statusText} - ${errorDetails}`);
  }

  return response.json();
}

export async function getBatchSubmissions(tokens: string[]): Promise<{ submissions: Judge0Result[] }> {
  const baseUrl = getBaseUrl();
  const tokenString = tokens.join(',');
  const url = `${baseUrl}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=stdout,stderr,compile_output,message,time,memory,status,token`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.statusText}`);
  }

  return response.json();
}
