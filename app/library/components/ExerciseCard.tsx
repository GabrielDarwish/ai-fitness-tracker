"use client";

import { useState } from "react";
import Link from "next/link";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
    bodyPart: string;
    equipment: string;
    target: string;
  };
  isSaved: boolean;
  onToggleSave: (exerciseId: string, currentlySaved: boolean) => Promise<void>;
}

export default function ExerciseCard({
  exercise,
  isSaved,
  onToggleSave,
}: ExerciseCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    setIsLoading(true);
    try {
      await onToggleSave(exercise.id, isSaved);
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link 
      href={`/library/${exercise.id}`}
      className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {exercise.gifUrl ? (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-400">
            💪
          </div>
        )}
        
        {/* Save Button Overlay */}
        <button
          onClick={handleToggleSave}
          disabled={isLoading}
          className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            isSaved
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
          } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          aria-label={isSaved ? "Unsave exercise" : "Save exercise"}
        >
          {isLoading ? (
            <svg
              className="h-5 w-5 animate-spin"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : isSaved ? (
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Exercise Info */}
      <div className="p-4">
        <h3 className="mb-3 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {exercise.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {exercise.bodyPart}
          </span>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            {exercise.equipment}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {exercise.target}
          </span>
        </div>
      </div>
    </Link>
  );
}

