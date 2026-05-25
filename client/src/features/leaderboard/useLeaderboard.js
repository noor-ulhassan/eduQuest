import { useQuery } from "@tanstack/react-query";
import { getGlobalLeaderboard } from "./leaderboardApi";

export const useGlobalLeaderboard = () =>
  useQuery({ queryKey: ["leaderboard", "global"], queryFn: getGlobalLeaderboard, staleTime: 3 * 60 * 1000 });
