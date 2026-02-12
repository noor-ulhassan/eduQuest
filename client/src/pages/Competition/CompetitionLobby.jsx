import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "../../lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Copy,
  Check,
  Crown,
  Settings,
  Play,
  Loader2,
  ArrowLeft,
  Swords,
  BookOpen,
  Code,
  Timer,
  Trophy,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

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
  const [gameCategory, setGameCategory] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // Spectator & join request state
  const isSpectator = searchParams.get("spectate") === "true";
  const [spectatorData, setSpectatorData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const isHost = room?.hostId === user?._id;

  console.log("Render Debug:", {
    isHost,
    userId: user?._id,
    hostId: room?.hostId,
    pendingCount: pendingRequests.length,
    pendingRequests,
  });

  // Auto-rejoin on reconnection to update socket ID on server
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log("Socket connected/reconnected, checking room:", roomCode);
      if (roomCode) {
        socket.emit("joinRoom", { roomCode }, (res) => {
          if (res.success) {
            console.log("Re-joined room successfully:", res.room);
            setRoom(res.room);
            setPendingRequests(res.room.pendingRequests || []);
          }
        });
      }
    };

    socket.on("connect", onConnect);

    // Also try immediately if already connected but maybe lost room state on server restart
    if (socket.connected && roomCode) {
      // Optional: could ping server here
    }

    return () => socket.off("connect", onConnect);
  }, [socket, roomCode]);

  // Connect socket on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const s = connectSocket(token);
    setSocket(s);

    return () => {
      const sock = getSocket();
      if (sock && roomCode) {
        sock.emit("leaveRoom", { roomCode });
      }
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onPlayerJoined = ({ players, newPlayer }) => {
      setRoom((prev) => (prev ? { ...prev, players } : prev));
      // Remove the joined player from pending requests if they were there
      setPendingRequests((prev) =>
        prev.filter(
          (req) =>
            !players.some((p) => p.id === req.id || p.name === newPlayer), // Match by ID or Name safely
        ),
      );
      toast(`${newPlayer} joined the room!`);
    };

    const onPlayerLeft = ({ players, leftPlayer }) => {
      setRoom((prev) => (prev ? { ...prev, players } : prev));
      if (leftPlayer) toast(`${leftPlayer} left the room`, { icon: "👋" });
    };

    const onSettingsUpdated = (newSettings) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    const onNewHost = ({ hostId }) => {
      setRoom((prev) => (prev ? { ...prev, hostId } : prev));
      if (hostId === user?._id) toast.success("You are now the host!");
    };

    const onGameStatus = ({ status, totalQuestions: tq }) => {
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
      }
    };

    const onGameStarted = ({
      totalQuestions: tq,
      timerDuration,
      question,
      questionIndex: qi,
      category,
      language,
    }) => {
      setGameState("playing");
      setTotalQuestions(tq);
      setTimeRemaining(timerDuration);
      setCurrentQuestion(question);
      setQuestionIndex(qi);
      setGameCategory(category);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setIsStarting(false);
    };

    const onNextQuestion = ({ question, questionIndex: qi }) => {
      setCurrentQuestion(question);
      setQuestionIndex(qi);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setIsSubmitting(false);
    };

    const onLeaderboardUpdate = ({ leaderboard: lb }) => {
      setLeaderboard(lb);
    };

    const onTimerUpdate = ({ remaining }) => {
      setTimeRemaining(remaining);
    };

    const onPlayerFinished = ({ score }) => {
      toast.success(`You finished! Score: ${score}`);
    };

    const onGameOver = ({ leaderboard: lb }) => {
      setGameState("finished");
      setFinalResults(lb);
      setLeaderboard(lb);
    };

    socket.on("playerJoined", onPlayerJoined);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("settingsUpdated", onSettingsUpdated);
    socket.on("newHost", onNewHost);
    socket.on("gameStatus", onGameStatus);
    socket.on("gameStarted", onGameStarted);
    socket.on("nextQuestion", onNextQuestion);
    socket.on("leaderboardUpdate", onLeaderboardUpdate);
    socket.on("timerUpdate", onTimerUpdate);
    socket.on("playerFinished", onPlayerFinished);
    socket.on("gameOver", onGameOver);

    // Join request notification (host)
    const onJoinRequest = ({ roomCode: rc, requester }) => {
      console.log("Received join request:", requester);
      setPendingRequests((prev) => {
        if (prev.find((r) => r.id === requester.id)) return prev;
        return [...prev, requester];
      });
      // Also update room state to keep it consistent
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
      socket.off("timerUpdate", onTimerUpdate);
      socket.off("playerFinished", onPlayerFinished);
      socket.off("gameOver", onGameOver);
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
            setReadyQuestionCount(response.room.questions?.length || 0);
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

  const handleCopyCode = () => {
    const link = `${window.location.origin}/competition/${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    socket?.emit("updateSettings", { roomCode, settings: { [key]: value } });
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

  const handleSubmitAnswer = (answer) => {
    if (!socket?.connected || isSubmitting) return;
    setIsSubmitting(true);
    setSelectedAnswer(answer);

    socket.emit(
      "submitAnswer",
      { roomCode, questionIndex, answer },
      (result) => {
        setAnswerResult(result);
        setIsSubmitting(false);
      },
    );
  };

  const handleLeave = () => {
    socket?.emit("leaveRoom", { roomCode });
    navigate("/");
  };

  // ─── RENDER: Spectator View ─────────────────────────────
  if (isSpectator && (spectatorData || gameState === "playing")) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 mt-20">
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
                  <span className="flex-1 text-sm font-medium truncate">
                    {p.name}
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

  // ─── RENDER: No Room Yet (Create/Join) ──────────────────
  if (!room) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full space-y-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 mb-6">
              <Swords size={36} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Competition Arena
            </h1>
            <p className="text-zinc-400 mt-2">
              Challenge your friends in coding battles & quizzes
            </p>
          </div>

          {/* Create Room */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Crown size={18} className="text-yellow-400" />
              Create a Room
            </h2>
            <p className="text-sm text-zinc-400">
              Create a room and share the code with your friends
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isConnecting}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Swords size={18} />
              )}
              Create Room
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-500 text-xs uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Join Room */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Join a Room
            </h2>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[.3em] uppercase placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-orange-500 transition"
              />
              <button
                onClick={() => handleJoinRoom()}
                disabled={isConnecting || !joinCode.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm flex items-center justify-center gap-1 transition"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Generating ─────────────────────────────────
  if (gameState === "generating") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto relative overflow-hidden">
            <Loader2
              size={32}
              className="text-orange-500 animate-spin relative z-10"
            />
            <div className="absolute inset-0 bg-orange-500/20 blur-xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Crafting Questions...</h2>
          <p className="text-zinc-400">Gemini AI is preparing the challenge</p>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Ready (Wait for Host) ──────────────────────
  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto text-green-500">
            <Check size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Questions Ready!
            </h2>
            <p className="text-zinc-400">
              {readyQuestionCount} questions generated successfully.
            </p>
          </div>

          {isHost ? (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={handleCancelGame}
                className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchGame}
                disabled={isStarting}
                className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
                Start Now
              </button>
            </div>
          ) : (
            <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center justify-center gap-3 text-zinc-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Waiting for host to launch...</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Game Over ──────────────────────────────────
  if (gameState === "finished" && finalResults) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full space-y-6"
        >
          <div className="text-center">
            <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Game Over!</h1>
            <p className="text-zinc-400 mt-1">Final Standings</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {finalResults.map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 border-b border-zinc-800 last:border-0 ${
                  i === 0 ? "bg-yellow-500/5" : ""
                }`}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
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
                  src={player.avatarUrl || "/Avatar.png"}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">
                    {player.name}
                    {player.id === user?._id && (
                      <span className="text-xs text-zinc-500 ml-2">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {player.currentQuestion} questions answered
                  </p>
                </div>
                <span className="font-bold text-lg text-orange-400">
                  {player.score}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
            >
              Home
            </button>
            <button
              onClick={() => {
                setGameState("lobby");
                setRoom((prev) => ({ ...prev, status: "waiting" }));
                setFinalResults(null);
                setLeaderboard([]);
                setCurrentQuestion(null);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold transition"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Generating Questions ───────────────────────
  if (gameState === "generating") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 size={48} className="animate-spin text-orange-400 mx-auto" />
          <h2 className="text-xl font-semibold">Generating Questions...</h2>
          <p className="text-zinc-400 text-sm">
            AI is crafting your competition. Hold tight!
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Playing (Quiz Mode) ───────────────────────
  if (gameState === "playing" && gameCategory === "general") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-orange-400" />
              <span className="font-semibold">
                Question {questionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <Timer size={16} className="text-orange-400" />
              <span
                className={`font-mono font-bold ${
                  timeRemaining < 30 ? "text-red-400" : "text-white"
                }`}
              >
                {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                key={questionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
              >
                <h2 className="text-xl font-semibold mb-6">
                  {currentQuestion?.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion?.options?.map((option, i) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = answerResult?.correctAnswer === option;
                    const showResult = answerResult !== null;

                    return (
                      <button
                        key={i}
                        onClick={() =>
                          !answerResult && handleSubmitAnswer(option)
                        }
                        disabled={!!answerResult || isSubmitting}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          showResult && isCorrect
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : showResult && isSelected && !isCorrect
                              ? "border-red-500 bg-red-500/10 text-red-400"
                              : isSelected
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
                        } disabled:cursor-default`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + i)}.{" "}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {answerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-xl border ${
                      answerResult.isCorrect
                        ? "bg-green-500/5 border-green-500/20 text-green-400"
                        : "bg-red-500/5 border-red-500/20 text-red-400"
                    }`}
                  >
                    <p className="font-semibold">
                      {answerResult.isCorrect
                        ? `✓ Correct! +${answerResult.pointsEarned} pts`
                        : "✗ Incorrect"}
                    </p>
                    {answerResult.explanation && (
                      <p className="text-sm text-zinc-400 mt-1">
                        {answerResult.explanation}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Live Leaderboard */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-fit">
              <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" /> Live Standings
              </h3>
              <div className="space-y-2">
                {leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      p.id === user?._id
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "bg-zinc-800/50"
                    }`}
                  >
                    <span className="w-5 text-xs font-bold text-zinc-500">
                      #{i + 1}
                    </span>
                    <img
                      src={p.avatarUrl || "/Avatar.png"}
                      className="w-6 h-6 rounded-full"
                      alt=""
                    />
                    <span className="text-sm flex-1 truncate">{p.name}</span>
                    <span className="text-xs font-bold text-orange-400">
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Playing (Programming Mode) ────────────────
  if (gameState === "playing" && gameCategory === "programming") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Code size={20} className="text-green-400" />
              <span className="font-semibold">
                Challenge {questionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <Timer size={16} className="text-orange-400" />
              <span
                className={`font-mono font-bold ${
                  timeRemaining < 60 ? "text-red-400" : "text-white"
                }`}
              >
                {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Problem Description */}
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-[70vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-3">
                {currentQuestion?.title}
              </h3>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {currentQuestion?.description}
              </div>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-[70vh] flex flex-col">
              <ProgrammingEditor
                question={currentQuestion}
                language={settings.language}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                answerResult={answerResult}
              />
            </div>

            {/* Leaderboard */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-fit">
              <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" /> Live Standings
              </h3>
              <div className="space-y-2">
                {leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      p.id === user?._id
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "bg-zinc-800/50"
                    }`}
                  >
                    <span className="w-5 text-xs font-bold text-zinc-500">
                      #{i + 1}
                    </span>
                    <img
                      src={p.avatarUrl || "/Avatar.png"}
                      className="w-6 h-6 rounded-full"
                      alt=""
                    />
                    <span className="text-sm flex-1 truncate">{p.name}</span>
                    <span className="text-xs font-bold text-orange-400">
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Lobby (Waiting Room) ──────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} /> Leave
          </button>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
            <span className="text-sm text-zinc-400">Room:</span>
            <span className="font-mono font-bold text-orange-400 tracking-wider text-lg">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:bg-zinc-800 rounded transition"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} />
            Players ({room?.players?.length || 0}/20)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {room?.players?.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
                >
                  <div className="relative">
                    <img
                      src={player.avatarUrl || "/Avatar.png"}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {player.id === room.hostId && (
                      <Crown
                        size={12}
                        className="absolute -top-1 -right-1 text-yellow-400"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {player.name}
                    </p>
                    {player.id === room.hostId && (
                      <p className="text-[10px] text-yellow-500">Host</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Invite / Share Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Copy size={16} />
            Invite Friends
          </h3>
          <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 mb-3">
            <span className="text-zinc-500 text-sm">Room Code:</span>
            <span className="font-mono font-bold text-2xl text-orange-400 tracking-[.4em] flex-1">
              {roomCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-400" />
                <span className="text-green-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-zinc-400" />
                Copy Invite Link
              </>
            )}
          </button>
        </div>

        {/* Pending Join Requests (Host Only) */}
        {isHost && pendingRequests.length > 0 && (
          <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              🔔 Join Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
                >
                  <img
                    src={req.avatarUrl || "/Avatar.png"}
                    alt={req.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="flex-1 font-medium text-sm">{req.name}</span>
                  <button
                    onClick={() => handleApproveJoin(req.id)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-semibold transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDenyJoin(req.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-semibold transition"
                  >
                    Deny
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings (Host Only) */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Settings size={16} />
              Game Settings
            </h3>

            {/* Category */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    handleUpdateSettings("category", "programming")
                  }
                  className={`p-4 rounded-xl border text-center transition-all ${
                    settings.category === "programming"
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <Code size={24} className="mx-auto mb-2" />
                  <span className="text-sm font-semibold">Programming</span>
                </button>
                <button
                  onClick={() => handleUpdateSettings("category", "general")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    settings.category === "general"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <BookOpen size={24} className="mx-auto mb-2" />
                  <span className="text-sm font-semibold">
                    General Knowledge
                  </span>
                </button>
              </div>
            </div>

            {/* Topic & Description (both categories) */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">
                  Topic{" "}
                  {settings.category === "programming" && (
                    <span className="text-zinc-600">(Optional)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={settings.topic}
                  onChange={(e) =>
                    handleUpdateSettings("topic", e.target.value)
                  }
                  placeholder={
                    settings.category === "programming"
                      ? "e.g. Arrays, Linked Lists, Dynamic Programming"
                      : "e.g. React Hooks, World History, Machine Learning"
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">
                  Description{" "}
                  {settings.category === "programming" && (
                    <span className="text-zinc-600">(Optional)</span>
                  )}
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    handleUpdateSettings("description", e.target.value)
                  }
                  placeholder={
                    settings.category === "programming"
                      ? "e.g. Focus on recursion and sorting algorithms..."
                      : "Describe what the questions should be about..."
                  }
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>

            {/* Language (Programming only) */}
            {settings.category === "programming" && (
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">
                  Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["javascript", "python", "java"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleUpdateSettings("language", lang)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all capitalize ${
                        settings.language === lang
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleUpdateSettings("difficulty", d)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all capitalize ${
                      settings.difficulty === d
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Count */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">
                Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleUpdateSettings("totalQuestions", n)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      settings.totalQuestions === n
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">
                Timer (minutes)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      handleUpdateSettings("timerDuration", m * 60)
                    }
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      settings.timerDuration === m * 60
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              disabled={isStarting || !settings.category}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isStarting ? (
                <>
                  <Loader2 size={22} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Play size={22} /> Start Game
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Waiting message for non-hosts */}
        {!isHost && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <Loader2
              size={32}
              className="animate-spin text-orange-400 mx-auto mb-4"
            />
            <p className="text-zinc-300 font-medium">
              Waiting for host to start the game...
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Category:{" "}
              <span className="capitalize text-zinc-300">
                {settings.category || "Not selected"}
              </span>
            </p>
          </div>
        )}
      </div>
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
        <span className="text-xs text-zinc-500 uppercase font-semibold">
          {language} Editor
        </span>
        <button
          onClick={handleRun}
          disabled={isRunning || isSubmitting}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition"
        >
          {isRunning ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Play size={13} fill="currentColor" />
          )}
          Run & Test
        </button>
      </div>
      <div className="flex-1">
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
          }}
        />
      </div>
      {output && (
        <div className="border-t border-zinc-800 p-3 bg-zinc-950 max-h-40 overflow-y-auto">
          {output.text && (
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
              {output.text}
            </pre>
          )}
          {output.error && (
            <pre className="text-xs text-red-400 whitespace-pre-wrap">
              {output.error}
            </pre>
          )}
          {output.testResult && (
            <div
              className={`mt-2 text-xs font-semibold ${
                output.testResult.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {output.testResult.success
                ? "✓ All tests passed!"
                : `✗ ${output.testResult.message}`}
            </div>
          )}
          {answerResult && (
            <div className="mt-2 text-xs font-semibold text-green-400">
              +{answerResult.pointsEarned} points!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CompetitionLobby;
