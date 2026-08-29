# Round 1 — Path Selection & Problem APIs

**Developer:** Pranav Eashwaran  
**Branch:** `pranav-round1`  
**Module:** Round 1 — The Maze of Fate

---

## 1. Objective

The objective of this implementation is to own the backend functionality for:

- Round 1 maze path selection
- Path locking
- Path → topic mapping
- Assignment of exactly 3 problems
- Public problem retrieval
- Team-specific problem state retrieval
- Problem validation
- Shared problem service logic
- Protection of hidden test cases and other private judge data

The intended Round 1 flow is:

```text
Team enters Round 1
        ↓
Maze displayed
        ↓
Team chooses ONE path
        ↓
Backend validates and locks path
        ↓
Topic is revealed
        ↓
3 problems are assigned
        ↓
Problems are solved through the submission system
```

---

# 2. Directory Structure of Changes

The Round 1 backend implementation is centered around the following files:

```text
src/app/api/
├── _services/
│   └── problem.service.ts
│       # Shared database, authentication, problem and state logic
│
├── _validators/
│   └── problem.ts
│       # Validation for Round 1 path selection
│
├── problems/
│   └── [problemId]/
│       ├── route.ts
│       │   # GET endpoint for public problem details
│       │
│       └── state/
│           └── route.ts
│               # GET endpoint for team-specific problem state
│
└── rounds/
    └── [roundNumber]/
        └── path/
            └── route.ts
                # POST endpoint for path selection,
                # topic mapping and problem assignment
```

---

# 3. API Endpoints

## A. Lock Round 1 Path

### Endpoint

```http
POST /api/rounds/[roundNumber]/path
```

### Route

```text
src/app/api/rounds/[roundNumber]/path/route.ts
```

### Purpose

Locks the selected maze path for a team during Round 1 and automatically assigns exactly 3 problems corresponding to the selected path's topic.

### Example Request

```json
{
  "path": "TRIANGLE"
}
```

### Request Verification Flow

The endpoint follows this validation flow:

1. Verify that `roundNumber === '1'`.
2. Authenticate the user using the session cookie.
3. Retrieve the user's team.
4. Check that Round 1 is currently active.
5. Load the team's `TeamRound` state.
6. Check whether a path has already been selected.
7. Reject the request if a path is already locked.
8. Validate the incoming path value.
9. Map the path to the fixed topic.
10. Select exactly 3 active problems for that topic.
11. Persist the path, topic, timestamp and assigned problems.
12. Return a safe response containing the selected path, topic and problem information.

### Duplicate Path Selection

A team is allowed to select only one path.

If a path has already been selected, another selection is rejected with:

```http
409 Conflict
```

This prevents a team from changing its topic after the initial selection.

---

# 4. Path → Topic Mapping

The mapping is fixed and controlled by the backend.

| Maze Path | Topic |
|---|---|
| `TRIANGLE` | `BASIC_MATH_NUMBERS` |
| `CIRCLE` | `STRING_MANIPULATION` |
| `SQUARE` | `ARRAYS_LOGIC` |
| `STAR` | `LOOPS_PATTERNS` |

The mapping is represented as:

```typescript
export const PATH_TO_TOPIC: Record<Round1Path, Round1Topic> = {
  [Round1Path.TRIANGLE]: Round1Topic.BASIC_MATH_NUMBERS,
  [Round1Path.CIRCLE]: Round1Topic.STRING_MANIPULATION,
  [Round1Path.SQUARE]: Round1Topic.ARRAYS_LOGIC,
  [Round1Path.STAR]: Round1Topic.LOOPS_PATTERNS,
};
```

The frontend does not decide which topic belongs to a path.

The backend performs the mapping after validating the selected path.

---

# 5. Problem Assignment

After a valid path selection, exactly 3 problems are assigned.

The selection process is:

```text
Selected Path
      ↓
Path Validation
      ↓
Path → Topic
      ↓
Find Active Problems
      ↓
Random Selection
      ↓
Exactly 3 Problems
      ↓
Store in TeamRound
```

The implementation uses MongoDB aggregation with `$sample` to randomly select the problems matching the selected topic.

The selected problems must:

- Be active.
- Match the selected Round 1 topic.
- Belong to the Round 1 problem pool.
- Be assigned exactly 3 at a time.

The assigned problem state is initially:

```text
PENDING
```

The selected problems, topic and path are persisted in the team's `TeamRound` state.

---

# 6. Fetch Problem Details

## Endpoint

```http
GET /api/problems/[problemId]
```

## Route

```text
src/app/api/problems/[problemId]/route.ts
```

## Purpose

Retrieves the public details of a specific problem.

The endpoint is intended to provide the information required by the participant-facing problem page without exposing private judge information.

### Public Information

The response may contain:

- Problem title
- Problem description
- Difficulty
- Input format
- Output format
- Examples
- Constraints
- Allowed languages

### Private Information

The following must never be returned to the participant:

- Hidden test cases
- Expected answers
- Private judge data
- Internal evaluation data

The internal database problem document is therefore converted into a safe client-facing representation before being returned.

