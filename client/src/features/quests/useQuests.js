import { useQuery } from "@tanstack/react-query";
import { fetchUserQuests } from "./questsApi";

export const useQuests = () =>
  useQuery({ queryKey: ["quests"], queryFn: fetchUserQuests, staleTime: 60 * 1000 });
