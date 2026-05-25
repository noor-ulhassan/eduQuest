import { useQuery } from "@tanstack/react-query";
import { getPublishedCourses, getUserEnrollments, getCourseById, getEnrollmentStatus } from "./courseApi";

export const usePublishedCourses = () =>
  useQuery({ queryKey: ["courses"], queryFn: getPublishedCourses, staleTime: 10 * 60 * 1000 });

export const useUserEnrollments = () =>
  useQuery({ queryKey: ["enrollments"], queryFn: getUserEnrollments, staleTime: 2 * 60 * 1000 });

export const useCourse = (courseId) =>
  useQuery({ queryKey: ["course", courseId], queryFn: () => getCourseById(courseId), enabled: !!courseId, staleTime: 5 * 60 * 1000 });

export const useEnrollmentStatus = (courseId) =>
  useQuery({ queryKey: ["enrollment", courseId], queryFn: () => getEnrollmentStatus(courseId), enabled: !!courseId, staleTime: 2 * 60 * 1000 });
