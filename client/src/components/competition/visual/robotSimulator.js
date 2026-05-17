const MOVE_DELTA  = { right: [0, 1], left: [0, -1], up: [-1, 0], down: [1, 0] };
const TURN_RIGHT  = { right: "down", down: "left", left: "up", up: "right" };
const TURN_LEFT   = { right: "up", up: "left", left: "down", down: "right" };
const TURN_AROUND = { right: "left", left: "right", up: "down", down: "up" };

export function applyCommand(pos, dir, cmd) {
  const c = cmd.toLowerCase();
  if (c.includes("forward")) {
    const [dr, dc] = MOVE_DELTA[dir];
    return { pos: [pos[0] + dr, pos[1] + dc], dir };
  }
  if (c.includes("turn right") || c.includes("rotate right"))
    return { pos: [...pos], dir: TURN_RIGHT[dir] };
  if (c.includes("turn left") || c.includes("rotate left"))
    return { pos: [...pos], dir: TURN_LEFT[dir] };
  if (c.includes("backward") || c.includes("back")) {
    const [dr, dc] = MOVE_DELTA[dir];
    return { pos: [pos[0] - dr, pos[1] - dc], dir };
  }
  if (c.includes("turn around") || c.includes("u-turn"))
    return { pos: [...pos], dir: TURN_AROUND[dir] };
  return { pos: [...pos], dir };
}

export function simulatePath(startPos, startDir, commands) {
  let state = { pos: [...startPos], dir: startDir };
  const path = [{ pos: [...state.pos], dir: state.dir }];
  for (const cmd of commands) {
    state = applyCommand(state.pos, state.dir, cmd);
    path.push({ pos: [...state.pos], dir: state.dir });
  }
  return path;
}
