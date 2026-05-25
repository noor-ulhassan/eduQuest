import { useQuery } from "@tanstack/react-query";
import { getCompetitionStats } from "./competitionApi";

export const useCompetitionStats = () =>
  useQuery({ queryKey: ["competition-stats"], queryFn: getCompetitionStats, staleTime: 2 * 60 * 1000 });