---

# 7. Fetch Team-Specific Problem State

## Endpoint

```http
GET /api/problems/[problemId]/state
```

## Route

```text
src/app/api/problems/[problemId]/state/route.ts
```

## Purpose

Retrieves the current solving/submission state of a problem for the authenticated team.

The state is team-specific and is not intended to expose another team's progress.

### Example Response

```json
{
  "problemId": "60c72b2f9b1d8b234567890a",
  "solved": true,
  "round1ProblemStatus": "SOLVED",
  "latestVerdict": "ACCEPTED",
  "latestSubmissionId": "60c72b2f9b1d8b234567890b",
  "canSubmit": false
}
```

### State Information

The endpoint can determine:

- Whether the team has solved the problem.
- The Round 1 problem status.
- The latest submission verdict.
- The latest submission ID.
- Whether the team can submit again.
- Relevant team/round state.

The problem state is determined using the team's own submissions and Round 1 assignment state.

---

# 8. Shared Service Layer

## File

```text
src/app/api/_services/problem.service.ts
```

The shared service layer contains common logic used by the problem-related APIs.

### Core Functions

| Function | Return Type | Purpose |
|---|---|---|
| `getAuthenticatedUser()` | `Promise<IUser \| null>` | Reads the session token from cookies and retrieves the authenticated user. |
| `getUserTeam(userId)` | `Promise<ITeam \| null>` | Finds the team associated with a user. |
| `getActiveRound(roundNumber)` | `Promise<IRound \| null>` | Finds the currently active round. |
| `getProblemById(problemId)` | `Promise<IProblem \| null>` | Retrieves a problem by MongoDB ObjectId. |
| `buildSafeProblem(problem)` | `object` | Converts an internal problem document into a safe client-facing object. |
| `selectProblemsForTopic(topic, count)` | `Promise<IProblem[]>` | Randomly selects active problems matching a topic. |
| `getProblemStateForTeam(problemId, teamId)` | `Promise<object>` | Determines the team's current problem-solving/submission state. |

Centralizing this logic avoids duplicating database and state-handling code across the API routes.

---

# 9. Input Validation

## File

```text
src/app/api/_validators/problem.ts
```

### Validator

```typescript
validateRound1Path(value: unknown): Round1Path
```

The validator ensures that the selected path:

1. Is a valid string value.
2. Matches one of the supported `Round1Path` enum values.
3. Cannot contain an arbitrary or unsupported path.

Supported values are:

```text
TRIANGLE
CIRCLE
SQUARE
STAR
```

Invalid input results in a validation error with a `400` status.

The validation layer keeps invalid data from reaching the service/database logic.

---

# 10. Authentication and Authorization

The participant-facing APIs use authenticated-user context and team-scoped access.

The general flow is:

```text
Authenticated User
       ↓
Retrieve User
       ↓
Find User's Team
       ↓
Find TeamRound
       ↓
Verify Round State
       ↓
Perform Team-Scoped Operation
```

For path selection, the backend verifies that:

- The user is authenticated.
- The user belongs to a team.
- Round 1 is active.
- The team has a valid Round 1 state.
- The team has not already selected a path.

For problem state, the returned state is associated with the authenticated user's team.

---

# 11. Hidden Test Case Protection

A critical requirement of the problem APIs is that hidden judge data must never be exposed.

The internal problem model may contain information that is required by the judging system but should not be visible to participants.

Therefore, the API uses a safe problem representation.

### Exposed

```text
✓ Title
✓ Description
✓ Difficulty
✓ Input format
✓ Output format
✓ Examples
✓ Constraints
✓ Allowed languages
```

### Never Exposed

```text
✗ Hidden test cases
✗ Expected answers
✗ Private judge data
✗ Internal evaluation information
```

The intended data flow is:

```text
                 MongoDB
                    │
             Full Problem
                    │
                    ▼
          buildSafeProblem()
                    │
                    ▼
          Public Problem Data
                    │
                    ▼
                Frontend
```

---

# 12. Complete Round 1 Backend Flow

```text
                    TEAM
                     │
                     ▼
             Enters Round 1
                     │
                     ▼
              Maze displayed
                     │
                     ▼
             Selects one path
                     │
                     ▼
          POST /api/rounds/1/path
                     │
                     ▼
              Authenticate
                     │
                     ▼
                Find Team
                     │
                     ▼
             Find TeamRound
                     │
                     ▼
          Verify Round 1 Active
                     │
                     ▼
       Check whether path is locked
                │         │
               YES        NO
                │          │
                ▼          ▼
             Reject    Validate Path
                           │
                           ▼
                    Map Path → Topic
                           │
                           ▼
                    Select 3 Problems
                           │
                           ▼
                  Persist TeamRound
                           │
                           ▼
                    Return Safe State
                           │
                           ▼
                   Problems Available
```

---

# 13. Problem Retrieval Flow

```text
Problem ID
    │
    ▼
GET /api/problems/[problemId]
    │
    ▼
Find Problem
    │
    ▼
Build Safe Problem
    │
    ▼
Return Public Details
```

