import argon2 from 'argon2';
import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import connectDB from '../src/lib/db';
import Problem from '../src/models/Problem';
import Round from '../src/models/Round';
import Team from '../src/models/Team';
import TeamRound from '../src/models/TeamRound';
import User from '../src/models/User';

import {
  ProblemDifficulty,
  ProblemTopic,
  RoundStatus,
  TeamMember,
  TeamStatus,
  UserRole,
} from '../src/constants/event';

const DEMO_TEAM_CODE = 'TEST001';
const DEMO_EMAIL = 'team@test.com';
const DEMO_PASSWORD = 'TestPassword123';

const ROUND3_PROBLEMS = [
  {
    title: 'Digital Root Reducer',
    description:
      'Given a non-negative integer n, repeatedly add all its digits until the result has only one digit. Output this final single digit value.\n\nCrucible Modifiers apply: Solve using recursion (Ouroboros) and compact code (Short & Sweet) for maximum points.',
    difficulty: ProblemDifficulty.EASY,
    roundNumber: 3,
    topic: ProblemTopic.BASIC_MATH_NUMBERS,
    constraints: '0 <= n <= 10^9\nTime Limit: 1000ms\nMemory Limit: 256MB',
    inputFormat: 'A single integer n.',
    outputFormat: 'A single integer representing the digital root.',
    examples: [
      {
        input: '38',
        output: '2',
        explanation: '3 + 8 = 11, then 1 + 1 = 2.',
      },
      {
        input: '0',
        output: '0',
        explanation: '0 is already a single digit.',
      },
      {
        input: '12345',
        output: '6',
        explanation: '1+2+3+4+5 = 15 -> 1+5 = 6.',
      },
    ],
    visibleTestCases: [
      { input: '38', expectedOutput: '2' },
      { input: '0', expectedOutput: '0' },
      { input: '12345', expectedOutput: '6' },
    ],
    hiddenTestCases: [
      { input: '9999', expectedOutput: '9' },
      { input: '18', expectedOutput: '9' },
      { input: '7', expectedOutput: '7' },
      { input: '1000000000', expectedOutput: '1' },
    ],
    allowedLanguages: ['cpp', 'python', 'javascript', 'java'],
    round3Constraints: {
      recursionRequired: true,
      noLoops: true,
      maxLines: 30,
    },
    isActive: true,
  },
  {
    title: 'Recursive Fibonacci Sequence',
    description:
      'Given an integer n, compute the nth Fibonacci number modulo 1000000007. The sequence begins: F(0) = 0, F(1) = 1, F(2) = 1, F(3) = 2, F(4) = 3, F(5) = 5...\n\nCrucible Modifiers apply: Solve using recursion (Ouroboros) and keep line count under 30 (Short & Sweet).',
    difficulty: ProblemDifficulty.MEDIUM,
    roundNumber: 3,
    topic: ProblemTopic.ARRAYS_LOGIC,
    constraints: '0 <= n <= 30\nTime Limit: 1000ms\nMemory Limit: 256MB',
    inputFormat: 'A single integer n.',
    outputFormat: 'Print the nth Fibonacci number modulo 1000000007.',
    examples: [
      {
        input: '5',
        output: '5',
        explanation: 'F(5) = 5.',
      },
      {
        input: '10',
        output: '55',
        explanation: 'F(10) = 55.',
      },
    ],
    visibleTestCases: [
      { input: '0', expectedOutput: '0' },
      { input: '5', expectedOutput: '5' },
      { input: '10', expectedOutput: '55' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '6', expectedOutput: '8' },
      { input: '15', expectedOutput: '610' },
      { input: '25', expectedOutput: '75025' },
    ],
    allowedLanguages: ['cpp', 'python', 'javascript', 'java'],
    round3Constraints: {
      recursionRequired: true,
      noLoops: true,
      maxLines: 30,
    },
    isActive: true,
  },
  {
    title: 'Grid Pathway Explorer',
    description:
      'A robot is located at the top-left corner of an m x n grid (grid[0][0]). The robot can only move either down or right at any point in time. The robot is trying to reach the bottom-right corner of the grid (grid[m-1][n-1]).\n\nCalculate the total number of unique paths to reach the destination.',
    difficulty: ProblemDifficulty.HARD,
    roundNumber: 3,
    topic: ProblemTopic.ARRAYS_LOGIC,
    constraints: '1 <= m, n <= 12\nTime Limit: 1000ms\nMemory Limit: 256MB',
    inputFormat: 'Two space-separated integers m and n.',
    outputFormat: 'A single integer representing the number of unique paths.',
    examples: [
      {
        input: '2 3',
        output: '3',
        explanation: 'From (0,0) to (1,2): Right->Right->Down, Right->Down->Right, Down->Right->Right.',
      },
      {
        input: '3 3',
        output: '6',
        explanation: 'There are 6 unique paths on a 3x3 grid.',
      },
    ],
    visibleTestCases: [
      { input: '2 3', expectedOutput: '3' },
      { input: '3 3', expectedOutput: '6' },
      { input: '1 5', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '3 7', expectedOutput: '28' },
      { input: '4 4', expectedOutput: '20' },
      { input: '5 5', expectedOutput: '70' },
      { input: '10 2', expectedOutput: '10' },
    ],
    allowedLanguages: ['cpp', 'python', 'javascript', 'java'],
    round3Constraints: {
      recursionRequired: true,
      noLoops: true,
      maxLines: 30,
    },
    isActive: true,
  },
];

