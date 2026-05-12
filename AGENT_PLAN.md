# eduQuest — Admin Course System: Agent Implementation Plan

## How to Use This File
This file is your complete brief. Read every section before writing a single line of code.
Ask the user for clarification only when explicitly noted with **[ASK USER]**.
Implement steps in the exact order listed. Do not skip ahead or batch steps.

---

## 1. Project Overview

**eduQuest** is a gamified coding education platform. It has two main learning systems:

### A. Playground
- 6 languages: `javascript`, `html`, `css`, `python`, `react`, `dsa`
- Structured curriculum stored in MongoDB (`Curriculum` model)
- Users solve problems chapter by chapter, earn XP
- Admin already manages this via `/admin/curriculum` (fully built, do not touch)

### B. Courses (the Workspace / "Learn" section)
- Currently: any logged-in user can generate an AI course on any topic
- **Goal of this task**: Move course creation exclusively to admin. Students browse and enroll in admin-published courses. Courses are aligned to the 6 playground languages so students can go from theory to practice.

---

## 2. Repository Structure (Critical — Follow Exactly)

```
server/
  config/         — aiProvider.js (Gemini + Groq clients, callAiModel, callAiModelChat)
  controllers/    — one file per feature domain
  middleware/     — authMiddleware.js has: authenticate, requireAdmin
  models/         — Mongoose models
  routes/         — one file per feature domain, mounted in index.js
  utils/          — ApiError, ApiResponse, asyncHandler

client/src/
  features/       — API call files, one folder per domain
    auth/         — authApi.js (the shared axios instance — USE THIS EVERYWHERE)
    playground/   — playgroundApi.js (pattern to follow for new courseApi.js)
    workspace/    — CREATE THIS FOLDER: courseApi.js goes here
  pages/
    Admin/        — AdminCurriculum.jsx (exists, do not modify)
                  — AdminCourses.jsx (CREATE THIS)
    Workspace/    — CourseView.jsx, EditCourse.jsx, components/ (mostly untouched)
  components/
    auth/         — AdminRoute.jsx (exists, works, do not modify)
  App.jsx         — Add new admin route here only
```

---

## 3. The Axios Instance (Critical)

File: `client/src/features/auth/authApi.js`
```js
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});
api.interceptors.response.use((res) => res.data);
```

**What this means for every API call:**
- Use relative paths: `/ai/generate-course`, not full URLs
- `await api.post(...)` returns `response.data` directly (the ApiResponse body)
- So `res.success`, `res.data`, `res.message` are directly on the result
- This pattern is already used everywhere — follow it exactly

---

## 4. Backend Patterns (Follow Exactly)

### Controller pattern
```js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const myHandler = asyncHandler(async (req, res) => {
  // req.user is the full User document (set by authenticate middleware)
  // req.user.email, req.user._id, req.user.role are available
  if (!something) throw new ApiError(400, "Message");
  return res.status(200).json(new ApiResponse(200, { data }, "Message"));
});
```

### ApiResponse shape (always)
```json
{ "statusCode": 200, "success": true, "message": "...", "data": { ... } }
```

### Route protection pattern
```js
router.post("/route", authenticate, requireAdmin, handler);  // admin only
router.get("/route", authenticate, handler);                  // any logged-in user
router.get("/route", handler);                                // public
```

### requireAdmin middleware (already exists in authMiddleware.js)
```js
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};
```

---

## 5. What NOT to Touch

These files work correctly. Do not modify them unless a step explicitly says to:

- `server/config/aiProvider.js` — AI client is fine
- `server/controllers/curriculumController.js` — playground curriculum, untouched
- `server/routes/curriculumRoutes.js` — untouched
- `server/models/user.model.js` — role field already exists (`"user"` | `"admin"`)
- `server/middleware/authMiddleware.js` — already has `authenticate` and `requireAdmin`
- `client/src/pages/Admin/AdminCurriculum.jsx` — untouched
- `client/src/components/auth/AdminRoute.jsx` — untouched
- `client/src/features/playground/playgroundApi.js` — untouched
- All of `client/src/pages/Workspace/components/CourseLearning.jsx` — untouched (student learning UI)
- All of `client/src/pages/Workspace/components/CourseMentor.jsx` — untouched
- All of `client/src/pages/Workspace/components/FlashcardViewer.jsx` — untouched
- All of `client/src/pages/Workspace/components/MermaidDiagram.jsx` — untouched
- All of `client/src/pages/Workspace/components/SlideshowPlayer.jsx` — untouched
- `client/src/pages/Workspace/CourseView.jsx` — untouched (student learning view)
- `server/controllers/playgroundController.js` — untouched

