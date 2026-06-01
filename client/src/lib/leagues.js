import { Trophy, Medal, Crown, Shield } from "lucide-react";

export const LEAGUE_LEVELS = [
  { name: "Bronze",      minLevel: 1   },
  { name: "Silver",      minLevel: 5   },
  { name: "Gold",        minLevel: 10  },
  { name: "Platinum",    minLevel: 25  },
  { name: "Diamond",     minLevel: 50  },
  { name: "Master",      minLevel: 75  },
  { name: "Grandmaster", minLevel: 100 },
];

export const LEAGUE_STYLE = {
  Grandmaster: { color: "text-red-400",     bar: "bg-red-400",     icon: Crown  },
  Master:      { color: "text-purple-400",  bar: "bg-purple-400",  icon: Crown  },
  Diamond:     { color: "text-cyan-400",    bar: "bg-cyan-400",    icon: Shield },
  Platinum:    { color: "text-emerald-400", bar: "bg-emerald-400", icon: Shield },
  Gold:        { color: "text-yellow-400",  bar: "bg-yellow-400",  icon: Trophy },
  Silver:      { color: "text-zinc-300",    bar: "bg-zinc-300",    icon: Medal  },
  Bronze:      { color: "text-orange-400",  bar: "bg-orange-400",  icon: Medal  },
};

export const getLeagueStyle = (league) =>
  LEAGUE_STYLE[league] ?? LEAGUE_STYLE.Bronze;

export const getLeagueProgress = (level, league) => {
  const idx = LEAGUE_LEVELS.findIndex((l) => l.name === league);
  if (idx === -1 || idx === LEAGUE_LEVELS.length - 1)
    return { nextLeague: null, levelsNeeded: 0, progress: 100 };
  const curr = LEAGUE_LEVELS[idx];
  const next = LEAGUE_LEVELS[idx + 1];
  const progress =
    ((level - curr.minLevel) / (next.minLevel - curr.minLevel)) * 100;
  return {
    nextLeague: next.name,
    levelsNeeded: Math.max(0, next.minLevel - level),
    progress: Math.min(100, Math.max(0, progress)),
  };
};
