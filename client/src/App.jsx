import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initializeAuth } from "./features/auth/authThunks";
import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/Homepage/HomePage";
import ProblemsPage from "./pages/Problems/ProblemsPage";
import ProblemPage from "./pages/Problems/ProblemPage";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import PublicProfile from "./pages/student/PublicProfile";
import QuizPage from "./pages/student/QuizPage";
import LearnPage from "./pages/Learn/LearnPage";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Signup from "./pages/Auth/Signup";
import Workspace from "./pages/Workspace/Page";
import EditCourse from "./pages/Workspace/EditCourse";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";

import AuthLoading from "./components/auth/AuthLoading";
import UploadPdfPage from "./pages/UploadPdfPage";
import CourseView from "./pages/Workspace/CourseView";
import AboutPage from "./pages/about/About";
import Playground from "./pages/Playgrounds/Page";
import LanguagePlayground from "./pages/Playgrounds/LanguagePlayground";
import Home from "./pages/Community/components/Home";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <Navigate to="/" replace /> },

      {
        path: "problems",
        element: (
          <ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "problem/:id",
        element: (
          <ProtectedRoute>
            <ProblemPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-learning",
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/:courseId",
        element: (
          <ProtectedRoute>
            <CourseView />
          </ProtectedRoute>
        ),
      },
      {
        path: "workspace",
        element: (
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        ),
      },
      // 2. ADDED THE DOCUMENTS ROUTE HERE
      {
        path: "documents",
        element: (
          <ProtectedRoute>
            <DocumentDetailPage />
          </ProtectedRoute>
        ),
      },
      { path: "workspace/edit-course/:courseId", element: <EditCourse /> },
      { path: "document", element: <DocumentDetailPage /> },
      { path: "upload-pdf", element: <UploadPdfPage /> },

      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:userId",
        element: (
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        ),
      },

      { path: "quiz", element: <QuizPage /> },
      {
        path: "playground/:language",
        element: (
          <ProtectedRoute>
            <LanguagePlayground />
          </ProtectedRoute>
        ),
      },
      { path: "learn", element: <LearnPage /> },
      { path: "signup", element: <Signup /> },
      { path: "login", element: <Login /> },
      { path: "about", element: <AboutPage /> },
      { path: "playground", element: <Playground /> },
      { path: "community", element: <Home /> },
    ],
  },

  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <a href="/" className="text-blue-600 hover:underline text-lg">
          Go Back Home
        </a>
      </div>
    ),
  },
]);

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={appRouter} />
    </GoogleOAuthProvider>
  );
}

export default App;
