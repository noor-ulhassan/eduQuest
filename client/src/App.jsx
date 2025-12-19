import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeAuth } from "./features/auth/authThunks";

import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/Homepage/HomePage";
import HeroSection from "./components/home/HeroSection";
import Courses from "./components/home/Courses";
import ProblemsPage from "./pages/student/ProblemsPage";
import ProblemPage from "./pages/student/ProblemPage";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import QuizPage from "./pages/student/QuizPage";
import LearnPage from "./pages/Learn/LearnPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Workspace from "./pages/Workspace/Page";
import EditCourse from "./pages/Workspace/EditCourse";
import { useSelector } from "react-redux";
import AuthLoading from "./components/AuthLoading";
import About from "./pages/about/About";
import UploadPdfPage from "./pages/UploadPdfPage";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <Navigate to="/" replace /> },

      { path: "problems", element: <ProblemsPage /> },
      { path: "problem/:id", element: <ProblemPage /> },
      { path: "my-learning", element: <MyLearning /> },
      { path: "workspace", element: <Workspace /> },
      { path: "/workspace/edit-course/:courseId", element: <EditCourse /> },
      { path: "/About", element: <About /> },
      { path: "/uploadpdf", element: <UploadPdfPage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },

      { path: "quiz", element: <QuizPage /> },
      { path: "learn", element: <LearnPage /> },

      { path: "signup", element: <Signup /> },
      { path: "login", element: <Login /> },
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
