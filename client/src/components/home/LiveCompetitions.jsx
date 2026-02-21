import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Code,
  BookOpen,
  Users,
  Eye,
  Clock,
  Zap,
  Crown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { connectSocket } from "../../lib/socket";
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
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // 5s poll for faster updates
    return () => clearInterval(interval);
  }, [user, fetchRooms]);

  // Refetch when user returns to tab (visibility change)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user) fetchRooms();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user, fetchRooms]);

  const handleJoinRequest = (roomCode) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Please login first");

    setRequestingRoom(roomCode);

    const s = connectSocket(token);
    s.emit("requestJoin", { roomCode }, (response) => {
      setRequestingRoom(null);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });

    // Listen for approval
    const onApproved = ({ roomCode: rc, room }) => {
      playPlayerJoinedSound();
      toast.success("Join request approved! Entering room...");
      s.off("joinApproved", onApproved);
      s.off("joinDenied", onDenied);
      navigate(`/competition/${rc}`);
    };

    const onDenied = ({ message }) => {
      toast.error(message || "Join request denied");
      s.off("joinApproved", onApproved);
      s.off("joinDenied", onDenied);
    };

    s.on("joinApproved", onApproved);
    s.on("joinDenied", onDenied);
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/competition")} className="text-primary hover:text-primary/90">
          Create Room <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
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

  const difficultyVariant = {
    easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    hard: "bg-red-500/10 text-red-600 border-red-500/20",
  }[room.difficulty] || "bg-slate-500/10 text-slate-600 border-slate-500/20";

  const timerDisplay = isLive
    ? (liveRemaining !== null ? formatTime(liveRemaining) : formatTime(Math.max(0, (room.timerDuration || 0) - (room.elapsedTime || 0))))
    : formatTime(room.timerDuration || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isProgramming ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"
                }`}
              >
                {isProgramming ? <Code size={22} /> : <BookOpen size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold truncate text-foreground">
                  {room.topic || (isProgramming ? "Coding Challenge" : "General Quiz")}
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
            <Badge variant="outline" className={`h-6 px-2 capitalize border ${difficultyVariant}`}>
              {room.difficulty}
            </Badge>
            {isProgramming && room.language && (
              <Badge variant="outline" className="h-6 px-2 font-normal capitalize">
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
                <span className="font-semibold tabular-nums text-foreground">{timerDisplay}</span> total
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
