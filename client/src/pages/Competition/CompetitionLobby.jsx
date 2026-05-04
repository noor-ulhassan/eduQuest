import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "../../lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Crown,
  Play,
  Loader2,
  ArrowLeft,
  Swords,
  BookOpen,
  Code,
  Timer,
  Trophy,
  Eye,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound, playPlayerJoinedSound } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import InteractiveQuestion from "../../components/competition/InteractiveQuestion";
import LobbyHeader from "../../components/competition/LobbyHeader";
import RoomCodeCard from "../../components/competition/RoomCodeCard";
import MatchConfiguration from "../../components/competition/MatchConfiguration";
import JoinRequestsPanel from "../../components/competition/JoinRequestsPanel";
import ParticipantsPanel from "../../components/competition/ParticipantsPanel";
import GuestWaitingCard from "../../components/competition/GuestWaitingCard";
import GeneratingScreen from "../../components/competition/GeneratingScreen";
import ReadyScreen from "../../components/competition/ReadyScreen";
import ResultsScreen from "../../components/competition/ResultsScreen";
import GameOverScreen from "../../components/competition/GameOverScreen";
import PodiumScreen from "../../components/competition/PodiumScreen";
import { useVoiceChat } from "../../hooks/useVoiceChat";
import VoiceControls from "../../components/competition/VoiceControls";
import VoiceSpeakerIndicator from "../../components/competition/VoiceSpeakerIndicator";
import VSScreen from "../../components/competition/VSScreen";
import FloatingFeedback from "../../components/competition/FloatingFeedback";
import AnimatedLeaderboard from "../../components/competition/AnimatedLeaderboard";
import confetti from "canvas-confetti";
import {
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  playTimerWarningSound,
} from "@/lib/sound";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const CompetitionLobby = () => {
  const navigate = useNavigate();
  const { roomCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);

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

  // Game state
  const [gameState, setGameState] = useState("lobby"); // lobby | generating | ready | playing | finished
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
  const [playerTeam, setPlayerTeam] = useState(null); // { [playerId]: 0 | 1 }
  const [teamScores, setTeamScores] = useState(null); // { 0: number, 1: number }
  const [blitzQuestionTime, setBlitzQuestionTime] = useState(15);
  const pendingNextQuestion = useRef(null);
  const [finalResults, setFinalResults] = useState(null);
  const confettiFired = useRef(false);
  const prevTimerRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const gameDurationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const roomCodeRef = useRef("");
  const autoCreateFired = useRef(false);

  // Gamification state
  const [showVS, setShowVS] = useState(false);
  const [vsData, setVsData] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackKey, setFeedbackKey] = useState(0);

  // Spectator & join request state
  const isSpectator = searchParams.get("spectate") === "true";
  const [spectatorData, setSpectatorData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const isHost = room?.hostId === user?._id;

  // Voice chat
  const {
    isInVoice,
    isMuted,
    activeSpeakers,
    voiceUsers,
    joinVoice,
    leaveVoice,
    toggleMute,
  } = useVoiceChat(socket, roomCode, user);

  // Reconnect recovery is handled by syncState below — no separate auto-rejoin needed

  // Keep ref in sync for cleanup closure
  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  // Connect socket on mount
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const s = connectSocket(token);
    setSocket(s);

    return () => {
      const sock = getSocket();
      if (sock && roomCodeRef.current) {
        sock.emit("leaveRoom", { roomCode: roomCodeRef.current });
      }
    };
  }, [user]);

  // CLI-3: Reconnection recovery — sync state from server if we reconnect mid-game
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      const code = roomCodeRef.current;
      if (!code) return;

      console.log("[Socket] Reconnected — syncing state...");
      socket.emit("syncState", { roomCode: code }, (state) => {
        if (!state?.success) return;

        // Restore game state
        setLeaderboard(state.leaderboard || []);
        if (state.settings) setSettings(state.settings);

        if (state.gameState === "active") {
          setGameState("playing");
          if (state.currentQuestion) {
            setCurrentQuestion(state.currentQuestion);
            setQuestionIndex(state.questionIndex || 0);
          }
          if (state.timeRemaining != null) {
            setTimeRemaining(state.timeRemaining);
            gameStartTimeRef.current =
              Date.now() -
              (state.settings.timerDuration - state.timeRemaining) * 1000;
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

    // Socket.IO v4: "reconnect" fires on the Manager (socket.io), not the socket itself
    socket.io?.on("reconnect", handleReconnect);

    return () => {
      socket.io?.off("reconnect", handleReconnect);
    };
  }, [socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onPlayerJoined = ({ players, newPlayer }) => {
      setRoom((prev) => (prev ? { ...prev, players } : prev));
      setPendingRequests((prev) =>
        prev.filter(
          (req) =>
            !players.some((p) => p.id === req.id || p.name === newPlayer),
        ),
      );
      // Play for host and other participants; joiner already heard on joinApproved
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
        toast.error(
          message || "Failed to generate questions. Please try again.",
        );
      }
    };

    const onGameStarted = ({
      gameMode: gm,
      playerTeam: pt,
      totalQuestions: tq,
      timerDuration,
      question,
      questionIndex: qi,
      category,
      challengeMode: cm,
      language,
    }) => {
      // Store data and show VS screen first
      if (pt) setPlayerTeam(pt);
      setVsData({
        totalQuestions: tq,
        timerDuration,
        question,
        questionIndex: qi,
        category,
        challengeMode: cm,
        gameMode: gm || "classic",
        language,
      });
      setShowVS(true);
      setIsStarting(false);
    };

    const onNextQuestion = ({ question, questionIndex: qi }) => {
      // Practice: store pending, don't auto-advance until user clicks
      if (currentGameMode === "practice") {
        pendingNextQuestion.current = { question, questionIndex: qi };
        return;
      }
      setCurrentQuestion(question);
      setQuestionIndex(qi);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setIsSubmitting(false);
    };

    const onLeaderboardUpdate = ({ leaderboard: lb }) => {
      setLeaderboard(lb);
    };

    // timerSync: server sends a correction every 30s to fix drift
    const onTimerSync = ({ remaining }) => {
      setTimeRemaining(remaining);
    };

    const onPlayerFinished = ({
      score,
      rank,
      timeTaken,
      correctAnswers,
      totalQuestions,
    }) => {
      setFinishData({ score, rank, timeTaken, correctAnswers, totalQuestions });
      setUserFinished(true);
    };

    const onGameOver = ({
      leaderboard: lb,
      playerTeam: pt,
      teamScores: ts,
    }) => {
      setGameState("finished");
      setFinalResults(lb);
      setLeaderboard(lb);
      if (pt) setPlayerTeam(pt);
      if (ts) setTeamScores(ts);
    };

    const onPlayerEliminated = ({
      score,
      correctAnswers,
      totalQuestions: tq,
    }) => {
      setIsEliminated(true);
      setUserFinished(true);
      setFinishData(
        (prev) =>
          prev || {
            score,
            rank: null,
            correctAnswers,
            totalQuestions: tq,
            timeTaken: 0,
            eliminated: true,
          },
      );
    };

    const onPlayerEliminatedUpdate = ({ playerName }) => {
      toast.error(`${playerName} was eliminated! 💀`);
    };

    socket.on("playerJoined", onPlayerJoined);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("settingsUpdated", onSettingsUpdated);
    socket.on("newHost", onNewHost);
    socket.on("gameStatus", onGameStatus);
    socket.on("gameStarted", onGameStarted);
    socket.on("nextQuestion", onNextQuestion);
    socket.on("leaderboardUpdate", onLeaderboardUpdate);
    socket.on("timerSync", onTimerSync);
    socket.on("playerFinished", onPlayerFinished);
    socket.on("gameOver", onGameOver);
    socket.on("playerEliminated", onPlayerEliminated);
    socket.on("playerEliminatedUpdate", onPlayerEliminatedUpdate);

    // Join request notification (host)
    const onJoinRequest = ({ roomCode: rc, requester }) => {
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
    socket.on("joinRequest", onJoinRequest);

    return () => {
      socket.off("playerJoined", onPlayerJoined);
      socket.off("playerLeft", onPlayerLeft);
      socket.off("settingsUpdated", onSettingsUpdated);
      socket.off("newHost", onNewHost);
      socket.off("gameStatus", onGameStatus);
      socket.off("gameStarted", onGameStarted);
      socket.off("nextQuestion", onNextQuestion);
      socket.off("leaderboardUpdate", onLeaderboardUpdate);
      socket.off("timerSync", onTimerSync);
      socket.off("playerFinished", onPlayerFinished);
      socket.off("gameOver", onGameOver);
      socket.off("playerEliminated", onPlayerEliminated);
      socket.off("playerEliminatedUpdate", onPlayerEliminatedUpdate);
      socket.off("joinRequest", onJoinRequest);
    };
  }, [socket, user]);

  // Auto-join if roomCode in URL — wait for socket to be connected
  useEffect(() => {
    if (!paramCode || !socket || room) return;

    const attemptJoin = () => {
      handleJoinRoom(paramCode);
    };

    if (socket.connected) {
      attemptJoin();
    } else {
      socket.on("connect", attemptJoin);
      return () => socket.off("connect", attemptJoin);
    }
  }, [paramCode, socket]);

  // Auto-join from ?join= query param (from landing page join flow)
  useEffect(() => {
    const joinParam = searchParams.get("join");
    if (!joinParam || !socket || room) return;

    const attemptJoin = () => handleJoinRoom(joinParam);

    if (socket.connected) {
      attemptJoin();
    } else {
      socket.on("connect", attemptJoin);
      return () => socket.off("connect", attemptJoin);
    }
  }, [searchParams, socket]);

  // Auto-create room when arriving at /competition/lobby with no code or join param
  useEffect(() => {
    if (paramCode || searchParams.get("join") || room || autoCreateFired.current) return;
    if (!socket) return;

    const attemptCreate = () => {
      if (autoCreateFired.current) return;
      autoCreateFired.current = true;
      handleCreateRoom();
    };

    if (socket.connected) {
      attemptCreate();
    } else {
      socket.on("connect", attemptCreate);
      return () => socket.off("connect", attemptCreate);
    }
  }, [socket]);

  // Auto-spectate if ?spectate=true
  useEffect(() => {
    if (!isSpectator || !paramCode || !socket) return;

    const attemptSpectate = () => {
      socket.emit("spectateRoom", { roomCode: paramCode }, (response) => {
        if (response.success) {
          setSpectatorData(response.room);
          setRoom(response.room);
          setRoomCode(response.room.roomCode);
          setPendingRequests(response.room.pendingRequests || []);
          setLeaderboard(response.room.leaderboard || []);
          setTimeRemaining(response.room.timeRemaining || 0);
          setGameCategory(response.room.category);
          setGameState(
            response.room.status === "waiting"
              ? "lobby"
              : response.room.status === "active"
                ? "playing"
                : response.room.status,
          );
        } else {
          toast.error(response.message);
        }
      });
    };

    if (socket.connected) {
      attemptSpectate();
    } else {
      socket.on("connect", attemptSpectate);
      return () => socket.off("connect", attemptSpectate);
    }
  }, [isSpectator, paramCode, socket]);

  // Approve/Deny join request handlers
  const handleApproveJoin = (requesterId) => {
    socket?.emit("approveJoin", { roomCode, requesterId });
    setPendingRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  const handleDenyJoin = (requesterId) => {
    socket?.emit("denyJoin", { roomCode, requesterId });
    setPendingRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  const handleCreateRoom = useCallback(() => {
    if (!socket?.connected) return toast.error("Not connected");
    setIsConnecting(true);

    socket.emit("createRoom", (response) => {
      setIsConnecting(false);
      if (response.success) {
        setRoomCode(response.roomCode);
        setRoom({
          ...response.room,
          hostId: user._id,
        });
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
          else if (response.room.status === "ready") {
            newState = "ready";
            setReadyQuestionCount(response.room.totalQuestions || 0);
          } else if (response.room.status === "generating") {
            newState = "generating";
          }

          setGameState(newState);
          toast.success("Joined room!");
        } else {
          toast.error(response.message || "Failed to join room");
        }
      });
    },
    [socket, joinCode],
  );

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          toast.success("Copied!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textarea);
  };

  const handleCopyCode = () => {
    copyToClipboard(roomCode);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/competition/${roomCode}`;
    copyToClipboard(link);
  };

  const handleUpdateSettings = (keyOrObj, value) => {
    // Support both single key-value and object of multiple settings
    const updates =
      typeof keyOrObj === "string" ? { [keyOrObj]: value } : keyOrObj;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    socket?.emit("updateSettings", { roomCode, settings: updates });
  };

  const handleStartGame = () => {
    if (!socket?.connected) return;
    setIsStarting(true);
    socket.emit("startGame", { roomCode }, (response) => {
      if (!response.success) {
        toast.error(response.message);
        setIsStarting(false);
        if (
          response.message?.includes("not found") ||
          response.message?.includes("expired")
        ) {
          setRoom(null);
          setRoomCode("");
        }
      }
    });
  };

  const handleLaunchGame = () => {
    if (!socket?.connected) return;
    setIsStarting(true);
    socket.emit("launchGame", { roomCode }, (response) => {
      if (!response.success) {
        toast.error(response.message);
        setIsStarting(false);
      }
    });
  };

  const handleCancelGame = () => {
    if (!socket?.connected) return;
    socket.emit("cancelGame", { roomCode }, (response) => {
      if (!response.success) {
        toast.error(response.message);
      }
    });
  };

  const handlePlayAgain = useCallback(() => {
    if (!socket?.connected) return;
    socket.emit("createRoom", (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setRoom({ ...response.room, hostId: user._id });
        setGameState("lobby");
        setFinalResults(null);
        setLeaderboard([]);
        setCurrentQuestion(null);
        setUserFinished(false);
        setFinishData(null);
        setComboCount(0);
        confettiFired.current = false;
        setSettings({
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
        setIsEliminated(false);
        toast.success(`New room ${response.roomCode} created!`);
      } else {
        toast.error("Failed to create new room");
      }
    });
  }, [socket, user]);

  const handleSubmitAnswer = (answer) => {
    if (!socket?.connected || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedAnswer(answer);

    // Fallback: reset isSubmitting if socket callback never fires (network blip)
    const submitTimeout = setTimeout(() => setIsSubmitting(false), 10000);

    socket.emit(
      "submitAnswer",
      { roomCode, questionIndex, answer },
      (result) => {
        clearTimeout(submitTimeout);
        setAnswerResult(result);
        setIsSubmitting(false);

        // Combo tracking + sound effects
        if (result?.isCorrect) {
          setComboCount((prev) => prev + 1);
          playCorrectSound();
          setFeedbackResult({
            correct: true,
            xpGained: result.pointsEarned || 50,
          });
        } else {
          setComboCount(0);
          playWrongSound();
          setFeedbackResult({ correct: false });
        }
        setFeedbackKey((prev) => prev + 1);
      },
    );
  };

  const handleLeave = () => {
    socket?.emit("leaveRoom", { roomCode });
    navigate("/");
  };

  // Handler: VS screen finished → transition to playing
  const handleVSComplete = () => {
    if (!vsData) return;
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
    setIsEliminated(false);
    setTeamScores(null);
    setBlitzQuestionTime(15);
    pendingNextQuestion.current = null;
    setSelectedAnswer(null);
    setAnswerResult(null);
    setComboCount(0);
    setFeedbackResult(null);
    setVsData(null);

    // Start local timer — updated immediately via server sync below
    gameStartTimeRef.current = Date.now();
    gameDurationRef.current = capturedDuration;

    // Signal server that player has started (fixes Q0 speed bonus for VS screen delay)
    socket?.emit("playerStarted", { roomCode: capturedRoomCode });

    // Sync timer with server so client countdown is accurate from the start
    socket?.emit("getTimerSync", { roomCode: capturedRoomCode }, (res) => {
      if (res?.remaining !== undefined) {
        setTimeRemaining(res.remaining);
        gameStartTimeRef.current = Date.now() - ((capturedDuration - res.remaining) * 1000);
      }
    });
  };

  // ─── Confetti + victory sound — fire once when game finishes ──
  useEffect(() => {
    if (
      gameState !== "finished" ||
      !leaderboard.length ||
      confettiFired.current
    )
      return;
    confettiFired.current = true;

    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    const winnerId = sorted[0]?.id;

    setTimeout(() => {
      if (winnerId === user?._id) playVictorySound();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f97316", "#eab308", "#ef4444", "#22c55e"],
      });
      setTimeout(
        () =>
          confetti({
            particleCount: 80,
            spread: 120,
            origin: { y: 0.3, x: 0.3 },
          }),
        400,
      );
      setTimeout(
        () =>
          confetti({
            particleCount: 80,
            spread: 120,
            origin: { y: 0.3, x: 0.7 },
          }),
        700,
      );
    }, 300);
  }, [gameState, leaderboard, user]);

  // ─── Blitz: per-question 15s countdown, resets on new question ──
  useEffect(() => {
    if (currentGameMode !== "blitz" || gameState !== "playing" || userFinished)
      return;
    setBlitzQuestionTime(15);
    const interval = setInterval(
      () => setBlitzQuestionTime((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, [currentGameMode, gameState, userFinished, questionIndex]);

  // Practice: advance to next question on user request
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

  // ─── Timer warning beep — fires each second when ≤15s remain ──
  useEffect(() => {
    if (gameState !== "playing" || userFinished) return;
    if (
      timeRemaining > 0 &&
      timeRemaining <= 15 &&
      prevTimerRef.current !== timeRemaining
    ) {
      playTimerWarningSound();
    }
    prevTimerRef.current = timeRemaining;
  }, [timeRemaining, gameState, userFinished]);

  // ─── Client-side timer — compute remaining time locally ──
  useEffect(() => {
    // Only run the timer when game is actively playing
    if (
      gameState !== "playing" ||
      !gameStartTimeRef.current ||
      !gameDurationRef.current
    ) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000,
      );
      const remaining = gameDurationRef.current - elapsed;
      setTimeRemaining(Math.max(0, remaining));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameState]);

  // ─── RENDER: VS Screen ─────────────────────────────────
  if (showVS && room?.players) {
    return (
      <VSScreen
        players={room.players}
        settings={settings}
        onComplete={handleVSComplete}
      />
    );
  }

  // ─── RENDER: Spectator View ─────────────────────────────
  if (isSpectator && (spectatorData || gameState === "playing")) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-sm"
            >
              <ArrowLeft size={16} /> Leave
            </button>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <Eye size={14} className="text-purple-400" />
              <span className="text-sm text-purple-400 font-semibold">
                Spectating
              </span>
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold mb-1">
              {spectatorData?.topic ||
                (gameCategory === "programming"
                  ? "Coding Challenge"
                  : "General Quiz")}
            </h2>
            <p className="text-sm text-zinc-400">
              Hosted by {spectatorData?.hostName || "Unknown"} •{" "}
              {spectatorData?.difficulty || "medium"} difficulty
            </p>
          </div>

          {/* Timer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-center gap-2">
            <Timer size={16} className="text-orange-400" />
            <span
              className={`font-mono font-bold text-xl ${timeRemaining < 30 ? "text-red-400" : "text-white"}`}
            >
              {Math.floor(timeRemaining / 60)}:
              {String(timeRemaining % 60).padStart(2, "0")}
            </span>
            <span className="text-zinc-500 text-sm ml-2">remaining</span>
          </div>

          {/* Live Leaderboard */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" /> Live Standings
            </h3>
            <div className="space-y-2">
              {leaderboard.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">
                  Waiting for game to start...
                </p>
              )}
              {leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    i === 0
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "bg-zinc-800/50"
                  }`}
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs ${
                      i === 0
                        ? "bg-yellow-500 text-black"
                        : i === 1
                          ? "bg-zinc-400 text-black"
                          : i === 2
                            ? "bg-orange-700 text-white"
                            : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={p.avatarUrl || "/Avatar.png"}
                    className="w-8 h-8 rounded-full"
                    alt=""
                  />
                  <span className="flex-1 text-sm font-medium truncate flex items-center">
                    {p.name}
                    {activeSpeakers.has(p.id) && (
                      <VoiceSpeakerIndicator inline />
                    )}
                  </span>
                  <span className="font-bold text-orange-400">{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {gameState === "finished" && finalResults && (
            <div className="text-center">
              <Trophy size={36} className="text-yellow-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: No Room Yet (auto-creating / auto-joining) ──
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 size={36} className="animate-spin text-orange-400 mx-auto" />
          <p className="text-zinc-400 text-sm">
            {searchParams.get("join") ? "Joining room…" : "Creating room…"}
          </p>
        </motion.div>
      </div>
    );
  }
  // ─── RENDER: Generating ─────────────────────────────────
  if (gameState === "generating") {
    return <GeneratingScreen />;
  }

  // ─── RENDER: Ready (Wait for Host) ──────────────────────
  if (gameState === "ready") {
    return (
      <ReadyScreen
        isHost={isHost}
        readyQuestionCount={readyQuestionCount}
        isStarting={isStarting}
        onLaunch={handleLaunchGame}
        onCancel={handleCancelGame}
      />
    );
  }

  // ─── RENDER: Game Over ──────────────────────────────────
  if (gameState === "finished" && finalResults) {
    return (
      <GameOverScreen
        finalResults={finalResults}
        userId={user?._id}
        currentGameMode={currentGameMode}
        teamScores={teamScores}
        playerTeam={playerTeam}
        onHome={() => navigate("/")}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // ─── RENDER: Individual Results (Player Finished or Eliminated) ──────────────────
  if (gameState === "playing" && userFinished && finishData) {
    return (
      <ResultsScreen
        finishData={finishData}
        isEliminated={isEliminated}
        currentGameMode={currentGameMode}
        teamScores={teamScores}
        playerTeam={playerTeam}
        userId={user?._id}
        leaderboard={leaderboard}
        activeSpeakers={activeSpeakers}
        onHome={() => navigate("/")}
        onSpectate={() => {
          setUserFinished(false);
          setFinishData(null);
          toast(
            "Spectating... You'll see the final results when everyone finishes.",
            { icon: "👁️" },
          );
        }}
      />
    );
  }

  // ─── RENDER: Playing (Quiz / Scenario Mode) ───────────────────────
  if (
    gameState === "playing" &&
    (gameCategory === "general" || gameChallengeMode !== "classic")
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        {/* Floating Feedback */}
        <FloatingFeedback
          result={feedbackResult}
          comboCount={comboCount}
          triggerKey={feedbackKey}
        />

        {/* Animated Timer Bar */}
        <div className="fixed top-0 left-0 w-full h-2 z-30 bg-zinc-900/80 backdrop-blur-sm">
          <motion.div
            className={`h-full ${timeRemaining <= 30 ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"}`}
            animate={{
              width: `${(timeRemaining / (gameDurationRef.current || settings.timerDuration || 300)) * 100}%`,
            }}
            transition={{ ease: "linear", duration: 1 }}
          />
          {timeRemaining <= 30 && (
            <motion.div
              className="absolute inset-0 bg-red-500/20"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Combo Indicator */}
        {comboCount >= 2 && (
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-full shadow-2xl"
          >
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold text-sm">
              {comboCount}x Combo!
            </span>
          </motion.div>
        )}

        <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6 mt-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                variant="pixel"
                size="icon"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to leave the ongoing competition?",
                    )
                  )
                    handleLeave();
                }}
                className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-10 w-10 mr-1"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <BookOpen size={20} className="text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">
                    Challenge {questionIndex + 1}
                  </h2>
                  {currentGameMode === "practice" && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">
                      Practice
                    </span>
                  )}
                  {currentGameMode === "duel" && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                      ⚔️ Duel
                    </span>
                  )}
                  {currentGameMode === "team" && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        backgroundColor:
                          playerTeam?.[user?._id] === 0
                            ? "rgba(59,130,246,0.2)"
                            : "rgba(239,68,68,0.2)",
                        color:
                          playerTeam?.[user?._id] === 0 ? "#93c5fd" : "#fca5a5",
                      }}
                    >
                      {playerTeam?.[user?._id] === 0
                        ? "🔵 Team Blue"
                        : "🔴 Team Red"}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  Question {questionIndex + 1} of {totalQuestions}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Blitz per-question countdown */}
              {currentGameMode === "blitz" && (
                <motion.div
                  animate={
                    blitzQuestionTime <= 5
                      ? { scale: [1, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 0.3,
                    repeat: blitzQuestionTime <= 5 ? Infinity : 0,
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 border font-mono font-black text-2xl ${blitzQuestionTime <= 5 ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : blitzQuestionTime <= 10 ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-zinc-900 border-zinc-700 text-white"}`}
                >
                  <Zap
                    size={16}
                    className={
                      blitzQuestionTime <= 5
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  />
                  {blitzQuestionTime}s
                </motion.div>
              )}
              <motion.div
                animate={
                  timeRemaining > 0 && timeRemaining <= 15
                    ? { scale: [1, 1.07, 1] }
                    : { scale: 1 }
                }
                transition={{
                  duration: 0.35,
                  repeat:
                    timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0,
                  repeatDelay: 0.65,
                }}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 border transition-all ${
                  timeRemaining <= 60
                    ? "bg-red-500/10 border-red-500/40 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <Timer
                  size={18}
                  className={
                    timeRemaining <= 60 ? "text-red-400" : "text-orange-400"
                  }
                />
                <span
                  className={`font-mono font-bold text-lg ${
                    timeRemaining <= 60 ? "text-red-400" : "text-white"
                  }`}
                >
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, "0")}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col">
              <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
                {currentQuestion ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      className="flex-1 flex flex-col"
                    >
                      <InteractiveQuestion
                        question={currentQuestion}
                        onSubmit={handleSubmitAnswer}
                        result={answerResult}
                        isSubmitting={isSubmitting}
                        selectedAnswer={selectedAnswer}
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-zinc-500 gap-4">
                    <Loader2
                      className="animate-spin text-orange-500"
                      size={32}
                    />
                    <p>Loading validation data...</p>
                  </div>
                )}
              </div>
              {currentGameMode === "practice" &&
                answerResult &&
                !userFinished && (
                  <div className="px-6 pb-5 border-t border-zinc-800 pt-4">
                    <Button
                      onClick={handlePracticeNext}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl"
                    >
                      Next Question →
                    </Button>
                  </div>
                )}
            </Card>

            {/* Sidebar (Leaderboard / Duel) */}
            <div className="space-y-6">
              {currentGameMode === "duel" ? (
                <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-4 h-fit sticky top-6">
                  <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <span>⚔️</span> Duel
                  </h3>
                  {(() => {
                    const me = leaderboard.find((p) => p.id === user?._id);
                    const opp = leaderboard.find((p) => p.id !== user?._id);
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                          <span className="text-sm font-bold text-orange-400 truncate">
                            {me?.name || "You"}
                          </span>
                          <span className="text-xl font-black text-orange-400">
                            {me?.score ?? 0}
                          </span>
                        </div>
                        <div className="text-center text-xs text-zinc-600 font-bold uppercase tracking-widest">
                          vs
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-zinc-800/60 border border-zinc-700 rounded-xl p-3">
                          <span className="text-sm font-bold text-zinc-300 truncate">
                            {opp?.name || "Opponent"}
                          </span>
                          <span className="text-xl font-black text-zinc-300">
                            {opp?.score ?? 0}
                          </span>
                        </div>
                        {opp && (
                          <div className="text-[10px] text-zinc-500 text-center">
                            {opp.finished
                              ? "Opponent finished ✓"
                              : `Opponent on Q${(opp.currentQuestion || 0) + 1}`}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden h-fit sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Trophy size={14} className="text-yellow-400" /> Live
                      Standings
                    </h3>
                  </div>
                  <div className="p-2">
                    <AnimatedLeaderboard
                      leaderboard={leaderboard}
                      userId={user?._id}
                      totalQuestions={totalQuestions}
                      activeSpeakers={activeSpeakers}
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        <VoiceControls
          isInVoice={isInVoice}
          isMuted={isMuted}
          voiceUsers={voiceUsers}
          activeSpeakers={activeSpeakers}
          onJoin={joinVoice}
          onLeave={leaveVoice}
          onToggleMute={toggleMute}
        />
      </div>
    );
  }

  // ─── RENDER: Playing (Programming Classic Mode — Code Editor) ────
  if (
    gameState === "playing" &&
    gameCategory === "programming" &&
    gameChallengeMode === "classic"
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        {/* Floating Feedback */}
        <FloatingFeedback
          result={feedbackResult}
          comboCount={comboCount}
          triggerKey={feedbackKey}
        />

        {/* Animated Timer Bar */}
        <div className="fixed top-0 left-0 w-full h-1.5 z-30 bg-zinc-800">
          <motion.div
            className={`h-full ${timeRemaining <= 30 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-400"}`}
            animate={{
              width: `${(timeRemaining / (gameDurationRef.current || settings.timerDuration || 300)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {comboCount >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 rounded-full shadow-2xl"
          >
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold text-sm">
              {comboCount}x Combo!
            </span>
          </motion.div>
        )}

        <div className="max-w-[1400px] mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to leave the ongoing competition?",
                    )
                  )
                    handleLeave();
                }}
                className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-10 w-10 mr-1"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Code size={20} className="text-orange-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  Challenge {questionIndex + 1}
                </h2>
                <div className="text-xs text-zinc-500 font-mono">
                  {currentQuestion?.title || "Loading Problem..."}
                </div>
              </div>
            </div>
            <motion.div
              animate={
                timeRemaining > 0 && timeRemaining <= 15
                  ? { scale: [1, 1.07, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.35,
                repeat: timeRemaining > 0 && timeRemaining <= 15 ? Infinity : 0,
                repeatDelay: 0.65,
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 border transition-all ${
                timeRemaining <= 60
                  ? "bg-red-500/10 border-red-500/40 animate-pulse"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Timer
                size={16}
                className={
                  timeRemaining <= 60 ? "text-red-400" : "text-zinc-400"
                }
              />
              <span
                className={`font-mono font-bold text-lg ${
                  timeRemaining <= 60 ? "text-red-400" : "text-white"
                }`}
              >
                {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
            {/* Problem Description (Left Col) */}
            <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} /> Problem Statement
                </h3>
              </div>
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                <h3 className="font-bold text-lg mb-4 text-metallic">
                  {currentQuestion?.title}
                </h3>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-4">
                  {currentQuestion?.description}
                </div>
              </div>
            </Card>

            {/* Code Editor (Middle Cols) */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
              <ProgrammingEditor
                question={currentQuestion}
                language={settings.language}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                answerResult={answerResult}
              />
            </div>

            {/* Leaderboard (Right Col) */}
            <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-400" /> Live
                  Standings
                </h3>
              </div>
              <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
                <AnimatedLeaderboard
                  leaderboard={leaderboard}
                  userId={user?._id}
                  totalQuestions={totalQuestions}
                  activeSpeakers={activeSpeakers}
                />
              </div>
            </Card>
          </div>
        </div>
        <VoiceControls
          isInVoice={isInVoice}
          isMuted={isMuted}
          voiceUsers={voiceUsers}
          activeSpeakers={activeSpeakers}
          onJoin={joinVoice}
          onLeave={leaveVoice}
          onToggleMute={toggleMute}
        />
      </div>
    );
  }

  // ─── RENDER: Game Finished (Results) ─────────────────────────────
  if (gameState === "finished") {
    return (
      <PodiumScreen
        leaderboard={leaderboard}
        userId={user?._id}
        isHost={isHost}
        onHome={() => navigate("/")}
      />
    );
  }

  // ─── RENDER: Lobby (Waiting Room) ──────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <DottedGlowBackground
          color="rgba(255,255,255,0.45)"
          glowColor="rgba(234,88,12,0.95)"
          gap={28}
          radius={1.5}
          opacity={0.55}
          speedMin={0.3}
          speedMax={0.9}
          speedScale={0.85}
        />
        <div className="absolute top-0 left-1/3 w-[700px] h-[400px] bg-orange-600/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-red-800/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">
          <LobbyHeader isHost={isHost} onLeave={handleLeave} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            <div className="space-y-5 min-w-0">
              <RoomCodeCard
                roomCode={roomCode}
                copied={copied}
                onCopyCode={handleCopyCode}
                onCopyLink={handleCopyLink}
              />
              {isHost && (
                <MatchConfiguration
                  settings={settings}
                  isStarting={isStarting}
                  onUpdateSettings={handleUpdateSettings}
                  onStartGame={handleStartGame}
                />
              )}
              <JoinRequestsPanel
                pendingRequests={pendingRequests}
                onApprove={handleApproveJoin}
                onDeny={handleDenyJoin}
              />
            </div>
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <ParticipantsPanel room={room} userId={user?._id} />
              {!isHost && <GuestWaitingCard settings={settings} />}
            </div>
          </div>
        </div>
      </div>

      <VoiceControls
        isInVoice={isInVoice}
        isMuted={isMuted}
        voiceUsers={voiceUsers}
        activeSpeakers={activeSpeakers}
        onJoin={joinVoice}
        onLeave={leaveVoice}
        onToggleMute={toggleMute}
      />
    </div>
  );
};

// ─── PROGRAMMING EDITOR COMPONENT ─────────────────────────
import Editor from "@monaco-editor/react";
import { executeCode } from "../../lib/piston";

const ProgrammingEditor = ({
  question,
  language,
  onSubmit,
  isSubmitting,
  answerResult,
}) => {
  const [code, setCode] = useState(question?.starterCode || "");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(question?.starterCode || "");
    setOutput(null);
  }, [question]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);

    try {
      const codeToRun = code + "\n" + (question?.testCases || "");
      const result = await executeCode(language, codeToRun);

      let displayOutput = result.output || "";
      let testResult = null;

      if (displayOutput) {
        const lines = displayOutput.split("\n");
        const jsonLineIdx = lines.findIndex((l) =>
          l.trim().startsWith('{"success":'),
        );
        if (jsonLineIdx !== -1) {
          try {
            testResult = JSON.parse(lines[jsonLineIdx].trim());
            displayOutput = lines
              .filter((_, i) => i !== jsonLineIdx)
              .join("\n")
              .trim();
          } catch (e) {}
        }
      }

      setOutput({
        text: displayOutput,
        error: result.error || null,
        testResult,
      });

      // If all tests passed, submit to server
      if (testResult?.success) {
        onSubmit({ allPassed: true, code });
      }
    } catch (err) {
      setOutput({ text: "", error: err.message, testResult: null });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
        <span className="text-xs text-zinc-500 uppercase font-semibold flex items-center gap-2">
          <Code size={14} className="text-zinc-600" />
          {language} Editor
        </span>
        <Button
          size="sm"
          onClick={handleRun}
          disabled={isRunning || isSubmitting}
          className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white h-8 text-xs font-semibold px-4 transition-all"
        >
          {isRunning ? (
            <Loader2 size={13} className="animate-spin mr-2" />
          ) : (
            <Play size={13} fill="currentColor" className="mr-2" />
          )}
          Run & Test
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
            fontFamily: "monospace",
          }}
        />
      </div>
      {output && (
        <div className="border-t border-zinc-800 p-3 bg-zinc-950 max-h-40 overflow-y-auto custom-scrollbar shrink-0">
          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
            Output Console
          </div>
          {output.text && (
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono">
              {output.text}
            </pre>
          )}
          {output.error && (
            <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono mt-1">
              {output.error}
            </pre>
          )}
          {output.testResult && (
            <div
              className={`mt-2 text-xs font-semibold p-2 rounded border ${
                output.testResult.success
                  ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}
            >
              {output.testResult.success
                ? "✓ All tests passed successfully!"
                : `✗ ${output.testResult.message || "Tests failed"}`}
            </div>
          )}
          {answerResult && (
            <div className="mt-2 text-xs font-semibold text-green-400 p-2 rounded bg-green-500/10 border border-green-500/20">
              +{answerResult.pointsEarned} XP Earned!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CompetitionLobby;
