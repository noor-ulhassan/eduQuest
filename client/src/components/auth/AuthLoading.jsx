function AuthLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="h-10 w-10 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-gray-600">
        Loading…
      </p>
    </div>
  );
}

export default AuthLoading;
