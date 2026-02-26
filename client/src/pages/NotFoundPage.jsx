import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

/**
 * NotFoundPage — shown whenever the user navigates to a route that doesn't exist.
 * Replaces the inline JSX that was previously embedded in App.jsx's router config.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-50 text-center">
      {/* Illustrative icon area */}
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-yellow-50 border-2 border-yellow-100 mb-6">
        <SearchX className="h-12 w-12 text-yellow-500" />
      </div>

      {/* Branded 404 */}
      <p className="text-6xl font-black tracking-tight text-yellow-500 mb-2">
        404
      </p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
        Double-check the URL or head back home.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-white font-semibold text-sm hover:bg-yellow-600 transition-colors shadow-sm"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
