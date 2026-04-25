# Playground Feature — Bug & Architecture Audit

> Analyzed: 2026-04-25  
> Scope: `client/src/pages/Playgrounds/`, `client/src/features/playground/`, `client/src/components/playground/`, `client/src/lib/`, `server/routes/`, `server/controllers/`, `server/models/`, `server/utils/`

---

## CRITICAL

---

### C-1 · Unauthenticated Remote Code Execution
**File:** `server/routes/codeRoutes.js:9`

The `/api/v1/code/execute` endpoint has **no `authenticate` middleware**. Any anonymous internet request can submit arbitrary JavaScript or Python to be executed as a child process on the server host. There is no session check before `execFile` runs.

```js
// codeRoutes.js — no authenticate call anywhere
router.post("/execute", async (req, res) => { ... });
```

**Fix:** Add `authenticate` as the first middleware on this route. Also add the rate limiter (see C-3).

---

### C-2 · Synchronous File I/O Blocks the Event Loop
**File:** `server/routes/codeRoutes.js:44, 53`

`fs.writeFileSync` and `fs.unlinkSync` are called inside an async request handler. These block the **entire Node.js event loop** for every execution request, stalling all concurrent requests on the server.

```js
fs.writeFileSync(tmpFile, code, "utf8");   // line 44 — blocks event loop
...
fs.unlinkSync(tmpFile);                    // line 53 — also blocking
```

**Fix:** Use `fs.promises.writeFile` / `fs.promises.unlink` (or the callback form with `util.promisify`).

---

### C-3 · No Rate Limiting on Code Execution Endpoint
**File:** `server/routes/codeRoutes.js` (entire file)

The `/execute` endpoint has no rate limiter. Compare with `playgroundRoutes.js` which uses `completeLimiter`. A single client (or bot) can flood the server with code execution requests, spawning unlimited child processes and exhausting system resources.

**Fix:** Apply an `express-rate-limit` limiter keyed by user ID (after `authenticate`) on this route, with a conservative max (e.g., 10 req/min).

---

### C-4 · `postMessage` Uses `"*"` as Target Origin
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:109`  
**File:** `client/src/lib/buildReactDoc.js:22`

The iframe dispatches test results back to the parent using `"*"` as the `targetOrigin`:

```js
window.parent.postMessage({ type: "TEST_RESULT", ... }, "*");
```

This leaks test results and the `IFRAME_READY` signal to **any origin** that can embed the page. The inbound listener in `LanguagePlayground.jsx` does check `e.origin`, but the outbound direction is wide open.

**Fix:** Replace `"*"` with `window.location.origin` (passed into the iframe via the HTML template as a `const`).

---

### C-5 · Admin Curriculum Mutation Routes Have No Role Check
**File:** `server/routes/curriculumRoutes.js:17–19`

`addProblem`, `updateProblem`, and `deleteProblem` are behind `authenticate` only. Any logged-in student can add, modify, or delete curriculum problems for all users. The code itself has a TODO comment acknowledging this.

```js
router.post("/:language/chapter/:chapterId/problem", authenticate, addProblem);
router.put("/:language/problem/:problemId", authenticate, updateProblem);
router.delete("/:language/problem/:problemId", authenticate, deleteProblem);
```

**Fix:** Implement and apply a `requireAdmin` middleware that checks `req.user.role === "admin"` (or equivalent field).

---

## HIGH

---

### H-1 · Race Condition: Double XP on Auto-Enroll
**File:** `server/controllers/playgroundController.js:118–148`

The `findOneAndUpdate` at line 118 prevents double-XP atomically for *existing* users. But when the document is not found (line 128), the code falls into an auto-enroll branch using `PlaygroundProgress.create(...)` with no duplicate guard. Two concurrent first-completion requests will both reach `create(...)` simultaneously; one succeeds, the other throws a duplicate-key error that the outer `catch` returns as a 500 — silently losing the XP credit.

**Fix:** Replace the manual auto-enroll branch with an `upsert: true` option on the `findOneAndUpdate` call, or wrap the `create` in a `try/catch` that handles `code: 11000` and re-queries.

---

### H-2 · Module-Level Cache Persists Across User Sessions
**File:** `client/src/features/playground/playgroundApi.js:3–15`

The `CACHE` Map is declared at module scope and **never cleared on logout**. If User A logs in and populates the cache, then logs out and User B logs in within the same browser tab, User B sees User A's progress data for up to 5 minutes. The cache also has no size limit and accumulates indefinitely.

**Fix:** Export a `clearCache()` function and call it from the `authLogout` action in `authSlice.js`. Add a max-size eviction policy (e.g., keep only the last 20 entries).

---

### H-3 · Wrong Language Hardcoded in `completeProblem` Call
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:275`

