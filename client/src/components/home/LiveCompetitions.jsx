import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Code,
  BookOpen,
  Eye,
  Clock,
  Zap,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { connectSocket, getSocket } from "../../lib/socket";
import api from "../../features/auth/authApi";
import { playPlayerJoinedSound } from "@/lib/sound";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarCircles } from "@/components/ui/avatar-circles";

const LiveCompetitions = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingRoom, setRequestingRoom] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get("/competition/rooms");
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      // Silently fail — user just doesn't see competitions
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchRooms(); // Initial load via HTTP

    // Subscribe to real-time room list updates via socket
    const token = localStorage.getItem("accessToken");
    const s = connectSocket(token);

    const onRoomListUpdate = ({ rooms: updatedRooms }) => {
      setRooms(updatedRooms);
      setLoading(false);
    };
    s.on("roomListUpdate", onRoomListUpdate);

    return () => {
      s.off("roomListUpdate", onRoomListUpdate);
    };
  }, [user, fetchRooms]);

  // Refetch when user returns to tab (visibility change)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user) fetchRooms();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [user, fetchRooms]);

  // Track pending join listeners for cleanup
  const joinListenersRef = useRef(null);

  // Cleanup join listeners on unmount
  useEffect(() => {
    return () => {
      if (joinListenersRef.current) {
        const { socket: s, onApproved, onDenied } = joinListenersRef.current;
        s.off("joinApproved", onApproved);
        s.off("joinDenied", onDenied);
        joinListenersRef.current = null;
      }
    };
  }, []);

  const handleJoinRequest = (roomCode) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Please login first");

    setRequestingRoom(roomCode);

    const s = getSocket() || connectSocket(token);
    s.emit("requestJoin", { roomCode }, (response) => {
      setRequestingRoom(null);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });

    // Clean up any previous pending listeners
    if (joinListenersRef.current) {
      const { socket: prev, onApproved: prevA, onDenied: prevD } = joinListenersRef.current;
      prev.off("joinApproved", prevA);
      prev.off("joinDenied", prevD);
    }

    // Listen for approval
    const onApproved = ({ roomCode: rc }) => {
      playPlayerJoinedSound();
      toast.success("Join request approved! Entering room...");
      s.off("joinApproved", onApproved);
      s.off("joinDenied", onDenied);
      joinListenersRef.current = null;
      navigate(`/competition/${rc}`);
    };

    const onDenied = ({ message }) => {
      toast.error(message || "Join request denied");
      s.off("joinApproved", onApproved);
      s.off("joinDenied", onDenied);
      joinListenersRef.current = null;
    };

    s.on("joinApproved", onApproved);
    s.on("joinDenied", onDenied);
    joinListenersRef.current = { socket: s, onApproved, onDenied };
  };

  const handleSpectate = (roomCode) => {
    navigate(`/competition/${roomCode}?spectate=true`);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!user || (rooms.length === 0 && !loading)) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Swords size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground font-hand">
              Live <span className="text-primary">Competitions</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Join or spectate ongoing battles
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/competition")}
          className="text-primary hover:text-primary/90"
        >
          Create Room <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 space-y-4"
            >
              {/* Card header skeleton */}
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full shrink-0" />
              </div>
              {/* Avatars + badges skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
              </div>
              {/* Timer skeleton */}
              <Skeleton className="h-4 w-28 rounded" />
              {/* Button skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {rooms.map((room) => (
              <CompetitionCard
                key={room.roomCode}
                room={room}
                onJoin={handleJoinRequest}
                onSpectate={handleSpectate}
                requesting={requestingRoom === room.roomCode}
                formatTime={formatTime}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

const MAX_AVATARS = 5;

const CompetitionCard = ({
  room,
  onJoin,
  onSpectate,
  requesting,
  formatTime,
}) => {
  const isProgramming = room.category === "programming";
  const isLive = room.status === "active";
  const players = room.players || [];

  // Live timer: recompute every second when game is active
  const [liveRemaining, setLiveRemaining] = useState(() => {
    if (!isLive || !room.startTime) return null;
    const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
    return Math.max(0, (room.timerDuration || 0) - elapsed);
  });

  useEffect(() => {
    if (!isLive || !room.startTime) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
      setLiveRemaining(Math.max(0, (room.timerDuration || 0) - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLive, room.startTime, room.timerDuration]);

  const avatarUrls = players
    .slice(0, MAX_AVATARS)
    .map((p) => ({ imageUrl: p.avatarUrl || "/Avatar.png", alt: p.name }));
  const numPeople = Math.max(0, players.length - MAX_AVATARS);

  const difficultyVariant =
    {
      easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      hard: "bg-red-500/10 text-red-600 border-red-500/20",
    }[room.difficulty] || "bg-slate-500/10 text-slate-600 border-slate-500/20";

  const timerDisplay = isLive
    ? liveRemaining !== null
      ? formatTime(liveRemaining)
      : formatTime(
          Math.max(0, (room.timerDuration || 0) - (room.elapsedTime || 0)),
        )
    : formatTime(room.timerDuration || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-500 ${
          isLive
            ? "border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2),_0_0_50px_rgba(249,115,22,0.1)] hover:shadow-[0_0_40px_rgba(249,115,22,0.35)] hover:border-orange-400/70"
            : "border-border bg-card hover:shadow-md"
        }`}
        style={
          isLive ? { animation: "glow-pulse 2s ease-in-out infinite" } : {}
        }
      >
        {isLive && (
          <>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 pointer-events-none" />
            {/* Pulsating border ring */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(249,115,22,0.3), 0 0 20px rgba(249,115,22,0.15)",
                animation: "border-glow 2s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes glow-pulse {
                0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.15), 0 0 40px rgba(249,115,22,0.05); }
                50% { box-shadow: 0 0 30px rgba(249,115,22,0.3), 0 0 60px rgba(249,115,22,0.1); }
              }
              @keyframes border-glow {
                0%, 100% { box-shadow: 0 0 0 1px rgba(249,115,22,0.2), 0 0 15px rgba(249,115,22,0.1); }
                50% { box-shadow: 0 0 0 2px rgba(249,115,22,0.4), 0 0 25px rgba(249,115,22,0.2); }
              }
            `}</style>
          </>
        )}
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isProgramming
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-500/10 text-blue-600"
                }`}
              >
                {isProgramming ? <Code size={22} /> : <BookOpen size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold truncate text-foreground">
                  {room.topic ||
                    (isProgramming ? "Coding Challenge" : "General Quiz")}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                  <Crown size={12} className="shrink-0 text-amber-500" />
                  {room.hostName}
                </p>
              </div>
            </div>
            {isLive ? (
              <Badge variant="destructive" className="shrink-0 h-6 px-2">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0 h-6 px-2">
                Waiting
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {room.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <AvatarCircles
                avatarUrls={avatarUrls}
                numPeople={numPeople}
                className="shrink-0"
              />
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {room.playerCount}/{room.maxPlayers}
              </span>
            </div>
            {room.spectatorCount > 0 && (
              <Badge variant="outline" className="h-6 px-2 font-normal">
                <Eye size={12} className="mr-1" />
                {room.spectatorCount}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`h-6 px-2 capitalize border ${difficultyVariant}`}
            >
              {room.difficulty}
            </Badge>
            {isProgramming && room.language && (
              <Badge
                variant="outline"
                className="h-6 px-2 font-normal capitalize"
              >
                {room.language}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={14} className="shrink-0" />
            {isLive ? (
              <span>
                <span className="font-semibold tabular-nums text-foreground">
                  {timerDisplay}
                </span>{" "}
                left
              </span>
            ) : (
              <span>
                <span className="font-semibold tabular-nums text-foreground">
                  {timerDisplay}
                </span>{" "}
                total
              </span>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => onJoin(room.roomCode)}
              disabled={requesting}
              className="flex-1 h-10 font-semibold"
              variant="default"
            >
              {requesting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Zap size={16} className="shrink-0" />
              )}
              <span className="ml-2">
                {requesting ? "Requesting..." : isLive ? "Rejoin" : "Join"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSpectate(room.roomCode)}
              className="h-10 px-4 shrink-0"
            >
              <Eye size={16} className="shrink-0" />
              <span className="ml-2">Watch</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LiveCompetitions;
