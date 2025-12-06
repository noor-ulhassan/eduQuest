import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import ProblemsPage from "./pages/student/ProblemsPage";
import ProblemPage from "./pages/student/ProblemPage";
import Courses from "./pages/student/Courses";
import HeroSection from "./pages/student/HeroSection";
import HomePage from "./pages/student/HomePage";
import QuizPage from "./pages/student/QuizPage";
import Login from "./pages/Login";
import LearnPage from "./pages/Learn/LearnPage";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <Navigate to="/" replace /> },

      {
        path: "problems",
        element: <ProblemsPage />,
      },
      {
        path: "problem/:id",
        element: <ProblemPage />,
      },
      {
        path: "my-learning",
        element: <MyLearning />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "quiz",
        element: <QuizPage />,
      },
      {
        path: "learn",
        element: <LearnPage />,
      },

      // public
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
  return <RouterProvider router={appRouter} />;
}

export default App;