---

## 6. Current State of courseController.js & aiRoutes.js

### What currently exists (all working):
- `geminiCourseGenerator` — generates course outline with AI
- `getCourseById` — get one course by courseId
- `generateChapterContent` — on-demand chapter content generation (HTML + YouTube + diagrams)
- `getAllCourses` — currently returns courses by userEmail from query
- `enrollToCourse` — enroll user in a course
- `getEnrollmentStatus` — check if enrolled
- `markChapterCompleted` — mark chapter done, award XP
- `getUserEnrollments` — get all enrolled courses for a user
- `generateFlashcards` — flashcards for a chapter
- `courseMentorChat` — AI chat scoped to a chapter

### What needs to change:
- `geminiCourseGenerator` → admin only, auto-populate creator info from req.user
- `getAllCourses` → two modes: admin sees their own courses, student sees published only
- Add: `publishCourse`, `deleteCourse`, `updateCourseChapter`

---

## 7. Revised Approach — Pre-Seeded Courses + Admin Management

**Instead of having the admin manually generate courses one by one at runtime, the plan is:**

1. A **one-time seed script** (`server/scripts/seedCourses.js`) runs once and populates MongoDB with 6 fully-generated courses (one per playground language). Each course has complete chapter content (HTML explanations, diagrams, etc.) pre-generated using the same AI that the app already uses. Courses are marked `isPublished: true` so students can access them immediately.

2. The **admin panel** (`/admin/courses`) lets the admin manage these courses: edit chapters, toggle publish/unpublish, delete, and create additional courses via AI if needed.

**Why a seed script?**
- Chapter content generation calls the AI for each chapter (8–10 chapters × per course × 6 languages = ~60 AI calls). Running this once via a script is more reliable than clicking through the UI.
- Courses are ready for students on day one — no "content not yet generated" gaps.
- Admin can still create more courses via the UI form whenever needed.

**How to run the seed script:**
```bash
node server/scripts/seedCourses.js
```
The script reads `MONGO_URI` and AI keys from the existing `.env` file. Run it once. If run again, it skips languages that already have a course.

---

## 8. Implementation Steps

---

### STEP 1 — Update the Course Model

**File:** `server/models/AiCourse.js`

Add two new fields to the schema:
- `isPublished`: `{ type: Boolean, default: false }` — admin toggles this to make a course visible to students
- `language`: `{ type: String, enum: ["javascript", "html", "css", "python", "react", "dsa", "general"], default: "general" }` — links this course to a playground language

No other changes to the model. The existing fields (`courseId`, `name`, `description`, `noOfChapters`, `level`, `category`, `courseOutput`, `userEmail`, `userName`, `userProfileImage`) all stay.

---

### STEP 2 — Update courseController.js

**File:** `server/controllers/courseController.js`

#### 2a. `geminiCourseGenerator` — no logic changes, just body changes
- Remove `userEmail`, `userName`, `userProfileImage` from destructured `req.body` — these come from `req.user` now only
- Add `language` to destructured `req.body` (the new field)
- Change `resolvedUserEmail` to just `req.user.email` (remove the `|| userEmail` fallback — admin is always authenticated)
- Change `resolvedUserName` to just `req.user.name`
- Change `resolvedUserProfileImage` to just `req.user.avatarUrl`
- Add `language: language || "general"` to the `Course.create(...)` call
- Keep everything else exactly the same (prompt, AI call, response shape)

#### 2b. `getAllCourses` — split by role
Replace the current implementation with:
```js
export const getAllCourses = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";

  const query = isAdmin
    ? { userEmail: req.user.email }          // admin sees their own courses (draft + published)
    : { isPublished: true };                  // students see only published courses

  const courses = await Course.find(query).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, { courses }));
});
```

#### 2c. Add `publishCourse` (new export)
```js
export const publishCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findOne({ courseId });
  if (!course) throw new ApiError(404, "Course not found");

  course.isPublished = !course.isPublished;
  await course.save();

  return res.status(200).json(
    new ApiResponse(200, { course }, course.isPublished ? "Course published" : "Course unpublished")
  );
});
```

#### 2d. Add `deleteCourse` (new export)
```js
export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findOneAndDelete({ courseId });
  if (!course) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, null, "Course deleted"));
});
```

#### 2e. Add `updateCourseChapter` (new export)
This lets admin manually edit/overwrite a chapter's generated content.
```js
export const updateCourseChapter = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { index, chapterData } = req.body;

  if (index === undefined || !chapterData) {
    throw new ApiError(400, "index and chapterData are required");
  }

  await Course.findOneAndUpdate(
    { courseId },
    { $set: { [`courseOutput.chapters.${index}`]: chapterData } }
  );

  return res.status(200).json(new ApiResponse(200, null, "Chapter updated"));
});
```

