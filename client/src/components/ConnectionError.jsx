import { useState } from "react";
import { useDispatch } from "react-redux";
import { WifiOff, RefreshCw } from "lucide-react";
import { initializeAuth } from "@/features/auth/authThunks";

export default function ConnectionError() {
  const dispatch = useDispatch();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    await dispatch(initializeAuth());
    setRetrying(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0) 50%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#111] p-8 sm:p-10 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <WifiOff className="w-7 h-7 text-red-400" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Can't reach EduQuest
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We're having trouble connecting. Check your internet, or try again
            in a moment.
          </p>
        </div>

        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed border border-red-400 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
          style={{ boxShadow: "0 2px 12px rgba(220, 38, 38, 0.2)" }}
        >
          <RefreshCw
            className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`}
          />
          {retrying ? "Reconnecting…" : "Try Again"}
        </button>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Still broken? The server might be down.
        </p>
      </div>
    </div>
  );
}
