import { useQuery } from "@tanstack/react-query";
import { getDocuments, getDocumentById } from "./apiService";
import { quizApi } from "./ragApiService";

export const useDocuments = () =>
  useQuery({ queryKey: ["documents"], queryFn: getDocuments, staleTime: 2 * 60 * 1000 });

export const useDocument = (id) =>
  useQuery({ queryKey: ["document", id], queryFn: () => getDocumentById(id), enabled: !!id, staleTime: 5 * 60 * 1000 });

export const useQuizAttempts = (documentId) =>
  useQuery({
    queryKey: ["quiz-attempts", documentId],
    queryFn: () => quizApi.getAttempts(documentId).then((res) => res.data || []),
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000,
  });