---

### STEP 3 — Update aiRoutes.js

**File:** `server/routes/aiRoutes.js`

Import the new controller functions and add `requireAdmin` to admin-only routes.

Changes:
1. Import `publishCourse`, `deleteCourse`, `updateCourseChapter` from courseController
2. Import `requireAdmin` from authMiddleware
3. Add `requireAdmin` to `generate-course` route
4. Add new admin routes
5. Keep all existing student routes exactly as they are

The updated route list:
```js
// Admin-only routes
router.post("/generate-course", authenticate, requireAdmin, geminiCourseGenerator);
router.patch("/course/:courseId/publish", authenticate, requireAdmin, publishCourse);
router.delete("/course/:courseId", authenticate, requireAdmin, deleteCourse);
router.put("/course/:courseId/chapter", authenticate, requireAdmin, updateCourseChapter);

// Shared routes (admin + students)
router.get("/get-course/:courseId", authenticate, getCourseById);
router.post("/generate-chapter-content", authenticate, generateChapterContent);
router.get("/courses", authenticate, getAllCourses);    // role-aware inside controller
router.get("/course/:courseId", authenticate, getCourseById);

// Student routes
router.post("/enroll-course", authenticate, enrollToCourse);
router.get("/enrollment-status", authenticate, getEnrollmentStatus);
router.post("/mark-chapter-completed", authenticate, markChapterCompleted);
router.get("/user-enrollments", authenticate, getUserEnrollments);
router.post("/generate-flashcards", authenticate, generateFlashcards);
router.post("/course-mentor-chat", authenticate, courseMentorChat);

// RAG routes (keep as-is)
router.post("/rag/chat", authenticate, chatWithDocument);
router.post("/rag/explain", authenticate, explainText);
router.post("/rag/quiz/generate", authenticate, generateQuiz);
```

Note: Remove the duplicate `router.post("/update-user-xp", ...)` line if it exists — that belongs in user routes, not ai routes.

---

### STEP 4 — Create Course Seed Script

**Create new file:** `server/scripts/seedCourses.js`

This script creates all 6 playground-aligned courses with fully generated chapter content and inserts them into MongoDB. Run once.

**Pattern to follow:** Import `callAiModel` from `../config/aiProvider.js` exactly as the controller does. Use the same prompt format as `generateChapterContent` in `courseController.js`. Import `Course` from `../models/AiCourse.js`.

**Script structure:**
```js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// load .env from server root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { Course } from "../models/AiCourse.js";
import { callAiModel } from "../config/aiProvider.js";

const ADMIN_EMAIL = "eduquest010@gmail.com";
const ADMIN_NAME = "EduQuest Admin";
```

**Course definitions to seed** (agent must define all 6 with full chapter lists):

