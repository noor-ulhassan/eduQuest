import { useEffect, useRef, useState, useCallback } from "react";

const MAX_EVENTS = 5;
const EVENT_TTL_MS = 5500;
const DEDUP_WINDOW_MS = 2200;
const STAGGER_MS = 220; // gap between consecutive events emitted in the same tick

let idCounter = 0;
const nextId = () => `evt-${Date.now()}-${++idCounter}`;

export default function useGameActivityFeed({
  leaderboard = [],
  userId,
  isPowerQuestion = false,
  questionIndex = 0,
  totalQuestions = 0,
  gameState = "lobby",
}) {
  const [events, setEvents] = useState([]);
  const prevSnapshotRef = useRef(null);
  const firstBloodFiredRef = useRef(false);
  const lastEventByKeyRef = useRef(new Map());
  const announcedPowerRef = useRef(false);
  const announcedFinalRef = useRef(false);
  // Serial stagger queue — drains one event every STAGGER_MS so multiple
  // events fired in a single tick appear sequentially rather than all at once
  const staggerQueueRef = useRef([]);
  const staggerTimerRef = useRef(null);

  const drainStagger = useCallback(() => {
    if (staggerTimerRef.current) return;
    const tick = () => {
      const evt = staggerQueueRef.current.shift();
      if (!evt) {
        staggerTimerRef.current = null;
        return;
      }
      setEvents((prev) => [evt, ...prev].slice(0, MAX_EVENTS));
      staggerTimerRef.current = setTimeout(tick, STAGGER_MS);
    };
    tick();
  }, []);

  const push = useCallback(
    (evt) => {
      const dedupKey = `${evt.type}:${evt.playerId || ""}`;
      const now = Date.now();
      const last = lastEventByKeyRef.current.get(dedupKey);
      if (last && now - last < DEDUP_WINDOW_MS) return;
      lastEventByKeyRef.current.set(dedupKey, now);

      staggerQueueRef.current.push({ id: nextId(), createdAt: now, ...evt });
      drainStagger();
    },
    [drainStagger],
  );

  // Periodically prune expired events
  useEffect(() => {
    if (events.length === 0) return;
    const t = setInterval(() => {
      const now = Date.now();
      setEvents((prev) => prev.filter((e) => now - e.createdAt < EVENT_TTL_MS));
    }, 600);
    return () => clearInterval(t);
  }, [events.length]);

  // Reset between games
  useEffect(() => {
    if (gameState !== "playing") {
      prevSnapshotRef.current = null;
      firstBloodFiredRef.current = false;
      announcedPowerRef.current = false;
      announcedFinalRef.current = false;
      lastEventByKeyRef.current.clear();
      staggerQueueRef.current.length = 0;
      if (staggerTimerRef.current) {
        clearTimeout(staggerTimerRef.current);
        staggerTimerRef.current = null;
      }
      setEvents([]);
    }
  }, [gameState]);

  // Power-question / final-question banners
  useEffect(() => {
    if (gameState !== "playing") return;
    if (isPowerQuestion && !announcedPowerRef.current) {
      announcedPowerRef.current = true;
      push({
        type: "power",
        icon: "⚡",
        text: "Power Question — 2× Points!",
        tone: "yellow",
      });
    }
    if (
      totalQuestions > 0 &&
      questionIndex === totalQuestions - 1 &&
      !announcedFinalRef.current &&
      !isPowerQuestion
    ) {
      announcedFinalRef.current = true;
      push({
        type: "final",
        icon: "⏳",
        text: "Final Question — make it count!",
        tone: "orange",
      });
    }
  }, [isPowerQuestion, questionIndex, totalQuestions, gameState, push]);

  // Leaderboard diff → derived events
  useEffect(() => {
    if (gameState !== "playing") return;
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) return;

    const prevMap = prevSnapshotRef.current;
    const newSnap = new Map();
    leaderboard.forEach((p, idx) => {
      newSnap.set(p.id, {
        rank: idx,
        score: p.score || 0,
        currentQuestion: p.currentQuestion || 0,
        correctAnswers: p.correctAnswers || 0,
        comboCount: p.comboCount || 0,
        finished: !!p.finished,
        eliminated: !!p.eliminated,
        name: p.name,
      });
    });

    if (!prevMap) {
      prevSnapshotRef.current = newSnap;
      return;
    }

    // First blood: someone went from 0 → 1 correct, and total correct across all
    // was 0 before. Only fires once per game.
    const totalCorrectBefore = Array.from(prevMap.values()).reduce(
      (a, b) => a + (b.correctAnswers || 0),
      0,
    );

    leaderboard.forEach((p, newRank) => {
      const prev = prevMap.get(p.id);
      if (!prev) return; // new player midgame — skip
      const isMe = p.id === userId;
      const displayName = isMe ? "You" : p.name;

      const scoreDelta = (p.score || 0) - prev.score;
      const correctDelta = (p.correctAnswers || 0) - prev.correctAnswers;
      const questionDelta = (p.currentQuestion || 0) - prev.currentQuestion;
      const newCombo = p.comboCount || 0;
      const prevCombo = prev.comboCount || 0;

      // First blood
      if (
        correctDelta > 0 &&
        totalCorrectBefore === 0 &&
        !firstBloodFiredRef.current
      ) {
        firstBloodFiredRef.current = true;
        push({
          type: "firstBlood",
          icon: "🩸",
          text: `${displayName} drew first blood!`,
          tone: "red",
          playerId: p.id,
          isMe,
        });
      }

      // Correct answer (not first blood and not the local player — local
      // player already gets a big FloatingFeedback). Skip for self.
      if (!isMe && correctDelta > 0 && scoreDelta > 0) {
        push({
          type: "correct",
          icon: "🎯",
          text: `${displayName} aced Q${prev.currentQuestion + 1}`,
          xp: scoreDelta,
          tone: "green",
          playerId: p.id,
          isMe,
        });
      }

      // Combo milestones — 3, 5, 7
      if (newCombo > prevCombo) {
        if (newCombo === 3) {
          push({
            type: "streak3",
            icon: "🔥",
            text: `${displayName} on a 3× streak!`,
            tone: "orange",
            playerId: p.id,
            isMe,
          });
        } else if (newCombo === 5) {
          push({
            type: "streak5",
            icon: "💥",
            text: `${displayName} is ON FIRE — 5×!`,
            tone: "orange",
            playerId: p.id,
            isMe,
          });
        } else if (newCombo === 7) {
          push({
            type: "streak7",
            icon: "🌟",
            text: `${displayName} UNSTOPPABLE — 7×!`,
            tone: "purple",
            playerId: p.id,
            isMe,
          });
        }
      }

      // Streak broken (for others) — combo was 3+ and dropped to 0
      if (!isMe && prevCombo >= 3 && newCombo === 0 && questionDelta > 0) {
        push({
          type: "streakBroken",
          icon: "💔",
          text: `${displayName}'s ${prevCombo}× streak ended`,
          tone: "zinc",
          playerId: p.id,
          isMe,
        });
      }

      // Lead change — only when newRank becomes 0 and was higher
      if (newRank === 0 && prev.rank > 0 && (p.score || 0) > 0) {
        // Was someone else previously rank 0?
        const prevLeader = Array.from(prevMap.entries()).find(
          ([, v]) => v.rank === 0,
        );
        if (prevLeader && prevLeader[0] !== p.id) {
          push({
            type: "leadTaken",
            icon: "👑",
            text: `${displayName} took the lead!`,
            tone: "yellow",
            playerId: p.id,
            isMe,
          });
        }
      }

      // Overtake — moved up at least 1 rank, not into 1st (covered above),
      // not in 1st row (top) and didn't finish/get eliminated
      if (
        newRank < prev.rank &&
        newRank > 0 &&
        !p.finished &&
        !p.eliminated &&
        scoreDelta > 0
      ) {
        // Find who they overtook (player at this rank previously, or rank-1
        // previously who is now lower)
        const overtaken = Array.from(prevMap.entries()).find(
          ([, v]) => v.rank === newRank,
        );
        const overtakenLeaderboardEntry =
          overtaken && leaderboard.find((q) => q.id === overtaken[0]);
        if (
          overtaken &&
          overtaken[0] !== p.id &&
          overtakenLeaderboardEntry &&
          !overtakenLeaderboardEntry.eliminated &&
          !overtakenLeaderboardEntry.finished
        ) {
          const overtakenName =
            overtaken[0] === userId ? "you" : overtaken[1].name;
          push({
            type: "overtake",
            icon: "💨",
            text: `${displayName} overtook ${overtakenName}`,
            tone: "blue",
            playerId: p.id,
            isMe,
          });
        }
      }
    });

    prevSnapshotRef.current = newSnap;
  }, [leaderboard, gameState, push, userId]);

  // Public API: imperative push for socket-driven events (eliminated, finished)
  const pushExternal = useCallback(
    ({ type, name, playerId, isMe }) => {
      if (type === "eliminated") {
        push({
          type: "eliminated",
          icon: "💀",
          text: `${isMe ? "You were" : name + " was"} eliminated`,
          tone: "red",
          playerId,
          isMe,
        });
      } else if (type === "finished") {
        push({
          type: "finished",
          icon: "🏁",
          text: `${isMe ? "You" : name} finished!`,
          tone: "green",
          playerId,
          isMe,
        });
      }
    },
    [push],
  );

  return { events, pushExternal };
}
