/**
 * Judge0 Load Testing Script
 * 
 * Simulates concurrent code submissions to test capacity, latency, and queue handling.
 * Run with: node scripts/load-test-judge0.mjs [concurrency] [totalSubmissions]
 * Example:  node scripts/load-test-judge0.mjs 20 60
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// 1. Read .env.local for Judge0 configurations
function getEnvConfig() {
  let apiUrl = process.env.JUDGE0_API_URL || '';
  let authToken = process.env.JUDGE0_AUTH_TOKEN || '';

  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of envFile.split('\n')) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        if (key === 'JUDGE0_API_URL') apiUrl = val;
        if (key === 'JUDGE0_AUTH_TOKEN') authToken = val;
      }
    }
  } catch (err) {
    // If no .env.local, use defaults or process.env
  }

  if (apiUrl.includes('/:')) {
    apiUrl = apiUrl.replace('/:', ':');
  }
  apiUrl = apiUrl.replace(/\/$/, '');

  return { apiUrl, authToken };
}

const { apiUrl, authToken } = getEnvConfig();

console.log(`\n======================================================`);
console.log(`🚀 JUDGE0 LOAD & CAPACITY TESTING SUITE`);
console.log(`======================================================`);
console.log(`Target Judge0 URL: ${apiUrl || '(Missing JUDGE0_API_URL)'}`);
console.log(`Auth Token:        ${authToken ? '******' + authToken.slice(-6) : '(None)'}`);
console.log(`======================================================\n`);

if (!apiUrl) {
  console.error('❌ Error: JUDGE0_API_URL is not set.');
  process.exit(1);
}

// Sample programs for testing
const CPP_CODE = `#include <iostream>
using namespace std;
int main() {
    int n;
    if (cin >> n) {
        cout << "Result: " << (n * 2) << endl;
    } else {
        cout << "Result: 0" << endl;
    }
    return 0;
}`;

const PYTHON_CODE = `import sys
n = sys.stdin.read().strip()
print(f"Result: {int(n)*2 if n.isdigit() else 0}")`;

// Helper: send one submission (with wait=true)
async function sendSingleSubmission(id, languageId, sourceCode, stdin) {
  const start = Date.now();
  const url = `${apiUrl}/submissions?base64_encoded=true&wait=true`;

  const body = {
    language_id: languageId,
    source_code: Buffer.from(sourceCode).toString('base64'),
    stdin: Buffer.from(stdin).toString('base64'),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'X-Auth-Token': authToken } : {}),
      },
      body: JSON.stringify(body),
    });

    const elapsed = Date.now() - start;
    if (!res.ok) {
      const errText = await res.text();
      return { id, success: false, elapsed, status: res.status, error: errText };
    }

    const data = await res.json();
    return {
      id,
      success: true,
      elapsed,
      status: res.status,
      judgeStatus: data.status?.description || 'Unknown',
      statusId: data.status?.id,
      execTime: data.time,
      execMemory: data.memory,
    };
  } catch (err) {
    return {
      id,
      success: false,
      elapsed: Date.now() - start,
      status: 'FETCH_ERROR',
      error: err.message,
    };
  }
}

// Helper: Batch submissions (async token polling)
async function sendBatchSubmission(batchSize) {
  const start = Date.now();
  const submissions = Array.from({ length: batchSize }, (_, i) => ({
    language_id: 54, // C++
    source_code: Buffer.from(CPP_CODE).toString('base64'),
    stdin: Buffer.from(String(i + 1)).toString('base64'),
  }));

  const url = `${apiUrl}/submissions/batch?base64_encoded=true`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'X-Auth-Token': authToken } : {}),
      },
      body: JSON.stringify({ submissions }),
    });

    if (!res.ok) {
      throw new Error(`Batch submit failed (${res.status}): ${await res.text()}`);
    }

    const tokensData = await res.json();
    const tokens = tokensData.map((t) => t.token);

    // Poll until all complete
    let completed = false;
    let pollCount = 0;
    const maxPolls = 30;

    while (!completed && pollCount < maxPolls) {
      await new Promise((r) => setTimeout(r, 1000));
      pollCount++;

      const pollUrl = `${apiUrl}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true&fields=status,token`;
      const pollRes = await fetch(pollUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-Auth-Token': authToken } : {}),
        },
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      const subs = pollData.submissions || [];
      const stillProcessing = subs.some((s) => !s.status || s.status.id <= 2);

      if (!stillProcessing && subs.length === batchSize) {
        completed = true;
      }
    }

    const elapsed = Date.now() - start;
    return { success: completed, elapsed, batchSize, polls: pollCount };
  } catch (err) {
    return { success: false, elapsed: Date.now() - start, batchSize, error: err.message };
  }
}

// ── Runner for test stages ──────────────────────────────────────────────────
async function runStage(stageName, concurrency, totalRequests) {
  console.log(`\n------------------------------------------------------`);
  console.log(`▶ STAGE: ${stageName}`);
  console.log(`  Concurrency: ${concurrency} parallel requests | Total Requests: ${totalRequests}`);
  console.log(`------------------------------------------------------`);

  const results = [];
  let index = 0;

  const startTime = Date.now();

  async function worker() {
    while (index < totalRequests) {
      const currentId = ++index;
      const langId = currentId % 2 === 0 ? 54 : 71; // alternate C++ and Python
      const code = langId === 54 ? CPP_CODE : PYTHON_CODE;
      const res = await sendSingleSubmission(currentId, langId, code, String(currentId));
      results.push(res);
      process.stdout.write(res.success ? '✔ ' : '✖ ');
    }
  }

  // Spawn concurrent workers
  const workers = Array.from({ length: Math.min(concurrency, totalRequests) }, () => worker());
  await Promise.all(workers);
  process.stdout.write('\n');

  const totalTime = Date.now() - startTime;
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const times = successful.map((r) => r.elapsed);

  const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0) : 0;
  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  const throughput = ((totalRequests / (totalTime / 1000))).toFixed(2);

  console.log(`\n📊 RESULTS FOR ${stageName}:`);
  console.log(`  • Completed in:       ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`  • Success Rate:       ${successful.length}/${totalRequests} (${((successful.length / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`  • Failed Requests:    ${failed.length}`);
  console.log(`  • Throughput:         ${throughput} submissions/sec`);
  console.log(`  • Avg Latency:        ${avgTime} ms`);
  console.log(`  • Min / Max Latency:  ${minTime} ms / ${maxTime} ms`);

  if (failed.length > 0) {
    console.log(`  ⚠️ Sample Error:       ${failed[0].error || failed[0].status}`);
  }

  return { throughput, avgTime, failureRate: ((failed.length / totalRequests) * 100) };
}

// ── Main Execution ──────────────────────────────────────────────────────────
async function main() {
  const customConcurrency = parseInt(process.argv[2], 10);
  const customTotal = parseInt(process.argv[3], 10);

  if (!isNaN(customConcurrency) && !isNaN(customTotal)) {
    await runStage('Custom Test', customConcurrency, customTotal);
    return;
  }

  console.log('Running automated 3-tier capacity test...\n');

  // Stage 1: Warmup & baseline (5 concurrent, 10 submissions)
  await runStage('Stage 1: Warmup / Low Load', 5, 10);

  // Stage 2: Medium Load (20 concurrent, 40 submissions)
  await runStage('Stage 2: Medium Load (Typical Contest Pace)', 20, 40);

  // Stage 3: Stress / Peak Burst (50 concurrent, 100 submissions)
  await runStage('Stage 3: High Peak Burst (Round Start/End Surge)', 50, 100);

  // Stage 4: Batch API Test (1 batch of 20 test cases in 1 request)
  console.log(`\n------------------------------------------------------`);
  console.log(`▶ STAGE 4: Batch Evaluation Test (1 Batch x 20 Test Cases)`);
  console.log(`------------------------------------------------------`);
  const batchRes = await sendBatchSubmission(20);
  if (batchRes.success) {
    console.log(`✔ Batch of 20 test cases fully evaluated in ${(batchRes.elapsed / 1000).toFixed(2)}s (${batchRes.polls} poll intervals)`);
  } else {
    console.log(`✖ Batch evaluation failed: ${batchRes.error}`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Testing complete!`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
