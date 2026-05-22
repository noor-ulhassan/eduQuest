import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  playLobbyMusic, stopLobbyMusic,
  playVictorySound, playTimerWarningSound,
} from "@/lib/sound";

/**
 * All game side-effects: confetti, lobby music, blitz timer,
 * keyboard shortcuts, timer warning beep, and client-side countdown.
 */
export function useGameSideEffects({
  gameState, leaderboard, user,
  currentGameMode, userFinished, questionIndex,
  timeRemaining, currentQuestion, isSubmitting, answerResult,
  prevTimerRef, gameStartTimeRef, gameDurationRef, timerIntervalRef, confettiFired,
  setBlitzQuestionTime, setTimeRemaining,
  handleSubmitAnswer,
}) {
  // ─── Confetti + victory sound on game finish ──────────────────
  useEffect(() => {
    if (gameState !== "finished" || !leaderboard.length || confettiFired.current) return;
    confettiFired.current = true;
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    const winnerId = sorted[0]?.id;
    const topTied = sorted.length >= 2 && sorted[0].score === sorted[1].score;
    setTimeout(() => {
      if (winnerId === user?._id && !topTied) playVictorySound();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#f97316", "#eab308", "#ef4444", "#22c55e"] });
      setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.3, x: 0.3 } }), 400);
      setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.3, x: 0.7 } }), 700);
    }, 300);
  }, [gameState, leaderboard, user]);

  // ─── Lobby background music ───────────────────────────────────
  useEffect(() => {
    playLobbyMusic();
    return () => stopLobbyMusic();
  }, []);

  useEffect(() => {
    if (gameState === "playing" || gameState === "finished") stopLobbyMusic();
  }, [gameState]);

  // ─── Blitz: per-question 15s countdown ───────────────────────
  useEffect(() => {
    if (currentGameMode !== "blitz" || gameState !== "playing" || userFinished) return;
    setBlitzQuestionTime(15);
    const interval = setInterval(
      () => setBlitzQuestionTime((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(interval);
  }, [currentGameMode, gameState, userFinished, questionIndex]);

  // ─── Keyboard shortcuts: 1/2/3/4 for MCQ options ─────────────
  useEffect(() => {
    if (gameState !== "playing" || userFinished || !currentQuestion) return;
    const onKeyDown = (e) => {
      if (isSubmitting || answerResult) return;
      const choices = currentQuestion.choices;
      if (!Array.isArray(choices) || choices.length === 0) return;
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < choices.length) handleSubmitAnswer(choices[idx]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState, userFinished, currentQuestion, isSubmitting, answerResult]); // eslint-disable-line

  // ─── Timer warning beep (fires each second when ≤15s) ────────
  useEffect(() => {
    if (gameState !== "playing" || userFinished) return;
    if (timeRemaining > 0 && timeRemaining <= 15 && prevTimerRef.current !== timeRemaining) {
      playTimerWarningSound();
    }
    prevTimerRef.current = timeRemaining;
  }, [timeRemaining, gameState, userFinished]);

  // ─── Client-side countdown timer ──────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || !gameStartTimeRef.current || !gameDurationRef.current) return;
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      setTimeRemaining(Math.max(0, gameDurationRef.current - elapsed));
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameState]);
}
