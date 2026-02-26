/**
 * PageLoader — full-page branded loading spinner.
 * Used as the Suspense fallback and in AuthLoading.
 */
const PageLoader = ({ message = "Loading…" }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="h-10 w-10 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin" />
      {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
    </div>
  );
};

export default PageLoader;