Inside the `message` event handler (which handles React/HTML/CSS iframe test results), the language argument is hardcoded to `"react"` instead of using the `language` variable from the outer scope:

```js
// Line 275 — always sends "react" regardless of actual language
const response = await completeProb("react", prob.id, prob.xp);
```

This means completing an HTML or CSS problem incorrectly records progress under the React language track.

**Fix:** Replace `"react"` with the `language` variable (or `languageRef.current` if a ref is needed to avoid stale closure).

---

### H-4 · No Abort Controller in `initData` Effect
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:142–204`

The `useEffect` at line 142 fires two sequential async fetches (`getCurriculum` + `getLanguageProgress`) with no cleanup function. If the user navigates away mid-flight, both promises continue and call `setData`, `setCompletedProblems`, etc. on an unmounted component. The dependency array also omits `dsaLang`, which is read inside the async body — making the starter code stale if `dsaLang` changes between mount and resolution.

**Fix:** Create an `AbortController`, pass its `signal` into the fetch calls, and return a cleanup function that calls `controller.abort()`. Add `dsaLang` to the dependency array.

---

### H-5 · No Abort Controller in `fetchData` Effect (PlaygroundTopics)
**File:** `client/src/pages/Playgrounds/PlaygroundTopics.jsx:115–140`

Same pattern as H-4. Two async fetches with no cleanup, setting state on an unmounted component when the user navigates away during load.

**Fix:** Same approach — `AbortController` + cleanup.

---

### H-6 · Silent Failure — No Error State Displayed to Users
**File:** `client/src/pages/Playgrounds/Page.jsx:53–54`  
**File:** `client/src/pages/Playgrounds/PlaygroundTopics.jsx:133–134`

Both `catch` blocks only `console.error`. `isLoading` is cleared but there is no `error` state. Users see an empty page or incorrect data with no explanation when API calls fail.

**Fix:** Add an `error` state variable to each component. Set it in the `catch` block and render an appropriate error message.

---

## MEDIUM

---

### M-1 · Hardcoded `localhost` URLs
**File:** `client/src/lib/piston.js:25`  
**File:** `client/src/features/auth/authApi.js:5`

Both files hardcode `http://localhost:8080`. These will fail in any staging, production, or Docker environment.

```js
// piston.js
const response = await fetch("http://localhost:8080/api/v1/code/execute", ...);

// authApi.js
baseURL: "http://localhost:8080/api/v1",
```

**Fix:** Use `import.meta.env.VITE_API_URL` for both. Add `VITE_API_URL=http://localhost:8080` to `.env.development` and a production value to `.env.production`.

---

### M-2 · N+1 Curriculum Lookup on Every `completeProblem` Call
**File:** `server/controllers/playgroundController.js:93–114`

Every problem completion triggers a full `Curriculum.findOne({ language })` fetch, loading all chapters, all problems, and all starter code blobs just to look up a single XP value. Curriculum content is essentially static and should not be re-fetched per request.

**Fix:** Cache the `{ language → problemId → xp }` map in a module-level `Map` populated at server startup (or on first access with a long TTL). A single `Curriculum.find({})` on startup is sufficient.

---

### M-3 · `addProblem` Accepts Unvalidated Problem Data
**File:** `server/controllers/curriculumController.js:54–77`

Only `difficulty` is validated. The rest of `req.body` is pushed directly onto `chapter.problems` without checking for required fields (`id`, `title`, `xp`, `description`, `starterCode`) or duplicate `id` values. A malformed or duplicate problem breaks curriculum loading for all users in that language track.

