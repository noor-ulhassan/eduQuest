import { playNotificationSound, playPlayerJoinedSound } from "@/lib/sound";
import { toast } from "sonner";
import { resetFeedbackOrchestrator } from "@/lib/feedbackOrchestrator";

/**
 * Registers all room-level socket events and returns a cleanup function.
 * Handles: playerJoined, playerLeft, settingsUpdated, newHost,
 *          gameStatus, playerReadyUpdate, joinRequest, roomReset
 */
export function registerRoomSocketEvents(socket, user, setters) {
  const {
    setRoom, setPendingRequests, setSettings, setGameState,
    setIsStarting, setReadyQuestionCount, setIsReady,
    setFinalResults, setLeaderboard, setCurrentQuestion,
    setUserFinished, setFinishData, setComboCount, setIsEliminated,
    setTeamScores, setPlayerTeam, setIsDraw, setSpectatorCount,
    setIsPowerQuestion, setGameEvents, setRematchVotes,
    confettiFired,
  } = setters;

  const onPlayerJoined = ({ players, newPlayer }) => {
    setRoom((prev) => (prev ? { ...prev, players } : prev));
    setPendingRequests((prev) =>
      prev.filter((req) => !players.some((p) => p.id === req.id || p.name === newPlayer))
    );
    if (user?.name !== newPlayer) playPlayerJoinedSound();
    toast(`${newPlayer} joined the room!`);
  };

  const onPlayerLeft = ({ players }) => {
    setRoom((prev) => (prev ? { ...prev, players } : prev));
    toast("A player left the room", { icon: "👋" });
  };

  const onSettingsUpdated = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const onNewHost = ({ hostId }) => {
    setRoom((prev) => (prev ? { ...prev, hostId } : prev));
    if (hostId === user?._id) toast.success("You are now the host!");
  };

  const onGameStatus = ({ status, totalQuestions: tq, message }) => {
    if (status === "generating") setGameState("generating");
    if (status === "ready") {
      setGameState("ready");
      setReadyQuestionCount(tq || 0);
      setIsStarting(false);
    }
    if (status === "cancelled") {
      setGameState("lobby");
      setIsStarting(false);
      toast("Game cancelled by host");
    }
    if (status === "error") {
      setGameState("lobby");
      setIsStarting(false);
      toast.error(message || "Failed to generate questions. Please try again.");
    }
  };

  const onPlayerReadyUpdate = ({ playerId, ready, readyCount, totalPlayers }) => {
    setRoom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map((p) => (p.id === playerId ? { ...p, ready } : p)),
        readyCount,
        totalPlayers,
      };
    });
  };

  const onJoinRequest = ({ requester }) => {
    console.log("Received join request:", requester);
    playNotificationSound();
    setPendingRequests((prev) => {
      if (prev.find((r) => r.id === requester.id)) return prev;
      return [...prev, requester];
    });
    setRoom((prev) => {
      if (!prev) return prev;
      const current = prev.pendingRequests || [];
      if (current.find((r) => r.id === requester.id)) return prev;
      return { ...prev, pendingRequests: [...current, requester] };
    });
    toast(`${requester.name} wants to join!`, { icon: "🔔" });
  };

  const onRoomReset = ({ room: resetRoom }) => {
    resetFeedbackOrchestrator();
    setRoom(resetRoom);
    setGameState("lobby");
    setFinalResults(null);
    setLeaderboard([]);
    setCurrentQuestion(null);
    setUserFinished(false);
    setFinishData(null);
    setComboCount(0);
    setIsEliminated(false);
    setTeamScores(null);
    setPlayerTeam(null);
    setIsDraw(false);
    setIsReady(false);
    confettiFired.current = false;
    setSpectatorCount(0);
    setIsPowerQuestion(false);
    setGameEvents([]);
    setRematchVotes({ voteCount: 0, totalPlayers: 0, voterNames: [] });
    setSettings((s) => ({
      ...s,
      category: resetRoom.category || s.category,
      gameMode: resetRoom.gameMode || s.gameMode,
      challengeMode: resetRoom.challengeMode || s.challengeMode,
      difficulty: resetRoom.difficulty || s.difficulty,
    }));
    toast.success("Room reset — ready for another round!");
  };

  socket.on("playerJoined", onPlayerJoined);
  socket.on("playerLeft", onPlayerLeft);
  socket.on("settingsUpdated", onSettingsUpdated);
  socket.on("newHost", onNewHost);
  socket.on("gameStatus", onGameStatus);
  socket.on("playerReadyUpdate", onPlayerReadyUpdate);
  socket.on("joinRequest", onJoinRequest);
  socket.on("roomReset", onRoomReset);

  return () => {
    socket.off("playerJoined", onPlayerJoined);
    socket.off("playerLeft", onPlayerLeft);
    socket.off("settingsUpdated", onSettingsUpdated);
    socket.off("newHost", onNewHost);
    socket.off("gameStatus", onGameStatus);
    socket.off("playerReadyUpdate", onPlayerReadyUpdate);
    socket.off("joinRequest", onJoinRequest);
    socket.off("roomReset", onRoomReset);
  };
}
