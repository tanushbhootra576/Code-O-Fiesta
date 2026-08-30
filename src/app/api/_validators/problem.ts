import { Round1Path } from '@/constants/event';

const VALID_PATHS = new Set<string>(Object.values(Round1Path));

export function validateRound1Path(value: unknown): Round1Path {
  if (!value || typeof value !== 'string') {
    throw new PathValidationError('path is required and must be a string');
  }
  if (!VALID_PATHS.has(value)) {
    throw new PathValidationError(
      `Invalid path "${value}". Allowed values: ${Object.values(Round1Path).join(', ')}`
    );
  }
  return value as Round1Path;
}

export class PathValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'PathValidationError';
  }
}