**Fix:** Validate the full shape of the incoming problem object (e.g., with Joi or Zod) and check for duplicate `id` before pushing.

---

### M-4 · Duplicate `buildReactDoc` Definition
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:96–112`  
**File:** `client/src/lib/buildReactDoc.js`

The function is defined twice — once inline in `LanguagePlayground.jsx` and once in `lib/buildReactDoc.js`. The lib file is **never imported** in `LanguagePlayground.jsx`; the inline version is always used. Fixes to the lib file have no effect. The two copies will silently diverge.

**Fix:** Delete the inline definition and import from `lib/buildReactDoc.js`.

---

### M-5 · Dead Component Files — All Logic Is Inlined
**Files:** `EditorPanel.jsx`, `PreviewPanel.jsx`, `PlaygroundNavbar.jsx`, `PlaygroundSidebar.jsx`, `MobileBottomNav.jsx`, `WelcomeBanner.jsx`

None of these components are imported in `LanguagePlayground.jsx`. All editor, sidebar, navbar, preview, and mobile nav logic is inlined in `LanguagePlayground.jsx` (1,472 lines). The extracted component files are dead code and create maintenance confusion — two diverging implementations.

**Fix:** Either delete the dead files and keep the inline code, or refactor `LanguagePlayground.jsx` to import and use the components. The inlined version is the live one.

---

### M-6 · Wrong Guard Order Causes False "Language Not Found" Error
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:515–575`

The `!data` guard at line 515 fires a "Language Not Found" error screen. But `data` can be briefly `null` even when `isLoadingProgress` is still `true` (the correct loading state). The current guard order means a transient null `data` during a still-loading state renders a permanent error instead of the spinner.

**Fix:** Check `isLoadingProgress || !data` before the `!data` guard, or restructure so the spinner check comes first and returns early before the error check runs.

---

### M-7 · Rate Limiter Keyed by IP, Not User ID
**File:** `server/routes/playgroundRoutes.js:14–18`

`completeLimiter` uses IP-based windowing. Behind corporate NAT or shared WiFi, all users share one IP and can rate-limit each other. The limiter runs before `authenticate`, so `req.user` is not yet available for user-keyed limiting.

**Fix:** Move the rate limiter to after `authenticate` in the middleware chain and use `keyGenerator: (req) => req.user._id.toString()`.

---

### M-8 · Stale Dead Argument Passed to `completeProblem`
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:390, 443`

The call sites pass `currentProblem.xp` as a third argument to `completeProb`. The server now determines XP internally and ignores this value. The function signature still accepts the argument but never uses it, leaving misleading dead code.

**Fix:** Remove the third argument from all call sites and remove the parameter from the function signature in `playgroundApi.js`.

---

### M-9 · Invalid Tailwind Class Strings
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:785, 833, 839, 868, 1238`

Several `className` strings contain broken Tailwind values:

- `"bg-red-500/20/40"` — double opacity modifier, not a valid class (lines 833, 868)
- `"text[#2cf07d]"` — missing the `-` separator; should be `"text-[#2cf07d]"` (lines 785, 839, 1238)
- `"hover:bg-red-500/20/60"` — invalid (line 868)

These styles are silently dropped by Tailwind and the intended colors never appear.

**Fix:** Correct each class string to valid Tailwind syntax.

---

## LOW

---

### L-1 · Uncleaned `setTimeout` in InteractiveProblem
**File:** `client/src/pages/Playgrounds/components/InteractiveProblem.jsx:131–133`

```js
setShake(true);
setTimeout(() => setShake(false), 600);
```

The timeout ID is not stored or cleared. If the component unmounts within 600 ms, `setShake(false)` fires on an unmounted component (React warning in strict mode).

**Fix:** `const id = setTimeout(...); return () => clearTimeout(id);` — or store the ref and clear on unmount.

---

### L-2 · IDOR: `getUserDiscussions` Accepts Any User ID
**File:** `server/controllers/discussionController.js:27–39`

`GET /discussions/user/:userId` accepts any `ObjectId` in the URL. An authenticated user can pass another user's ID and read all their discussion posts. There is no check that `req.params.userId === req.user._id.toString()`.

