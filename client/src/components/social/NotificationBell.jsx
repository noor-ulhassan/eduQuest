import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { playNotificationSound } from "@/lib/sound";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getFriendRequests,
  acceptFriendRequest,
} from "@/features/social/socialApi";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getFriendRequests();
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const prevCountRef = useRef(0);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Play sound when new notifications arrive (count increased)
  useEffect(() => {
    if (requests.length > prevCountRef.current && prevCountRef.current > 0) {
      playNotificationSound();
    }
    prevCountRef.current = requests.length;
  }, [requests.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await acceptFriendRequest(requestId);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {requests.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {requests.length > 9 ? "9+" : requests.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111111] rounded-xl shadow-xl shadow-black/50 border border-white/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {requests.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {requests.length} new
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && requests.length === 0 ? (
              <div className="p-4 space-y-3">
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <Avatar
                      className="h-9 w-9 cursor-pointer ring-1 ring-white/10"
                      onClick={() => {
                        navigate(`/profile/${req.from?._id}`);
                        setIsOpen(false);
                      }}
                    >
                      <AvatarImage src={req.from?.avatarUrl} />
                      <AvatarFallback className="bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
                        {req.from?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {req.from?.name || "Someone"}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Wants to connect
                      </p>
                    </div>

                    <button
                      onClick={() => handleAccept(req._id)}
                      className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-500/20"
                      title="Accept"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
