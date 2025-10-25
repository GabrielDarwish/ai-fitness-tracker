/**
 * Empty State Component
 * Reusable empty state for lists and collections
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center",
        className
      )}
    >
      <div className="mb-6 text-6xl">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mb-6 text-slate-600">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-600"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-600"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Simple Empty Message
 * Lightweight version for smaller spaces
 */
interface EmptyMessageProps {
  icon?: string;
  message: string;
  className?: string;
}

export function EmptyMessage({
  icon = "📭",
  message,
  className,
}: EmptyMessageProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      <div className="mb-4 text-4xl opacity-50">{icon}</div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
}

