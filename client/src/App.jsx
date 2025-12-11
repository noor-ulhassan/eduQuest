import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import ProblemsPage from "./pages/student/ProblemsPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./components/ProtectedRoute";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <ProblemsPage /> }, // default page
      { path: "/signup", element: <Signup /> },
      { path: "/login", element: <Login /> },
      { path: "problems", element: <ProblemsPage /> },
      { path: "my-learning", element: <MyLearning /> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
    ],
  },
  // ✅ Fallback route for 404s
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

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={appRouter} />;
    </GoogleOAuthProvider>
  );
}

export default App;
