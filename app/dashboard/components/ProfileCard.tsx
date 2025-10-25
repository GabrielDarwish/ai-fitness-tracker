"use client";

import { useState } from "react";
import { User, Target, Dumbbell } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

interface ProfileCardProps {
  goals: string;
  equipment: string[];
}

export default function ProfileCard({ goals, equipment }: ProfileCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="group relative mt-6 animate-scale-in delay-500">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-slate-500 to-slate-600 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
        
        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-md shadow-slate-500/30">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Your Profile</h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 hover:scale-105 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-slate-900">Goal:</span>
              <span className="text-slate-600 capitalize">
                {goals?.replace(/-/g, " ") || "Not set"}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Dumbbell className="h-4 w-4 text-green-600 mt-0.5" />
              <span className="font-medium text-slate-900">Equipment:</span>
              <span className="text-slate-600">
                {equipment && equipment.length > 0 ? equipment.join(", ") : "None"}
              </span>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentGoal={goals || "general-fitness"}
        currentEquipment={equipment || []}
      />
    </>
  );
}