---

# 14. Problem State Flow

```text
Problem ID + Authenticated User
              │
              ▼
GET /api/problems/[problemId]/state
              │
              ▼
          Find Team
              │
              ▼
      Check TeamRound State
              │
              ▼
       Check Submissions
              │
              ▼
     Determine Latest State
              │
              ▼
     Return Team-Specific State
```

---

# 15. Integration With Other Modules

## Authentication

The implementation depends on the existing authentication foundation for session and authenticated-user checks.

## Round / Event State

The implementation depends on the existing Round and event state to determine whether Round 1 is active.

## Submission System

Problem statements and problem IDs are consumed by the submission/execution system.

Problem state is expected to reflect submission activity from the submission endpoints.

## Round 2

The shared problem service provides a reusable problem read contract that can be consumed by other round-related APIs where required.

---

# 16. Scope of Work

## Implemented / Owned

```text
✓ Round 1 path selection
✓ Path validation
✓ Path locking
✓ Backend-controlled topic mapping
✓ Random problem selection
✓ Assignment of exactly 3 problems
✓ Public problem retrieval
✓ Team-specific problem state retrieval
✓ Problem validation
✓ Shared problem service logic
✓ Safe problem response
✓ Hidden test case protection
✓ Team-scoped operations
```

## Explicitly Not Implemented

```text
✗ Round 2 state machine
✗ Round 3 scoring
✗ Judge0 integration
✗ AST evaluation
✗ Submission execution
✗ Leaderboard logic
✗ Admin functionality
```

---

# 17. Testing Checklist

## Path Selection

- [ ] Authenticated user can select a path.
- [ ] Unauthenticated request is rejected.
- [ ] `roundNumber` other than `1` is rejected.
- [ ] Invalid path is rejected with a validation error.
- [ ] Inactive Round 1 rejects path selection.
- [ ] Team lookup works correctly.
- [ ] TeamRound lookup works correctly.
- [ ] First path selection is persisted.
- [ ] Selecting another path after locking returns `409 Conflict`.

## Topic Mapping

- [ ] `TRIANGLE` maps to `BASIC_MATH_NUMBERS`.
- [ ] `CIRCLE` maps to `STRING_MANIPULATION`.
- [ ] `SQUARE` maps to `ARRAYS_LOGIC`.
- [ ] `STAR` maps to `LOOPS_PATTERNS`.
- [ ] Topic is determined by the backend.

## Problem Assignment

- [ ] Exactly 3 problems are assigned.
- [ ] Problems are active.
- [ ] Problems match the selected topic.
- [ ] Problems are selected server-side.
- [ ] Assigned problems are persisted in TeamRound.
- [ ] Assigned problems initially have `PENDING` status.

## Problem Retrieval

- [ ] Valid problem ID returns public problem details.
- [ ] Invalid/nonexistent problem ID is handled correctly.
- [ ] Title is returned.
- [ ] Description is returned.
- [ ] Difficulty is returned.
- [ ] Input/output information is returned.
- [ ] Examples and constraints are returned.
- [ ] Allowed languages are returned.
- [ ] Hidden test cases are not returned.
- [ ] Private judge information is not returned.

## Problem State

- [ ] Authenticated team can retrieve its problem state.
- [ ] State is scoped to the correct team.
- [ ] Solved status is accurate.
- [ ] Latest verdict is accurate.
- [ ] Latest submission ID is returned when applicable.
- [ ] `canSubmit` reflects the current state.
- [ ] State reflects submission activity.

---

# 18. Definition of Done

The Round 1 backend implementation is considered complete when:

```text
✓ Team can select exactly one maze path
✓ Selected path becomes locked
✓ Correct topic is determined by the backend
✓ Exactly 3 problems are assigned
✓ Assigned problems are stored in TeamRound
✓ Public problem details can be retrieved
✓ Hidden test cases are never exposed
✓ Team-specific problem state can be retrieved
✓ Problem state reflects submission/solve progress
✓ Authentication is enforced
✓ Operations are scoped to the requesting team
```

---

# 19. PR Summary

### Title

```text
Round 1: Path Selection and Problem APIs
```

### Summary

This change implements the Round 1 backend functionality for the Maze of Fate flow. It adds path selection and locking, backend-controlled topic mapping, assignment of three topic-specific problems, public problem retrieval, and team-specific problem state retrieval.

The implementation also introduces shared problem service logic and validation while ensuring that hidden test cases and private judge information are never exposed through participant-facing APIs.

### Main Areas Changed

```text
src/app/api/rounds/[roundNumber]/path/route.ts
src/app/api/problems/[problemId]/route.ts
src/app/api/problems/[problemId]/state/route.ts
src/app/api/_services/problem.service.ts
src/app/api/_validators/problem.ts
```

### Review Focus

Reviewers should primarily verify:

1. Path locking and duplicate-selection protection.
2. Correct path → topic mapping.
3. Exactly 3 problems being assigned.
4. Team-level authorization.
5. Safe problem responses.
6. Hidden test case protection.
7. Accuracy of team-specific problem state.
