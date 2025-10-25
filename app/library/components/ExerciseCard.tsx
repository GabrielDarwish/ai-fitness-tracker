"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Target, Dumbbell, Focus } from "lucide-react";

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
    <div className="group relative">
      {/* Gradient border effect */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
      
      <Link 
        href={`/library/${exercise.id}`}
        className="relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Image Container with overlay */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {exercise.gifUrl ? (
            <>
              <Image
                src={exercise.gifUrl}
                alt={exercise.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
          
          {/* Floating save button */}
          <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`
              absolute right-3 top-3 z-10
              flex h-11 w-11 items-center justify-center
              rounded-full backdrop-blur-sm
              shadow-lg
              transition-all duration-300
              hover:scale-110 active:scale-95
              ${isSaved
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
              }
              ${isLoading ? "cursor-not-allowed opacity-50" : ""}
            `}
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Heart 
                className={`h-5 w-5 transition-all ${isSaved ? "fill-white" : ""}`} 
              />
            )}
          </button>
        </div>

        {/* Exercise Info */}
        <div className="p-4">
          <h3 className="mb-3 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
            {exercise.name}
          </h3>

          {/* Tags with icons */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-xs font-semibold text-blue-700">
              <Target className="h-3.5 w-3.5" />
              {exercise.bodyPart}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-xs font-semibold text-green-700">
              <Dumbbell className="h-3.5 w-3.5" />
              {exercise.equipment}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-xs font-semibold text-purple-700">
              <Focus className="h-3.5 w-3.5" />
              {exercise.target}
            </span>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
      </Link>
    </div>
  );
}

