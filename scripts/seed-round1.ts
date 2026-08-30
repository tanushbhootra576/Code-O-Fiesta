import argon2 from 'argon2';
import mongoose from 'mongoose';

import connectDB from '../src/lib/db';
import Problem from '../src/models/Problem';
import Round from '../src/models/Round';
import Team from '../src/models/Team';
import TeamRound from '../src/models/TeamRound';
import User from '../src/models/User';

import {
  ProblemDifficulty,
  ProblemTopic,
  Round1Path,
  Round1Topic,
  RoundStatus,
  TeamMember,
  TeamStatus,
  UserRole,
} from '../src/constants/event';

const DEMO_PROBLEM_TITLES = [
  'Demo Problem 1 - Sum of Digits',
  'Demo Problem 2 - String Reverse',
  'Demo Problem 3 - Max Subarray Value',
] as const;

const DEMO_TEAM_CODE = 'TEST001';
const DEMO_EMAIL = 'team@test.com';
const DEMO_PASSWORD = 'TestPassword123';
const CLEANUP_MODE = process.argv.includes('--cleanup');

function buildDemoProblems() {
  return [
    {
      title: 'Demo Problem 1 - Sum of Digits',
      description:
        'Given a positive integer n, compute the sum of its digits. This is a basic number manipulation problem intended for Round 1.',
      difficulty: ProblemDifficulty.EASY,
      roundNumber: 1,
      topic: ProblemTopic.BASIC_MATH_NUMBERS,
      constraints:
        '1 <= n <= 10^9\nThe input value fits in a 64-bit signed integer.',
      inputFormat: 'The input contains a single integer n.',
      outputFormat: 'Print the sum of the digits of n.',
      examples: [
        {
          input: '1234',
          output: '10',
          explanation: '1 + 2 + 3 + 4 = 10.',
        },
        {
          input: '987',
          output: '24',
          explanation: '9 + 8 + 7 = 24.',
        },
      ],
      visibleTestCases: [
        { input: '1234', expectedOutput: '10' },
        { input: '7', expectedOutput: '7' },
      ],
      hiddenTestCases: [
        { input: '99999', expectedOutput: '45' },
        { input: '1000000000', expectedOutput: '1' },
      ],
      allowedLanguages: ['cpp', 'python', 'javascript'],
      round3Constraints: {
        recursionRequired: false,
        noLoops: false,
        maxLines: null,
      },
      isActive: true,
    },
    {
      title: 'Demo Problem 2 - String Reverse',
      description:
        'Given a string s, reverse it and print the transformed string. This problem tests string-handling and indexing logic.',
      difficulty: ProblemDifficulty.MEDIUM,
      roundNumber: 1,
      topic: ProblemTopic.STRING_MANIPULATION,
      constraints:
        '1 <= |s| <= 10^5\nThe string contains only lowercase English letters and spaces.',
      inputFormat: 'The input contains a single string s.',
      outputFormat: 'Print the reversed string.',
      examples: [
        {
          input: 'hello',
          output: 'olleh',
          explanation: 'The letters are reversed in order.',
        },
        {
          input: 'code fiesta',
          output: 'atseif edoc',
          explanation: 'The entire string is reversed as a sequence of characters.',
        },
      ],
      visibleTestCases: [
        { input: 'hello', expectedOutput: 'olleh' },
        { input: 'abc', expectedOutput: 'cba' },
      ],
      hiddenTestCases: [
        { input: 'racecar', expectedOutput: 'racecar' },
        { input: 'programming', expectedOutput: 'gnimmargorp' },
      ],
      allowedLanguages: ['cpp', 'python', 'javascript'],
      round3Constraints: {
        recursionRequired: false,
        noLoops: false,
        maxLines: null,
      },
      isActive: true,
    },
    {
      title: 'Demo Problem 3 - Max Subarray Value',
      description:
        'Given an array of integers, find the maximum sum of a contiguous subarray. This is a classic dynamic-programming style Round 1 challenge.',
      difficulty: ProblemDifficulty.HARD,
      roundNumber: 1,
      topic: ProblemTopic.ARRAYS_LOGIC,
      constraints:
        '1 <= n <= 2 * 10^5\n-10^9 <= arr[i] <= 10^9',
      inputFormat: 'The first line contains n, followed by n integers.',
      outputFormat: 'Print the maximum contiguous subarray sum.',
      examples: [
        {
          input: '5\n-2 1 -3 4 -1 2 1 -5 4',
          output: '6',
          explanation: 'The maximum subarray is [4, -1, 2, 1] with sum 6.',
        },
        {
          input: '4\n1 2 3 4',
          output: '10',
          explanation: 'The whole array is the maximum subarray.',
        },
      ],
      visibleTestCases: [
        { input: '5\n-2 1 -3 4 -1', expectedOutput: '6' },
        { input: '3\n-1 -2 -3', expectedOutput: '-1' },
      ],
      hiddenTestCases: [
        { input: '6\n-5 4 -1 2 1 -3', expectedOutput: '6' },
        { input: '7\n10 -5 3 9 -10 20 1', expectedOutput: '27' },
      ],
      allowedLanguages: ['cpp', 'python', 'javascript'],
      round3Constraints: {
        recursionRequired: false,
        noLoops: false,
        maxLines: null,
      },
      isActive: true,
    },
  ];
}

