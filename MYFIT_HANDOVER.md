# MyFit Handover

Last updated: 2026-08-14

## Phase 10: Final Requirements Build (2026-08-14)

Implemented the "Oh MyFit" final requirements doc on top of the existing app. Decision made with the user: keep all existing modules (Challenges, Coins, Progress, History) and add the new ones alongside them rather than replacing anything.

New backend modules (all under `requireMongoConnection`, same pattern as existing routes):

- **Daily Routine**: `backend/src/data/dailyRoutine.js` (static schedule matching the spec exactly — wake time, pre/post workout, 11am, lunch, alternate-day shake, dinner, 3L water target), `models/RoutineCompletion.js` (dateKey + completedItems[]), `controllers/routineController.js`, `routes/routineRoutes.js` → `GET/PATCH /api/routine`.
- **Daily Checklist**: `models/DailyChecklist.js` (only stores the one field that can't be derived — `dietFollowed`). Workout/cardio/water3L/protein-goal are all read live from `WorkoutCompletion`/`DailyStats`/`DietEntry`, same read-derived pattern as Challenges/History. `controllers/checklistController.js`, `routes/checklistRoutes.js` → `GET/PATCH /api/checklist`. Uses a 3L water threshold (3000ml) specific to this module and Night Summary — intentionally different from the existing Dashboard/Challenges 4L target, since the new spec explicitly calls for 3L.
- **100 Days Challenge**: `models/HundredDaysSettings.js` (singleton start date, auto-created as today on first load) + `models/HundredDaysEntry.js` (per-day completed flag, 1-100). `controllers/hundredDaysController.js` computes the full 100-day grid with dateKeys, current streak (consecutive completed days ending at today), longest streak, and progress %. `routes/hundredDaysRoutes.js` → `GET /api/hundred-days`, `PATCH /api/hundred-days/day/:dayNumber`, `POST /api/hundred-days/reset`.
- **Profile**: `models/Profile.js` (singleton name + imageUrl). Image upload via `multer` (added as a new dependency, pinned to the maintained 2.x line — not 1.x, which has known CVEs) writing to `backend/uploads/`, served statically at `/uploads` (mounted in `server.js` before the Mongo-required routes, so it works even if Mongo is briefly down). Old image file is deleted when a new one is uploaded. `controllers/profileController.js`, `routes/profileRoutes.js`, `utils/uploadStorage.js` → `GET/PUT /api/profile`, `POST /api/profile/image`.
- **DailyStats extended**: added `caloriesBurned` (manual entry, same pattern as steps/water) plus a new read-only `GET /api/dailystats/suggested-burn/:date`, which suggests a default burn value from the day's `WorkoutCompletion` (parses the existing `workoutPlan.js` `estimatedBurn` range string into an average, +250 kcal flat if cardio was checked). This is a suggestion only — the user still confirms/edits the actual value, nothing is auto-saved.

New frontend pages/nav items, in the existing per-page-fetch style (no global state):

- **My Diet** (`/my-diet`) — shows the current weekday/date and the full daily meal plan (there is no per-weekday-distinct diet content in the spec beyond the fixed Daily Routine, so this page presents that routine's meal sections as "today's diet").
- **Diet Library** — this is the existing Diet Food page (`/diet`), relabeled in the sidebar to match the spec's naming; the page's food-item CRUD + Add-to-Today's-Diet + Edit already satisfied the Diet Library / Food Tracking spec sections, so no duplicate page was built.
- **Daily Routine** (`/routine`) — interactive per-date checklist version of the same routine data, persisted via `RoutineCompletion`.
- **Daily Checklist** (`/checklist`) — the 5 required items with a completion %; 4 are read-only/derived, "Diet Followed" is the one manual toggle.
- **100 Days Challenge** (`/100-days`) — grid of 100 tappable days, streak/longest-streak/progress stats.
- **Night Summary** (`/night-summary`) — derived entirely from existing endpoints (diet totals, daily stats, workout completion, weight), no new model. Result status (Deficit/Maintenance/Surplus) is based on calories consumed vs. the existing 1300 kcal daily target (±50 kcal band), matching the spec's own worked example (1280 kcal read as "Deficit Achieved" even though burn was only 450 — the example is clearly budget-relative, not consumed-minus-burned). Includes a same-metric comparison against the previous calendar date.
- **Notifications** — pure frontend, `frontend/src/lib/notifications.js` + `components/notifications/NotificationScheduler.jsx` (polls every 30s against a fixed daily schedule, dedupes per day via localStorage) + `NotificationBell.jsx` (permission request / on-off toggle, shown in the mobile header and as a persistent top-right control on desktop). No backend involved — uses the browser Notification API directly, per the spec's "Browser Notifications" requirement.
- **Profile image upload** — `components/profile/ProfileAvatar.jsx` + `lib/useProfile.js`, shown at the bottom of the sidebar (full) and in the mobile header (compact). Click the avatar to upload a new photo.
- **Dashboard** — added the three stat cards the spec required that weren't already present: Calories Burned Today (manual entry + a "Use Suggested" button backed by the new suggested-burn endpoint), Cardio Status, and Weight Progress % (using the oldest of the last 100 weight entries as the starting point, same formula as the existing `WeightGoalCard`).
- **Edit button fix**: the Diet Food/Protein edit forms were already functionally wired to the update APIs, but rendered inline in the page rather than as a popup, and gave no save confirmation. Both are now real overlay modals (`components/common/Modal.jsx`), the submit button reads "Save Changes" when editing (vs. "Save Food"/"Save Protein" when adding), and a success toast (`components/common/Toast.jsx` + `lib/useToast.js`) confirms the save. Diet Food's list is also re-fetched after a save.

Files intentionally left untouched: everything listed under "Files That Must Not Be Replaced" below, plus `Challenges`/`Coins`/`Progress`/`History` in full — none of Phase 10's work modifies their models, controllers, routes, or components.

New backend dependency: `multer@^2.2.0` (installed and verified with `npm install`).

Tests completed (2026-08-14):

- `node --check` passed on every new/edited backend file.
- Backend started clean against the live MongoDB Atlas connection; full regression sweep of every pre-existing `GET` endpoint (fooditems, proteins, foodlogs, workouts, weights, challenges, progress, rewards) still returns `200`.
- All new endpoints exercised directly with `curl`, including the PATCH/toggle paths (routine progress, checklist diet-followed, 100-days day toggle) — verified correct response shape and math, then reset the real "today" records back to their pre-test state (no test residue left in `routineCompletions`, `dailyChecklists`, or the 100-day entry for day 1).
- Profile image upload tested end-to-end (upload → served at `/uploads/...` with CORS working → re-upload deletes the previous file) using a throwaway test PNG, then reset `imageUrl` back to empty afterward — no leftover test file in `backend/uploads/`.
- `npm run build` in `frontend` succeeds.
- A local `frontend/.env.local` (gitignored, does not affect the deployed `.env`) was added pointing `VITE_API_URL` at `http://localhost:5000/api`, so local dev now talks to the local backend instead of the Railway production URL in `.env`. Both the local backend (`node src/server.js`) and frontend (`npm run dev`) were left running for continued manual testing.
- Browser UI click-through was not performed (no browser tool available in this environment, same limitation noted in Phases 7-9) — verified instead via successful build, full endpoint testing, and code review of every new component's data flow.

## Unfinished / worth knowing for next session

- Night Summary's deficit/maintenance/surplus logic is budget-relative (vs. the 1300 kcal target), not a true calories-in-vs-calories-out calculation, because the app has no BMR/TDEE concept anywhere. This mirrors the spec's own example.
- 100 Days Challenge has no admin control to change the start date once set, other than the unexposed `POST /api/hundred-days/reset` (wipes all progress) — no UI button calls it yet.
- Notification times are fixed defaults (water at 08:00/11:30/15:00/18:00, workout at 05:45, weight at 21:00, one rotating motivational message at 09:00); there's no settings UI yet to customize them.
- Daily Checklist's "Water 3L" (3000ml) and the rest of the app's existing "4L" water target intentionally coexist — they serve different modules and weren't unified, since unifying them was out of scope and risked changing already-shipped Challenges/Dashboard behavior.


## Current Project Structure

```text
/home/inkyank/myfit
├── backend
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── src
│       ├── config/db.js
│       ├── controllers/challengeController.js
│       ├── controllers/dietController.js
│       ├── controllers/foodController.js
│       ├── controllers/proteinController.js
│       ├── controllers/progressController.js
│       ├── controllers/rewardController.js
│       ├── controllers/weightController.js
│       ├── controllers/workoutController.js
│       ├── data/challenges.js
│       ├── data/workoutPlan.js
│       ├── models/ChallengeProgress.js
│       ├── models/CoinTransaction.js
│       ├── models/DietEntry.js
│       ├── models/Food.js
│       ├── models/WeightEntry.js
│       ├── models/WeightGoal.js
│       ├── models/WorkoutCompletion.js
│       ├── routes/challengeRoutes.js
│       ├── routes/dietRoutes.js
│       ├── routes/foodRoutes.js
│       ├── routes/healthRoutes.js
│       ├── routes/progressRoutes.js
│       ├── routes/proteinRoutes.js
│       ├── routes/rewardRoutes.js
│       ├── routes/weightRoutes.js
│       ├── routes/workoutRoutes.js
│       ├── seed/proteinFoods.js
│       ├── seed/regularFoods.js
│       ├── server.js
│       └── utils/nutrition.js
├── frontend
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── public/myfit.png
│   ├── src
│   │   ├── App.jsx
│   │   ├── components/challenges/ChallengeCard.jsx
│   │   ├── components/common/StatusState.jsx
│   │   ├── components/dashboard/*.jsx
│   │   ├── components/diet/FoodCard.jsx
│   │   ├── components/diet/FoodForm.jsx
│   │   ├── components/diet/MealSelector.jsx
│   │   ├── components/diet/TodaysDiet.jsx
│   │   ├── components/layout/*.jsx
│   │   ├── components/layout/navigation.js
│   │   ├── components/weight/WeightChart.jsx
│   │   ├── components/weight/WeightEntryForm.jsx
│   │   ├── components/weight/WeightGoalCard.jsx
│   │   ├── components/weight/WeightHistoryList.jsx
│   │   ├── components/workout/WorkoutDayPanel.jsx
│   │   ├── components/progress/*.jsx
│   │   ├── components/history/*.jsx
│   │   ├── components/coins/*.jsx
│   │   ├── data/exerciseImages.js
│   │   ├── lib/api.js
│   │   ├── lib/progressStats.js
│   │   ├── main.jsx
│   │   ├── pages/Challenges.jsx
│   │   ├── pages/Coins.jsx
│   │   ├── pages/ComingSoon.jsx
│   │   ├── pages/Dashboard.jsx
│   │   ├── pages/DietFood.jsx
│   │   ├── pages/History.jsx
│   │   ├── pages/Progress.jsx
│   │   ├── pages/ProteinFood.jsx
│   │   ├── pages/Weight.jsx
│   │   ├── pages/Workout.jsx
│   │   └── styles.css
│   ├── tailwind.config.js
│   └── vite.config.js
├── MYFIT_HANDOVER.md
├── myfit.png
└── package.json
```

## Frontend

- Framework: React 18 + Vite.
- Styling: Tailwind CSS, plus shared `.dashboard-card` class in `frontend/src/styles.css`.
- Routing: `react-router-dom` in `frontend/src/App.jsx`.
- API client: `frontend/src/lib/api.js`.
- Layout/nav:
  - `frontend/src/components/layout/AppLayout.jsx`
  - `frontend/src/components/layout/Sidebar.jsx`
  - `frontend/src/components/layout/Header.jsx`
  - `frontend/src/components/layout/navigation.js`
- Implemented pages:
  - `frontend/src/pages/Dashboard.jsx`
  - `frontend/src/pages/DietFood.jsx`
  - `frontend/src/pages/ProteinFood.jsx`
  - `frontend/src/pages/Workout.jsx`
  - `frontend/src/pages/Weight.jsx`
  - `frontend/src/pages/Challenges.jsx`
  - `frontend/src/pages/Progress.jsx`
  - `frontend/src/pages/History.jsx`
  - `frontend/src/pages/Coins.jsx`
- `frontend/src/pages/ComingSoon.jsx` still exists on disk but is no longer imported or routed anywhere — every sidebar item now has a real page. Left in place rather than deleted since removing it wasn't required by any phase.

Current frontend routes:

- `/` and `/dashboard`: Dashboard.
- `/diet`: Diet Food.
- `/protein`: Protein.
- `/workout`: Workout.
- `/weight`: Weight.
- `/challenges`: Challenges.
- `/progress`: Progress.
- `/history`: History.
- `/coins`: Coins.

Frontend commands:

```bash
cd /home/inkyank/myfit/frontend
npm run dev
npm run build
```

## Backend

- Framework: Node.js + Express.
- Database ORM: Mongoose.
- Backend entrypoint: `backend/src/server.js`.
- MongoDB connection: `backend/src/config/db.js`.
- Controllers:
  - `foodController.js`: regular food master CRUD.
  - `proteinController.js`: protein food master CRUD.
  - `dietController.js`: shared daily foodlog operations.
  - `workoutController.js`: workout plan lookup, completion, and progress persistence.
  - `weightController.js`: weight entry logging, history/latest lookup, and target-weight goal persistence.
  - `challengeController.js`: daily/weekly challenge progress computation (read-only queries against `DietEntry`, `DailyStats`, `WorkoutCompletion`) plus completion/reward-claim persistence.
  - `progressController.js`: read-only historical day-series aggregation (`DietEntry`/`DailyStats`/`WorkoutCompletion`) for the Progress page's charts/summaries. No model of its own — purely derived data.
  - `rewardController.js`: re-derives which coin rewards should exist by reading `WorkoutCompletion`/`DailyStats`/`ChallengeProgress` directly, then idempotently persists any newly-earned reward to `CoinTransaction`. No workout/steps/water/challenge logic is duplicated — only their already-computed completed/threshold state is read.
- Routes:
  - `foodRoutes.js`
  - `proteinRoutes.js`
  - `dietRoutes.js`
  - `healthRoutes.js`
  - `workoutRoutes.js`
  - `weightRoutes.js`
  - `challengeRoutes.js`
  - `progressRoutes.js`
  - `rewardRoutes.js`
- Seed files:
  - `seed/regularFoods.js`
  - `seed/proteinFoods.js`
- Nutrition calculation helper: `utils/nutrition.js`.

Backend commands:

```bash
cd /home/inkyank/myfit/backend
npm run dev
npm start
```

Expected backend startup messages:

```text
MongoDB connected
MyFit backend running on port 5000
```

## MongoDB Connection Setup

- MongoDB Atlas is used through Mongoose.
- `backend/src/config/db.js` reads `process.env.MONGODB_URI`.
- `backend/src/server.js` calls `connectDB()`, then seeds regular foods and protein foods if `MONGODB_URI` exists.
- The backend uses `requireMongoConnection` middleware for Mongo-backed API routes. If MongoDB is disconnected, those routes return `503`.
- Do not recreate or replace MongoDB Atlas.
- Do not print or expose the MongoDB connection string.

## Environment Variables

Do not expose actual values.

Backend `.env` variable names:

- `PORT`
- `MONGODB_URI`

Frontend `.env` variable names:

- `VITE_API_URL`

Expected frontend API base:

```text
http://localhost:5000/api
```

## Current API Routes

Root and health:

- `GET /`
- `GET /api/health`

Food master data:

- `GET /api/fooditems`
- `POST /api/fooditems`
- `PUT /api/fooditems/:id`
- `DELETE /api/fooditems/:id`
- Alias: `/api/foods` uses the same routes.

Protein master data:

- `GET /api/proteins`
- `POST /api/proteins`
- `PUT /api/proteins/:id`
- `DELETE /api/proteins/:id`

Daily diet / food logs:

- `GET /api/foodlogs/today`
- `POST /api/foodlogs/today`
- `PATCH /api/foodlogs/today/:id`
- `DELETE /api/foodlogs/today/:id`
- `GET /api/foodlogs/:date`
- `POST /api/foodlogs`
- `PUT /api/foodlogs/:id`
- `DELETE /api/foodlogs/:id`
- Alias: `/api/diet` uses the same routes.

Workout data:

- `GET /api/workouts` — full Monday–Saturday plan plus Sunday rest day.
- `GET /api/workouts/:day` — single day's plan.
- `GET /api/workouts/today?date=` — plan + completion state for a date.
- `GET /api/workouts/completion/:dateKey` — completion/progress record for a date.
- `POST /api/workouts/complete` — marks a date's workout fully completed.
- `PATCH /api/workouts/progress` — saves per-exercise checkbox state and cardio checkbox state for a date without marking the workout completed. Added during Phase 4 persistence fixes.

Weight data:

- `GET /api/weights/history?limit=` — recent weight entries, newest first (default limit 30, capped at 100).
- `GET /api/weights/latest` — most recent weight entry by date (not by most-recently-saved).
- `GET /api/weights/goal` — current target weight, or `targetWeightKg: null` if never set.
- `PUT /api/weights/goal` — sets/updates the single target-weight goal document.
- `GET /api/weights/:dateKey` — weight entry for one specific date, or `entry: null` if none logged.
- `POST /api/weights` — creates or updates (upserts) the weight entry for a date; same date always updates in place rather than duplicating.

Challenges data:

- `GET /api/challenges/today?date=` — the 5 daily challenges for a date, each recomputed live from `DietEntry`/`DailyStats`/`WorkoutCompletion` and persisted to `ChallengeProgress`. Also auto-claims the coin reward the moment a challenge first becomes completed.
- `GET /api/challenges/weekly?date=` — the 4 weekly challenges for the Monday–Sunday week containing the given date, computed the same way across that week's dates. Response includes `weekStartKey` and `weekDates` (all 7 dates).
- There is no separate "claim reward" endpoint — claiming happens automatically and idempotently inside the two GET endpoints above (see the `ChallengeProgress` model notes below), so a dedicated endpoint would have been a duplicate.

Progress data:

- `GET /api/progress/history?range=7d|30d|3m|all` — the only new endpoint added for Phase 7. Returns one entry per calendar day for the requested range (7/30/90/365 days respectively, ending today), each with `{ dateKey, restDay, calories, protein, fiber, steps, waterMl, workoutCompleted, cardioCompleted }`, computed by directly querying `DietEntry` (aggregated per day), `DailyStats`, and `WorkoutCompletion` — the same collections Challenges already reads, no new business logic. This exists because no existing endpoint can return a multi-day series in one call; everything else the Progress page needs (today's diet/steps/workout snapshot, weight history/latest/goal) is served by endpoints that already existed before this phase.

History data (Phase 8):

- No new endpoints were added. The History page is a single-date detail view, and every existing per-date endpoint already covers what it needs: `GET /api/foodlogs/:date` (diet entries + meal grouping + totals), `GET /api/dailystats/:date` (steps/water), `GET /api/workouts/today?date=` (the scheduled workout for that date's weekday plus its completion record — this endpoint already accepted an arbitrary `?date=`, not just literal "today"), and `GET /api/weights/:dateKey` (weight for that date, or `null`). Protein History is derived client-side by filtering the already-fetched diet entries where `foodSnapshot.category === 'Protein'`, with no separate API call.

Rewards data (Phase 9):

- `GET /api/rewards/:date` — syncs then returns that one date's reward transactions plus its total. "Sync" means: check `WorkoutCompletion`/`DailyStats`/`ChallengeProgress` for that date and idempotently create (via upsert) any coin reward that's newly earned but not yet recorded, before reading back and summing whatever exists in `CoinTransaction` for that date. Never removes a transaction, never re-awards one that already exists.
- `GET /api/rewards` — same sync, but across the most recent 365 days (matching Progress's own "All Time" bound), then returns every transaction ever recorded (newest date first) plus `totalCoins` (sum of all of them) and `todayCoins` (sum of just today's). This is what Dashboard and the Coins page call for the running balance — the balance is always computed from real `CoinTransaction` documents, never hard-coded or tracked separately.
- No separate "claim" or "award" endpoint exists — exactly like Challenges' auto-claim pattern, a reward is created as a side effect of reading these two GET endpoints, and the `{dateKey, rewardType, sourceId}` unique index on `CoinTransaction` is what actually prevents duplicates (MongoDB itself is the enforcement point, not application code deciding "have I already given this?").

## MongoDB Models / Collections

### `Food` model

File: `backend/src/models/Food.js`

Collection: Mongoose default pluralized collection, expected `foods`.

Fields:

- `name`: unique string.
- `category`: string.
- `defaultQuantity.amount`: number.
- `defaultQuantity.unit`: string.
- `nutrition.calories`: number.
- `nutrition.protein`: number.
- `nutrition.fiber`: number.
- `notes`: string.
- timestamps: `createdAt`, `updatedAt`.

Used for:

- Diet Food regular foods.
- Protein foods with `category: "Protein"`.

### `DietEntry` model

File: `backend/src/models/DietEntry.js`

Collection: Mongoose default pluralized collection, expected `dietentries`.

Fields:

- `dateKey`: date string such as `2026-08-11`.
- `meal`: enum of `Breakfast`, `Lunch`, `Mid Lunch`, `Evening Snack`, `Dinner`.
- `food`: ObjectId reference to `Food`.
- `foodSnapshot`: stored copy of food name/category/default quantity/nutrition at time of logging.
- `quantity.amount`: number.
- `quantity.unit`: string.
- `nutrition.calories`: calculated number.
- `nutrition.protein`: calculated number.
- `nutrition.fiber`: calculated number.
- timestamps: `createdAt`, `updatedAt`.

Important index:

- Unique compound index on `{ dateKey: 1, meal: 1, food: 1 }`.
- This prevents adding the same food more than once to the same date + meal. Existing controller skips duplicates.

### `WorkoutCompletion` model

File: `backend/src/models/WorkoutCompletion.js`

Collection: Mongoose default pluralized collection, expected `workoutcompletions`.

Fields:

- `dateKey`: unique date string such as `2026-08-19`. One document per calendar date.
- `day`: enum of `Monday`–`Saturday`. Always derived server-side from `dateKey`'s real weekday; never trusted from client input (Phase 4 persistence fix).
- `workoutName`: string, derived from the day's plan.
- `completedExercises`: array of exercise-name strings the user has checked off for that date. Added during Phase 4 persistence fixes.
- `cardioCompleted`: boolean for the cardio checkbox. Added during Phase 4 persistence fixes.
- `completed`: boolean, true only after `POST /api/workouts/complete`. Defaults to `false` so a document can hold in-progress checklist state before the workout is marked complete.
- `completedAt`: date, set only when `completed` becomes `true`.
- timestamps: `createdAt`, `updatedAt`.

### `WeightEntry` model

File: `backend/src/models/WeightEntry.js`

Collection: Mongoose default pluralized collection, expected `weightentries`.

Fields:

- `dateKey`: unique date string such as `2026-08-19`. One document per calendar date; saving again for the same date updates this document instead of creating a duplicate.
- `weightKg`: number, must be greater than 0, rounded to 1 decimal place.
- timestamps: `createdAt`, `updatedAt`.

There is no user field — the app has no authentication, so this is a single global weight log, consistent with `DailyStats` and `WorkoutCompletion`.

### `WeightGoal` model

File: `backend/src/models/WeightGoal.js`

Collection: Mongoose default pluralized collection, expected `weightgoals`. Intended to hold exactly one document (a singleton settings record, not date-keyed). `saveWeightGoal` upserts with an empty filter (`{}`) so re-saving always updates that same document rather than inserting a second one.

Fields:

- `targetWeightKg`: number, must be greater than 0, rounded to 1 decimal place.
- timestamps: `createdAt`, `updatedAt`.

### `ChallengeProgress` model

File: `backend/src/models/ChallengeProgress.js`

Collection: Mongoose default pluralized collection, expected `challengeprogresses`.

Fields:

- `challengeId`: string, one of the static challenge IDs from `backend/src/data/challenges.js` (e.g. `daily-steps`, `weekly-workout`).
- `period`: string — the `dateKey` for a daily challenge, or the Monday `dateKey` of the week for a weekly challenge.
- `progress`: number, the live-computed value the last time it was checked. Frozen (stops updating) once `completed` becomes `true`, so a challenge can't visually "un-complete" itself if the underlying data is later edited down (e.g. steps corrected to a lower number).
- `completed`: boolean. Only ever transitions `false → true`, never back.
- `rewardClaimed`: boolean. Set `true` in the same write that first sets `completed: true` — this is what makes the coin reward a one-time award; refreshing the page just re-reads the same persisted `true` values instead of re-triggering anything.
- `claimedAt`: date, set once at the same moment.
- timestamps: `createdAt`, `updatedAt`.

Unique compound index on `{ challengeId: 1, period: 1 }` — this is what gives per-date (daily) and per-week (weekly) isolation; a date's or week's challenge progress can never leak into another date/week.

Challenge definitions themselves (name, description, category, target, unit, coin reward) are **not** stored in Mongo — they're static config in `backend/src/data/challenges.js`, matching the existing `workoutPlan.js` pattern. Only the per-period computed state is persisted, per the phase requirement to store just "identifier, date/period, progress, completed status, reward claimed status."

### `CoinTransaction` model

File: `backend/src/models/CoinTransaction.js`

Collection: Mongoose default pluralized collection, expected `cointransactions`. This is the central reward ledger for Phase 9 — no such model existed before this phase, so it was created per the phase spec ("use the existing CoinTransaction/reward model if it already exists; if it does not exist, create one").

Fields:

- `dateKey`: date string such as `2026-08-12` — the day the reward was earned for. Named `dateKey` rather than the phase's suggested `date`, to match every other model in this codebase (`Food`, `DietEntry`, `WorkoutCompletion`, `DailyStats`, `WeightEntry`, `ChallengeProgress` all use `dateKey`) — a deliberate deviation from the literal suggested field name in favor of established convention.
- `rewardType`: enum of `workout`, `steps`, `water`, `challenge`. (No `protein` type — the phase's reward rules only define coins for workout/steps/water/challenges, not protein directly; a completed `daily-protein` *challenge* still earns a `challenge`-type reward.)
- `sourceId`: string identifying which specific thing earned the reward — `'workout'`, `'steps'`, `'water'` for those three types, or the challenge ID (e.g. `'daily-steps'`) for challenge-type rewards.
- `description`: human-readable label shown in the UI, e.g. `"Workout Completed"`, `"5K Steps"`, `"4L Water"`, `"Challenge Completed: Reach 5,000 Steps"`.
- `coins`: number, always `10` per the phase's flat reward rule, but stored per-transaction (not hard-coded in the total) so `GET /api/rewards` can sum real documents rather than trusting a computed constant.
- timestamps: `createdAt`, `updatedAt`.

Unique compound index on `{ dateKey: 1, rewardType: 1, sourceId: 1 }` — this is the actual duplicate-prevention mechanism described in the phase's "Security / Data Integrity" section. `rewardController.js` always upserts with `$setOnInsert` against this exact key, so MongoDB rejects/no-ops any repeat attempt to award the same reward for the same date; the backend never has to "decide" whether a reward was already claimed by inspecting frontend state.

There is no user field — same single-user design as every other model in this app.

## Completed So Far

### Phase 1: Diet Food + MongoDB Persistence

Completed:

- Diet Food page at `/diet`.
- Regular food master list loaded from MongoDB.
- Regular food CRUD:
  - Add Food.
  - Edit Food.
  - Delete Food.
- Multi-select food cards with checkboxes.
- Selected count.
- Add selected foods to the shared daily diet.
- Date selector.
- Shared Today’s Diet component.
- Meal grouping.
- Daily totals for calories, protein, and fiber.
- Quantity adjustment and proportional nutrition recalculation.
- MongoDB persistence for master foods and daily foodlog entries.

### Phase 3: Protein Food Module

Completed:

- Protein sidebar item opens `/protein`.
- Protein page title is `🥩 Protein`.
- Protein page shows `My Regular Protein Foods`.
- Protein master data API at `/api/proteins`.
- Protein data stored in the same `Food` collection with `category: "Protein"`.
- Protein CRUD:
  - Add Protein.
  - Edit Protein.
  - Delete Protein.
- Protein foods can be added to the existing Today’s Diet through the existing foodlog API.
- Protein page uses the same date key logic and daily diet model.
- Protein quantity changes use existing foodlog quantity update and proportional nutrition calculation.

Seeded default protein foods:

- Chicken Breast: 100 g, 165 kcal, 31 g protein, 0 g fiber.
- Whole Egg: 1 egg, 70 kcal, 6 g protein, 0 g fiber.
- Egg Whites: 2 egg whites, 34 kcal, 7 g protein, 0 g fiber.
- Nakpro Protein: 1 serving, 0 kcal, 0 g protein, 0 g fiber, editable note to enter label values.
- Mixed Seeds: 10 g, 55 kcal, 2 g protein, 1.5 g fiber.

Existing protein-category foods from Diet Food also appear in `/api/proteins`, including Paneer and Soya Chunks.

### Phase 4: Workout Module

Completed:

- Workout sidebar item opens `/workout`.
- Static Monday–Saturday workout plan with per-day exercises (sets/reps), a 30-minute cardio slot, and an estimated-calorie-burn note; Sunday is a rest day. Plan content unchanged by this phase's fixes.
- Day-tab navigator and date picker on the Workout page.
- Per-exercise and cardio checkboxes.
- "Complete Workout" action that persists a completion record for the date via `/api/workouts/complete`.
- Dashboard "Today's Workout" preview widget using the same panel component, driving the Dashboard's Workout stat card (Completed / Not Completed).

Persistence fixes (2026-08-12):

1. **Checklist persistence.** Exercise and cardio checkboxes were previously local component state only and were lost on refresh. Added `PATCH /api/workouts/progress`, which upserts `completedExercises` and `cardioCompleted` on the `WorkoutCompletion` document for a date without marking the workout as fully completed. The Workout page and Dashboard preview now save on every checkbox toggle and read the checklist back from the persisted completion record.
2. **Per-date isolation.** The workout panel component now re-syncs its checklist state from the loaded completion record whenever the date or day changes, instead of keeping stale checkbox state in memory across date switches.
3. **Day/date integrity.** `day` is now always derived server-side from the actual weekday of `dateKey` in both `/api/workouts/complete` and `/api/workouts/progress` — a client-supplied `day` is no longer trusted. Exercise names in a progress update are filtered against the real scheduled day's exercise list, so checklist data can't be saved under the wrong day.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded after the panel/page/dashboard changes.
- `node --check` passed on the three edited backend files (model, controller, routes).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- `PATCH /api/workouts/progress` verified to persist `completedExercises`/`cardioCompleted` with `completed: false`.
- Verified a mismatched-day exercise name (e.g. a Monday-only exercise sent for a Wednesday date) is filtered out and not saved.
- Verified `POST /api/workouts/complete` ignores a client-supplied `day` that doesn't match the date's real weekday, and preserves previously saved checklist progress when flipping `completed` to `true`.
- Test data was written against a future placeholder date and deleted after verification; no lingering test documents remain.
- Re-verified `GET /api/fooditems`, `GET /api/proteins`, and `GET /api/foodlogs/:date` still return `200` — Diet Food and Protein were not modified or affected.

### Phase 5: Weight Module

Completed:

- Weight sidebar item opens `/weight` (real page, no longer a Coming Soon placeholder).
- Weight page title is `⚖️ Weight Tracker`.
- Log Weight form: date (defaults to today, editable to any other date) and weight in kg; saving upserts the entry for that date via `POST /api/weights` rather than creating a duplicate.
- Switching the selected date reloads that date's own entry from the server and re-syncs the form, so no other date's weight leaks into the input.
- Weight History list: newest first, each row shows date, weight, and the difference from the previous chronological entry; the newest entry is visually highlighted.
- Goal card: shows Current Weight (the true latest entry by date, independent of whatever date is selected in the form above), Target Weight (editable inline, persisted via `PUT /api/weights/goal`), total kg remaining to reach the target, and a progress percentage/bar computed from the earliest logged weight to the target.
- Weight Progress chart: a small hand-rolled responsive inline SVG line chart (no new npm dependency added — none of the existing dependencies included a charting library, so a minimal custom SVG was used instead) plotting weight over time; shows a placeholder message until at least two entries exist.
- Dashboard "Current Weight" stat card now loads the latest saved weight and target weight from MongoDB on mount (independent of the Dashboard's own date picker, since "current weight" is a running value, not scoped to a specific day) instead of showing static `-- kg` placeholders. Because `Dashboard.jsx` fetches on mount, navigating away to `/weight`, saving, and back to `/dashboard` shows the updated value.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded.
- `node --check` passed on all new/edited backend files (`WeightEntry.js`, `WeightGoal.js`, `weightController.js`, `weightRoutes.js`, `server.js`).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- Verified `POST /api/weights` create-then-update-same-date keeps the same document `_id` and updates `weightKg`/`updatedAt` rather than creating a duplicate (unique index on `dateKey`).
- Verified validation: negative weight, zero weight, missing weight, and a malformed date string are all rejected with `400` and a useful message; these are also checked client-side before the request is sent.
- Verified `GET /api/weights/latest` returns the chronologically latest date, not simply the most-recently-written document (tested by updating an older date after a newer one already existed).
- Verified `GET /api/weights/:dateKey` for two different dates returns each date's own value with no cross-date leakage.
- Verified `GET /api/weights/history` sorts newest first.
- Verified `PUT /api/weights/goal` called twice updates the same singleton document (confirmed only one document ever exists in `weightgoals`) and rejects a negative target.
- Simulated a page refresh by writing an entry and then re-fetching it fresh from `GET /api/weights/:dateKey` — data persisted correctly.
- All test data was written against future placeholder dates (`2026-09-01` .. `2026-09-05`) and deleted after verification; confirmed `weightentries`/`weightgoals` were empty again afterward.
- Re-verified `GET /api/fooditems`, `GET /api/proteins`, `GET /api/foodlogs/:date`, `GET /api/workouts`, `GET /api/workouts/today`, and `GET /api/dailystats/:date` all still return `200`, and the `/diet`, `/protein`, `/workout` frontend routes still load — Diet Food, Protein, and Workout were not modified.

### Phase 6: Challenges Module

Completed:

- Challenges sidebar item opens `/challenges` (real page, no longer a Coming Soon placeholder).
- Daily Challenges (5, matching the exact phase spec): Complete Today's Workout, Reach 5,000 Steps, Drink 4L Water, Reach 70g Protein, Stay Within 1,300 kcal. Progress for all 5 is computed by reading the existing `WorkoutCompletion`, `DailyStats`, and `DietEntry` collections directly — no diet/step/water/workout calculation logic was reimplemented, only read and compared against each challenge's target.
- Weekly Challenges (4): Complete Workouts Monday–Saturday (6/6 days), Reach 5K Steps on Multiple Days (3+/7 days), Maintain Protein Target (5+/7 days at 70g+), Maintain Water Target (5+/7 days at 4L+). The week is always the Monday–Sunday week containing the selected/queried date, computed server-side.
- Each challenge card shows name, description, category, progress bar, current/target values, completion percentage, Completed/In Progress status, and coin reward, per the phase spec.
- Completed challenges get a distinct visual state (green border/background card, filled green progress bar, "Completed" badge with a check icon) instead of the default card look.
- Coin rewards are auto-claimed exactly once per challenge per period the moment it's first detected complete (see the `ChallengeProgress` model notes above) — there is no manual "claim" button/endpoint, since the GET endpoints already claim as a side effect and a second endpoint would have duplicated that.
- Dashboard "Today's Challenges" compact card: a single small card with one row per daily challenge (name, thin progress bar, coin badge, checkmark if completed) — intentionally list-style rather than full cards, to stay compact and avoid making the Dashboard taller. Always shows literal "today" (like the existing "Today's Workout" preview), independent of the Dashboard's own date picker.

Design notes / deviations worth knowing about:

- **Calorie challenge threshold.** "Stay Within 1,300 kcal" is a ceiling-style goal, unlike the other 4 (which are "reach at least X" floor-style goals). A naive `calories > 0 && calories <= 1300` check was tested and found to trivially complete after a single small breakfast item — and because completion freezes `progress` (see below), that tiny number would then be locked in as "Completed" for the rest of the day even if the user went on to blow past budget. Fixed to require `calories >= 650` (half the budget) **and** `calories <= 1300`, so completion only triggers once a meaningful portion of the day's eating has happened while still under budget. This app has no end-of-day finalization concept to check against instead, so this threshold is a deliberate approximation, not a load-bearing guarantee.
- **Sticky completion.** Once a challenge's `completed` becomes `true`, its `progress` is frozen and never recomputed downward again for that period, even if the underlying data is later edited to a lower value. This was a deliberate choice so "Completed" badges can never silently look wrong (e.g. showing 3,200/5,000 steps next to a green "Completed" tag) — verified in testing by regressing steps back to 0 after completion and confirming the challenge stayed at its frozen completed value.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded.
- `node --check` passed on all new/edited backend files (`challenges.js`, `ChallengeProgress.js`, `challengeController.js`, `challengeRoutes.js`, `server.js`).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- Verified week-boundary math against real calendar dates (`2026-09-10` → week `2026-09-07`–`2026-09-13`, confirmed Monday/Sunday with an independent date library) rather than trusting it by inspection alone.
- Verified daily-steps/daily-water progress reflects real `DailyStats` values, including partial (under-target) progress.
- Verified daily-workout: completing a workout via the existing `/api/workouts/complete` flips the challenge to completed; a Sunday (rest day) date auto-passes since no workout is scheduled that day.
- Verified daily-protein/daily-calories against real food logged through the existing `/api/foodlogs` API (not synthetic data) — confirmed totals matched, and confirmed/fixed the calorie-threshold issue described above.
- Verified weekly-workout/weekly-protein counts against real data logged within a test week.
- Verified reward-claim idempotency: called `GET /api/challenges/today` twice in a row after a challenge completed — `rewardClaimed`/`completed`/`claimedAt` were identical both times (confirmed via a direct MongoDB read that `claimedAt` was set exactly once).
- Verified sticky-progress: regressed steps back to 0 after the steps challenge had completed at 6,000 — challenge stayed `completed: true` with `progress: 6000`, not reset.
- Verified date isolation: two different dates' `daily-steps` progress are completely independent documents with no leakage, confirmed via the unique `{challengeId, period}` index.
- All test data (future placeholder dates `2026-09-10` .. `2026-09-15` and week-start periods `2026-09-07`, `2026-09-14`) was deleted after verification across `dailystats`, `workoutcompletions`, `dietentries`, and `challengeprogresses`; confirmed empty afterward.
- Re-verified `GET /api/fooditems`, `GET /api/proteins`, `GET /api/foodlogs/:date`, `GET /api/workouts`, `GET /api/workouts/today`, `GET /api/dailystats/:date`, `GET /api/weights/latest`, and `GET /api/weights/goal` all still return `200`, and `/dashboard`, `/diet`, `/protein`, `/workout`, `/weight` frontend routes all still load — Diet Food, Protein, Workout, Weight, and the rest of the Dashboard were not modified.

### Phase 7: Progress Module

Completed:

- Progress sidebar item opens `/progress` (real page, no longer a Coming Soon placeholder).
- Header: "Your Progress", a short motivational subtitle, and a 4-way range selector (7 Days / 30 Days / 3 Months / All Time). Ranges are internally 7/30/90/365 days ending today.
- Daily Nutrition Progress and Activity Progress: always show today's live snapshot (Calories/Protein/Water as progress rings, Steps/Workout/Cardio as cards), independent of the range selector — reused directly from the existing `GET /api/foodlogs/:date`, `GET /api/dailystats/:date`, and `GET /api/workouts/today` endpoints, no new API needed for this section.
- Weight Progress: Starting Weight (oldest entry in the fetched history), Current Weight and Target Weight (existing `/api/weights/latest` and `/api/weights/goal`), Total Weight Lost/Gained, Remaining, and a progress percentage — plus the chart is the **existing** `WeightChart` component from the Weight module, reused as-is (including its own built-in "log at least two entries" empty state). The chart's data is windowed to the selected range; the headline stats (starting/current/target/lost/remaining/%) are always all-time, not windowed, so they read as a stable "journey so far" figure rather than jumping around as you switch range tabs.
- Weekly Summary: a responsive 7-card grid (always the most recent 7 days, sliced from whichever range is currently loaded — no extra fetch needed) showing weight (cross-referenced from the already-fetched weight history by date), calories, protein, water, steps, and workout status per day.
- Long-Term Progress: shown only when a range other than 7 Days is selected. Workout consistency (% of scheduled Mon–Sat days completed, rest days excluded from the denominator), average daily steps, average water, average protein, and calorie-target consistency (% of days with logged calories that stayed at/under 1,300 kcal), all computed from the same range day-series.
- Overall Progress Score: a simple average of whichever of these have real underlying data in the selected range — daily step goal %, daily water goal %, daily protein goal %, calorie budget %, workout completion %, and weight-goal progress % — with the exact list of included metrics spelled out in the UI text underneath the score, and any metric with no underlying data (e.g. no weight goal set) simply excluded from the average rather than counted as 0%.
- Best Stats: Best Step Day, Best Protein Day, Best Water Day, Most Consistent Workout Streak, and Highest Weight-Loss Progress — each computed from the range day-series / weight history and only rendered if a qualifying real value exists (e.g. no weight-loss stat is shown with fewer than 2 weight entries).
- Empty state: if there is no data at all in the selected range (`hasAnyDailyData`) **and** no weight has ever been logged, the lower half of the page shows a single clean "Keep tracking your daily activities to build your progress history." message instead of empty/fake charts. If only weight is missing, just the Weight Progress card shows that message in place of the chart; the rest of the page still renders normally from whatever real data does exist.
- Responsive: progress rings/cards use `grid-cols-*` breakpoints (`sm:`/`lg:`) throughout; the Weekly Summary grid goes 2 → 4 → 7 columns so nothing needs horizontal scrolling on mobile.
- Dashboard was **not** touched for this phase — nothing on it needed to change to "connect" Progress data, since Progress reads the same existing endpoints Dashboard already relies on.

Performance / efficiency notes:

- Exactly one new backend endpoint was added (`GET /api/progress/history`), specifically because the existing per-date endpoints (`/api/foodlogs/:date`, `/api/dailystats/:date`, `/api/workouts/completion/:dateKey`) would otherwise require up to 365 individual calls to build a year-long series — that's the only case existing APIs genuinely couldn't serve.
- The Progress page fetches weight history/latest/goal and today's diet/stats/workout **exactly once** per page load, regardless of how many times the range selector is clicked (none of that data depends on the range).
- Range history is cached client-side per range key (`7d`/`30d`/`3m`/`all`) — switching back to a previously-viewed range re-renders from memory instead of refetching.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded.
- `node --check` passed on all new/edited backend files (`progressController.js`, `progressRoutes.js`, `server.js`).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- Called `GET /api/progress/history` with `range=7d`, `30d`, `3m`, `all`, and an invalid value — confirmed day counts of 7/30/90/365/7 (invalid safely defaults to `7d`) and correct `startDateKey`/`endDateKey` boundaries, independently verified against real calendar weekdays (e.g. confirmed `2026-08-09` was correctly flagged `restDay: true` by checking it actually is a Sunday).
- Verified the endpoint returns real, already-existing MongoDB data (not synthetic) — a real logged day (`2026-08-11`: 864 kcal / 91 g protein / 3,750 steps / workout completed) and today's real data appeared correctly in the series with zero cross-date leakage between days.
- Hand-traced the Overall Score and Best Stats calculations against that same real 7-day payload to confirm the math (step/water/protein/calorie/workout percentages, average, and streak-counting logic) produces the expected numbers — see the Phase 7 design notes above for the worked example.
- Confirmed existing single-weight-entry and single-day edge cases degrade gracefully (0% progress-to-goal when start equals current, weight chart's own <2-entries message, no weight-loss stat shown with only one entry).
- Full regression: `GET /api/fooditems`, `GET /api/proteins`, `GET /api/foodlogs/:date`, `GET /api/workouts/today`, `GET /api/weights/latest`, `GET /api/weights/goal`, and `GET /api/challenges/today` all still return `200`; `/dashboard`, `/diet`, `/protein`, `/workout`, `/weight`, `/challenges`, and `/progress` frontend routes all load — Diet Food, Protein, Workout, Weight, Challenges, and the Dashboard were not modified.
- No test data was created or needed for this phase (the endpoint is read-only and was verified entirely against real, pre-existing MongoDB data), so there was nothing to clean up afterward.
- Browser-based UI interaction (clicking range buttons, watching the empty state render) could not be exercised directly in this session (no browser tool available); confidence here instead comes from a full code review of the range-caching/empty-state logic plus the direct API verification above. This is a known limitation worth a manual click-through pass.

### Phase 8: History Module

Completed:

- History sidebar item opens `/history` (real page, no longer a Coming Soon placeholder).
- Header: "History" with subtitle "Review your daily fitness journey".
- Date navigation: native date picker, Previous/Next day buttons (simple local-date arithmetic, formatted back to a `dateKey` with the existing `getTodayKey` helper), and a "Today" button (disabled when already on today); the selected date is shown in full (e.g. "Wednesday, August 12, 2026") beneath the controls.
- Daily Summary: six `StatCard`s (the same component Dashboard/Progress/other pages already use) — Calories actual/1300, Protein actual/70g, Water actual/4L, Steps actual/5000, Workout Completed/Not Completed, and Weight (`"X kg"` or `"Not recorded"` — the only field that can actually distinguish "no data" from "logged zero", since `/api/weights/:dateKey` returns `entry: null` when nothing was saved).
- Diet History: foods for the selected date grouped by Breakfast/Lunch/Mid Lunch/Evening Snack/Dinner (name, quantity, calories, protein, fiber per item), reusing the exact `meals` grouping the existing diet endpoint already returns — no client-side re-grouping logic needed.
- Protein History: the same date's diet entries filtered client-side to `foodSnapshot.category === 'Protein'` — no extra API call, no duplicated filtering logic elsewhere.
- Workout History: scheduled workout day/name, each exercise with a checkmark if it was in that date's `completedExercises`, cardio completion, overall completed badge, and estimated calories burned when the plan provides one. Shows "Rest Day" for a Sunday and "No workout data for this date" if the date somehow has none.
- Water & Steps: two `ProgressRing`s (the same component built for Phase 7's Progress page, reused as-is) showing actual/target and the completion percentage visually.
- Daily Completion: a compact 5-column row of thin progress bars — Nutrition, Protein, Water, Steps, Workout — giving an at-a-glance view distinct from the raw-number Daily Summary cards above.
- Empty state: if the selected date has zero diet entries, zero steps, zero water, no completed workout, and no recorded weight, the whole lower section is replaced with a single "No activity recorded for this date." message instead of a page full of real-but-empty zeros.
- Read-only by design: unlike `TodaysDiet` (used on the Diet/Protein pages, which supports editing quantities and removing entries), History intentionally has no edit/delete actions — it's a review page, and none of the phase requirements asked for historical entries to be mutable from here.

Design notes:

- **Zero new backend files.** Every data need was already covered by an existing per-date endpoint (see the "History data" entry under Current API Routes above), including `GET /api/workouts/today?date=` which — despite its name — already accepted an arbitrary date via `dateKeyFromRequest`, not just literal "today". No new model, controller, or route was created for this phase.
- **Date isolation inherited, not reinvented.** Every endpoint History reuses was already keyed by `dateKey` with its own uniqueness/isolation guarantees proven in earlier phases (Weight, Workout, DailyStats, Diet). The History page's own `useEffect` is keyed on `[selectedDate]` and fully overwrites all four pieces of state on every date change (no merging), so there's no risk of the kind of stale-child-state leak that was fixed for `WorkoutDayPanel` back in Phase 4.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded.
- `node --check` passed on every backend `.js` file (no backend files were changed this phase, so this simply re-confirms nothing regressed).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- Verified real data end-to-end for today (`2026-08-12`: 5,000 steps, 1,500 ml water, workout completed, 76 kg weight, 0 diet entries) and for a real prior day (`2026-08-11`: 864 kcal / 91 g protein across 6 diet entries spanning Breakfast and Lunch, workout completed with 5 exercises) — including confirming the exact `foodSnapshot.category` values (`Protein` for Chicken Breast/Whole Egg/Egg Whites, non-`Protein` for Chapathi/Oats) so the Protein History filter is verified correct against real data, not assumed.
- Verified empty-state data: a real future date (`2026-12-25`) returns zero/`null` across all four endpoints, confirming the "No activity recorded" path has genuine data to trigger on rather than being untestable.
- Verified refresh persistence: called the same per-date endpoint twice in a row and diffed the raw responses — byte-for-byte identical.
- Verified date isolation by directly comparing the responses for `2026-08-11`, `2026-08-12`, and `2026-12-25` — three genuinely distinct payloads with no cross-date leakage.
- Full regression: `GET /api/fooditems`, `GET /api/proteins`, `GET /api/foodlogs/:date`, `GET /api/workouts/today`, `GET /api/dailystats/:date`, `GET /api/weights/latest`, `GET /api/weights/goal`, `GET /api/challenges/today`, `GET /api/challenges/weekly`, and `GET /api/progress/history` all still return `200`; `/dashboard`, `/diet`, `/protein`, `/workout`, `/weight`, `/challenges`, `/progress`, and `/history` frontend routes all load — Diet Food, Protein, Workout, Weight, Challenges, Progress, and the Dashboard were not modified.
- No test data was created or needed for this phase (fully read-only, verified entirely against real pre-existing MongoDB data plus one untouched real future date), so there was nothing to clean up.
- Browser-based UI interaction (clicking Previous/Next/Today, watching the empty state render) was not exercised in an actual browser this session (none available) — verified instead via full code review of the date-shifting/empty-state logic plus direct API testing against real data, same limitation noted for Phase 7.

### Phase 9: Coins & Rewards Module

Still single-user, no authentication — this phase does not add or require a `userId` anywhere.

Completed:

- Coins sidebar item opens `/coins` (real page, no longer a Coming Soon placeholder — the last one).
- Header: "🪙 Coins" with Total Coins and Today's Coins shown large at the top, computed from real `CoinTransaction` documents (never hard-coded). "Current Reward Streak" was deliberately **not** built — the phase spec says "if already available," and there is no existing streak calculation anywhere in this app (Dashboard's own "Current Streak" card is still static per the Unfinished Work list above); adding one would have meant building a new streak feature, which is out of this phase's scope.
- Today's Rewards: every reward earned today, each as `<icon> <description> +10`, with a "Today's Total" line — matches the phase's example format exactly.
- Reward History: past rewards grouped by date (newest first), each group showing its items and a per-date total, plus a small date-lookup input for jumping to any specific date's rewards on demand (reusing the History module's date-picker pattern, calling `GET /api/rewards/:date` for that one date).
- Reward rules implemented exactly as specified: Workout Completed = +10, Steps ≥ 5,000 = +10, Water ≥ 4 L = +10, each completed **daily** challenge = +10. "Light" is not an actual state anywhere in this codebase — `WorkoutCompletion` only has a boolean `completed` field, no tri-state status — so "Light" and "Not Done" are handled identically: any date where `completed` isn't `true` earns 0 coins, which is exactly the required behavior without needing to invent a new field.
- Weekly challenges are intentionally excluded from coin rewards — their `ChallengeProgress.period` is a week-start date, not the specific day the threshold was actually crossed, so there's no unambiguous single date to attribute a weekly reward to. Only `daily-*` challenge completions earn coins. This is a deliberate scoping decision, not an oversight.
- Dashboard's "Coins" stat card now fetches `GET /api/rewards` on mount and shows the real `totalCoins` instead of a static `0`; no coin math is duplicated in the frontend — it displays exactly what the backend computed.

Architecture — server-side sync-on-read, not a write-time hook:

- Per the phase's own guidance ("if reward creation can be safely handled server-side during existing completion/update APIs, prefer that architecture"), rewards are created as a side effect of reading, following the exact pattern already proven in Phase 6 (Challenges' auto-claim-on-GET). `workoutController.js`, `dailyStatsController.js`, and `challengeController.js` were **not modified at all** — `rewardController.js` independently re-derives "what should have been earned" by querying those three collections directly, then upserts any missing `CoinTransaction`. This keeps the "do not break Workout/Diet/Challenges" requirement airtight: zero lines changed in any of those controllers.
- `GET /api/rewards/:date` syncs just that one date (cheap) — used by "Today's Rewards" and the date-lookup feature.
- `GET /api/rewards` syncs the most recent 365 days before summing everything — this is what guarantees the Dashboard/Total-Coins balance reflects an achievement (workout completed, steps hit 5,000, etc.) the moment it happens, without needing a separate real-time push mechanism. For a personal single-user app this is cheap in practice (a handful of documents to scan and at most a few upsert attempts); the 365-day bound mirrors Progress's own "All Time" cap rather than introducing a new pattern.
- Because the upsert is `$setOnInsert`-only and keyed on `{dateKey, rewardType, sourceId}`, calling either endpoint any number of times can never create a duplicate reward or change the coin amount of an existing one — this is what makes "MongoDB is the source of truth, not frontend state" concretely true rather than just a design intention.

Tests completed (2026-08-12):

- `npm run build` in `frontend` succeeded.
- `node --check` passed on all new/edited backend files (`CoinTransaction.js`, `rewardController.js`, `rewardRoutes.js`, `server.js`).
- Backend started against the live MongoDB Atlas connection (`MongoDB connected`, `MyFit backend running on port 5000`).
- On the very first `GET /api/rewards` call (before any test data was written), the sync correctly derived rewards from **pre-existing real data** from earlier phases — `2026-08-12` (workout completed, 5,000 steps, two daily challenges completed) and `2026-08-11` (workout completed) — for a real total of 50 coins, confirming the total is genuinely computed from real MongoDB history, not fabricated.
- Verified all three workout states on a future placeholder date: no `WorkoutCompletion` doc → 0 coins ("Not Done"); partial exercises checked via `/api/workouts/progress` with `completed` still `false` → 0 coins ("Light"); `POST /api/workouts/complete` → +10 ("Completed").
- Verified steps: 4,000 → 0 coins; 5,000 → +10; 6,000 → still only +10 (no duplicate); then regressed steps back to 0 and confirmed the reward **stayed** (sticky, matching the same philosophy already used for Challenges/`ChallengeProgress`).
- Verified water: 3 L → 0 coins; 4 L → +10; 4.5 L → still only +10 once.
- Verified challenge integration: completing daily-workout and daily-water challenges (via the existing `/api/challenges/today` recompute) correctly produced two additional `challenge`-type rewards, bringing the test date's total to 50 coins across 5 distinct transactions.
- Verified duplicate prevention and refresh persistence: called `GET /api/rewards/:date` twice in a row — transaction count, `_id`s, `coins`, and `totalCoins` were identical both times (only the harmless `updatedAt` bookkeeping timestamp ticked, which is the same pre-existing Mongoose upsert behavior already present in every other sync-on-read endpoint in this app, not a duplication bug).
- Verified reward history persists via a direct MongoDB read of the `cointransactions` collection for the test date.
- All test data (one future placeholder date) was deleted after verification across `cointransactions`, `dailystats`, `workoutcompletions`, and `challengeprogresses`; re-confirmed the real total returned to exactly 50 coins afterward, i.e. real data was untouched throughout.
- Full regression: `GET /api/fooditems`, `GET /api/proteins`, `GET /api/foodlogs/:date`, `GET /api/workouts/today`, `GET /api/dailystats/:date`, `GET /api/weights/latest`, `GET /api/weights/goal`, `GET /api/challenges/today`, and `GET /api/progress/history` all still return `200`; `/dashboard`, `/diet`, `/protein`, `/workout`, `/weight`, `/challenges`, `/progress`, `/history`, and `/coins` frontend routes all load — Diet Food, Protein, Workout, Weight, Challenges, Progress, History, and the rest of the Dashboard were not modified.
- Browser-based UI interaction was not exercised in an actual browser this session (none available) — verified instead via full code review plus direct API testing against real data, same limitation noted for Phases 7 and 8.

### Final QA Pass (2026-08-12)

A full regression QA pass across the entire application — no new features added, nothing redesigned, no authentication introduced.

Modules tested: Dashboard, Diet Food, Protein, Workout, Steps, Water, Weight, Challenges, Progress, History, Coins/Rewards, date isolation, MongoDB persistence, refresh persistence, API error handling, frontend build, backend startup.

**Bug found and fixed — invalid `:id` routes returned a bare `500` instead of a proper `400`.** Any route using Mongoose's `findById`/`findByIdAndDelete` (Diet Food, Protein, and Diet log update/delete — e.g. `PUT /api/foodlogs/invalid-id`, `PUT /api/fooditems/invalid-id`, `DELETE /api/proteins/invalid-id`) threw an uncaught `CastError` when given a malformed ObjectId, which fell through the shared error middleware in `backend/src/server.js` to the generic `res.status(500).json({ message: 'Something went wrong' })` branch — a real information-hiding/wrong-status-code bug, not a redesign. Fixed with one additive branch in that same shared middleware:
```js
if (error.name === 'CastError') {
  return res.status(400).json({ message: 'Invalid ID' })
}
```
This mirrors the existing `error.code === 11000` / `error.name === 'ValidationError'` branches immediately above it. Fixes the bug uniformly for every current and future `:id` route in the app without touching any individual controller (`foodController.js`, `proteinController.js`, `dietController.js` remain untouched). Re-verified all four previously-broken routes now return `400 {"message":"Invalid ID"}`, and re-confirmed the pre-existing `409` (duplicate) and `400` (validation) branches still work correctly (no regression from the change).

**Data-integrity finding — orphaned test residue cleaned up.** A scan of every date-keyed collection turned up 5 leftover `ChallengeProgress` documents dated `2026-09-10` (all `progress: 0`, `completed: false`) — a Phase 6 test-baseline artifact that escaped that phase's own cleanup step. Confirmed via `createdAt` timestamp and the absence of any corresponding `DailyStats`/`WorkoutCompletion` for that date that this was inert test residue, not real data, and deleted it. Also investigated a scan result that appeared to show the real `WeightGoal` document (targetWeightKg 60) missing — this turned out to be a bug in the QA scan script itself (it only checked for `dateKey`/`period` fields, which `WeightGoal` doesn't have), not an actual data-loss bug; a fresh direct query confirmed the real weight goal is intact (count: 1, `targetWeightKg: 60`). All other collections (`DailyStats`, `WorkoutCompletion`, `WeightEntry`, `CoinTransaction`, `DietEntry`, and the remaining `ChallengeProgress` docs) were confirmed to contain only real dates (`2026-08-10` through `2026-08-12`) with no other test leakage.

Tests completed:

- `npm run build` in `frontend` — succeeded, no errors.
- `node --check` on every `.js` file under `backend/src` — all passed.
- Backend startup verified clean from a fully-stopped state: `MongoDB connected` → `MyFit backend running on port 5000`, matching the documented expected messages exactly.
- Full endpoint sweep: every `GET` route across Diet, Protein, Workout, DailyStats, Weight, Challenges, Progress, and Rewards returned `200`.
- Full frontend page sweep: `/`, `/diet`, `/protein`, `/workout`, `/weight`, `/challenges`, `/progress`, `/history`, `/coins` all returned `200`, plus an unknown route confirmed to fall through the SPA catch-all correctly.
- API error handling: malformed date (degrades gracefully to empty/zeroed response, no crash), missing required fields (`400` with a real Mongoose validation message), negative weight/steps (`400`), non-existent food/workout-day lookups (`404`), duplicate food name (`409`), and the invalid-ObjectId case described above (now `400`, previously `500`).
- Full Diet Food CRUD round trip: create → verify → update → verify persisted → delete → verify gone.
- Full Protein CRUD round trip: create → verify appears in `/api/proteins` (auto-`category: "Protein"`) → update → verify → delete → verify gone.
- Date isolation re-confirmed by diffing two real dates' `/api/foodlogs/:date` responses (genuinely different, no leakage).
- Refresh persistence re-confirmed by diffing repeated `GET` calls to `/api/weights/goal` and `/api/fooditems` (byte-identical).
- Coins total re-verified stable at 50 (unchanged) after the test-data cleanup above, confirming the cleanup touched only orphaned data and nothing real.
- All 9 module pages plus Dashboard re-swept one final time after the fix and cleanup — all still `200`.

**MYFIT FINAL QA PASSED.**

## Currently Working

- Backend health endpoint.
- MongoDB Atlas connection.
- Regular food master list API.
- Protein food master list API.
- Daily foodlog API.
- `/diet` route.
- `/protein` route.
- Frontend build.
- Add/edit/delete for regular foods.
- Add/edit/delete for protein foods.
- Add foods/protein foods into the shared daily diet.
- Quantity changes recalculate nutrition proportionally.
- Date-specific diet logs.
- Workout master plan API and per-date completion API.
- Workout checklist progress persistence (`/api/workouts/progress`).
- `/workout` route and Dashboard workout preview.
- Weight entry, history, latest, and goal APIs (`/api/weights/*`).
- `/weight` route and Dashboard Current Weight card.
- Daily and weekly challenge APIs (`/api/challenges/*`), computed from existing Diet/DailyStats/Workout data.
- `/challenges` route and Dashboard Today's Challenges card.
- Progress history API (`/api/progress/history`), computed from existing Diet/DailyStats/Workout data.
- `/progress` route with range-based charts/summaries/best-stats.
- `/history` route: single-date detail view built entirely from existing per-date APIs, with date navigation (previous/next/today/direct pick).
- Coin reward APIs (`/api/rewards`, `/api/rewards/:date`), computed from existing Workout/DailyStats/Challenges data with server-side duplicate prevention.
- `/coins` route and Dashboard Coins card, both showing the real balance from MongoDB.

## Tested Successfully

Commands/endpoints tested during current work:

- `npm run build` in `frontend` succeeded.
- `GET http://localhost:5000/api/health` returned `{"app":"MyFit","status":"ok"}`.
- `GET http://localhost:5000/api/fooditems` returned MongoDB food master data.
- `GET http://localhost:5000/api/proteins` returned MongoDB protein foods.
- `GET http://localhost:5000/api/foodlogs/2026-08-11` returned a daily diet response.
- `GET http://localhost:5000/api/foodlogs/2026-08-12` returned a separate empty daily diet response during testing.
- `HEAD http://localhost:5173/diet` returned 200.
- `HEAD http://localhost:5173/protein` returned 200.

Functional tests performed:

- Diet Food add/edit/delete with temporary food and cleanup.
- Protein add/edit/delete with temporary protein and cleanup.
- Added protein foods to Breakfast, Lunch, and Dinner using `/api/foodlogs`.
- Re-fetched daily log to confirm persistence before cleanup.
- Updated Whole Egg quantity from 1 to 2 and confirmed nutrition recalculated to 140 kcal and 12 g protein.
- Existing Diet Food route and API still worked after Protein module implementation.
- Workout progress persistence, per-date isolation, and day/date integrity fixes (see Phase 4 section above for details).
- Weight entry create/update-in-place, history sort order, per-date isolation, goal singleton behavior, and validation (see Phase 5 section above for details).
- Challenge progress computation against real Diet/DailyStats/Workout data, completion, one-time reward-claim idempotency, sticky-progress-after-completion, and date/week isolation (see Phase 6 section above for details).
- Progress history endpoint across all 4 ranges against real MongoDB data, date-boundary/weekday correctness, and derived score/best-stats math (see Phase 7 section above for details).
- History page's reuse of existing per-date endpoints against real data for multiple distinct dates, refresh persistence, date isolation, and empty-state behavior (see Phase 8 section above for details).
- Coin reward computation against real Workout/DailyStats/Challenges data, all three workout states (Completed/Light/Not Done), steps/water threshold crossing, duplicate prevention, sticky persistence, and Dashboard balance display (see Phase 9 section above for details).

## Current Errors / Risks

- No known runtime errors as of the Final QA pass (2026-08-12) — see that section above for the full sweep. One real bug (invalid `:id` → `500` instead of `400`) was found and fixed during that pass; it is closed, not outstanding.
- There is no automated test suite yet.
- Local dev server ports may already be occupied by running Node/Vite processes — confirmed during the Final QA pass; always verify with `ps aux | grep -E "vite|node --watch"` and kill stale processes before starting fresh ones, otherwise the new backend process silently fails with `EADDRINUSE` while an old one keeps serving stale code.
- Network access to MongoDB Atlas can be blocked by sandbox permissions in Codex; escalation may be needed to run backend verification.
- Meal names were changed to support Protein requirements: `Breakfast`, `Lunch`, `Mid Lunch`, `Evening Snack`, `Dinner`. Confirm future Diet Food expectations before changing this again.
- The unique index on daily logs means the same food cannot be added twice to the same meal on the same date; instead quantity should be edited.

## Current Diet Food Functionality

Page: `/diet`

Implemented behavior:

- Loads all foods from `/api/fooditems`.
- Shows "My Regular Foods".
- Supports Add Food with fields:
  - Food Name
  - Category
  - Default Quantity
  - Quantity Unit
  - Calories
  - Protein
  - Fiber
  - Notes
- Supports edit and delete.
- Supports multi-select with checkboxes.
- Shows selected count.
- Can add selected foods to Today’s Diet.
- Uses the shared date selector.
- Uses shared `TodaysDiet` component for meal grouping, totals, quantity adjustment, and removal.
- Saves master foods and daily entries in MongoDB.

Important Diet files:

- `frontend/src/pages/DietFood.jsx`
- `frontend/src/components/diet/FoodCard.jsx`
- `frontend/src/components/diet/FoodForm.jsx`
- `frontend/src/components/diet/MealSelector.jsx`
- `frontend/src/components/diet/TodaysDiet.jsx`
- `backend/src/controllers/foodController.js`
- `backend/src/controllers/dietController.js`
- `backend/src/routes/foodRoutes.js`
- `backend/src/routes/dietRoutes.js`
- `backend/src/seed/regularFoods.js`

## Current Protein Functionality

Page: `/protein`

Implemented behavior:

- Loads protein foods from `/api/proteins`.
- Shows `🥩 Protein` and "My Regular Protein Foods".
- Protein card shows:
  - Food name
  - Default quantity
  - Calories
  - Protein
  - Fiber
  - Add
  - Edit
  - Delete
- Supports Add Protein form with:
  - Protein Name
  - Default Quantity
  - Quantity Unit
  - Calories
  - Protein
  - Fiber
  - Notes
- Supports edit and delete.
- Add button selects one protein food, then the user chooses:
  - Date
  - Meal: Breakfast, Lunch, Mid Lunch, Evening Snack, Dinner
- Adds selected protein food to existing Today’s Diet via `/api/foodlogs`.
- Uses shared `TodaysDiet` component for daily entries, totals, quantity changes, and removal.

Important Protein files:

- `frontend/src/pages/ProteinFood.jsx`
- `backend/src/controllers/proteinController.js`
- `backend/src/routes/proteinRoutes.js`
- `backend/src/seed/proteinFoods.js`
- `frontend/src/lib/api.js`

## Current Workout Functionality

Page: `/workout`

Implemented behavior:

- Loads the static Monday–Saturday plan from `/api/workouts` (Sunday is a rest day, no exercises).
- Date picker and day-tab navigator to browse any day's exercise list.
- Per-exercise checkboxes and a cardio checkbox; both are persisted per date via `/api/workouts/progress` and reloaded from the server when the date changes.
- "Complete Workout" button that persists a completion record via `/api/workouts/complete`; disabled once completed for that date.
- Estimated calorie burn shown per day (informational only, not persisted).
- Dashboard shows a compact version of the same panel for today's workout and reflects completion status in a stat card.

Important Workout files:

- `frontend/src/pages/Workout.jsx`
- `frontend/src/components/workout/WorkoutDayPanel.jsx`
- `frontend/src/components/dashboard/WorkoutPreview.jsx`
- `frontend/src/data/exerciseImages.js`
- `backend/src/controllers/workoutController.js`
- `backend/src/routes/workoutRoutes.js`
- `backend/src/models/WorkoutCompletion.js`
- `backend/src/data/workoutPlan.js`
- `frontend/src/lib/api.js`

## Current Weight Functionality

Page: `/weight`

Implemented behavior:

- Log Weight form: date (defaults to today, editable) and weight in kg. Saving upserts the entry for that date.
- Changing the date reloads that date's own saved entry (or clears the field if none exists) — never shows another date's value.
- Weight History: newest-first list showing date, weight, and difference from the previous entry, with the latest entry highlighted.
- Goal card: Current Weight (latest logged entry, independent of the form's selected date), Target Weight (inline editable, "Set Target" / "Edit Target"), total kg remaining, and a progress percentage bar computed from the earliest logged weight toward the target.
- Weight Progress chart: inline SVG line chart of all logged weights over time (no charting library dependency added).

Important Weight files:

- `frontend/src/pages/Weight.jsx`
- `frontend/src/components/weight/WeightEntryForm.jsx`
- `frontend/src/components/weight/WeightGoalCard.jsx`
- `frontend/src/components/weight/WeightHistoryList.jsx`
- `frontend/src/components/weight/WeightChart.jsx`
- `backend/src/controllers/weightController.js`
- `backend/src/routes/weightRoutes.js`
- `backend/src/models/WeightEntry.js`
- `backend/src/models/WeightGoal.js`
- `frontend/src/lib/api.js`

## Current Challenges Functionality

Page: `/challenges`

Implemented behavior:

- Date picker (defaults to today). Changing it reloads that date's daily challenges and the weekly challenges for the week containing that date.
- Daily Challenges section: cards for the 5 daily challenges (see Phase 6 above), each with category badge, description, progress bar, current/target + unit, completion percentage, coin reward, and a Completed/In Progress badge.
- Weekly Challenges section: cards for the 4 weekly challenges, with the week's date range shown above them.
- Dashboard "Today's Challenges" card: compact list of the 5 daily challenges for the real current day (name, thin progress bar, coin reward, checkmark once completed), placed directly below the Today's Progress / Today's Workout row.

Important Challenges files:

- `frontend/src/pages/Challenges.jsx`
- `frontend/src/components/challenges/ChallengeCard.jsx`
- `frontend/src/components/dashboard/TodaysChallengesCard.jsx`
- `backend/src/controllers/challengeController.js`
- `backend/src/routes/challengeRoutes.js`
- `backend/src/models/ChallengeProgress.js`
- `backend/src/data/challenges.js`
- `frontend/src/lib/api.js`

## Current Progress Functionality

Page: `/progress`

Implemented behavior:

- Range selector: 7 Days / 30 Days / 3 Months / All Time, anchored on the real server-side "today", cached per range so re-selecting an already-viewed range doesn't refetch.
- Daily Nutrition Progress + Activity Progress: today's live snapshot only (rings for Calories/Protein/Water, cards for Steps/Workout/Cardio), independent of the range selector.
- Weight Progress: Starting/Current/Target/Total Lost or Gained/Remaining/Progress %, plus the existing `WeightChart` component windowed to the selected range.
- Weekly Summary: always the most recent 7 days, a responsive per-day card grid (weight, calories, protein, water, steps, workout status).
- Long-Term Progress: shown for 30 Days/3 Months/All Time only — workout consistency, average steps/water/protein, calorie-target consistency.
- Overall Progress Score: one simple average across whichever tracked metrics have real data in the selected range, with the metrics list spelled out in the UI.
- Best Stats: Best Step/Protein/Water Day, Most Consistent Workout Streak, Highest Weight-Loss Progress — each only shown if real qualifying data exists.
- Empty state: a clean "Keep tracking your daily activities to build your progress history." message in place of fake charts when there's genuinely no data yet (see the Phase 7 section above for the exact per-section vs whole-page empty-state logic).

Important Progress files:

- `frontend/src/pages/Progress.jsx`
- `frontend/src/components/progress/ProgressRangeSelector.jsx`
- `frontend/src/components/progress/ProgressRing.jsx`
- `frontend/src/components/progress/DailyNutritionSection.jsx`
- `frontend/src/components/progress/ActivityProgressSection.jsx`
- `frontend/src/components/progress/WeightProgressSection.jsx`
- `frontend/src/components/progress/WeeklySummarySection.jsx`
- `frontend/src/components/progress/MonthlyProgressSection.jsx`
- `frontend/src/components/progress/OverallScoreSection.jsx`
- `frontend/src/components/progress/BestStatsSection.jsx`
- `frontend/src/lib/progressStats.js` (pure score/best-stats calculations, no React)
- `backend/src/controllers/progressController.js`
- `backend/src/routes/progressRoutes.js`
- `frontend/src/lib/api.js`

Also reused directly (unchanged): `frontend/src/components/weight/WeightChart.jsx`, `frontend/src/components/common/StatusState.jsx` (`EmptyState`/`ErrorState`/`LoadingState`), and the existing `/api/foodlogs/:date`, `/api/dailystats/:date`, `/api/workouts/today`, `/api/weights/history`, `/api/weights/latest`, `/api/weights/goal` endpoints.

## Current History Functionality

Page: `/history`

Implemented behavior:

- Date navigation: date picker, Previous/Next day, and Today button; the full selected date is displayed clearly beneath the controls.
- Daily Summary: six `StatCard`s for Calories/Protein/Water/Steps/Workout/Weight (actual vs. target, or "Not recorded" for weight specifically).
- Diet History: meal-grouped list of that date's logged foods (name, quantity, calories, protein, fiber).
- Protein History: that date's protein-category entries only, filtered client-side from the same already-fetched diet data.
- Workout History: scheduled workout, per-exercise completion, cardio completion, overall status, and estimated burn.
- Water & Steps: two progress rings (actual/target/percentage), reusing the Progress module's `ProgressRing`.
- Daily Completion: compact 5-metric progress-bar row (Nutrition/Protein/Water/Steps/Workout).
- Empty state: "No activity recorded for this date." shown instead of an all-zero page when the date genuinely has nothing logged.
- Entirely read-only — no editing/removing historical entries from this page (that's Diet/Protein/Workout's job on their own pages).

Important History files:

- `frontend/src/pages/History.jsx`
- `frontend/src/components/history/DietHistorySection.jsx`
- `frontend/src/components/history/ProteinHistorySection.jsx`
- `frontend/src/components/history/WorkoutHistorySection.jsx`
- `frontend/src/components/history/WaterStepsHistorySection.jsx`
- `frontend/src/components/history/DailyCompletionSection.jsx`

No backend files and no `frontend/src/lib/api.js` changes were needed for this phase — see the "History data" note under Current API Routes above.

## Current Coins Functionality

Page: `/coins`

Implemented behavior:

- Total Coins (large, top of page) and Today's Coins, both computed from real `CoinTransaction` documents via `GET /api/rewards`.
- Today's Rewards: list of today's earned rewards with icon/description/+10 each, plus a total line.
- View a Specific Date: a date picker that calls `GET /api/rewards/:date` on demand and shows that date's rewards/total.
- Reward History: all past reward dates (excluding today, shown above instead), grouped and totaled per date, newest first.
- Reward rules: Workout Completed = +10; 5,000+ steps = +10; 4 L+ water = +10; each completed daily challenge = +10; each earned at most once per date per reward type, enforced by a unique index in MongoDB (not by frontend state).
- Dashboard's Coins stat card shows this same real total.

Important Coins files:

- `frontend/src/pages/Coins.jsx`
- `frontend/src/components/coins/TodaysRewardsSection.jsx`
- `frontend/src/components/coins/RewardHistorySection.jsx`
- `backend/src/controllers/rewardController.js`
- `backend/src/routes/rewardRoutes.js`
- `backend/src/models/CoinTransaction.js`
- `frontend/src/lib/api.js`

No changes were made to `workoutController.js`, `dailyStatsController.js`, or `challengeController.js` for this phase — rewards are derived independently by reading those modules' existing collections, not by hooking into their write paths.

## Exact Next Phase To Implement

Phases 4 (Workout), 5 (Weight), 6 (Challenges), 7 (Progress), 8 (History), and 9 (Coins & Rewards) are complete, including their respective persistence fixes/tests described above. Every sidebar item now opens a real page — there is no remaining Coming Soon placeholder in the navigation. A full Final QA pass (2026-08-12, see the section above) re-verified all of it together and passed, with one real bug found and fixed (invalid `:id` → `500`, see above) — the app is in a clean, stable state.

Do not assume requirements for any further phase (e.g. Calendar, Streak, a real coin-spending/shop feature, or authentication) — ask for the exact phase prompt before implementing anything new. In particular, no streak calculation exists anywhere yet (Dashboard's "Current Streak" card is still static `0 Days`), and Coins currently has no way to *spend* coins, only earn them.

## Unfinished Work

- No authentication exists, by design.
- No Login/Register exists, by design.
- No automated tests exist.
- Calendar/Streak features are not implemented.
- No dedicated ProteinFood MongoDB model exists; this is intentional. Protein foods reuse `Food` with `category: "Protein"`.
- No workout history/list view across dates and no way to un-complete a completed workout (no PATCH/DELETE on a completed `WorkoutCompletion`).
- No streak calculation tied to workout completions yet; Dashboard's "Current Streak" card is still static.
- Weight has no delete/un-log endpoint for a mistaken entry (only create/update-in-place); correcting an entry means saving the correct value for that same date.
- Weight history and the progress chart cap at the 30 most recent entries by default (`limit` query param, capped at 100 server-side) — no pagination beyond that yet.
- Weight goal progress percentage is undefined (not shown) until at least one entry exists to serve as the starting-weight baseline.
- Challenge coin rewards for **daily** challenges are now credited to the real `CoinTransaction` ledger as of Phase 9 (see the Phase 9 section above) — `ChallengeProgress.rewardClaimed` is still tracked separately per challenge and is not itself the coin balance, but the actual coins do land in `CoinTransaction`/`GET /api/rewards` now. **Weekly** challenge completions still do not earn coins (deliberately, per the Phase 9 design note — a week-start `period` has no unambiguous single day to attribute the reward to).
- Challenges list is fixed/static (5 daily + 4 weekly); there's no admin UI to add/edit/remove challenge definitions — they live in `backend/src/data/challenges.js`.
- The "Stay Within 1,300 kcal" completion threshold (>= 650 kcal logged and <= 1,300 kcal) is a deliberate approximation documented in the Phase 6 section above, not an exact end-of-day evaluation (the app has no such concept for any module).
- Progress's "All Time" range is capped at 365 days server-side (a performance/bounding choice, not a true unbounded "all time"); if the app is ever used continuously beyond a year this cap should be revisited.
- Progress's weight history is capped at the same 100-entry limit as the Weight page (`/api/weights/history` max), so "Starting Weight" reflects the oldest of the most recent 100 entries, not necessarily the very first entry ever logged if there are more than 100.
- Progress page UI interaction (clicking range buttons, verifying live re-render) was not manually exercised in a browser this session (no browser tool available) — verified instead via full code review plus direct API testing against real data. Worth a manual click-through pass.
- History is intentionally read-only (no edit/delete of historical entries from `/history` itself); to correct a past day's data, use the Diet/Protein/Workout/Weight pages directly with their own date pickers.
- History page UI interaction (date navigation buttons, empty-state rendering) was not manually exercised in a browser this session (no browser tool available) — verified instead via full code review plus direct API testing against real data, same limitation as Phase 7.
- Coins has no way to *spend* coins — only earn them. `totalCoins` only ever goes up.
- Weekly challenge completions do not earn coins (only daily challenges do) — see the Phase 9 design note above for why.
- "Current Reward Streak" was not built on the Coins page — there is no existing streak feature anywhere in the app for it to reuse, and the phase spec explicitly said "if already available."
- Coins page UI interaction (date lookup, viewing reward history) was not manually exercised in a browser this session (no browser tool available) — verified instead via full code review plus direct API testing against real data, same limitation as Phases 7 and 8.

## Files That Must Not Be Replaced

Do not replace these existing working files wholesale:

- `backend/.env`
- `frontend/.env`
- `backend/src/config/db.js`
- `backend/src/server.js`
- `backend/src/models/Food.js`
- `backend/src/models/DietEntry.js`
- `backend/src/controllers/foodController.js`
- `backend/src/controllers/dietController.js`
- `backend/src/controllers/proteinController.js`
- `backend/src/routes/foodRoutes.js`
- `backend/src/routes/dietRoutes.js`
- `backend/src/routes/proteinRoutes.js`
- `backend/src/seed/regularFoods.js`
- `backend/src/seed/proteinFoods.js`
- `backend/src/utils/nutrition.js`
- `frontend/src/lib/api.js`
- `frontend/src/App.jsx`
- `frontend/src/pages/DietFood.jsx`
- `frontend/src/pages/ProteinFood.jsx`
- `frontend/src/components/diet/FoodCard.jsx`
- `frontend/src/components/diet/FoodForm.jsx`
- `frontend/src/components/diet/MealSelector.jsx`
- `frontend/src/components/diet/TodaysDiet.jsx`
- `frontend/src/components/layout/navigation.js`
- `backend/src/models/WorkoutCompletion.js`
- `backend/src/controllers/workoutController.js`
- `backend/src/routes/workoutRoutes.js`
- `backend/src/data/workoutPlan.js`
- `frontend/src/pages/Workout.jsx`
- `frontend/src/components/workout/WorkoutDayPanel.jsx`
- `frontend/src/components/dashboard/WorkoutPreview.jsx`
- `frontend/src/data/exerciseImages.js`
- `backend/src/models/WeightEntry.js`
- `backend/src/models/WeightGoal.js`
- `backend/src/controllers/weightController.js`
- `backend/src/routes/weightRoutes.js`
- `frontend/src/pages/Weight.jsx`
- `frontend/src/components/weight/WeightEntryForm.jsx`
- `frontend/src/components/weight/WeightGoalCard.jsx`
- `frontend/src/components/weight/WeightHistoryList.jsx`
- `frontend/src/components/weight/WeightChart.jsx`
- `backend/src/models/ChallengeProgress.js`
- `backend/src/controllers/challengeController.js`
- `backend/src/routes/challengeRoutes.js`
- `backend/src/data/challenges.js`
- `frontend/src/pages/Challenges.jsx`
- `frontend/src/components/challenges/ChallengeCard.jsx`
- `frontend/src/components/dashboard/TodaysChallengesCard.jsx`
- `backend/src/controllers/progressController.js`
- `backend/src/routes/progressRoutes.js`
- `frontend/src/pages/Progress.jsx`
- `frontend/src/components/progress/ProgressRangeSelector.jsx`
- `frontend/src/components/progress/ProgressRing.jsx`
- `frontend/src/components/progress/DailyNutritionSection.jsx`
- `frontend/src/components/progress/ActivityProgressSection.jsx`
- `frontend/src/components/progress/WeightProgressSection.jsx`
- `frontend/src/components/progress/WeeklySummarySection.jsx`
- `frontend/src/components/progress/MonthlyProgressSection.jsx`
- `frontend/src/components/progress/OverallScoreSection.jsx`
- `frontend/src/components/progress/BestStatsSection.jsx`
- `frontend/src/lib/progressStats.js`
- `frontend/src/pages/History.jsx`
- `frontend/src/components/history/DietHistorySection.jsx`
- `frontend/src/components/history/ProteinHistorySection.jsx`
- `frontend/src/components/history/WorkoutHistorySection.jsx`
- `frontend/src/components/history/WaterStepsHistorySection.jsx`
- `frontend/src/components/history/DailyCompletionSection.jsx`
- `backend/src/models/CoinTransaction.js`
- `backend/src/controllers/rewardController.js`
- `backend/src/routes/rewardRoutes.js`
- `frontend/src/pages/Coins.jsx`
- `frontend/src/components/coins/TodaysRewardsSection.jsx`
- `frontend/src/components/coins/RewardHistorySection.jsx`

When adding new phases, extend the existing structure and reuse existing API/client patterns.

## Handover Notes For Next Codex Session

- Start by reading this file, then inspect the relevant phase files.
- Do not expose `.env` values.
- Do not recreate MongoDB.
- Do not add auth unless explicitly requested.
- Do not replace Diet Food, Protein, Workout, Weight, Challenges, Progress, History, or Coins & Rewards functionality.
- Keep daily tracking centralized in `DietEntry` and `/api/foodlogs`.
- Keep workout completion/progress centralized in `WorkoutCompletion` and `/api/workouts`; always derive the workout `day` from the date’s real weekday server-side, never trust a client-supplied `day`.
- Keep weight logs centralized in `WeightEntry`/`/api/weights` (one document per `dateKey`, upserted) and the target goal centralized in the single `WeightGoal` singleton document; do not add a second weight-log or goal model.
- Challenges compute progress by reading `DietEntry`/`DailyStats`/`WorkoutCompletion` directly — do not duplicate their calculation logic elsewhere; if a challenge needs a new data source, query that source's existing model/collection instead of recomputing values another module already stores.
- `ChallengeProgress.completed`/`rewardClaimed` are one-way (`false → true` only) and `progress` freezes once completed — preserve this sticky behavior if you touch `challengeController.js`, it's what makes the one-time coin reward safe against refreshes and downstream data edits.
- Progress is entirely read-only/derived — it has no MongoDB model of its own. Before adding a new Progress API, check whether `GET /api/progress/history` (or an existing per-date endpoint) can already supply the data; only add a new range-aggregation endpoint if a genuinely new data shape is needed, following the same day-series pattern.
- History has zero backend files of its own — it's a pure frontend consumer of existing per-date endpoints. Before adding any new endpoint for a History-adjacent need, double-check whether `/api/foodlogs/:date`, `/api/dailystats/:date`, `/api/workouts/today?date=`, or `/api/weights/:dateKey` already covers it.
- `CoinTransaction` is the single reward ledger — do not add a second coins/rewards model. Its `{dateKey, rewardType, sourceId}` unique index is the actual duplicate-prevention mechanism; any new reward type must keep using upsert-with-`$setOnInsert` against that same key, never a plain `create()` or an application-level "check then insert." If a new reward source is added, extend `syncRewardsForDates` in `rewardController.js` to read that source's existing collection directly — do not hook reward creation into `workoutController.js`/`dailyStatsController.js`/`challengeController.js` themselves, to keep those modules unmodified.
- Prefer new module-specific master APIs only when needed, and reuse shared daily foodlog APIs for anything added to Today’s Diet.
