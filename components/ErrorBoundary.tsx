"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-50 p-4">
                  <svg
                    className="h-12 w-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                  Something went wrong
                </h2>
                <p className="mb-6 text-slate-600">
                  {this.state.error.message ||
                    "An unexpected error occurred. Please try again."}
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === "development" && (
                  <details className="mb-6 rounded-lg bg-slate-50 p-4 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700">
                      Error Details
                    </summary>
                    <pre className="mt-2 overflow-auto text-xs text-slate-600">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={this.resetError}
                    className="flex-1 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-md transition-all duration-200 hover:bg-slate-50 hover:shadow-lg"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
export function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900">Error</h3>
          <p className="mt-1 text-sm text-red-700">
            {error.message || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={reset}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

