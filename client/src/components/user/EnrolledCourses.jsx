import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import EnrollCourseList from "@/pages/Workspace/components/EnrollCourseList";
import { useSelector } from "react-redux";
import api from "@/features/auth/authApi";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, BookOpen } from "lucide-react";

// ---------------------------------------------------------------------------
// Skeleton loader — mimics the course card grid while data loads
// ---------------------------------------------------------------------------
const EnrolledCoursesSkeleton = () => (
  <div className="mt-8 space-y-4">
    <Skeleton className="h-7 w-56 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-zinc-200 p-4 space-y-3"
        >
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-2 w-full rounded-full mt-2" />
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.email) {
      fetchEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ Use the shared `api` instance — no hardcoded localhost URLs
      const res = await api.get(
        `/ai/user-enrollments?email=${encodeURIComponent(user?.email)}`,
      );
      setEnrolledCourses(res.data.enrolledCourses ?? []);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <EnrolledCoursesSkeleton />;

  if (error) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 p-10 rounded-2xl border border-red-100 bg-red-50/50 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchEnrolledCourses}
          className="mt-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 p-10 rounded-2xl border border-zinc-200 bg-zinc-50/50 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 border border-yellow-100">
          <BookOpen className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="font-jersey text-2xl text-zinc-600">
          No enrolled courses yet
        </h2>
        <p className="text-sm text-gray-500">
          Browse the course catalog and start learning.
        </p>
        <Link to="/workspace">
          <Button
            variant="pixel"
            className="font-jersey text-xl mt-1"
            size="lg"
          >
            Browse Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <EnrollCourseList userEmail={user?.email} />
    </div>
  );
}

export default EnrolledCourses;