```
javascript — "JavaScript Fundamentals" — 10 chapters:
  1. Variables & Data Types         topics: [Variables, var/let/const, Primitive Types, Type Coercion, typeof]
  2. Operators & Expressions        topics: [Arithmetic, Comparison, Logical, Ternary, Nullish Coalescing]
  3. Control Flow                   topics: [if/else, switch, Truthy & Falsy, Short-circuit]
  4. Functions & Scope              topics: [Function Declarations, Arrow Functions, Closures, Default Params]
  5. Arrays                         topics: [Array Methods, map/filter/reduce, Spread, Destructuring]
  6. Objects                        topics: [Object Literals, Property Access, Destructuring, Spread]
  7. Loops                          topics: [for, while, for...of, for...in, forEach]
  8. DOM Manipulation               topics: [Selecting Elements, Modifying DOM, Creating Elements]
  9. Events                         topics: [Event Listeners, Event Object, Event Delegation]
  10. Async JavaScript              topics: [Callbacks, Promises, async/await, Fetch API]

html — "HTML Essentials" — 8 chapters:
  1. Document Structure             topics: [DOCTYPE, head/body, Meta Tags, HTML Comments]
  2. Text & Headings                topics: [Headings, Paragraphs, Text Formatting, Quotations]
  3. Links & Images                 topics: [Anchor Tags, Image Tags, Paths, Attributes]
  4. Lists & Tables                 topics: [Ordered/Unordered Lists, Nested Lists, Table Structure]
  5. Forms & Input                  topics: [Form Element, Input Types, Labels, Validation Attributes]
  6. Semantic HTML                  topics: [header/nav/main/footer, article/section, aside, Why Semantics]
  7. Media Elements                 topics: [HTML Video, HTML Audio, iframes, Responsive Media]
  8. Accessibility                  topics: [Alt Text, ARIA Roles, Tab Index, Accessible Forms]

css — "CSS Mastery" — 8 chapters:
  1. Selectors & Specificity        topics: [Element/Class/ID, Pseudo-classes, Pseudo-elements, Specificity]
  2. Box Model                      topics: [Content/Padding/Border/Margin, box-sizing, Overflow, display]
  3. Flexbox                        topics: [flex container, flex-direction, justify-content, align-items, flex-wrap]
  4. CSS Grid                       topics: [grid-template-columns, grid-template-rows, grid-gap, grid-area]
  5. Typography & Fonts             topics: [font-family, font-size/units, line-height, Google Fonts]
  6. Colors & Gradients             topics: [hex/rgb/hsl, opacity, linear-gradient, CSS Variables]
  7. Transitions & Animations       topics: [transition, transform, @keyframes, Timing Functions]
  8. Responsive Design              topics: [Media Queries, Mobile-first, Viewport Units, Breakpoints]

python — "Python Programming" — 10 chapters:
  1. Variables & Data Types         topics: [Variables, int/float/str/bool, Type Conversion, None]
  2. Operators                      topics: [Arithmetic, Comparison, Logical, Augmented Assignment]
  3. Control Flow                   topics: [if/elif/else, Nested Conditions, Ternary Expression]
  4. Functions                      topics: [Defining Functions, Parameters, Return Values, Lambda]
  5. Lists & Tuples                 topics: [List Methods, Slicing, Tuples, List Comprehensions]
  6. Dictionaries                   topics: [Creating Dicts, Accessing Values, Dict Methods, Dict Comprehensions]
  7. Loops                          topics: [for Loop, while Loop, range(), enumerate & zip]
  8. String Methods                 topics: [Indexing/Slicing, Common Methods, f-Strings, Formatting]
  9. File I/O                       topics: [Opening Files, Reading, Writing, Context Managers]
  10. Error Handling                topics: [try/except, Specific Exceptions, finally, Raising Exceptions]

react — "React Development" — 10 chapters:
  1. JSX Basics                     topics: [What is JSX, JSX Expressions, Rendering Elements, JSX vs HTML]
  2. Components & Props             topics: [Functional Components, Props, Prop Types, Default Props]
  3. State & useState               topics: [useState Hook, State Updates, State vs Props, Multiple State]
  4. Event Handling                 topics: [onClick, onChange, onSubmit, Synthetic Events]
  5. Conditional Rendering          topics: [Ternary in JSX, && Operator, Rendering null]
  6. Lists & Keys                   topics: [Array.map() in JSX, The key Prop, Dynamic Lists]
  7. useEffect                      topics: [Side Effects, Dependency Array, Cleanup Functions]
  8. Forms                          topics: [Controlled Components, Form Submission, Validation]
  9. Component Composition          topics: [Children Prop, Reusable Components, Component Hierarchy]
  10. Context API                   topics: [Prop Drilling, createContext, useContext, Provider]

dsa — "Data Structures & Algorithms" — 10 chapters:
  1. Big O Notation                 topics: [Time Complexity, Space Complexity, Common Complexities]
  2. Arrays & Searching             topics: [Array Operations, Linear Search, Binary Search, Two Pointers]
  3. Sorting Algorithms             topics: [Bubble Sort, Selection Sort, Merge Sort, Quick Sort]
  4. Linked Lists                   topics: [Node Structure, Singly Linked List, Doubly Linked List, Operations]
  5. Stacks & Queues                topics: [Stack (LIFO), Queue (FIFO), Implementation, Applications]
  6. Recursion                      topics: [Base Case, Call Stack, Recursive Patterns, Memoization Intro]
  7. Trees                          topics: [Tree Terminology, Binary Trees, Traversal (BFS/DFS), BST]
  8. Graphs                         topics: [Graph Representations, BFS, DFS, Directed vs Undirected]
  9. Hash Tables                    topics: [Hashing, Hash Functions, Collision Handling, Applications]
  10. Dynamic Programming           topics: [Overlapping Subproblems, Memoization, Tabulation, Classic Problems]
```

**Chapter content generation** — use the exact same prompt as `generateChapterContent` in courseController.js (copy it into the script verbatim). Also copy the `fetchVideoId` function. The result is stored directly in the `courseOutput.chapters[i]` field.