**Fix:** Replace `req.params.userId` with `req.user._id` in the query, removing the URL param entirely (or add the equality check).

---

### L-3 · Missing DB Index on `completedProblems` Array
**File:** `server/models/PlaygroundProgress.js`

The `completedProblems` array is queried with `$ne` and `.includes()`. The compound index `{ userId, language }` cannot efficiently filter within subdocument arrays at scale.

**Fix:** Consider a separate `completedCount` field or a sparse index on `completedProblems.id` to support fast membership checks.

---

### L-4 · Redundant `isMobile` Sync Effect
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:462–464`

The initial value of `isSidebarOpen` is already `!isMobile` (line 125). The effect duplicates this logic for the "mobile becomes true" case without adding value.

**Fix:** Remove the effect. If responsive closing is needed on breakpoint change, handle it in the `isMobile` hook itself.

---

### L-5 · `currentProblemRef` Sync Is a Stale-Closure Workaround
**File:** `client/src/pages/Playgrounds/LanguagePlayground.jsx:224–226`

```js
useEffect(() => {
  currentProblemRef.current = currentProblem;
}, [currentProblem]);
```

This exists only to expose `currentProblem` inside the `message` event handler without triggering re-registration. It is a valid workaround but the secondary effect adds indirection.

**Fix:** Assign `currentProblemRef.current = currentProblem` synchronously at the point `setCurrentProblem` is called (not in a separate effect).

---

### L-6 · Dead UI: Maximize Button Has No Handler
**File:** `client/src/pages/Playgrounds/components/PreviewPanel.jsx:36–38`

```jsx
<button className="text-zinc-600 hover:text-zinc-400">
  <Maximize2 className="w-3 h-3" />
