import { QueryClient } from "@tanstack/react-query";

// Helper to get the base URL depending on environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return '';  // Use relative URLs in development
  }
  return '';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
        console.log("Making API request to:", fullUrl);

        try {
          const res = await fetch(fullUrl, {
            credentials: "include",
          });

          console.log("API response status:", res.status);

          if (!res.ok) {
            if (res.status >= 500) {
              throw new Error(`Server error: ${res.status}`);
            }
            const errorText = await res.text();
            throw new Error(`API error: ${res.status} - ${errorText}`);
          }

          const data = await res.json();
          console.log("API response data received");
          return data;
        } catch (error) {
          console.error("API request failed:", error);
          throw error;
        }
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    }
  },
});