**Course outline fields** — each course's `courseOutput` should look like:
```js
{
  name: "JavaScript Fundamentals",
  description: "...",
  category: "...",
  level: "Beginner",
  noOfChapters: 10,
  chapters: [ /* filled in by the AI content generation loop */ ],
  achievements: [
    { title: "First Step", icon: "flag", description: "Complete your first chapter" },
    { title: "Halfway There", icon: "bolt", description: "Complete half the course" },
    { title: "Course Complete", icon: "emoji_events", description: "Finish all chapters" }
  ]
}
```

**Duplicate prevention** — before inserting, check if a course with that `language` and `userEmail` already exists:
```js
const existing = await Course.findOne({ language: courseDef.language, userEmail: ADMIN_EMAIL });
if (existing) {
  console.log(`Skipping ${courseDef.language} — already seeded`);
  continue;
}
```

**Important:**
- Set `isPublished: true` on all seeded courses
- Set `language` to the language key (e.g. `"javascript"`)
- The script must import `.env` before importing models (env vars must load first)
- Add `"type": "module"` is already in server's package.json (ES modules) — use `import` not `require`
- YouTube API calls may fail or return null — that's fine, `videoId` is optional per topic
- Add a `console.log` before each chapter generation so progress is visible

---

### STEP 5 — Create Frontend API File

**Create new file:** `client/src/features/workspace/courseApi.js`

Follow the exact pattern of `client/src/features/playground/playgroundApi.js`.
Use `import api from "../auth/authApi.js"` — never import axios directly.

```js
import api from "../auth/authApi.js";

// ── Student API ───────────────────────────────────────────

export const getPublishedCourses = async () => {
  const res = await api.get("/ai/courses");
  return res.data.courses;
};

export const enrollInCourse = async (courseId) => {
  const res = await api.post("/ai/enroll-course", { courseId });
  return res.data.enrollment;
};

export const getEnrollmentStatus = async (courseId) => {
  const res = await api.get(`/ai/enrollment-status?courseId=${courseId}`);
  return res.data.enrollment;
};

export const getUserEnrollments = async () => {
  const res = await api.get("/ai/user-enrollments");
  return res.data.enrolledCourses;
};

export const generateChapterContent = async (courseId, chapter, index) => {
  const res = await api.post("/ai/generate-chapter-content", { courseId, chapter, index });
  return res.data;
};

export const markChapterCompleted = async (enrollmentId, chapterName) => {
  const res = await api.post("/ai/mark-chapter-completed", { enrollmentId, chapterName });
  return res.data.enrollment;
};

export const generateFlashcards = async (courseId, chapterIndex) => {
  const res = await api.post("/ai/generate-flashcards", { courseId, chapterIndex });
  return res.data.flashcards;
};

export const courseMentorChat = async (courseId, chapterIndex, message, history) => {
  const res = await api.post("/ai/course-mentor-chat", { courseId, chapterIndex, message, history });
  return res.data.reply;
};

// ── Admin API ─────────────────────────────────────────────

export const getAdminCourses = async () => {
  const res = await api.get("/ai/courses");
  return res.data.courses;
};

export const generateCourse = async (formData) => {
  const res = await api.post("/ai/generate-course", formData);
  return res.data;
};

export const publishCourse = async (courseId) => {
  const res = await api.patch(`/ai/course/${courseId}/publish`);
  return res.data.course;
};

export const deleteCourse = async (courseId) => {
  await api.delete(`/ai/course/${courseId}`);
};

export const getCourseById = async (courseId) => {
  const res = await api.get(`/ai/get-course/${courseId}`);
  return res.data.course;
};

export const updateCourseChapter = async (courseId, index, chapterData) => {
  await api.put(`/ai/course/${courseId}/chapter`, { index, chapterData });
};
```

---

### STEP 6 — Create AdminCourses.jsx

**Create new file:** `client/src/pages/Admin/AdminCourses.jsx`

This page has two sections:

**Section 1: Course List (primary — shown first)**
The pre-seeded courses will already be here. Show all admin courses in a grid. For each course:
- Course name + language badge (color-coded per language)
- Level badge + chapter count
- Published status badge: "Published" (green) or "Draft" (gray)
- Three action buttons:
  - "View / Edit" (icon: Pencil) — navigates to `/workspace/edit-course/{courseId}`
  - "Publish / Unpublish" (icon: Eye / EyeOff) — calls `publishCourse(courseId)`, toggles state in-place
  - "Delete" (icon: Trash2) — confirmation dialog, then calls `deleteCourse(courseId)`, removes from list

**Section 2: Generate New Course (collapsible panel or "Add Course" button)**
A form for creating additional courses beyond the seeded ones:
- Course Name (text input)
- Description (textarea)
- Language (select: javascript | html | css | python | react | dsa | general)
- Difficulty Level (select: Beginner | Intermediate | Advanced)
- Category (text input, e.g. "Web Development")
- Number of Chapters (number input, 1–12)
- "Generate with AI" button

