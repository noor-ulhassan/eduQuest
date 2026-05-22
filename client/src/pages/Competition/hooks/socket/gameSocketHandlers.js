import { updateUserStats } from "../../../../features/auth/authSlice";
import { emit as emitGamification } from "@/lib/gamificationBus";
import { toast } from "sonner";

/**
 * Registers all game-flow socket events and returns a cleanup function.
 * Handles: gameStarted, nextQuestion, leaderboardUpdate, timerSync,
 *          playerFinished, gameOver, playerEliminated, playerEliminatedUpdate,
 *          playerFinishedUpdate, rematchUpdate, userXPUpdated
 */
export function registerGameSocketEvents(socket, user, dispatch, setters) {
  const {
    setPlayerTeam, setVsData, setShowVS, setIsStarting,
    setIsPowerQuestion, setCurrentQuestion, setQuestionIndex,
    setSelectedAnswer, setAnswerResult, setIsSubmitting,
    setLeaderboard, setSpectatorCount, setTimeRemaining,
    setFinishData, setUserFinished, setGameState, setFinalResults,
    setTeamScores, setIsDraw, setIsEliminated, setGameEvents, setRematchVotes,
    currentGameModeRef, pendingNextQuestion, pushActivityRef,
  } = setters;

  const onGameStarted = ({
    gameMode: gm, playerTeam: pt, totalQuestions: tq, timerDuration,
    question, questionIndex: qi, category, challengeMode: cm, language, isPower,
  }) => {
    if (pt) setPlayerTeam(pt);
    setVsData({
      totalQuestions: tq, timerDuration, question, questionIndex: qi,
      category, challengeMode: cm, gameMode: gm || "classic", language, isPower: isPower || false,
    });
    setShowVS(true);
    setIsStarting(false);
  };

  const onNextQuestion = ({ question, questionIndex: qi, isPower }) => {
    setIsPowerQuestion(!!isPower);
    if (currentGameModeRef.current === "practice") {
      pendingNextQuestion.current = { question, questionIndex: qi };
      return;
    }
    setCurrentQuestion(question);
    setQuestionIndex(qi);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setIsSubmitting(false);
  };

  const onLeaderboardUpdate = ({ leaderboard: lb, spectatorCount: sc }) => {
    setLeaderboard(lb);
    if (sc !== undefined) setSpectatorCount(sc);
  };

  const onTimerSync = ({ remaining }) => {
    setTimeRemaining(remaining);
  };

  const onPlayerFinished = ({ score, rank, timeTaken, correctAnswers, totalQuestions }) => {
    setFinishData({ score, rank, timeTaken, correctAnswers, totalQuestions });
    setUserFinished(true);
  };

  const onGameOver = ({ leaderboard: lb, playerTeam: pt, teamScores: ts, isDraw: draw }) => {
    setGameState("finished");
    setFinalResults(lb);
    setLeaderboard(lb);
    if (pt) setPlayerTeam(pt);
    if (ts) setTeamScores(ts);
    if (draw) setIsDraw(true);
  };

  const onPlayerEliminated = ({ score, correctAnswers, totalQuestions: tq }) => {
    setIsEliminated(true);
    setUserFinished(true);
    setFinishData((prev) =>
      prev || { score, rank: null, correctAnswers, totalQuestions: tq, timeTaken: 0, eliminated: true }
    );
  };

  const onPlayerEliminatedUpdate = ({ playerId, playerName }) => {
    toast.error(`${playerName} was eliminated! 💀`);
    setGameEvents((prev) => [...prev.slice(-4), { type: "eliminated", name: playerName, time: Date.now() }]);
    pushActivityRef.current?.({ type: "eliminated", name: playerName, playerId, isMe: playerId === user?._id });
  };

  const onPlayerFinishedUpdate = ({ playerId, playerName }) => {
    toast.success(`${playerName} finished! 🏁`);
    setGameEvents((prev) => [...prev.slice(-4), { type: "finished", name: playerName, time: Date.now() }]);
    pushActivityRef.current?.({ type: "finished", name: playerName, playerId, isMe: playerId === user?._id });
  };

  const onRematchUpdate = (data) => {
    setRematchVotes(data);
  };

  const onUserXPUpdated = ({ xpGained, leveledUp, rankedUp, newBadges, user: updatedUser }) => {
    dispatch(updateUserStats(updatedUser));
    if (xpGained > 0) emitGamification({ type: "xp", amount: xpGained });
    if (leveledUp) emitGamification({ type: "levelUp", level: updatedUser.level });
    if (rankedUp) emitGamification({ type: "rankUp", league: updatedUser.league });
    (newBadges || []).forEach((b) => emitGamification({ type: "badge", ...b }));
  };

  socket.on("gameStarted", onGameStarted);
  socket.on("nextQuestion", onNextQuestion);
  socket.on("leaderboardUpdate", onLeaderboardUpdate);
  socket.on("timerSync", onTimerSync);
  socket.on("playerFinished", onPlayerFinished);
  socket.on("gameOver", onGameOver);
  socket.on("playerEliminated", onPlayerEliminated);
  socket.on("playerEliminatedUpdate", onPlayerEliminatedUpdate);
  socket.on("playerFinishedUpdate", onPlayerFinishedUpdate);
  socket.on("rematchUpdate", onRematchUpdate);
  socket.on("userXPUpdated", onUserXPUpdated);

  return () => {
    socket.off("gameStarted", onGameStarted);
    socket.off("nextQuestion", onNextQuestion);
    socket.off("leaderboardUpdate", onLeaderboardUpdate);
    socket.off("timerSync", onTimerSync);
    socket.off("playerFinished", onPlayerFinished);
    socket.off("gameOver", onGameOver);
    socket.off("playerEliminated", onPlayerEliminated);
    socket.off("playerEliminatedUpdate", onPlayerEliminatedUpdate);
    socket.off("playerFinishedUpdate", onPlayerFinishedUpdate);
    socket.off("rematchUpdate", onRematchUpdate);
    socket.off("userXPUpdated", onUserXPUpdated);
  };
}
