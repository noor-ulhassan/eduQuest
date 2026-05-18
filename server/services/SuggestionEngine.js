import TopicPerformance from "../models/TopicPerformance.js";
import Enrollment from "../models/EnrollmentModel.js";
import { Course } from "../models/AiCourse.js";
import { Curriculum } from "../models/Curriculum.js";
import { Suggestion } from "../models/Suggestion.js";

const norm = (s) => (s || "").trim().toLowerCase();

/**
 * Generate a single personalised suggestion for a user.
 * Pure code — no AI calls. Priority 1 → 2 → 3 → 4.
 * @param {import("../models/user.model.js").User} user - full Mongoose user doc
 * @returns {Promise<object|null>} suggestion payload or null
 */
export async function generateSuggestion(user) {
  // ── Priority 1: Revisit lesson (weakness) ───────────────────────────────
  // Chapter where user has repeatedly failed linked exercises
  const weakTopics = await TopicPerformance.find({
    userId: user._id,
    passed: false,
    attemptCount: { $gte: 2 },
  }).sort({ attemptCount: -1 });

  if (weakTopics.length > 0) {
    const weakest = weakTopics[0];
    const course = await Course.findOne({ courseId: weakest.courseId });
    const chapters = course?.courseOutput?.chapters || [];
    const chapter = chapters[weakest.chapterIndex];
    return {
      type: "revisit_lesson",
      courseId: weakest.courseId,
      chapterIndex: weakest.chapterIndex,
      reason: chapter
        ? `You've struggled with "${chapter.chapterName}" — reviewing it may help.`
        : "You've had difficulty with a chapter in this course.",
      ctaLabel: "Review Chapter",
    };
  }

  // ── Priority 2: Practice now (completed chapter, no playground practice) ─
  const enrollments = await Enrollment.find({ userEmail: user.email });
  const allCurriculums = await Curriculum.find({});

  // Build courseId::chapterIndex → [problemId] map from all curriculums
  const linkedMap = new Map();
  for (const curriculum of allCurriculums) {
    for (const ch of curriculum.chapters) {
      for (const prob of ch.problems) {
        const link = prob.courseChapterLink;
        if (link?.courseId && link?.chapterIndex != null) {
          const key = `${link.courseId}::${link.chapterIndex}`;
          if (!linkedMap.has(key)) linkedMap.set(key, []);
          linkedMap.get(key).push(prob.id);
        }
      }
    }
  }

  for (const enrollment of enrollments) {
    const course = await Course.findOne({ courseId: enrollment.courseId });
    if (!course?.courseOutput?.chapters) continue;

    const courseChapters = course.courseOutput.chapters;

    for (const completedName of enrollment.completedChapters) {
      // Fix 1: normalise both sides to avoid casing/whitespace mismatches
      const chapterIndex = courseChapters.findIndex(
        (ch) => norm(ch.chapterName) === norm(completedName),
      );
      if (chapterIndex === -1) continue;

      const key = `${enrollment.courseId}::${chapterIndex}`;
      const linkedIds = linkedMap.get(key);
      if (!linkedIds || linkedIds.length === 0) continue;

      const practiced = await TopicPerformance.findOne({
        userId: user._id,
        exerciseId: { $in: linkedIds },
      });

      if (!practiced) {
        return {
          type: "practice_now",
          courseId: enrollment.courseId,
          chapterIndex,
          reason: `You completed "${courseChapters[chapterIndex].chapterName}" but haven't tried the linked exercises yet.`,
          ctaLabel: "Practice Now",
        };
      }
    }
  }

  // ── Priority 3: Next chapter to advance ─────────────────────────────────
  for (const enrollment of enrollments) {
    const course = await Course.findOne({ courseId: enrollment.courseId });
    if (!course?.courseOutput?.chapters) continue;

    const courseChapters = course.courseOutput.chapters;
    const completedNorm = new Set(enrollment.completedChapters.map(norm));

    for (let i = 0; i < courseChapters.length; i++) {
      const chName = courseChapters[i]?.chapterName;
      // Fix 2: explicitly verify this chapter is not already completed
      if (!completedNorm.has(norm(chName))) {
        return {
          type: "next_chapter",
          courseId: enrollment.courseId,
          chapterIndex: i,
          reason: `Keep the momentum in "${course.name}". Up next: "${chName}".`,
          ctaLabel: "Continue Learning",
        };
      }
    }
  }

  // ── Priority 4: Fallback ─────────────────────────────────────────────────
  return null;
}

/**
 * Generate + persist a suggestion for a user.
 * Safe to call fire-and-forget: generates the payload and upserts the Suggestion doc.
 * @param {import("../models/user.model.js").User} user - full Mongoose user doc
 */
export async function computeAndSave(user) {
  const payload = await generateSuggestion(user);
  if (!payload) return;
  await Suggestion.findOneAndUpdate(
    { userId: user._id },
    { ...payload, userId: user._id, generatedAt: new Date(), actedOn: false },
    { upsert: true, new: true },
  );
}
