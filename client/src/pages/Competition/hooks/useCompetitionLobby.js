import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket, getSocket } from "../../../lib/socket";
import { toast } from "sonner";
import {
  muteLobbyMusic, unmuteLobbyMusic,
  stopLobbyMusic, playCorrectSound, playWrongSound,
} from "@/lib/sound";
import useGameActivityFeed from "@/hooks/useGameActivityFeed";
import { resetFeedbackOrchestrator } from "@/lib/feedbackOrchestrator";
import { registerRoomSocketEvents } from "./socket/roomSocketHandlers";
import { registerGameSocketEvents } from "./socket/gameSocketHandlers";
import { useGameSideEffects } from "./useGameSideEffects";

export function useCompetitionLobby({ paramCode, searchParams, user, dispatch, navigate }) {
  // ─── State ────────────────────────────────────────────────────
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState(paramCode || "");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [settings, setSettings] = useState({
    category: "general",
    challengeMode: "classic",
    gameMode: "classic",
    difficulty: "medium",
    language: "javascript",
    totalQuestions: 5,
    timerDuration: 300,
    topic: "",
    description: "",
  });

  const [gameState, setGameState] = useState("lobby");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [readyQuestionCount, setReadyQuestionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFinished, setUserFinished] = useState(false);
  const [finishData, setFinishData] = useState(null);
  const [gameCategory, setGameCategory] = useState(null);
  const [gameChallengeMode, setGameChallengeMode] = useState("classic");
  const [currentGameMode, setCurrentGameMode] = useState("classic");
  const [isEliminated, setIsEliminated] = useState(false);
  const [playerTeam, setPlayerTeam] = useState(null);
  const [teamScores, setTeamScores] = useState(null);
  const [blitzQuestionTime, setBlitzQuestionTime] = useState(15);
  const [finalResults, setFinalResults] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [showVS, setShowVS] = useState(false);
  const [vsData, setVsData] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [spectatorData, setSpectatorData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [isPowerQuestion, setIsPowerQuestion] = useState(false);
  const [gameEvents, setGameEvents] = useState([]);
  const [rematchVotes, setRematchVotes] = useState({ voteCount: 0, totalPlayers: 0, voterNames: [] });

  // ─── Refs ─────────────────────────────────────────────────────
  const pendingNextQuestion = useRef(null);
  const confettiFired = useRef(false);
  const prevTimerRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const gameDurationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const roomCodeRef = useRef("");
  const autoCreateFired = useRef(false);
  const currentGameModeRef = useRef("classic");

  // ─── Derived ──────────────────────────────────────────────────
  const isHost = room?.hostId === user?._id;
  const isSpectator = searchParams.get("spectate") === "true";

  // ─── Activity feed ────────────────────────────────────────────
  const { events: activityEvents, pushExternal: pushActivity } = useGameActivityFeed({
    leaderboard, userId: user?._id, isPowerQuestion, questionIndex, totalQuestions, gameState,
  });
  const pushActivityRef = useRef(pushActivity);
  useEffect(() => { pushActivityRef.current = pushActivity; }, [pushActivity]);

  // ─── Keep refs in sync ────────────────────────────────────────
  useEffect(() => { roomCodeRef.current = roomCode; }, [roomCode]);
  useEffect(() => { currentGameModeRef.current = currentGameMode; }, [currentGameMode]);

  // ─── Socket connection ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const s = connectSocket();
    setSocket(s);
    return () => {
      const sock = getSocket();
      if (sock && roomCodeRef.current) sock.emit("leaveRoom", { roomCode: roomCodeRef.current });
    };
  }, [user]);

  // ─── Reconnect: resync game state after socket drops ─────────
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      const code = roomCodeRef.current;
      if (!code) return;
      console.log("[Socket] Reconnected — syncing state...");
      socket.emit("syncState", { roomCode: code }, (state) => {
        if (!state?.success) return;
        setLeaderboard(state.leaderboard || []);
        if (state.settings) {
          setSettings(state.settings);
          if (state.settings.gameMode) {
            setCurrentGameMode(state.settings.gameMode);
            currentGameModeRef.current = state.settings.gameMode;
          }
          if (state.settings.category) setGameCategory(state.settings.category);
          if (state.settings.challengeMode) setGameChallengeMode(state.settings.challengeMode);
        }
        if (state.gameState === "active") {
          setGameState("playing");
          if (state.currentQuestion) { setCurrentQuestion(state.currentQuestion); setQuestionIndex(state.questionIndex || 0); }
          if (state.timeRemaining != null) {
            setTimeRemaining(state.timeRemaining);
            gameStartTimeRef.current = Date.now() - (state.settings.timerDuration - state.timeRemaining) * 1000;
            gameDurationRef.current = state.settings.timerDuration;
          }
          setSelectedAnswer(null);
          setAnswerResult(null);
          toast.success("Reconnected to game!");
        } else if (state.gameState === "finished") {
          setGameState("finished");
          setFinalResults(state.leaderboard);
        } else {
          setGameState("lobby");
        }
      });
    };
    socket.io?.on("reconnect", handleReconnect);
    return () => { socket.io?.off("reconnect", handleReconnect); };
  }, [socket]);

  // ─── Socket event listeners ───────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const roomSetters = {
      setRoom, setPendingRequests, setSettings, setGameState, setIsStarting,
      setReadyQuestionCount, setIsReady, setFinalResults, setLeaderboard,
      setCurrentQuestion, setUserFinished, setFinishData, setComboCount,
      setIsEliminated, setTeamScores, setPlayerTeam, setIsDraw,
      setSpectatorCount, setIsPowerQuestion, setGameEvents, setRematchVotes,
      confettiFired,
    };
    const gameSetters = {
      setPlayerTeam, setVsData, setShowVS, setIsStarting, setIsPowerQuestion,
      setCurrentQuestion, setQuestionIndex, setSelectedAnswer, setAnswerResult,
      setIsSubmitting, setLeaderboard, setSpectatorCount, setTimeRemaining,
      setFinishData, setUserFinished, setGameState, setFinalResults,
      setTeamScores, setIsDraw, setIsEliminated, setGameEvents, setRematchVotes,
      currentGameModeRef, pendingNextQuestion, pushActivityRef,
    };
    const cleanupRoom = registerRoomSocketEvents(socket, user, roomSetters);
    const cleanupGame = registerGameSocketEvents(socket, user, dispatch, gameSetters);
    return () => { cleanupRoom(); cleanupGame(); };
  }, [socket, user, dispatch]);

  // ─── Auto-join from URL param ─────────────────────────────────
  useEffect(() => {
    if (!paramCode || !socket || room) return;
    const attempt = () => handleJoinRoom(paramCode);
    if (socket.connected) { attempt(); } else { socket.on("connect", attempt); return () => socket.off("connect", attempt); }
  }, [paramCode, socket]); // eslint-disable-line

  // ─── Auto-join from ?join= query param ───────────────────────
  useEffect(() => {
    const joinParam = searchParams.get("join");
    if (!joinParam || !socket || room) return;
    const attempt = () => handleJoinRoom(joinParam);
    if (socket.connected) { attempt(); } else { socket.on("connect", attempt); return () => socket.off("connect", attempt); }
  }, [searchParams, socket]); // eslint-disable-line

  // ─── Auto-create room when arriving at /lobby with no code ────
  useEffect(() => {
    if (paramCode || searchParams.get("join") || room || autoCreateFired.current || !socket) return;
    const attempt = () => {
      if (autoCreateFired.current) return;
      autoCreateFired.current = true;
      handleCreateRoom();
    };
    if (socket.connected) { attempt(); } else { socket.on("connect", attempt); return () => socket.off("connect", attempt); }
  }, [socket]); // eslint-disable-line

  // ─── Auto-spectate ────────────────────────────────────────────
  useEffect(() => {
    if (!isSpectator || !paramCode || !socket) return;
    const attempt = () => {
      socket.emit("spectateRoom", { roomCode: paramCode }, (response) => {
        if (response.success) {
          setSpectatorData(response.room);
          setRoom(response.room);
          setRoomCode(response.room.roomCode);
          setPendingRequests(response.room.pendingRequests || []);
          setLeaderboard(response.room.leaderboard || []);
          const timeLeft = response.room.timeRemaining || 0;
          setTimeRemaining(timeLeft);
          setGameCategory(response.room.category);
          setGameState(
            response.room.status === "waiting" ? "lobby"
            : response.room.status === "active" ? "playing"
            : response.room.status
          );
          if (response.room.status === "active" && response.room.timerDuration) {
            gameDurationRef.current = response.room.timerDuration;
            gameStartTimeRef.current = Date.now() - (response.room.timerDuration - timeLeft) * 1000;
          }
        } else {
          toast.error(response.message);
        }
      });
    };
    if (socket.connected) { attempt(); } else { socket.on("connect", attempt); return () => socket.off("connect", attempt); }
  }, [isSpectator, paramCode, socket]); // eslint-disable-line

  // ─── Answer submission (defined early for useGameSideEffects) ──
  const handleSubmitAnswer = useCallback((answer) => {
    if (!socket?.connected || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedAnswer(answer);
    const prevCombo = comboCount;
    const submitTimeout = setTimeout(() => setIsSubmitting(false), 10000);
    socket.emit("submitAnswer", { roomCode, questionIndex, answer }, (result) => {
      clearTimeout(submitTimeout);
      setAnswerResult(result);
      setIsSubmitting(false);
      if (result?.comboCount !== undefined) setComboCount(result.comboCount);
      if (result?.isCorrect) {
        playCorrectSound();
        setFeedbackResult({ correct: true, xpGained: result.pointsEarned || 50 });
      } else {
        playWrongSound();
        setFeedbackResult({ correct: false, streakBroken: prevCombo >= 3 ? prevCombo : 0 });
      }
      setFeedbackKey((prev) => prev + 1);
    });
  }, [socket, isSubmitting, roomCode, questionIndex, comboCount]);

  // ─── Side effects (music, timers, confetti, keyboard) ────────
  useGameSideEffects({
    gameState, leaderboard, user, currentGameMode, userFinished,
    questionIndex, timeRemaining, currentQuestion, isSubmitting, answerResult,
    prevTimerRef, gameStartTimeRef, gameDurationRef, timerIntervalRef, confettiFired,
    setBlitzQuestionTime, setTimeRemaining,
    handleSubmitAnswer,
  });

  // ─── Room action handlers ─────────────────────────────────────

  const handleApproveJoin = (requesterId) => {
    socket?.emit("approveJoin", { roomCode, requesterId });
    setPendingRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  const handleDenyJoin = (requesterId) => {
    socket?.emit("denyJoin", { roomCode, requesterId });
    setPendingRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  const handleToggleReady = () => {
    if (!socket?.connected || !roomCode) return;
    const newReady = !isReady;
    socket.emit("setReady", { roomCode, ready: newReady }, (res) => {
      if (res?.success) setIsReady(newReady);
    });
  };

  const handleCreateRoom = useCallback(() => {
    if (!socket?.connected) return toast.error("Not connected");
    setIsConnecting(true);
    socket.emit("createRoom", (response) => {
      setIsConnecting(false);
      if (response.success) {
        setRoomCode(response.roomCode);
        setRoom({ ...response.room, hostId: user._id });
        setPendingRequests([]);
        toast.success(`Room ${response.roomCode} created!`);
      } else {
        toast.error("Failed to create room");
      }
    });
  }, [socket, user]);

  const handleJoinRoom = useCallback(
    (code) => {
      const c = code || joinCode.trim().toUpperCase();
      if (!c) return toast.error("Enter a room code");
      if (!socket?.connected) return toast.error("Not connected");
      setIsConnecting(true);
      socket.emit("joinRoom", { roomCode: c }, (response) => {
        setIsConnecting(false);
        if (response.success) {
          setRoom(response.room);
          setRoomCode(response.room.roomCode);
          setPendingRequests(response.room.pendingRequests || []);
          let newState = "lobby";
          if (response.room.status === "active") newState = "playing";
          else if (response.room.status === "ready") { newState = "ready"; setReadyQuestionCount(response.room.totalQuestions || 0); }
          else if (response.room.status === "generating") newState = "generating";
          setGameState(newState);
          toast.success("Joined room!");
        } else {
          toast.error(response.message || "Failed to join room");
        }
      });
    },
    [socket, joinCode]
  );

  const handleUpdateSettings = (keyOrObj, value) => {
    const updates = typeof keyOrObj === "string" ? { [keyOrObj]: value } : keyOrObj;
    setSettings((prev) => ({ ...prev, ...updates }));
    socket?.emit("updateSettings", { roomCode, settings: updates });
  };

  const handleStartGame = () => {
    if (!socket?.connected) return;
    const playerCount = room?.players?.length || 0;
    const modeMinPlayers = { duel: 2, survival: 2, team: 2 };
    const modeLabels = { duel: "Duel", survival: "Survival", team: "Team Battle" };
    const required = modeMinPlayers[settings.gameMode];
    if (required && playerCount < required) return toast.error(`${modeLabels[settings.gameMode]} mode requires at least ${required} players`);
    setIsStarting(true);
    socket.emit("startGame", { roomCode }, (response) => {
      if (!response.success) {
        toast.error(response.message);
        setIsStarting(false);
        if (response.message?.includes("not found") || response.message?.includes("expired")) { setRoom(null); setRoomCode(""); }
      }
    });
  };

  const handleLaunchGame = () => {
    if (!socket?.connected) return;
    stopLobbyMusic();
    setIsStarting(true);
    socket.emit("launchGame", { roomCode }, (response) => {
      if (!response.success) { toast.error(response.message); setIsStarting(false); }
    });
  };

  const handleCancelGame = () => {
    if (!socket?.connected) return;
    socket.emit("cancelGame", { roomCode }, (response) => {
      if (!response.success) toast.error(response.message);
    });
  };

  const handlePlayAgain = useCallback(() => {
    if (!socket?.connected) return;
    function createNewRoom() {
      socket.emit("createRoom", (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setRoom({ ...response.room, hostId: user._id });
          setGameState("lobby"); setFinalResults(null); setLeaderboard([]);
          setCurrentQuestion(null); setUserFinished(false); setFinishData(null);
          setComboCount(0); confettiFired.current = false; setIsEliminated(false);
          setTeamScores(null); setPlayerTeam(null);
          toast.success(`New room ${response.roomCode} created!`);
        } else {
          toast.error("Failed to create new room");
        }
      });
    }
    if (roomCode) {
      socket.emit("resetRoom", { roomCode }, (response) => { if (!response?.success) createNewRoom(); });
    } else {
      createNewRoom();
    }
  }, [socket, user, roomCode]);

  const handleLeave = () => {
    socket?.emit("leaveRoom", { roomCode });
    navigate("/");
  };

  const handleGoHome = () => {
    if (roomCode) socket?.emit("leaveRoom", { roomCode });
    window.location.href = "/competition/lobby";
  };

  const handleRequestRematch = useCallback(() => {
    if (!socket?.connected || !roomCode) return;
    socket.emit("requestRematch", { roomCode }, (res) => {
      if (!res?.success) toast.error("Rematch request failed");
    });
  }, [socket, roomCode]);

  const handleToggleMusic = () => {
    setIsMusicMuted((prev) => {
      const next = !prev;
      next ? muteLobbyMusic() : unmuteLobbyMusic();
      return next;
    });
  };

  // ─── Game action handlers ─────────────────────────────────────

  const fallbackCopy = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(el);
    el.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(el);
  };

  const copyToClipboard = (text) => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  };

  const handleCopyCode = () => copyToClipboard(roomCode);
  const handleCopyLink = () => copyToClipboard(`${window.location.origin}/competition/${roomCode}`);

  const handlePracticeNext = () => {
    if (!pendingNextQuestion.current) return;
    const { question, questionIndex: qi } = pendingNextQuestion.current;
    pendingNextQuestion.current = null;
    setCurrentQuestion(question);
    setQuestionIndex(qi);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setIsSubmitting(false);
  };

  const handleSpectateAfterFinish = () => {
    setUserFinished(false);
    setFinishData(null);
    toast("Spectating... You'll see the final results when everyone finishes.", { icon: "👁️" });
  };

  const handleVSComplete = () => {
    if (!vsData) return;
    resetFeedbackOrchestrator();
    const capturedRoomCode = roomCode;
    const capturedDuration = vsData.timerDuration;
    setShowVS(false);
    setGameState("playing");
    setTotalQuestions(vsData.totalQuestions);
    setTimeRemaining(vsData.timerDuration);
    setCurrentQuestion(vsData.question);
    setQuestionIndex(vsData.questionIndex);
    setGameCategory(vsData.category);
    setGameChallengeMode(vsData.challengeMode || "classic");
    setCurrentGameMode(vsData.gameMode || "classic");
    setIsEliminated(false); setTeamScores(null); setBlitzQuestionTime(15);
    pendingNextQuestion.current = null;
    setSelectedAnswer(null); setAnswerResult(null); setComboCount(0);
    setFeedbackResult(null); setIsPowerQuestion(!!vsData.isPower);
    setGameEvents([]); setRematchVotes({ voteCount: 0, totalPlayers: 0, voterNames: [] });
    setVsData(null);
    gameStartTimeRef.current = Date.now();
    gameDurationRef.current = capturedDuration;
    socket?.emit("playerStarted", { roomCode: capturedRoomCode });
    socket?.emit("getTimerSync", { roomCode: capturedRoomCode }, (res) => {
      if (res?.remaining !== undefined) {
        setTimeRemaining(res.remaining);
        gameStartTimeRef.current = Date.now() - (capturedDuration - res.remaining) * 1000;
      }
    });
  };

  return {
    room, roomCode, joinCode, copied, isConnecting, isHost, isSpectator,
    isStarting, isMusicMuted, settings,
    gameState, currentQuestion, questionIndex, totalQuestions, readyQuestionCount,
    timeRemaining, leaderboard, selectedAnswer, answerResult, isSubmitting,
    userFinished, finishData, gameCategory, gameChallengeMode, currentGameMode,
    isEliminated, playerTeam, teamScores, blitzQuestionTime, finalResults, isDraw,
    showVS, vsData, comboCount, feedbackResult, feedbackKey,
    spectatorData, pendingRequests, isReady, spectatorCount, isPowerQuestion,
    gameEvents, rematchVotes, activityEvents,
    gameDurationRef,
    handleApproveJoin, handleDenyJoin, handleToggleReady,
    handleCreateRoom, handleJoinRoom, handleCopyCode, handleCopyLink,
    handleUpdateSettings, handleStartGame, handleLaunchGame, handleCancelGame,
    handlePlayAgain, handleSubmitAnswer, handleLeave, handleGoHome,
    handleRequestRematch, handleVSComplete, handleToggleMusic,
    handleSpectateAfterFinish, handlePracticeNext,
  };
}

