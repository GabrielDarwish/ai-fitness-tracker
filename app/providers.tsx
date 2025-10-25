"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider } from "@/components/ui/toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes before refetch
            staleTime: 1000 * 60 * 5,
            // Garbage collection time - cache persists for 30 minutes (renamed from cacheTime in v5)
            gcTime: 1000 * 60 * 30,
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on every window focus (better UX)
            refetchOnWindowFocus: false,
            // Refetch when connection restored
            refetchOnReconnect: true,
            // Refetch when component mounts if data is stale
            refetchOnMount: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}