async function seedRound3() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // 1. Ensure Rounds 1 & 2 are COMPLETED and Round 3 is ACTIVE
    await Round.updateOne(
      { roundNumber: 1 },
      { $set: { status: RoundStatus.COMPLETED } },
      { upsert: false }
    );
    await Round.updateOne(
      { roundNumber: 2 },
      { $set: { status: RoundStatus.COMPLETED } },
      { upsert: false }
    );

    const now = new Date();
    const endsAt = new Date(now.getTime() + 60 * 60 * 1000); // 60 mins from now

    const round3 = await Round.findOneAndUpdate(
      { roundNumber: 3 },
      {
        $set: {
          name: 'Round 3 - The Constraint Crucible',
          status: RoundStatus.ACTIVE,
          durationSeconds: 3600,
          startedAt: now,
          endsAt: endsAt,
          configuration: {
            problemCount: 3,
            round3: {
              basePoints: 50,
              ouroborosPoints: 30,
              shortAndSweetPoints: 20,
              oneShotWonderPoints: 40,
              maxLines: 30,
            },
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Round 3 is now ACTIVE in MongoDB (ID:', round3._id.toString(), ')');

    // 2. Upsert Problems for Round 3
    const seededProblems: any[] = [];
    for (const prob of ROUND3_PROBLEMS) {
      const p = await Problem.findOneAndUpdate(
        { title: prob.title, roundNumber: 3 },
        { $set: prob },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededProblems.push(p);
      console.log(`- Problem: "${p.title}" (ID: ${p._id.toString()})`);
    }

    // 3. Ensure Demo Team and User exist
    let team = await Team.findOne({ teamCode: DEMO_TEAM_CODE });
    if (!team) {
      team = await Team.create({
        teamCode: DEMO_TEAM_CODE,
        name: 'Demo Team',
        members: [],
        captainId: null,
        status: TeamStatus.ACTIVE,
      });
    }

    const passwordHash = await argon2.hash(DEMO_PASSWORD);

    let member1 = await User.findOne({
      email: DEMO_EMAIL,
      teamMember: TeamMember.MEMBER_1,
    });
    if (!member1) {
      member1 = await User.create({
        name: 'Demo Participant 1',
        email: DEMO_EMAIL,
        passwordHash,
        role: UserRole.PARTICIPANT,
        teamId: team._id,
        teamMember: TeamMember.MEMBER_1,
        isActive: true,
      });
    }

    let member2 = await User.findOne({
      email: DEMO_EMAIL,
      teamMember: TeamMember.MEMBER_2,
    });
    if (!member2) {
      member2 = await User.create({
        name: 'Demo Participant 2',
        email: DEMO_EMAIL,
        passwordHash,
        role: UserRole.PARTICIPANT,
        teamId: team._id,
        teamMember: TeamMember.MEMBER_2,
        isActive: true,
      });
    }

    team.members = [member1._id, member2._id];
    team.captainId = member1._id;
    await team.save();

    // 4. Reset or initialize TeamRound for Round 3 so test team starts fresh
    await TeamRound.deleteMany({
      teamId: team._id,
      roundId: round3._id,
    });

    console.log('');
    console.log('====================================================');
    console.log('🚀 ROUND 3 SEED COMPLETED SUCCESSFULLY');
    console.log('====================================================');
    console.log('Round Status       : ACTIVE');
    console.log('Round Duration     : 60 minutes');
    console.log('Seeded Problems    : 3 Problems');
    console.log('');
    console.log('Demo Credentials for Testing:');
    console.log('  URL              : http://localhost:3000/login');
    console.log('  Email            : team@test.com');
    console.log('  Team Member      : MEMBER_1');
    console.log('  Password         : TestPassword123');
    console.log('');
    console.log('Round 3 URL        : http://localhost:3000/round-3');
    console.log('====================================================');
  } catch (err) {
    console.error('Failed to seed Round 3:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedRound3();