On submit: calls `generateCourse()` from courseApi.js, then refreshes the course list. Show loading state. Show `toast.success` / `toast.error`.

**Styling:** Match `AdminCurriculum.jsx` dark theme:
- Background: `bg-[#0a0a0a]`
- Cards: `bg-[#111] border border-white/10 rounded-2xl`
- Accent: indigo (`indigo-500/600`)

**State:** Local `useState` only. No Redux.

**Imports:**
- `{ generateCourse, getAdminCourses, publishCourse, deleteCourse }` from `"@/features/workspace/courseApi"`
- `{ toast }` from `"sonner"`
- Lucide icons as needed
- `{ useNavigate }` from `"react-router-dom"`

---

### STEP 7 — Update Workspace Student View

The student workspace should now show published courses, not user-generated ones.

#### 7a. Update `CourseList.jsx`

**File:** `client/src/pages/Workspace/components/CourseList.jsx`

Changes:
1. Remove `AddCourseDialog` import and usage entirely
2. Change the API call to use `getPublishedCourses` from `courseApi.js` instead of the inline `api.get` call
3. Remove the `user` dependency from `useEffect` (published courses don't filter by user)
4. Update the empty state message: "No courses available yet. Check back soon!" — no create button for students

The rest stays the same (CourseCard rendering, grid layout).

#### 7b. Update `EnrollCourseList.jsx`

**File:** `client/src/pages/Workspace/components/EnrollCourseList.jsx`

Change the API call to use `getUserEnrollments` from `courseApi.js`:
```js
import { getUserEnrollments } from "@/features/workspace/courseApi";
// ...
const enrolledCourses = await getUserEnrollments();
setEnrolledCourses(enrolledCourses);
```
Remove the `userEmail` prop dependency — the function uses req.user on the backend now.
Update the component to not require `userEmail` prop.
Update all callers of `EnrollCourseList` to not pass `userEmail`.

#### 7c. Update `CourseCard.jsx`

**File:** `client/src/pages/Workspace/components/CourseCard.jsx`

Change the enrollment call to use `enrollInCourse` from `courseApi.js`:
```js
import { enrollInCourse } from "@/features/workspace/courseApi";
// ...
const response = await enrollInCourse(course?.courseId);
if (response) navigate(`/course/${course?.courseId}`);
```
Remove `useSelector` for user if it's only used for `user.email` (no longer needed).

#### 7d. Update `ProgressCard.jsx`

**File:** `client/src/pages/Workspace/components/ProgressCard.jsx`

Same as CourseCard — use `enrollInCourse` from courseApi, remove user email dependency.

---

### STEP 8 — Update App.jsx Router

**File:** `client/src/App.jsx`

1. Add lazy import for AdminCourses:
```js
const AdminCourses = lazy(() => import("./pages/Admin/AdminCourses"));
```

2. Add route inside the admin section (after the existing `admin/curriculum` route):
```js
{
  path: "admin/courses",
  element: (
    <AdminRoute>
      <Lazy element={AdminCourses} />
    </AdminRoute>
  ),
},
```

No other changes to App.jsx.

---

### STEP 9 — Add Playground Link to CourseLearning

**File:** `client/src/pages/Workspace/components/CourseLearning.jsx`

This is a minimal, surgical change. Add a "Practice on Playground" button in the chapter header area, visible only when `course.language` exists and is not `"general"`.

**Where to add it:** In the article header section, next to the existing "Play Chapter" button (around line 408–415 in the original file).

```jsx
{course?.language && course.language !== "general" && (
  <button
    onClick={() => navigate(`/playground/${course.language}`)}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all shrink-0 mt-2"
  >
    <Terminal className="w-4 h-4" />
    Practice
  </button>
)}
```

Import `Terminal` from lucide-react (it's already used in the file or nearby).
Import `useNavigate` from `react-router-dom` if not already imported (check first).

That's all. Do not change anything else in CourseLearning.jsx.

---

### STEP 10 — Add AdminCourses Link to Admin Navigation

**[ASK USER]**: Does a navigation menu or sidebar exist for the admin panel? If yes, where is it? If no admin nav exists, simply note in your response that the admin can reach `/admin/courses` and `/admin/curriculum` by URL directly.

If AdminCurriculum.jsx has any navigation links at the top or a sidebar, add a link to `/admin/courses` there. If not, skip this step.

---

## 9. Data Flow Summary After Changes

```
Admin creates course
  POST /api/v1/ai/generate-course  [authenticate + requireAdmin]
  → Course saved with isPublished: false (draft)

Admin publishes course
  PATCH /api/v1/ai/course/:courseId/publish  [authenticate + requireAdmin]
  → isPublished toggled to true

Student sees courses
  GET /api/v1/ai/courses  [authenticate]
  → Controller checks req.user.role
  → student: { isPublished: true }
  → admin: { userEmail: req.user.email }

Student enrolls
  POST /api/v1/ai/enroll-course  [authenticate]
  → uses req.user.email (no email in body)

Student learns
  All existing: generateChapterContent, markChapterCompleted,
  generateFlashcards, courseMentorChat — unchanged

Playground link
  course.language === "javascript" → button links to /playground/javascript
```

---

## 10. Files Changed Summary

| File | Action |
|------|--------|
| `server/models/AiCourse.js` | Modify — add `isPublished`, `language` fields |
| `server/controllers/courseController.js` | Modify — update 3 functions, add 3 new exports |
| `server/routes/aiRoutes.js` | Modify — add requireAdmin, add 3 new routes |
| `server/scripts/seedCourses.js` | **Create new** — one-time seed script for all 6 courses |
| `client/src/features/workspace/courseApi.js` | **Create new** |
| `client/src/pages/Admin/AdminCourses.jsx` | **Create new** |
| `client/src/pages/Workspace/components/CourseList.jsx` | Modify — remove AddCourseDialog, use courseApi |
| `client/src/pages/Workspace/components/EnrollCourseList.jsx` | Modify — use courseApi, remove userEmail prop |
| `client/src/pages/Workspace/components/CourseCard.jsx` | Modify — use courseApi enrollInCourse |
| `client/src/pages/Workspace/components/ProgressCard.jsx` | Modify — use courseApi enrollInCourse |
| `client/src/pages/Workspace/components/CourseLearning.jsx` | Modify — add playground link button only |
| `client/src/App.jsx` | Modify — add AdminCourses route |

**Files that are NOT touched:**
- `server/middleware/authMiddleware.js`
- `server/models/user.model.js`
- `server/config/aiProvider.js`
- `server/controllers/curriculumController.js`
- `server/routes/curriculumRoutes.js`
- `client/src/pages/Admin/AdminCurriculum.jsx`
- `client/src/pages/Workspace/CourseView.jsx`
- `client/src/pages/Workspace/EditCourse.jsx`
- `client/src/pages/Workspace/components/CourseLearning.jsx` (except Step 8)
- `client/src/pages/Workspace/components/CourseMentor.jsx`
- `client/src/pages/Workspace/components/FlashcardViewer.jsx`
- `client/src/pages/Workspace/components/MermaidDiagram.jsx`
- `client/src/pages/Workspace/components/SlideshowPlayer.jsx`
- `client/src/pages/Workspace/components/CourseInfo.jsx`
- `client/src/pages/Workspace/components/ChapterTopicList.jsx`
- `client/src/pages/Workspace/components/CourseOverview.jsx`
- `client/src/components/auth/AdminRoute.jsx`

---

## 11. Coding Rules for This Task

1. **Never use full URLs** — always relative paths with the axios instance (e.g. `/ai/courses`)
2. **Never import axios directly** — always `import api from "@/features/auth/authApi"`  
   OR import named functions from `"@/features/workspace/courseApi"`
3. **Always use asyncHandler** in backend controllers — never try/catch in controllers
4. **Always throw ApiError** for error cases — never `res.status(400).json({...})` manually
5. **Always return ApiResponse** — never `res.json({ success: true, ... })` manually
6. **No inline styles** — only Tailwind classes
7. **Toast notifications** — use `{ toast }` from `"sonner"` in frontend
8. **No Redux for this feature** — local useState only in new components
9. **Read the file before editing** — never assume file contents
10. **One feature per file** — do not put course admin logic in the curriculum admin file

---

## 12. RBAC Status — Critical

**Role-based access control has never been fully implemented in this project.** The pieces exist but have NOT been wired to routes yet:

- `requireAdmin` middleware exists in `authMiddleware.js` ✅
- `role` field exists on the User model ✅  
- `AdminRoute` component exists on the frontend ✅
- `/admin/curriculum` route already uses `AdminRoute` on the frontend ✅
- **MISSING:** `requireAdmin` is NOT imported or used in `aiRoutes.js` at all yet

**What the agent must do:**
1. Import `requireAdmin` from `"../middleware/authMiddleware.js"` in `aiRoutes.js`
2. Add it to the `generate-course` route and the 3 new admin routes (publish/delete/update)
3. Leave all student routes (`enroll-course`, `user-enrollments`, etc.) with only `authenticate`
4. Do NOT add `requireAdmin` to routes students need — only admin routes

**How to set admin role for testing:** The developer will manually set `role: "admin"` on their user document in MongoDB Atlas. The agent does NOT need to create any admin-setup UI.

**Frontend `AdminRoute` guard** (already in `client/src/components/auth/AdminRoute.jsx`):
- It wraps admin pages and redirects non-admins away
- Use it in App.jsx the same way `/admin/curriculum` already uses it (see existing route in App.jsx)

---

## 13. Theory → Practice Flow (Core Design Intent)

This is the most important design concept in this task. Read carefully.

**The goal:** A student should be able to learn a concept in a Course (theory), then immediately practice it in the Playground (hands-on coding). The course and playground should cover the same topics.

**Example flow:**
1. Student opens the JavaScript course
2. Reads Chapter 1: "Variables & Data Types" — learns what variables are, how to declare them, etc.
3. Clicks "Practice on Playground" button → goes to `/playground/javascript`
4. In the playground, they solve problems about variables and data types

**How this is implemented:**
- `course.language = "javascript"` links the course to the javascript playground
- The "Practice on Playground" button in CourseLearning.jsx links to `/playground/javascript`
- The courses the admin generates should teach theory for the same chapter topics that exist in the playground

**What this means for the AdminCourses UI:**
- The `language` dropdown is the most important field — it determines which playground the course links to
- When admin selects `language: "javascript"`, the AI-generated course should cover JavaScript concepts
- The admin form should make this clear with helpful placeholder text

**What this does NOT mean:**
- No need to sync course chapters 1-for-1 with playground chapters
- No need to query the playground curriculum at runtime
- Just a navigation link from course to the playground section

---

## 14. Playground Curriculum Reference (For AI Course Generation)

When admin generates a course via the UI, the AI prompt in `geminiCourseGenerator` should eventually be enhanced to guide the AI toward relevant topics. For now, the agent does NOT need to modify the AI prompt — just ensure `language` is saved to the course model.

For reference, here are the topics each playground language covers (so courses the admin creates will naturally align):

### JavaScript
Chapters: Variables & Data Types, Operators & Expressions, Control Flow, Functions, Arrays, Objects, Loops, DOM Basics, Events, Async JavaScript (Callbacks/Promises/Async-Await)

### HTML
Chapters: HTML Structure, Text Elements, Links & Images, Lists & Tables, Forms, Semantic Elements, Media Elements, Accessibility Basics

### CSS
Chapters: Selectors & Specificity, Box Model, Flexbox, Grid, Typography, Colors & Gradients, Transitions & Animations, Responsive Design

### Python
Chapters: Variables & Data Types, Operators, Control Flow, Functions, Lists, Dictionaries, Loops, String Methods, File I/O, Error Handling

### React
Chapters: JSX Basics, Components & Props, State & useState, Event Handling, Conditional Rendering, Lists & Keys, useEffect, Forms, Component Composition, Context API

### DSA (Data Structures & Algorithms)
Chapters: Arrays & Searching, Sorting Algorithms, Linked Lists, Stacks & Queues, Trees & BST, Graphs, Dynamic Programming, Recursion, Hash Tables, Big O Notation

**Important:**
- Do NOT copy these chapter names exactly — the AI generates richer course content at runtime
- These are reference topics only — so the admin knows what language covers what concepts
- Do NOT modify the playground curriculum (the `Curriculum` collection in MongoDB) — these are already live

---

## 15. Context the Agent Does NOT Need

- The exact MongoDB documents for playground curriculum — summarized in Section 13 above
- Any information about competitions, documents, quests, community — unrelated features, do not touch
- Video upload functionality — out of scope for this task
- Any changes to how users earn XP, streaks, or badges — do not touch gamification

---

## 16. Checklist Before Starting Any Code

Confirm you understand all of these before writing a single line:

1. The `api` interceptor means `await api.get(...)` returns `response.data` directly — access `res.data.courses`, `res.success` directly (no `res.data.data.courses`)
2. `requireAdmin` is already in `authMiddleware.js` — import it, do NOT rewrite it
3. `asyncHandler` is in `server/utils/asyncHandler.js` — import it
4. The `Course` model is in `server/models/AiCourse.js` — the default export is `Course`
5. RBAC is not yet wired in `aiRoutes.js` — you must add `requireAdmin` imports and usage (Section 11)
6. The theory→practice link is a simple navigation button — no data sync needed (Section 12)
7. The playground curriculum topics in Section 13 are for context only — do not modify the playground

If anything is unclear after reading this entire document, ask the user before proceeding.
