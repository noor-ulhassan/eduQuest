import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "./features/auth/authThunks";
import MainLayout from "./layout/MainLayout";
import AuthLoading from "./pages/Auth/components/AuthLoading";
import PageLoader from "./components/ui/PageLoader";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./pages/Auth/components/ProtectedRoute";
import AdminRoute from "./pages/Auth/components/AdminRoute";

// ─── Eagerly loaded (small / needed immediately) ────────────────────────────
import HomePage from "./pages/Homepage/HomePage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

// ─── Lazily loaded (heavy pages, code-split on demand) ──────────────────────
const Profile = lazy(() => import("./pages/Profile/Profile"));
const CourseView = lazy(() => import("./pages/Workspace/CourseView"));
const EditCourse = lazy(() => import("./pages/Workspace/EditCourse"));
const DocumentsPage = lazy(() => import("./pages/Documents/DocumentsPage"));
const Playground = lazy(() => import("./pages/Playgrounds/Page"));
const LanguagePlayground = lazy(
  () => import("./pages/Playgrounds/LanguagePlayground"),
);

const CompetitionPage = lazy(
  () => import("./pages/Competition/CompetitionPage"),
);
const CompetitionLobby = lazy(
  () => import("./pages/Competition/CompetitionLobby"),
);
const LeaderboardPage = lazy(() => import("./components/home/leaderboard"));

const AdminCurriculum = lazy(() => import("./pages/Admin/AdminCurriculum"));
const AdminCourses = lazy(() => import("./pages/Admin/AdminCourses"));

// Wraps a lazy element in a Suspense boundary with the global spinner fallback
const Lazy = ({ element: Element }) => (
  <Suspense fallback={<PageLoader />}>
    <Element />
  </Suspense>
);

// ─── Route definitions ───────────────────────────────────────────────────────
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: "home", element: <Navigate to="/" replace /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "learn", element: <Navigate to="/workspace" replace /> },
      { path: "playground", element: <Lazy element={Playground} /> },

      // Protected routes
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Lazy element={Profile} />
          </ProtectedRoute>
        ),
      },

      {
        path: "course/:courseId",
        element: (
          <ProtectedRoute>
            <Lazy element={CourseView} />
          </ProtectedRoute>
        ),
      },
      {
        path: "workspace",
        element: (
          <ProtectedRoute>
            <Lazy element={CourseView} />
          </ProtectedRoute>
        ),
      },
      {
        path: "workspace/edit-course/:courseId",
        element: (
          <AdminRoute>
            <Lazy element={EditCourse} />
          </AdminRoute>
        ),
      },
      {
        path: "documents",
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Lazy element={DocumentsPage} />
              </ProtectedRoute>
            ),
          },
          {
            path: ":id",
            element: (
              <ProtectedRoute>
                <Lazy element={DocumentsPage} />
              </ProtectedRoute>
            ),
          },
          {
            path: ":id/chat",
            element: (
              <ProtectedRoute>
                <Lazy element={DocumentsPage} />
              </ProtectedRoute>
            ),
          },
          {
            path: ":id/quiz",
            element: (
              <ProtectedRoute>
                <Lazy element={DocumentsPage} />
              </ProtectedRoute>
            ),
          },
          {
            path: ":id/companion",
            element: (
              <ProtectedRoute>
                <Lazy element={DocumentsPage} />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: "playground/:language",
        element: (
          <ProtectedRoute>
            <Lazy element={LanguagePlayground} />
          </ProtectedRoute>
        ),
      },
      {
        path: "competition",
        element: (
          <ProtectedRoute>
            <Lazy element={CompetitionPage} />
          </ProtectedRoute>
        ),
      },
      {
        path: "competition/lobby",
        element: (
          <ProtectedRoute>
            <Lazy element={CompetitionLobby} />
          </ProtectedRoute>
        ),
      },
      {
        path: "competition/:roomCode",
        element: (
          <ProtectedRoute>
            <Lazy element={CompetitionLobby} />
          </ProtectedRoute>
        ),
      },
      {
        path: "leaderboard",
        element: (
          <ProtectedRoute>
            <Lazy element={LeaderboardPage} />
          </ProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: "admin/curriculum",
        element: (
          <AdminRoute>
            <Lazy element={AdminCurriculum} />
          </AdminRoute>
        ),
      },
      {
        path: "admin/courses",
        element: (
          <AdminRoute>
            <Lazy element={AdminCourses} />
          </AdminRoute>
        ),
      },
    ],
  },

  // 404 — dedicated component instead of inline JSX
  { path: "*", element: <NotFoundPage /> },
]);

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (status === "loading" || status === "idle") {
    return <AuthLoading />;
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={appRouter} />
    </ErrorBoundary>
  );
}

export default App;
