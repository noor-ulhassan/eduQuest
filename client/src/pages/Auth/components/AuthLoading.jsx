import PageLoader from "@/components/ui/PageLoader";

/**
 * AuthLoading — shown during the initial auth state check (idle/loading).
 * Delegates to the shared PageLoader so the spinner style stays in one place.
 */
function AuthLoading() {
  return <PageLoader message="Initialising…" />;
}

export default AuthLoading;