</button>
```

No `onClick` is attached. The button is visible but non-functional.

**Fix:** Implement the handler or remove the button.

---

### L-7 · `window.confirm` Blocks the Main Thread
**File:** `client/src/components/playground/DiscussionCard.jsx:55`

```js
if (!window.confirm("Delete this discussion?")) return;
```

`window.confirm` is a synchronous, blocking browser dialog. It is unavailable in some embedded or test environments.

**Fix:** Replace with an inline confirmation UI (e.g., a small modal or an inline "Are you sure?" toggle).

---

### L-8 · Discussion `language` Field Not Validated Against Known Enum
**File:** `server/controllers/discussionController.js:43–68`

`language` is accepted as any free-form string. The Mongoose schema has no enum restriction. A user could post with `language: "xss_payload"` or other arbitrary strings.

**Fix:** Add `enum: ["html", "css", "javascript", "python", "react", "dsa"]` to the Discussion schema's `language` field, and validate `req.body.language` against it in the controller.

---

### L-9 · Streak Logic Uses Server Local Time Instead of UTC
**File:** `server/utils/streak.js:6–8`

```js
const startOfDay = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
```

`new Date(year, month, day)` uses the **server's local timezone**. Streaks can incorrectly break (or not break) depending on where the server is deployed relative to the user's timezone.

**Fix:** Use `Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())`.

---

### L-10 · `getAllCurriculumsMetadata` Has a No-Op Mongoose Projection
**File:** `server/controllers/curriculumController.js:5`

```js
Curriculum.find({}, 'language chapters.title chapters.problems._id');
```

Projecting nested array fields like `chapters.title` does not work as expected in Mongoose subdocument arrays — Mongoose returns all chapter fields. The projection is effectively a no-op, leaking full chapter data to the client including all problem content.

**Fix:** Either project correctly with `{ language: 1, "chapters.title": 1 }` (which does work for simple fields in embedded docs) or load the full document and map on the application layer before sending the response.

---

### L-11 · No Global 401 Interceptor on Axios Instance
**File:** `client/src/features/auth/authApi.js`

When any playground API call returns 401 (expired token), the component-level `catch` block silently logs and the user sees stale or empty data with no redirect to login.

**Fix:** Add an Axios response interceptor that dispatches `authLogout` and redirects to `/login` on 401 responses.

---

### L-12 · `DiscussionPanel` Has No Error State
**File:** `client/src/components/playground/DiscussionPanel.jsx:23–32`

The `catch` block only calls `console.error` and clears the loading state. Users see an empty discussion list with no error message.

**Fix:** Add an `error` state and render a user-facing message on failure.

---

### L-13 · Page.jsx Hardcodes Six Languages
**File:** `client/src/pages/Playgrounds/Page.jsx:98–163`

The six `SkillCard` instances are hardcoded in JSX. Adding a new language track requires editing this component manually. The languages and their metadata are already fetched from `getCurriculumsMetadata()` in the same component.

**Fix:** Map over the metadata response to render `SkillCard` dynamically.

---

## Summary

| # | Severity | Category | File | Key Lines |
|---|---|---|---|---|
| C-1 | Critical | Security — Unauth RCE | `codeRoutes.js` | 9 |
| C-2 | Critical | Performance — Blocking I/O | `codeRoutes.js` | 44, 53 |
| C-3 | Critical | Security — No Rate Limit on RCE | `codeRoutes.js` | whole file |
| C-4 | Critical | Security — postMessage `"*"` | `LanguagePlayground.jsx`, `buildReactDoc.js` | 109, 22 |
| C-5 | Critical | Security — Missing RBAC | `curriculumRoutes.js` | 17–19 |
| H-1 | High | Race Condition — Double XP | `playgroundController.js` | 128–148 |
| H-2 | High | Memory Leak — Auth Cache | `playgroundApi.js` | 3–15 |
| H-3 | High | Logic Bug — Wrong Language | `LanguagePlayground.jsx` | 275 |
| H-4 | High | Memory Leak — No Abort | `LanguagePlayground.jsx` | 142–204 |
| H-5 | High | Memory Leak — No Abort | `PlaygroundTopics.jsx` | 115–140 |
| H-6 | High | Missing Error State | `Page.jsx`, `PlaygroundTopics.jsx` | 53, 133 |
| M-1 | Medium | Config — Hardcoded localhost | `piston.js`, `authApi.js` | 25, 5 |
| M-2 | Medium | Performance — N+1 DB Fetch | `playgroundController.js` | 93–114 |
| M-3 | Medium | Security — Unvalidated Input | `curriculumController.js` | 54–77 |
| M-4 | Medium | Architecture — Duplicate Code | `LanguagePlayground.jsx`, `buildReactDoc.js` | 96–112 |
| M-5 | Medium | Architecture — Dead Components | `EditorPanel.jsx` et al. | whole files |
| M-6 | Medium | Logic Bug — Wrong Guard Order | `LanguagePlayground.jsx` | 515–575 |
| M-7 | Medium | Security — IP Rate Limit | `playgroundRoutes.js` | 14–18 |
| M-8 | Medium | Dead Code — Stale Argument | `LanguagePlayground.jsx` | 390, 443 |
| M-9 | Medium | Bug — Invalid Tailwind Classes | `LanguagePlayground.jsx` | 785, 833, 839, 868 |
| L-1 | Low | Memory Leak — setTimeout | `InteractiveProblem.jsx` | 131–133 |
| L-2 | Low | Security — IDOR | `discussionController.js` | 27–39 |
| L-3 | Low | Performance — Missing Index | `PlaygroundProgress.js` | — |
| L-4 | Low | Redundant Effect | `LanguagePlayground.jsx` | 462–464 |
| L-5 | Low | Code Smell — Ref Sync Effect | `LanguagePlayground.jsx` | 224–226 |
| L-6 | Low | Dead UI — No onClick | `PreviewPanel.jsx` | 36–38 |
| L-7 | Low | UX — Blocking confirm | `DiscussionCard.jsx` | 55 |
| L-8 | Low | Security — Unvalidated Enum | `discussionController.js` | 43–68 |
| L-9 | Low | Bug — Timezone in Streak | `streak.js` | 6–8 |
| L-10 | Low | Bug — No-Op Projection | `curriculumController.js` | 5 |
| L-11 | Low | Architecture — No 401 Interceptor | `authApi.js` | whole file |
| L-12 | Low | Missing Error State | `DiscussionPanel.jsx` | 23–32 |
| L-13 | Low | Architecture — Hardcoded List | `Page.jsx` | 98–163 |

**Totals: 5 Critical · 6 High · 9 Medium · 13 Low**
