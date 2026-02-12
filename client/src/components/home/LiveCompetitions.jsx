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
import { connectSocket, getSocket } from "../../lib/socket";
import api from "../../features/auth/authApi";

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
    const interval = setInterval(fetchRooms, 15000);
    return () => clearInterval(interval);
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
            <Swords size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-hand">
              Live <span className="text-orange-500">Competitions</span>
            </h2>
            <p className="text-sm text-gray-500">
              Join or spectate ongoing battles
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/competition")}
          className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition"
        >
          Create Room <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-orange-400" />
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

const CompetitionCard = ({
  room,
  onJoin,
  onSpectate,
  requesting,
  formatTime,
}) => {
  const isProgramming = room.category === "programming";
  const isLive = room.status === "active";

  const difficultyColors = {
    easy: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    hard: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-500 uppercase">Live</span>
        </div>
      )}

      {!isLive && (
        <div className="absolute top-4 right-4">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Waiting
          </span>
        </div>
      )}

      {/* Category Icon + Topic */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isProgramming
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {isProgramming ? <Code size={20} /> : <BookOpen size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">
            {room.topic ||
              (isProgramming ? "Coding Challenge" : "General Quiz")}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Crown size={10} className="text-yellow-500" />
            Hosted by {room.hostName}
          </p>
        </div>
      </div>

      {/* Description if available */}
      {room.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          <Users size={12} /> {room.playerCount}/{room.maxPlayers}
        </span>
        {room.spectatorCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            <Eye size={12} /> {room.spectatorCount} watching
          </span>
        )}
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${
            difficultyColors[room.difficulty] || difficultyColors.medium
          }`}
        >
          {room.difficulty}
        </span>
        {isProgramming && (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full capitalize">
            {room.language}
          </span>
        )}
      </div>

      {/* Timer info */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Clock size={12} />
        {isLive ? (
          <span>
            <span className="font-semibold text-orange-500">
              {formatTime(Math.max(0, room.timerDuration - room.elapsedTime))}
            </span>{" "}
            remaining
          </span>
        ) : (
          <span>
            Total time:{" "}
            <span className="font-semibold">
              {formatTime(room.timerDuration)}
            </span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onJoin(room.roomCode)}
          disabled={requesting || isLive}
          className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {requesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          {requesting
            ? "Requesting..."
            : isLive
              ? "In Progress"
              : "Request to Join"}
        </button>
        <button
          onClick={() => onSpectate(room.roomCode)}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <Eye size={14} />
          Watch
        </button>
      </div>
    </motion.div>
  );
};

export default LiveCompetitions;
