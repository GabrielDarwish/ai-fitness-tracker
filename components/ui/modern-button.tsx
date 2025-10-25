"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "ai" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function ModernButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  loading = false,
  className,
  disabled,
  ...props
}: ModernButtonProps) {
  const baseStyles = `
    relative overflow-hidden
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    group
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600
      text-white
      shadow-lg shadow-blue-500/30
      hover:shadow-xl hover:shadow-blue-500/40
      hover:scale-105
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-green-500 to-green-600
      text-white
      shadow-lg shadow-green-500/30
      hover:shadow-xl hover:shadow-green-500/40
      hover:scale-105
      active:scale-95
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-emerald-600
      text-white
      shadow-lg shadow-emerald-500/30
      hover:shadow-xl hover:shadow-emerald-500/40
      hover:scale-105
      active:scale-95
    `,
    ai: `
      bg-gradient-to-r from-amber-500 to-orange-600
      text-white
      shadow-lg shadow-amber-500/40
      hover:shadow-xl hover:shadow-amber-500/50
      hover:scale-105
      active:scale-95
      border-2 border-amber-400
    `,
    ghost: `
      bg-white
      border-2 border-slate-200
      text-slate-700
      hover:border-blue-300
      hover:text-blue-600
      hover:shadow-md
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
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
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  );
}

