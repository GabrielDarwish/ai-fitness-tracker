/**
 * Error Component
 * Reusable error states
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface ErrorProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
  className?: string;
}

export function Error({
  title = "Something went wrong",
  message,
  action,
  fullScreen = false,
  className,
}: ErrorProps) {
  const content = (
    <div className={cn("text-center", className)}>
      <div className="mb-6 flex justify-center">
        <img src="/logo.png" alt="Error" className="h-40 w-40 opacity-50" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mb-6 text-slate-600">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md px-4">{content}</div>
      </div>
    );
  }

  return content;
}

/**
 * Inline Error Message
 */
interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}

/**
 * Success Message
 */
interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}

