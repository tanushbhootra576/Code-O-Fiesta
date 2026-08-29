import { TeamMember } from '@/constants/event';

export const ROUND_2_NUMBER = 2 as const;

export type Round2Number = typeof ROUND_2_NUMBER;

export class RoundRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'RoundRequestError';
    this.status = status;
    this.code = code;
  }
}

export function parseRoundNumberParam(roundNumber: string): number {
  const parsed = Number.parseInt(roundNumber, 10);

  if (!Number.isInteger(parsed) || String(parsed) !== roundNumber.trim()) {
    throw new RoundRequestError(
      'roundNumber must be an integer path segment.',
      400,
      'INVALID_ROUND_NUMBER',
    );
  }

  return parsed;
}

export function isRound2(roundNumber: number): roundNumber is Round2Number {
  return roundNumber === ROUND_2_NUMBER;
}

export function assertRound2(roundNumber: number): asserts roundNumber is Round2Number {
  if (!isRound2(roundNumber)) {
    throw new RoundRequestError(
      'This handler only serves Round 2.',
      404,
      'ROUND_NOT_OWNED',
    );
  }
}

export async function parseRound2Params(
  params: Promise<{ roundNumber: string }>,
): Promise<Round2Number> {
  const { roundNumber } = await params;
  const parsed = parseRoundNumberParam(roundNumber);
  assertRound2(parsed);
  return parsed;
}

export type PatchRound2CodeInput = {
  sourceCode: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new RoundRequestError(
      'Request body must be valid JSON.',
      400,
      'INVALID_JSON',
    );
  }
}

export function parsePatchRound2CodeBody(body: unknown): PatchRound2CodeInput {
  if (!isRecord(body)) {
    throw new RoundRequestError(
      'Request body must be a JSON object.',
      400,
      'INVALID_BODY',
    );
  }

  if (typeof body.sourceCode !== 'string') {
    throw new RoundRequestError(
      'sourceCode is required and must be a string.',
      400,
      'INVALID_SOURCE_CODE',
    );
  }

  return {
    sourceCode: body.sourceCode,
  };
}

export function isTeamMember(value: unknown): value is TeamMember {
  return value === TeamMember.MEMBER_1 || value === TeamMember.MEMBER_2;
}

export type PostRound2CompleteInput = {
  questionId?: unknown;
};

export function parsePostRound2CompleteBody(
  body: unknown,
): PostRound2CompleteInput {
  if (body === undefined || body === null) {
    return {};
  }
  if (!isRecord(body)) {
    throw new RoundRequestError(
      'Request body must be a JSON object when provided.',
      400,
      'INVALID_BODY',
    );
  }
  const out: PostRound2CompleteInput = {};
  if (body.questionId !== undefined) {
    out.questionId = body.questionId;
  }
  return out;
}
