// Validates AI-generated questions before they are sent to players.
// Each interaction type has its own validator in VALIDATORS.

function warn(index, msg) {
  console.warn(`[Validation] Q${index + 1}: ${msg}`);
  return false;
}

// Mirrors client/src/pages/Competition/components/visual/robotSimulator.js
function validateVisualSequencePath(q) {
  try {
    const { gridConfig, items, correctOrder } = q;
    if (!gridConfig || !Array.isArray(items) || !Array.isArray(correctOrder)) return false;
    const { startPos, startDir, goalPos, rows, cols, walls = [] } = gridConfig;
    if (!startPos || !startDir || !goalPos || !rows || !cols) return false;

    const MOVE_DELTA = { right: [0, 1], left: [0, -1], up: [-1, 0], down: [1, 0] };
    const TURN_RIGHT  = { right: "down", down: "left", left: "up",   up: "right" };
    const TURN_LEFT   = { right: "up",   up: "left",   left: "down", down: "right" };
    const TURN_AROUND = { right: "left", left: "right", up: "down",  down: "up" };

    let pos = [...startPos];
    let dir = startDir;

    for (const idx of correctOrder) {
      if (idx < 0 || idx >= items.length) return false;
      const cmd = String(items[idx]).toLowerCase();

      if      (cmd.includes("forward"))                               { const [dr, dc] = MOVE_DELTA[dir] || [0, 0]; pos = [pos[0] + dr, pos[1] + dc]; }
      else if (cmd.includes("turn right") || cmd.includes("rotate right")) dir = TURN_RIGHT[dir] || dir;
      else if (cmd.includes("turn left")  || cmd.includes("rotate left"))  dir = TURN_LEFT[dir]  || dir;
      else if (cmd.includes("backward")   || cmd.includes("back"))   { const [dr, dc] = MOVE_DELTA[dir] || [0, 0]; pos = [pos[0] - dr, pos[1] - dc]; }
      else if (cmd.includes("turn around") || cmd.includes("u-turn")) dir = TURN_AROUND[dir] || dir;

      if (pos[0] < 0 || pos[0] >= rows || pos[1] < 0 || pos[1] >= cols) return false;
      if (walls.some(w => Array.isArray(w) && w[0] === pos[0] && w[1] === pos[1])) return false;
    }

    return pos[0] === goalPos[0] && pos[1] === goalPos[1];
  } catch {
    return false;
  }
}

// Per-type validators — each returns true (valid) or false (invalid, with a warn log)
const VALIDATORS = {
  code: (q, i) => {
    if (!q.starterCode || !q.testCases) return warn(i, "code question missing starterCode/testCases");
    return true;
  },

  drag_order: (q, i) => {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder)) return warn(i, "drag_order missing items/correctOrder");
    if (q.items.length !== q.correctOrder.length) return warn(i, "drag_order items/correctOrder length mismatch");
    const sorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (sorted.some((v, idx) => v !== idx)) return warn(i, "drag_order correctOrder has invalid indices");
    if (q.correctOrder.every((v, idx) => Number(v) === idx) && q.items.length >= 4) return warn(i, "drag_order correctOrder is [0,1,2,...] — items appear unshuffled");
    return true;
  },

  drag_match: (q, i) => {
    if (!Array.isArray(q.pairs) || q.pairs.length < 2) return warn(i, "drag_match missing pairs");
    if (q.pairs.some(p => !p.left || !p.right)) return warn(i, "drag_match pair missing left/right");
    return true;
  },

  fill_blank: (q, i) => {
    if (!q.codeTemplate || !Array.isArray(q.blanks) || q.blanks.length === 0) return warn(i, "fill_blank missing codeTemplate/blanks");
    return true;
  },

  predict_output: (q, i) => {
    if (!q.codeSnippet || !Array.isArray(q.acceptedAnswers)) return warn(i, "predict_output missing codeSnippet/acceptedAnswers");
    return true;
  },

  slider_adjust: (q, i) => {
    if (!Array.isArray(q.sliders) || q.sliders.length === 0) return warn(i, "slider_adjust missing sliders");
    if (q.sliders.some(s => s.correctValue === undefined)) return warn(i, "slider missing correctValue");
    return true;
  },

  visual_sequence: (q, i) => {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder) || !q.gridConfig) return warn(i, "visual_sequence missing items/correctOrder/gridConfig");
    if (q.items.length !== q.correctOrder.length) return warn(i, "visual_sequence items/correctOrder length mismatch");
    if (!Array.isArray(q.gridConfig.startPos) || !Array.isArray(q.gridConfig.goalPos)) return warn(i, "visual_sequence gridConfig missing startPos/goalPos");
    const sorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (sorted.some((v, idx) => v !== idx || !Number.isInteger(v))) return warn(i, "visual_sequence correctOrder is not a valid permutation");
    if (!validateVisualSequencePath(q)) return warn(i, "visual_sequence path does not reach goalPos");
    return true;
  },

  code_trace: (q, i) => {
    if (!Array.isArray(q.steps) || !Array.isArray(q.correctOrder) || !q.codeSnippet) return warn(i, "code_trace missing steps/correctOrder/codeSnippet");
    if (q.steps.length !== q.correctOrder.length) return warn(i, "code_trace steps/correctOrder length mismatch");
    const sorted = [...q.correctOrder].map(Number).sort((a, b) => a - b);
    if (sorted.some((v, idx) => v !== idx || !Number.isInteger(v))) return warn(i, "code_trace correctOrder is not a valid permutation");
    if (q.correctOrder.every((v, idx) => Number(v) === idx) && q.steps.length >= 5) return warn(i, "code_trace correctOrder is [0,1,2,3,4] — AI likely forgot to shuffle");
    return true;
  },
};

function validateMCQ(q, i) {
  if (q.starterCode && q.testCases) return true; // looks like a code question without interactionType
  if (!Array.isArray(q.options) || q.options.length < 2) return warn(i, "MCQ missing options");
  if (q.correctAnswer !== undefined && !q.options.includes(q.correctAnswer)) return warn(i, "correctAnswer not in options");
  return true;
}

export function validateQuestion(q, index) {
  if (!q.question && !q.title) return warn(index, "missing question text");
  const type = q.interactionType;
  if (!type || type === "mcq") return validateMCQ(q, index);
  const validate = VALIDATORS[type];
  if (!validate) return true; // unknown type — pass through
  return validate(q, index);
}
