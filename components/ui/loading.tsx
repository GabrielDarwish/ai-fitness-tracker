/**
 * Loading Component
 * Reusable loading states
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = "md",
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const content = (
    <div className={cn("text-center", className)}>
      <div className="mb-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Loading"
          className={cn(sizeClasses[size], "animate-pulse")}
        />
      </div>
      {text && (
        <p className={cn("text-slate-600", textSizes[size])}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Spinner Component
 * Simple spinner for inline loading states
 */
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <svg
      className={cn("animate-spin", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Loading Skeleton
 * Placeholder for loading content
 */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-200", className)}
    />
  );
}

/**
 * Card Skeleton Grid
 * Loading state for card grids
 */
interface CardSkeletonGridProps {
  count?: number;
  columns?: number;
}

export function CardSkeletonGrid({
  count = 8,
  columns = 4,
}: CardSkeletonGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns as keyof typeof gridCols])}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  );
}

