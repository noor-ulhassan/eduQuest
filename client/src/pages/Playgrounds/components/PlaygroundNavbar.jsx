import React from "react";
import { Menu, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlaygroundNavbar({ 
  isMobile, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  language, 
  getLanguageIconUrl, 
  user 
}) {
  const navigate = useNavigate();

  if (isMobile) return null;

  return (
    <header className="h-[60px] shrink-0 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ml-1">
          {getLanguageIconUrl(language) ? (
            <img
              src={getLanguageIconUrl(language)}
              alt={language}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
          ) : (
            <Terminal className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="font-bold text-lg tracking-wide hidden sm:block">
          {language.charAt(0).toUpperCase() + language.slice(1)} Playground
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
