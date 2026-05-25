import { useQuery } from "@tanstack/react-query";
import { getUserAnalytics } from "./userApi";

export const useUserAnalytics = () =>
  useQuery({ queryKey: ["analytics"], queryFn: getUserAnalytics, staleTime: 5 * 60 * 1000 });
