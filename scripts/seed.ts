import argon2 from 'argon2';
import mongoose from 'mongoose';
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
import connectDB from '../src/lib/db';

import Team from '../src/models/Team';
import User from '../src/models/User';
import Round from '../src/models/Round';

import {
  Round1Path,
  Round1Topic,
  RoundStatus,
  TeamMember,
  TeamStatus,
  UserRole,
} from '../src/constants/event';

const TEST_PASSWORD = 'TestPassword123';

async function seed() {
  try {
    await connectDB();

    console.log('Connected to MongoDB');

    const passwordHash = await argon2.hash(
      TEST_PASSWORD,
    );

    /*
     * Clean test users.
     */

    await User.deleteMany({
      email: {
        $in: [
          'team@test.com',
          'admin@test.com',
          'judge@test.com',
        ],
      },
    });

    /*
     * Clean test team.
     */

    await Team.deleteOne({
      teamCode: 'TEST001',
    });

    /*
     * Clean existing rounds.
     *
     * This allows you to run the seed repeatedly
     * without duplicate roundNumber errors.
     */

    await Round.deleteMany({
      roundNumber: {
        $in: [1, 2, 3],
      },
    });

    /*
     * Create test team.
     */

    const team = await Team.create({
      teamCode: 'TEST001',
      name: 'Test Team',
      members: [],
      captainId: null,
      status: TeamStatus.ACTIVE,
    });

    /*
     * Create Participant 1.
     */

    const member1 = await User.create({
      name: 'Test Member 1',
      email: 'team@test.com',
      passwordHash,
      role: UserRole.PARTICIPANT,
      teamId: team._id,
      teamMember: TeamMember.MEMBER_1,
      isActive: true,
    });

    /*
     * Create Participant 2.
     *
     * Same email and password.
     * Different teamMember identifier.
     */

    const member2 = await User.create({
      name: 'Test Member 2',
      email: 'team@test.com',
      passwordHash,
      role: UserRole.PARTICIPANT,
      teamId: team._id,
      teamMember: TeamMember.MEMBER_2,
      isActive: true,
    });

    /*
     * Create Admin.
     */

    await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash,
      role: UserRole.ADMIN,
      teamId: null,
      isActive: true,
    });

    /*
     * Create Judge.
     */

    await User.create({
      name: 'Test Judge',
      email: 'judge@test.com',
      passwordHash,
      role: UserRole.JUDGE,
      teamId: null,
      isActive: true,
    });

    /*
     * Link participants to the team.
     */

    team.members = [
      member1._id,
      member2._id,
    ];

    team.captainId = member1._id;

    await team.save();

    /*
     * =========================
     * ROUND 1
     * =========================
     */

    await Round.create({
      roundNumber: 1,
      name: 'Round 1',
      status: RoundStatus.UPCOMING,
      durationSeconds: 3600,
      startedAt: null,
      endsAt: null,

      configuration: {
        problemCount: 4,

        round1: {
          paths: [
            {
              shape: Round1Path.TRIANGLE,
              topic: Round1Topic.BASIC_MATH_NUMBERS,
            },
            {
              shape: Round1Path.CIRCLE,
              topic: Round1Topic.STRING_MANIPULATION,
            },
            {
              shape: Round1Path.SQUARE,
              topic: Round1Topic.ARRAYS_LOGIC,
            },
            {
              shape: Round1Path.STAR,
              topic: Round1Topic.LOOPS_PATTERNS,
            },
          ],
        },
      },
    });

    /*
     * =========================
     * ROUND 2
     * =========================
     */

    await Round.create({
      roundNumber: 2,
      name: 'Round 2',
      status: RoundStatus.UPCOMING,
      durationSeconds: 1800,
      startedAt: null,
      endsAt: null,

      configuration: {
        problemCount: 4,

        round2: {
          questionCount: 4,
          member1Seconds: 900,
          member2Seconds: 900,
          overallDurationSeconds: 1800,
        },
      },
    });

    /*
     * =========================
     * ROUND 3
     * =========================
     */

    await Round.create({
      roundNumber: 3,
      name: 'Round 3',
      status: RoundStatus.UPCOMING,
      durationSeconds: 1800,
      startedAt: null,
      endsAt: null,

      configuration: {
        problemCount: 3,

        round3: {
          basePoints: 100,
          ouroborosPoints: 50,
          shortAndSweetPoints: 25,
          oneShotWonderPoints: 25,
          maxLines: 20,
        },
      },
    });

    console.log('');
    console.log('================================');
    console.log('AUTH + TEAM + ROUND TEST SEED COMPLETE');
    console.log('================================');

    console.log('');
    console.log('Team');
    console.log('Code: TEST001');
    console.log('Name: Test Team');

    console.log('');
    console.log('Participant 1');
    console.log('Email: team@test.com');
    console.log('Team Member: MEMBER_1');

    console.log('');
    console.log('Participant 2');
    console.log('Email: team@test.com');
    console.log('Team Member: MEMBER_2');

    console.log('');
    console.log('Admin');
    console.log('Email: admin@test.com');

    console.log('');
    console.log('Judge');
    console.log('Email: judge@test.com');

    console.log('');
    console.log('Password for all:', TEST_PASSWORD);

    console.log('');
    console.log('Rounds');

    console.log('Round 1: UPCOMING');
    console.log('Round 2: UPCOMING');
    console.log('Round 3: UPCOMING');

  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();