async function ensureDemoRound() {
  const round = await Round.findOneAndUpdate(
    { roundNumber: 1 },
    {
      $set: {
        status: RoundStatus.ACTIVE,
      },
      $setOnInsert: {
        roundNumber: 1,
        name: 'Round 1',
        durationSeconds: 3600,
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 3600 * 1000),
        configuration: {
          problemCount: 3,
          round1: {
            paths: [
              { shape: Round1Path.TRIANGLE, topic: Round1Topic.BASIC_MATH_NUMBERS },
              { shape: Round1Path.CIRCLE, topic: Round1Topic.STRING_MANIPULATION },
              { shape: Round1Path.SQUARE, topic: Round1Topic.ARRAYS_LOGIC },
              { shape: Round1Path.STAR, topic: Round1Topic.LOOPS_PATTERNS },
            ],
          },
        },
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return round;
}

async function ensureDemoTeam() {
  const existingTeam = await Team.findOne({ teamCode: DEMO_TEAM_CODE }).lean();

  if (existingTeam) {
    return existingTeam;
  }

  const team = await Team.create({
    teamCode: DEMO_TEAM_CODE,
    name: 'Demo Round 1 Team',
    members: [],
    captainId: null,
    status: TeamStatus.ACTIVE,
  });

  return team.toObject();
}

async function ensureDemoUsers(teamId: string | mongoose.Types.ObjectId) {
  const member1 = await User.findOne({
    email: DEMO_EMAIL,
    teamMember: TeamMember.MEMBER_1,
  });

  const member2 = await User.findOne({
    email: DEMO_EMAIL,
    teamMember: TeamMember.MEMBER_2,
  });

  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  const finalMember1 =
    member1 ??
    (await User.create({
      name: 'Demo Member 1',
      email: DEMO_EMAIL,
      passwordHash,
      role: UserRole.PARTICIPANT,
      teamId,
      teamMember: TeamMember.MEMBER_1,
      isActive: true,
    }));

  const finalMember2 =
    member2 ??
    (await User.create({
      name: 'Demo Member 2',
      email: DEMO_EMAIL,
      passwordHash,
      role: UserRole.PARTICIPANT,
      teamId,
      teamMember: TeamMember.MEMBER_2,
      isActive: true,
    }));

  const team = await Team.findById(teamId);
  if (team) {
    const uniqueMembers = [...new Set([finalMember1._id.toString(), finalMember2._id.toString()])].map((id) => new mongoose.Types.ObjectId(id));
    team.members = uniqueMembers;
    team.captainId = finalMember1._id;
    await team.save();
  }

  return { member1: finalMember1, member2: finalMember2 };
}

async function seedRound1Demo() {
  await connectDB();

  const team = await ensureDemoTeam();
  const round = await ensureDemoRound();

  const demoProblems = buildDemoProblems();
  const existingProblems = await Problem.find({ title: { $in: DEMO_PROBLEM_TITLES } }).lean();

  const finalProblems: Array<{ _id: mongoose.Types.ObjectId; [key: string]: unknown }> = [];

  for (const problemData of demoProblems) {
    const existing = existingProblems.find((problem) => problem.title === problemData.title);

    if (existing) {
      finalProblems.push(existing);
      continue;
    }

    const created = await Problem.create(problemData);
    finalProblems.push(created.toObject());
  }

  const teamRound = await TeamRound.findOne({
    teamId: team._id,
    roundId: round._id,
  });

  const assignedProblems = finalProblems.map((problem) => ({
    problemId: problem._id,
    status: 'PENDING',
  }));

  if (teamRound) {
    teamRound.set('round1.selectedPath', Round1Path.TRIANGLE);
    teamRound.set('round1.revealedTopic', Round1Topic.BASIC_MATH_NUMBERS);
    teamRound.set('round1.selectedAt', new Date());
    teamRound.set('round1.problems', assignedProblems as never);
    teamRound.status = 'IN_PROGRESS';
    teamRound.currentProblemId = finalProblems[0]._id;
    await teamRound.save();
  } else {
    await TeamRound.create({
      teamId: team._id,
      roundId: round._id,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      currentProblemId: finalProblems[0]._id,
      score: 0,
      round1: {
        selectedPath: Round1Path.TRIANGLE,
        revealedTopic: Round1Topic.BASIC_MATH_NUMBERS,
        selectedAt: new Date(),
        problems: assignedProblems as never,
      },
      round2: {
        currentQuestionNumber: 1,
        activeMember: TeamMember.MEMBER_1,
        phase: 'MEMBER_1',
        phaseStartedAt: new Date(),
        phaseEndsAt: null,
        questions: [],
      },
      round3: {
        currentProblemId: null,
        problems: [],
      },
    });
  }

  if (!team.members?.length) {
    await ensureDemoUsers(team._id);
  }

  console.log('');
  console.log('========================================');
  console.log('ROUND 1 DEMO SEED COMPLETE');
  console.log('========================================');
  console.log('Team Code:', team.teamCode);
  console.log('Team ID:', team._id.toString());
  console.log('Round ID:', round._id.toString());
  console.log('Problem IDs:');
  for (const problem of finalProblems) {
    console.log('-', problem._id.toString(), problem.title);
  }
  console.log('TeamRound assigned:', assignedProblems.length, 'problems');
  console.log('Auth login target:');
  console.log('email:', DEMO_EMAIL);
  console.log('teamMember:', TeamMember.MEMBER_1);
  console.log('password:', DEMO_PASSWORD);
}

async function cleanupRound1Demo() {
  await connectDB();

  const team = await Team.findOne({ teamCode: DEMO_TEAM_CODE }).lean();
  if (team) {
    await TeamRound.deleteMany({ teamId: team._id });
  }

  await Problem.deleteMany({
    title: { $in: DEMO_PROBLEM_TITLES },
  });

  await User.deleteMany({
    email: DEMO_EMAIL,
    role: UserRole.PARTICIPANT,
  });

  if (team) {
    await Team.deleteOne({ _id: team._id });
  }

  console.log('Removed only Round 1 demo data for the test team and assigned problems.');
}

async function main() {
  try {
    if (CLEANUP_MODE) {
      await cleanupRound1Demo();
      return;
    }

    await seedRound1Demo();
  } catch (error) {
    console.error('Round 1 demo seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
