import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUserStats } from "../../features/auth/authSlice";
import { store } from "@/store/store";
import { emit as emitGamification } from "@/lib/gamificationBus";
import { connectSocket, disconnectSocket, getSocket } from "../../lib/socket";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound, playPlayerJoinedSound, playLobbyMusic, stopLobbyMusic, muteLobbyMusic, unmuteLobbyMusic } from "@/lib/sound";
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
import VSScreen from "../../components/competition/VSScreen";
import SpectatorView from "../../components/competition/SpectatorView";
import GamePlayView from "../../components/competition/GamePlayView";
import ClassicPlayView from "../../components/competition/ClassicPlayView";
import MatchSnapshot from "../../components/competition/MatchSnapshot";
import useGameActivityFeed from "@/hooks/useGameActivityFeed";
import { resetFeedbackOrchestrator } from "@/lib/feedbackOrchestrator";
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
  const dispatch = useDispatch();

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
  const [isDraw, setIsDraw] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const confettiFired = useRef(false);
  const prevTimerRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const gameDurationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const roomCodeRef = useRef("");
  const autoCreateFired = useRef(false);
  const currentGameModeRef = useRef("classic");

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
  const [isReady, setIsReady] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [isPowerQuestion, setIsPowerQuestion] = useState(false);
  const [gameEvents, setGameEvents] = useState([]);
  const [rematchVotes, setRematchVotes] = useState({
    voteCount: 0,
    totalPlayers: 0,
    voterNames: [],
  });

  const isHost = room?.hostId === user?._id;

  // Live activity feed — derives kill-feed-style events from leaderboard diffs
  const { events: activityEvents, pushExternal: pushActivity } =
    useGameActivityFeed({
      leaderboard,
      userId: user?._id,
      isPowerQuestion,
      questionIndex,
      totalQuestions,
      gameState,
    });
  const pushActivityRef = useRef(pushActivity);
  useEffect(() => {
    pushActivityRef.current = pushActivity;
  }, [pushActivity]);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  useEffect(() => {
    currentGameModeRef.current = currentGameMode;
  }, [currentGameMode]);

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
        if (state.settings) {
          setSettings(state.settings);
          if (state.settings.gameMode) {
            setCurrentGameMode(state.settings.gameMode);
            currentGameModeRef.current = state.settings.gameMode;
          }
          if (state.settings.category) setGameCategory(state.settings.category);
          if (state.settings.challengeMode)
            setGameChallengeMode(state.settings.challengeMode);
        }

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
      isPower,
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
        isPower: isPower || false,
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
      isDraw: draw,
    }) => {
      setGameState("finished");
      setFinalResults(lb);
      setLeaderboard(lb);
      if (pt) setPlayerTeam(pt);
      if (ts) setTeamScores(ts);
      if (draw) setIsDraw(true);
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

    const onPlayerEliminatedUpdate = ({ playerId, playerName }) => {
      toast.error(`${playerName} was eliminated! 💀`);
      setGameEvents((prev) => [
        ...prev.slice(-4),
        { type: "eliminated", name: playerName, time: Date.now() },
      ]);
      pushActivityRef.current?.({
        type: "eliminated",
        name: playerName,
        playerId,
        isMe: playerId === user?._id,
      });
    };

    // B-08: Handle player finishing so other players get immediate feedback
    const onPlayerFinishedUpdate = ({ playerId, playerName }) => {
      toast.success(`${playerName} finished! 🏁`);
      setGameEvents((prev) => [
        ...prev.slice(-4),
        { type: "finished", name: playerName, time: Date.now() },
      ]);
      pushActivityRef.current?.({
        type: "finished",
        name: playerName,
        playerId,
        isMe: playerId === user?._id,
      });
    };

    // G-08: Rematch vote updates
    const onRematchUpdate = (data) => {
      setRematchVotes(data);
    };

    // G-06: Handle room reset — everyone goes back to lobby with fresh state
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

    // G-04: Track per-player ready state
    const onPlayerReadyUpdate = ({
      playerId,
      ready,
      readyCount,
      totalPlayers,
    }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, ready } : p,
          ),
          readyCount,
          totalPlayers,
        };
      });
    };

    const onUserXPUpdated = ({
      xpGained,
      leveledUp,
      rankedUp,
      newBadges,
      user: updatedUser,
    }) => {
      dispatch(updateUserStats(updatedUser));
      if (xpGained > 0) emitGamification({ type: "xp", amount: xpGained });
      if (leveledUp)
        emitGamification({ type: "levelUp", level: updatedUser.level });
      if (rankedUp)
        emitGamification({ type: "rankUp", league: updatedUser.league });
      (newBadges || []).forEach((b) =>
        emitGamification({ type: "badge", ...b }),
      );
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
    socket.on("playerFinishedUpdate", onPlayerFinishedUpdate);
    socket.on("roomReset", onRoomReset);
    socket.on("playerReadyUpdate", onPlayerReadyUpdate);
    socket.on("rematchUpdate", onRematchUpdate);
    socket.on("userXPUpdated", onUserXPUpdated);

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
      socket.off("playerFinishedUpdate", onPlayerFinishedUpdate);
      socket.off("roomReset", onRoomReset);
      socket.off("playerReadyUpdate", onPlayerReadyUpdate);
      socket.off("rematchUpdate", onRematchUpdate);
      socket.off("joinRequest", onJoinRequest);
      socket.off("userXPUpdated", onUserXPUpdated);
    };
  }, [socket, user, dispatch]);

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
    if (
      paramCode ||
      searchParams.get("join") ||
      room ||
      autoCreateFired.current
    )
      return;
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
          const timeLeft = response.room.timeRemaining || 0;
          setTimeRemaining(timeLeft);
          setGameCategory(response.room.category);
          setGameState(
            response.room.status === "waiting"
              ? "lobby"
              : response.room.status === "active"
                ? "playing"
                : response.room.status,
          );
          // B-11: Fix spectator timer — start local countdown from the real elapsed time
          if (
            response.room.status === "active" &&
            response.room.timerDuration
          ) {
            gameDurationRef.current = response.room.timerDuration;
            gameStartTimeRef.current =
              Date.now() - (response.room.timerDuration - timeLeft) * 1000;
          }
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
    const playerCount = room?.players?.length || 0;
    const modeMinPlayers = { duel: 2, survival: 2, team: 2 };
    const modeLabels = {
      duel: "Duel",
      survival: "Survival",
      team: "Team Battle",
    };
    const required = modeMinPlayers[settings.gameMode];
    if (required && playerCount < required) {
      return toast.error(
        `${modeLabels[settings.gameMode]} mode requires at least ${required} players`,
      );
    }
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
    stopLobbyMusic();
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

    if (roomCode) {
      socket.emit("resetRoom", { roomCode }, (response) => {
        if (response?.success) return;
        createNewRoom();
      });
    } else {
      createNewRoom();
    }

    function createNewRoom() {
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
          setIsEliminated(false);
          setTeamScores(null);
          setPlayerTeam(null);
          toast.success(`New room ${response.roomCode} created!`);
        } else {
          toast.error("Failed to create new room");
        }
      });
    }
  }, [socket, user, roomCode]);

  const handleSubmitAnswer = (answer) => {
    if (!socket?.connected || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedAnswer(answer);
    const prevCombo = comboCount;

    // Fallback: reset isSubmitting if socket callback never fires (network blip)
    const submitTimeout = setTimeout(() => setIsSubmitting(false), 10000);

    socket.emit(
      "submitAnswer",
      { roomCode, questionIndex, answer },
      (result) => {
        clearTimeout(submitTimeout);
        setAnswerResult(result);
        setIsSubmitting(false);

        // Combo tracking + sound effects — use server's authoritative combo count
        if (result?.comboCount !== undefined) setComboCount(result.comboCount);
        if (result?.isCorrect) {
          playCorrectSound();
          setFeedbackResult({
            correct: true,
            xpGained: result.pointsEarned || 50,
          });
        } else {
          playWrongSound();
          setFeedbackResult({
            correct: false,
            streakBroken: prevCombo >= 3 ? prevCombo : 0,
          });
        }
        setFeedbackKey((prev) => prev + 1);
      },
    );
  };

  const handleLeave = () => {
    socket?.emit("leaveRoom", { roomCode });
    navigate("/");
  };

  const handleRequestRematch = useCallback(() => {
    if (!socket?.connected || !roomCode) return;
    socket.emit("requestRematch", { roomCode }, (res) => {
      if (!res?.success) toast.error("Rematch request failed");
    });
  }, [socket, roomCode]);

  // Handler: VS screen finished → transition to playing
  const handleVSComplete = () => {
    if (!vsData) return;
    // Clean slate for the new match — drop any stale banners/sounds queued
    // from the previous match (e.g. play-again flow).
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
    setIsEliminated(false);
    setTeamScores(null);
    setBlitzQuestionTime(15);
    pendingNextQuestion.current = null;
    setSelectedAnswer(null);
    setAnswerResult(null);
    setComboCount(0);
    setFeedbackResult(null);
    setIsPowerQuestion(!!vsData.isPower);
    setGameEvents([]);
    setRematchVotes({ voteCount: 0, totalPlayers: 0, voterNames: [] });
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
        gameStartTimeRef.current =
          Date.now() - (capturedDuration - res.remaining) * 1000;
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
    const topTied = sorted.length >= 2 && sorted[0].score === sorted[1].score;

    setTimeout(() => {
      if (winnerId === user?._id && !topTied) playVictorySound();
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

  // ─── Lobby background music ─────────────────────────────
  useEffect(() => {
    playLobbyMusic();
    return () => stopLobbyMusic();
  }, []);

  useEffect(() => {
    if (gameState === "playing" || gameState === "finished") {
      stopLobbyMusic();
    }
  }, [gameState]);

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

  // G-15: Keyboard shortcuts — 1/2/3/4 for MCQ options
  useEffect(() => {
    if (gameState !== "playing" || userFinished || !currentQuestion) return;
    const handleKeyDown = (e) => {
      if (isSubmitting || answerResult) return;
      const choices = currentQuestion.choices;
      if (!Array.isArray(choices) || choices.length === 0) return;
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < choices.length) {
        handleSubmitAnswer(choices[idx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, userFinished, currentQuestion, isSubmitting, answerResult]);

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

  if (showVS && room?.players) {
    return (
      <VSScreen
        players={room.players}
        settings={settings}
        onComplete={handleVSComplete}
      />
    );
  }

  if (isSpectator && (spectatorData || gameState === "playing")) {
    return (
      <SpectatorView
        spectatorData={spectatorData}
        gameState={gameState}
        finalResults={finalResults}
        leaderboard={leaderboard}
        timeRemaining={timeRemaining}
        gameCategory={gameCategory}
        navigate={navigate}
      />
    );
  }

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

  if (gameState === "generating") {
    return <GeneratingScreen />;
  }

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
        isDraw={isDraw}
        userId={user?._id}
        currentGameMode={currentGameMode}
        teamScores={teamScores}
        playerTeam={playerTeam}
        totalQuestions={totalQuestions}
        rematchVotes={rematchVotes}
        onRequestRematch={handleRequestRematch}
        onHome={() => {
          if (roomCode) socket?.emit("leaveRoom", { roomCode });
          window.location.href = "/competition/lobby";
        }}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

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
        onHome={() => {
          if (roomCode) socket?.emit("leaveRoom", { roomCode });
          window.location.href = "/competition/lobby";
        }}
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

  if (
    gameState === "playing" &&
    (gameCategory === "general" || gameChallengeMode !== "classic")
  ) {
    return (
      <GamePlayView
        feedbackResult={feedbackResult}
        comboCount={comboCount}
        feedbackKey={feedbackKey}
        timeRemaining={timeRemaining}
        gameDuration={gameDurationRef.current || settings.timerDuration || 300}
        questionIndex={questionIndex}
        currentGameMode={currentGameMode}
        playerTeam={playerTeam}
        userId={user?._id}
        totalQuestions={totalQuestions}
        blitzQuestionTime={blitzQuestionTime}
        spectatorCount={spectatorCount}
        handleLeave={handleLeave}
        isPowerQuestion={isPowerQuestion}
        currentQuestion={currentQuestion}
        answerResult={answerResult}
        isSubmitting={isSubmitting}
        selectedAnswer={selectedAnswer}
        handleSubmitAnswer={handleSubmitAnswer}
        handlePracticeNext={handlePracticeNext}
        userFinished={userFinished}
        leaderboard={leaderboard}
        gameEvents={gameEvents}
        activityEvents={activityEvents}
      />
    );
  }

  // ─── RENDER: Playing (Programming Classic Mode — Code Editor) ────
  if (
    gameState === "playing" &&
    gameCategory === "programming" &&
    gameChallengeMode === "classic"
  ) {
    return (
      <ClassicPlayView
        feedbackResult={feedbackResult}
        comboCount={comboCount}
        feedbackKey={feedbackKey}
        timeRemaining={timeRemaining}
        gameDuration={gameDurationRef.current || settings.timerDuration || 300}
        questionIndex={questionIndex}
        currentQuestion={currentQuestion}
        handleLeave={handleLeave}
        spectatorCount={spectatorCount}
        isPowerQuestion={isPowerQuestion}
        language={settings.language}
        handleSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        answerResult={answerResult}
        leaderboard={leaderboard}
        gameEvents={gameEvents}
        userId={user?._id}
        totalQuestions={totalQuestions}
        activityEvents={activityEvents}
      />
    );
  }

  if (gameState === "finished") {
    return (
      <PodiumScreen
        leaderboard={leaderboard}
        isDraw={isDraw}
        userId={user?._id}
        isHost={isHost}
        rematchVotes={rematchVotes}
        onRequestRematch={handleRequestRematch}
        onHome={() => navigate("/competition/lobby")}
        onPlayAgain={isHost ? handlePlayAgain : undefined}
      />
    );
  }

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
          <LobbyHeader
            isHost={isHost}
            onLeave={handleLeave}
            isMusicMuted={isMusicMuted}
            onToggleMusic={() => {
              setIsMusicMuted((prev) => {
                const next = !prev;
                next ? muteLobbyMusic() : unmuteLobbyMusic();
                return next;
              });
            }}
          />
          {isHost ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
              <div className="space-y-5 min-w-0 flex flex-col">
                <RoomCodeCard
                  roomCode={roomCode}
                  copied={copied}
                  onCopyCode={handleCopyCode}
                  onCopyLink={handleCopyLink}
                />
                <MatchConfiguration
                  settings={settings}
                  isStarting={isStarting}
                  onUpdateSettings={handleUpdateSettings}
                  onStartGame={handleStartGame}
                  playerCount={room?.players?.length || 0}
                />
                <JoinRequestsPanel
                  pendingRequests={pendingRequests}
                  onApprove={handleApproveJoin}
                  onDeny={handleDenyJoin}
                />
              </div>
              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                <ParticipantsPanel room={room} userId={user?._id} />
                <MatchSnapshot settings={settings} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <RoomCodeCard
                roomCode={roomCode}
                copied={copied}
                onCopyCode={handleCopyCode}
                onCopyLink={handleCopyLink}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <GuestWaitingCard
                  settings={settings}
                  isReady={isReady}
                  onToggleReady={handleToggleReady}
                  readyCount={room?.readyCount}
                  totalPlayers={room?.players?.length}
                />
                <ParticipantsPanel room={room} userId={user?._id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionLobby;
