import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./Logout";
import { Loader2 } from "lucide-react";

export default function AuthButtons() {
  const { user, status } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex gap-3">
        <div className="px-5 py-1.5 rounded border border-white/20 text-gray-500 text-sm flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex gap-3">
        <LogoutButton
          className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-white/30 hover:border-white/60 bg-transparent hover:bg-white/5 transition-all cursor-pointer"
        />
        <button
          onClick={() => navigate("/profile")}
          className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-red-400 bg-red-600 hover:bg-red-500 transition-all cursor-pointer"
          style={{ boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)" }}
        >
          Profile
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => navigate("/login")}
        className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-white/30 hover:border-white/60 bg-transparent hover:bg-white/5 transition-all cursor-pointer"
      >
        Log in
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="px-5 py-1.5 rounded text-sm font-semibold text-white border border-red-400 bg-red-600 hover:bg-red-500 transition-all cursor-pointer"
        style={{
          boxShadow: "0 2px 12px rgba(220, 38, 38, 0.3)",
        }}
      >
        Sign Up
      </button>
    </div>
  );
}
