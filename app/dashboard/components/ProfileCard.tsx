"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface ProfileCardProps {
  goals: string;
  equipment: string[];
}

export default function ProfileCard({ goals, equipment }: ProfileCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Your Profile</h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100"
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
        <div className="space-y-2 text-sm">
          <p className="text-slate-600">
            <span className="font-medium text-slate-900">Goal:</span>{" "}
            {goals?.replace(/-/g, " ") || "Not set"}
          </p>
          <p className="text-slate-600">
            <span className="font-medium text-slate-900">Equipment:</span>{" "}
            {equipment && equipment.length > 0 ? equipment.join(", ") : "None"}
          </p>
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

