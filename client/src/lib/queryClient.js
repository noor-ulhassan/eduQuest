import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh, no refetch on re-navigation
      retry: 1,                  // retry a failed request once before showing error
    },
  },
});

export default queryClient;
