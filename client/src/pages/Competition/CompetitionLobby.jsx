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
  Home,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound, playPlayerJoinedSound } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InteractiveQuestion from "../../components/competition/InteractiveQuestion";

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
  const [finalResults, setFinalResults] = useState(null);

  // Spectator & join request state
  const isSpectator = searchParams.get("spectate") === "true";
  const [spectatorData, setSpectatorData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const isHost = room?.hostId === user?._id;

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
    if (!user) return;
    const token = localStorage.getItem("accessToken");
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
      challengeMode: cm,
      language,
    }) => {
      setGameState("playing");
      setTotalQuestions(tq);
      setTimeRemaining(timerDuration);
      setCurrentQuestion(question);
      setQuestionIndex(qi);
      setGameCategory(category);
      setGameChallengeMode(cm || "classic");
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
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[url('/gladiator1.jpg')] bg-cover bg-center bg-no-repeat">
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        {/* Content wrapper - centered, consistent spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center"
        >
          {/* Header */}
          <header className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-3">
              EduQuest Arena
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg">
              Challenge your friends in coding battles & quizzes
            </p>
          </header>

          {/* Cards container */}
          <div className="w-full space-y-5 sm:space-y-6">
            {/* Create Room */}
            <div className="border border-zinc-700/80 rounded-2xl p-6 bg-zinc-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="crown.jpg"
                  alt=""
                  width={40}
                  height={48}
                  className="rounded-lg object-contain"
                />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Create a Room
                  </h2>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Share the code with your friends
                  </p>
                </div>
              </div>
              <Button
                variant="pixel"
                onClick={handleCreateRoom}
                disabled={isConnecting}
                className="w-full py-3 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Swords size={18} />
                )}
                Create Room
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-500" />
              <span className="text-zinc-200 text-xs font-bold uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-zinc-500" />
            </div>

            {/* Join Room */}
            <div className="border border-zinc-700/80 rounded-2xl p-6 bg-zinc-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-blue-400 shrink-0" />
                <h2 className="text-lg font-semibold text-white">
                  Join a Room
                </h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Enter the 6-character code shared by the host
              </p>
              <div className="flex gap-2 sm:gap-3">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="flex-1 h-12 text-center text-lg font-mono tracking-[0.25em] uppercase bg-zinc-800/80 border-zinc-600 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-orange-500"
                />
                <Button
                  variant={"pixel"}
                  onClick={() => handleJoinRoom()}
                  disabled={isConnecting || !joinCode.trim()}
                  className="h-12 px-6 shrink-0 font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-100"
                >
                  Join
                </Button>
              </div>
            </div>
          </div>

          {/* Back link */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 sm:mt-8 flex items-center font-bold justify-center gap-2 py-2 px-4 text-zinc-300 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} className="shrink-0" />
            Back to Home
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
                } ${player.id === user?._id ? "ring-1 ring-orange-500/30" : ""}`}
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {player.name}
                    {player.id === user?._id && (
                      <span className="text-xs text-orange-400 ml-2">
                        (You)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                    <span>
                      {player.correctAnswers || 0}/{player.currentQuestion}{" "}
                      correct
                    </span>
                    {player.timeTaken != null && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                        <span className="flex items-center gap-1">
                          <Timer size={10} />
                          {Math.floor(player.timeTaken / 60)}:
                          {String(player.timeTaken % 60).padStart(2, "0")}
                        </span>
                      </>
                    )}
                    {!player.finished && (
                      <span className="text-red-400">DNF</span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-lg text-orange-400">
                  {player.score}{" "}
                  <span className="text-xs text-zinc-500 font-normal">XP</span>
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

  // ─── RENDER: Individual Results (Player Finished) ──────────────────
  if (gameState === "playing" && userFinished && finishData) {
    const accuracy =
      finishData.totalQuestions > 0
        ? Math.round(
            (finishData.correctAnswers / finishData.totalQuestions) * 100,
          )
        : 0;
    const minutes = Math.floor(finishData.timeTaken / 60);
    const seconds = finishData.timeTaken % 60;

    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full relative z-10 space-y-6"
        >
          {/* Trophy / Rank Icon */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/30">
              {finishData.rank === 1 ? (
                <Trophy size={40} className="text-yellow-400" />
              ) : (
                <Target size={40} className="text-orange-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {finishData.rank === 1
                ? "🏆 1st Place!"
                : `#${finishData.rank} Place`}
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">Challenge Complete</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {finishData.score}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">
                Total XP
              </div>
            </Card>
            <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {accuracy}%
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">
                Accuracy
              </div>
            </Card>
            <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {minutes}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">
                Time Taken
              </div>
            </Card>
            <Card className="bg-zinc-900/60 border-zinc-800 p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {finishData.correctAnswers}/{finishData.totalQuestions}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1">
                Correct
              </div>
            </Card>
          </div>

          {/* Speed Bonus Callout */}
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
            <Zap size={20} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">
                Speed Bonus Applied
              </p>
              <p className="text-xs text-zinc-400">
                Faster answers earned you extra XP per question!
              </p>
            </div>
          </div>

          {/* Live Leaderboard Preview */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-0 overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Trophy size={12} className="text-yellow-400" /> Live Standings
              </h3>
            </div>
            <div className="p-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              {leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    p.id === user?._id
                      ? "bg-orange-500/10 border border-orange-500/20"
                      : ""
                  }`}
                >
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                      i === 0
                        ? "bg-yellow-500 text-black"
                        : i === 1
                          ? "bg-zinc-300 text-black"
                          : i === 2
                            ? "bg-orange-700 text-white"
                            : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`flex-1 truncate ${p.id === user?._id ? "text-orange-400 font-medium" : "text-zinc-300"}`}
                  >
                    {p.name} {p.id === user?._id && "(You)"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {p.finished ? "✓" : `Q${p.currentQuestion}`}
                  </span>
                  <span className="text-xs font-bold text-orange-400">
                    {p.score}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/")}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl"
            >
              <Home size={16} className="mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => {
                setUserFinished(false);
                setFinishData(null);
                // Stay in the room listening for gameOver
                toast(
                  "Spectating... You'll see the final results when everyone finishes.",
                  { icon: "👁️" },
                );
              }}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 text-white font-semibold rounded-xl"
            >
              <Eye size={16} className="mr-2" />
              Spectate
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Playing (Quiz / Scenario Mode) ───────────────────────
  if (
    gameState === "playing" &&
    (gameCategory === "general" || gameChallengeMode !== "classic")
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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
                <h2 className="font-bold text-lg">
                  Challenge {questionIndex + 1}
                </h2>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  Question {questionIndex + 1} of {totalQuestions}
                </div>
              </div>
            </div>
            <div
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col">
              <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
                {currentQuestion ? (
                  <InteractiveQuestion
                    question={currentQuestion}
                    onSubmit={handleSubmitAnswer}
                    result={answerResult}
                    isSubmitting={isSubmitting}
                    selectedAnswer={selectedAnswer}
                  />
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
            </Card>

            {/* Sidebar (Leaderboard) */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden h-fit sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-400" /> Live
                    Standings
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {leaderboard.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        p.id === user?._id
                          ? "bg-orange-500/10 border border-orange-500/20"
                          : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 flex shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                          i === 0
                            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                            : i === 1
                              ? "bg-zinc-300 text-black"
                              : i === 2
                                ? "bg-orange-700 text-white"
                                : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium truncate ${p.id === user?._id ? "text-orange-400" : "text-zinc-300"}`}
                          >
                            {p.name}
                          </span>
                          {p.id === user?._id && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                          <span>{p.score} XP</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                          <span>
                            {p.finished ? "Finished" : `Q${p.currentQuestion}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      Waiting for players to start...
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
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
            <div
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
            </div>
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
                <h3 className="font-bold text-lg mb-4">
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
              <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                {leaderboard.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      p.id === user?._id
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        i === 0
                          ? "bg-yellow-500 text-black"
                          : i === 1
                            ? "bg-zinc-300 text-black"
                            : i === 2
                              ? "bg-orange-700 text-white"
                              : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate ${p.id === user?._id ? "text-orange-400" : "text-zinc-300"}`}
                        >
                          {p.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <span>{p.score} XP</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                        <span>
                          {p.finished ? "Done" : `Q${p.currentQuestion}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Game Finished (Results) ─────────────────────────────
  if (gameState === "finished") {
    // Determine winner and sorted list
    const sortedLeaderboard = [...leaderboard].sort(
      (a, b) => b.score - a.score,
    );
    const winner = sortedLeaderboard[0];
    const isHost = room?.host?._id === user?._id;

    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Competition Ended
            </h1>
            <p className="text-zinc-400 text-lg">
              Here are the final standings
            </p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-2xl shadow-orange-900/10">
            {/* Winner Highlight (if any) */}
            {winner && (
              <div className="p-8 flex flex-col items-center bg-gradient-to-b from-orange-500/10 to-transparent border-b border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)] overflow-hidden bg-zinc-800">
                    <img
                      src={winner.avatarUrl || "/Avatar.png"}
                      className="w-full h-full object-cover"
                      alt={winner.name}
                    />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shrink-0 w-max mt-1">
                    <Crown size={12} fill="currentColor" /> WINNER
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {winner.name}
                </h2>
                <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-700/50">
                  <Trophy size={14} className="text-orange-400" />
                  <span className="text-orange-400 font-mono font-bold text-lg">
                    {winner.score} XP
                  </span>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-zinc-900/50">
              {sortedLeaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className={`p-4 flex items-center gap-4 hover:bg-zinc-800/40 transition-colors border-b border-zinc-800/50 last:border-0 ${
                    p.id === user?._id
                      ? "bg-orange-500/5 hover:bg-orange-500/10"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      i === 0
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                        : i === 1
                          ? "bg-zinc-300 text-black"
                          : i === 2
                            ? "bg-orange-700 text-white"
                            : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <img
                    src={p.avatarUrl || "/Avatar.png"}
                    className="w-10 h-10 rounded-full bg-zinc-800 object-cover shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-200 flex items-center gap-2 truncate">
                      {p.name}
                      {p.id === user?._id && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-orange-400 shrink-0">
                    {p.score} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4 justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white h-12 px-6"
            >
              <ArrowLeft size={16} /> Return Home
            </Button>
            {isHost && (
              <Button
                onClick={() => {
                  // Host can restart or go to lobby (reloading page is simplest to reset state)
                  window.location.reload();
                }}
                className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white h-12 px-8 shadow-lg shadow-orange-900/20"
              >
                <Play size={16} fill="currentColor" /> Play Again
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Lobby (Waiting Room) ──────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Top Navigation */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 -ml-1"
          >
            <ArrowLeft size={18} /> Exit Lobby
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/20"
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </Badge>
            <Badge
              variant="outline"
              className="border-zinc-700 text-zinc-400 font-normal"
            >
              {isHost ? "Host" : "Player"}
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Room Info & Players */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Header Card */}
            <Card className="relative border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div
                className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                aria-hidden
              />
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Competition Lobby
                </CardTitle>
                <CardDescription className="text-zinc-400 max-w-lg">
                  Share the room code with friends to invite them to this
                  challenge.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4">
                  <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950/50 overflow-hidden shrink-0">
                    <div className="px-4 py-3 bg-zinc-900/80 border-r border-zinc-800">
                      <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-default">
                        Room Code
                      </Label>
                    </div>
                    <div className="px-5 py-3 font-mono text-xl sm:text-2xl font-bold text-orange-400 tracking-[0.2em]">
                      {roomCode}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                      className="rounded-none h-auto px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border-l border-zinc-800 shrink-0"
                    >
                      {copied ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <Copy size={20} />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="secondary"
                    className="flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-200 shrink-0 min-h-[46px]"
                  >
                    <Copy size={16} />
                    Copy Invite Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Match Configuration (Host Only) - Below Lobby */}
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-zinc-800 bg-zinc-900 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                        <Settings size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">
                          Match Configuration
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Customize your competition
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category */}
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Target Domain
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            handleUpdateSettings("category", "programming");
                            handleUpdateSettings("challengeMode", "classic");
                          }}
                          className={`relative p-4 rounded-xl border text-left transition-all overflow-hidden ${
                            settings.category === "programming"
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                          }`}
                        >
                          <Code
                            size={24}
                            className={`mb-2 ${settings.category === "programming" ? "text-orange-500" : "text-zinc-500"}`}
                          />
                          <span
                            className={`block text-sm font-bold ${settings.category === "programming" ? "text-white" : "text-zinc-400"}`}
                          >
                            Programming
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateSettings("category", "general");
                            handleUpdateSettings("challengeMode", "classic");
                          }}
                          className={`relative p-4 rounded-xl border text-left transition-all overflow-hidden ${
                            settings.category === "general"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                          }`}
                        >
                          <BookOpen
                            size={24}
                            className={`mb-2 ${settings.category === "general" ? "text-blue-500" : "text-zinc-500"}`}
                          />
                          <span
                            className={`block text-sm font-bold ${settings.category === "general" ? "text-white" : "text-zinc-400"}`}
                          >
                            General
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Challenge Mode */}
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Challenge Type
                      </Label>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {(settings.category === "programming"
                          ? [
                              {
                                id: "classic",
                                name: "Classic Coding",
                                icon: "💻",
                                desc: "Standard algorithmic challenges",
                              },
                              {
                                id: "scenario",
                                name: "Scenario Challenge",
                                icon: "🎭",
                                desc: "Real-world engineering narratives",
                              },
                              {
                                id: "debug",
                                name: "Debug Detective",
                                icon: "🔍",
                                desc: "Find and fix critical bugs",
                              },
                              {
                                id: "outage",
                                name: "Production Outage",
                                icon: "🚨",
                                desc: "High-pressure incident response",
                              },
                              {
                                id: "refactor",
                                name: "Code Refactor",
                                icon: "♻️",
                                desc: "Optimize messy legacy code",
                              },
                              {
                                id: "missing",
                                name: "Missing Link",
                                icon: "🧩",
                                desc: "Implement the missing component",
                              },
                              {
                                id: "interactive",
                                name: "Interactive",
                                icon: "🎮",
                                desc: "Drag, drop, and type answers",
                              },
                            ]
                          : [
                              {
                                id: "classic",
                                name: "Classic Quiz",
                                icon: "📝",
                                desc: "Standard multiple-choice",
                              },
                              {
                                id: "interactive",
                                name: "Interactive",
                                icon: "🎮",
                                desc: "Drag, drop, and type answers",
                              },
                              {
                                id: "scenario",
                                name: "Scenario Challenge",
                                icon: "🎭",
                                desc: "Real-world situations",
                              },
                              {
                                id: "missing",
                                name: "Missing Link",
                                icon: "🧩",
                                desc: "Connect the system concepts",
                              },
                            ]
                        ).map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() =>
                              handleUpdateSettings("challengeMode", mode.id)
                            }
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              settings.challengeMode === mode.id
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
                            }`}
                          >
                            <span className="text-xl mt-0.5">{mode.icon}</span>
                            <div>
                              <span
                                className={`block text-sm font-bold ${
                                  settings.challengeMode === mode.id
                                    ? "text-orange-400"
                                    : "text-zinc-300"
                                }`}
                              >
                                {mode.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 leading-tight block mt-0.5">
                                {mode.desc}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Topic & Description */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Specific Topic
                        </Label>
                        <Input
                          type="text"
                          value={settings.topic}
                          onChange={(e) =>
                            handleUpdateSettings("topic", e.target.value)
                          }
                          placeholder={
                            settings.category === "programming"
                              ? "e.g. React Hooks, graph algorithms..."
                              : "e.g. European History, Physics..."
                          }
                          className="bg-zinc-950/80 border-zinc-800 text-zinc-200 placeholder:text-zinc-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Description
                        </Label>
                        <Textarea
                          value={settings.description}
                          onChange={(e) =>
                            handleUpdateSettings("description", e.target.value)
                          }
                          placeholder="Context or rules..."
                          rows={2}
                          className="resize-none bg-zinc-950/80 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Sliders / Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Difficulty
                        </Label>
                        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                          {["easy", "medium", "hard"].map((d) => (
                            <button
                              key={d}
                              onClick={() =>
                                handleUpdateSettings("difficulty", d)
                              }
                              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                                settings.difficulty === d
                                  ? "bg-zinc-800 text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Questions
                        </Label>
                        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                          {[3, 5, 10].map((n) => (
                            <button
                              key={n}
                              onClick={() =>
                                handleUpdateSettings("totalQuestions", n)
                              }
                              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                                settings.totalQuestions === n
                                  ? "bg-zinc-800 text-white shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Duration Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Duration
                      </Label>
                      <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                        {[1, 3, 5, 10, 15, 30].map((m) => (
                          <button
                            key={m}
                            onClick={() =>
                              handleUpdateSettings("timerDuration", m * 60)
                            }
                            className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                              settings.timerDuration === m * 60
                                ? "bg-zinc-800 text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Start Button */}
                    <Button
                      onClick={handleStartGame}
                      disabled={isStarting || !settings.category}
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-base rounded-xl shadow-lg shadow-orange-900/20"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 size={22} className="animate-spin mr-2" />
                          Initiating...
                        </>
                      ) : (
                        <>
                          <Swords size={22} className="mr-2" />
                          Begin Competition
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Join Requests (Host Only) */}
            {isHost && pendingRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                      <span aria-hidden>🔔</span>
                      Pending Requests
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 text-orange-400 ml-1"
                      >
                        {pendingRequests.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/80"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={req.avatarUrl || "/Avatar.png"}
                            alt={req.name}
                          />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                            {req.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium text-sm text-zinc-200 truncate">
                          {req.name}
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveJoin(req.id)}
                            className="h-8 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDenyJoin(req.id)}
                            className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN: Participants (both Host & Guest) + Preparing Battle (Guest only) */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            {/* Participants - visible to both host and joined players */}
            <Card className="border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Users size={18} className="text-zinc-400" />
                    Participants
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-300 font-medium"
                  >
                    {room?.players?.length || 0}/20
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence>
                    {room?.players?.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                      >
                        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-zinc-800">
                          <AvatarImage
                            src={player.avatarUrl || "/Avatar.png"}
                            alt={player.name}
                          />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                            {player.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {player.name}
                          </p>
                          {player.id === room.hostId ? (
                            <Badge
                              variant="outline"
                              className="mt-0.5 h-4 px-1.5 text-[10px] border-yellow-500/50 text-yellow-500 font-medium"
                            >
                              <Crown size={10} className="mr-0.5" /> Host
                            </Badge>
                          ) : (
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Player
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {Array.from({
                      length: Math.max(0, 3 - (room?.players?.length || 0)),
                    }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="border border-dashed border-zinc-800 rounded-lg p-3 flex items-center justify-center min-h-[72px]"
                      >
                        <span className="text-xs text-zinc-600">
                          Waiting...
                        </span>
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Preparing Battle - guest only */}
            {!isHost && (
              <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                    <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
                    <Loader2
                      size={28}
                      className="text-orange-500 relative z-10"
                    />
                  </div>
                  <CardTitle className="text-xl text-white mb-2">
                    Preparing Battle...
                  </CardTitle>
                  <CardDescription className="mb-6 text-zinc-400">
                    The host is configuring the match. Please wait for the game
                    to launch.
                  </CardDescription>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 space-y-3 text-left">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Mode</span>
                      <span className="font-medium text-zinc-300 capitalize flex items-center gap-2">
                        {settings.category === "programming" ? (
                          <Code size={14} className="text-orange-500" />
                        ) : (
                          <BookOpen size={14} className="text-blue-500" />
                        )}
                        {settings.category}
                      </span>
                    </div>
                    <Separator className="bg-zinc-800" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Challenge</span>
                      <Badge
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 font-medium capitalize"
                      >
                        {settings.challengeMode}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
