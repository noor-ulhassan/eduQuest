import { useQuery } from "@tanstack/react-query";
import {
  getPlaygroundProgress,
  getCurriculumsMetadata,
  getCurriculum,
  getLanguageProgress,
} from "./playgroundApi";

export const usePlaygroundProgress = () =>
  useQuery({ queryKey: ["playground", "progress"], queryFn: getPlaygroundProgress, staleTime: 5 * 60 * 1000 });

export const useCurriculumsMetadata = () =>
  useQuery({ queryKey: ["curriculum", "metadata"], queryFn: getCurriculumsMetadata, staleTime: 5 * 60 * 1000 });

export const useCurriculum = (language) =>
  useQuery({ queryKey: ["curriculum", language], queryFn: () => getCurriculum(language), enabled: !!language, staleTime: 5 * 60 * 1000 });

export const useLanguageProgress = (language) =>
  useQuery({ queryKey: ["playground", "progress", language], queryFn: () => getLanguageProgress(language), enabled: !!language, staleTime: 5 * 60 * 1000 });
