# Backend Results, Leaderboard & Admin APIs Implementation

Hi team, 

This PR implements the **Results, Leaderboard & Admin Backend** components assigned to me (Tanush). 

### 🚀 What was done & How
- **Participant Endpoints:** 
  - `GET /api/results/me`: Retrieves authenticated team's final results.
  - `GET /api/leaderboard`: Generates the public leaderboard.
- **Organizer Endpoints (Protected by Admin Auth):**
  - `GET /api/admin/state`: Dashboard global state, including all rounds and active teams.
  - `GET /api/admin/teams`: List of all registered teams.
  - `GET /api/admin/teams/[teamId]`: Detail view for a specific team (with null team checks).
  - `GET /api/admin/rounds`: Added an endpoint to fetch round data as specified in the folder allocation.
  - `POST /api/admin/rounds/[roundNumber]/start`: Starts a round globally and dynamically updates `TeamRound` states.
  - `POST /api/admin/rounds/[roundNumber]/complete`: Completes a round globally and updates `TeamRound` states.
  - `POST /api/admin/rounds/[roundNumber]/override`: Allows manual organizer override with strict payload validation via Zod schemas.
  - `GET /api/admin/submissions`: Fetches recent organizer-visible submissions.
  - `GET /api/admin/leaderboard`: Generates the extended leaderboard with admin-only fields.
- **Bonus Addition:** 
  - I've included an additional `GET /api/health` endpoint. This performs a basic database connection check and returns a `200 OK` if the backend and DB are healthy, which should be helpful for monitoring.

### 🔒 Security & Validation
- **Zod Validation:** Manual overrides are strictly validated using exact `RoundStatus` enums.
- **Authorization Scopes:** All `/admin/**` routes are locked behind Likhita's `requireAdmin()` helper. Participant routes enforce `requireAuthentication()` so teams can only pull their own data.
- **Type Safety:** Handled `null` references when querying team details to prevent runtime crashes.

---

### ⚠️ Merge Instructions for the Maintainer
This module consumes `TeamRound` status, `Score` structures, and Likhita's authorization foundation (`_lib/authorization.ts`). 

**Please DO NOT merge this PR into `main` immediately.** 
As per the task allocation document's recommended merge order (Step 6), this PR should be merged **after** the following PRs have been merged:
1. Likhita (Authentication foundation)
2. Yashwant (Shared submission/execution engine)
3. Pranav / Prabanjan / Tharakeshvar (Round components and Score writes)

Once the core models and helpers are in `main`, feel free to review and merge this! Let me know if you need any adjustments.
