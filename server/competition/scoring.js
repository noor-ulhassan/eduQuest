// Pure grading logic — no side effects, no DB calls, no socket emits.
// gradeAnswer() is called from the submitAnswer socket handler.

function calcSpeedBonus(base, maxBonus, elapsed, blitzFactor) {
  const tau = 8 / blitzFactor;
  return base + Math.max(0, Math.floor(maxBonus * blitzFactor * Math.exp(-elapsed / tau)));
}

// Builds the correctAnswer data sent back for feedback after an answer.
export function buildCorrectAnswerData(question) {
  const iType = question.interactionType;
  if (iType === "drag_order")    return question.correctOrder.map(i => question.items?.[i] ?? String(i));
  if (iType === "drag_match")    return question.pairs?.map(p => `${p.left} → ${p.right}`);
  if (iType === "fill_blank")    return question.blanks;
  if (iType === "predict_output") return question.acceptedAnswers?.[0] || null;
  if (iType === "slider_adjust") return question.sliders?.map(s => `${s.label}: ${s.correctValue}${s.unit}`);
  if (iType === "visual_sequence") return question.correctOrder.map(i => question.items?.[i] ?? String(i));
  if (iType === "code_trace")    return question.correctOrder.map(i => question.steps?.[i]?.lineLabel ?? String(i));
  return question.correctAnswer || null;
}

// Grades a submitted answer for any question type.
// Returns { isCorrect, pointsEarned, correctAnswerData }
export function gradeAnswer({ question, answer, room, questionIndex, questionElapsed, isPowerQuestion }) {
  const blitzFactor = room.gameMode === "blitz" ? 3 : 1;
  const iType = question.interactionType;
  let isCorrect = false;
  let pointsEarned = 0;

  const pts = (base, bonus) => calcSpeedBonus(base, bonus, questionElapsed, blitzFactor);

  if (iType === "drag_order") {
    const submitted = answer?.value;
    isCorrect = Array.isArray(submitted) && Array.isArray(question.correctOrder) &&
      submitted.length === question.correctOrder.length &&
      submitted.every((v, i) => v === question.correctOrder[i]);
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (iType === "drag_match") {
    const submitted = answer?.value;
    if (submitted && question.pairs) {
      const shuffleMap = room._shuffleMaps?.[`q${questionIndex}_dragMatch`];
      isCorrect = shuffleMap
        ? question.pairs.every((_, i) => shuffleMap[submitted[i]] === i)
        : question.pairs.every((_, i) => submitted[i] === i);
    }
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (iType === "fill_blank") {
    const submitted = answer?.value;
    isCorrect = Array.isArray(submitted) && Array.isArray(question.blanks) &&
      submitted.length === question.blanks.length &&
      submitted.every((v, i) => v.trim().toLowerCase() === question.blanks[i].trim().toLowerCase());
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (iType === "predict_output") {
    const userAnswer = (answer?.value || "").trim().toLowerCase();
    isCorrect = (question.acceptedAnswers || []).some(a => a.trim().toLowerCase() === userAnswer);
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (iType === "slider_adjust") {
    const submitted = answer?.value;
    if (submitted && question.sliders) {
      isCorrect = question.sliders.every((slider, i) => Math.abs(Number(submitted[i]) - slider.correctValue) <= (slider.tolerance || 0));
    }
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (iType === "visual_sequence" || iType === "code_trace") {
    const submitted = answer?.value;
    isCorrect = Array.isArray(submitted) && Array.isArray(question.correctOrder) &&
      submitted.length === question.correctOrder.length &&
      submitted.every((v, i) => Number(v) === Number(question.correctOrder[i]));
    if (isCorrect) pointsEarned = pts(100, 50);

  } else if (room.category === "programming" && (!room.challengeMode || room.challengeMode === "classic")) {
    isCorrect = answer?.allPassed === true;
    if (isCorrect) pointsEarned = pts(200, 100);

  } else {
    // Standard MCQ
    isCorrect = typeof answer === "string" &&
      answer.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
    if (isCorrect) pointsEarned = pts(100, 50);
  }

  // Power question (last question) doubles points
  if (isCorrect && isPowerQuestion) pointsEarned = Math.round(pointsEarned * 2);

  return { isCorrect, pointsEarned, correctAnswerData: buildCorrectAnswerData(question) };
}
