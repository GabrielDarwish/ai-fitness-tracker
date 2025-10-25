"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: string;
  currentEquipment: string[];
}

const goalOptions = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "muscle-gain", label: "Muscle Gain" },
  { value: "strength", label: "Strength Training" },
  { value: "endurance", label: "Endurance" },
  { value: "general-fitness", label: "General Fitness" },
];

const equipmentOptions = [
  { value: "body weight", label: "Body Weight", icon: "💪" },
  { value: "dumbbell", label: "Dumbbells", icon: "🏋️" },
  { value: "barbell", label: "Barbell", icon: "🏋️‍♂️" },
  { value: "kettlebell", label: "Kettlebell", icon: "🔔" },
  { value: "band", label: "Resistance Bands", icon: "🎗️" },
  { value: "resistance band", label: "Resistance Band", icon: "🎗️" },
  { value: "cable", label: "Cable Machine", icon: "🔗" },
  { value: "leverage machine", label: "Leverage Machine", icon: "⚙️" },
  { value: "smith machine", label: "Smith Machine", icon: "🏗️" },
  { value: "stability ball", label: "Stability Ball", icon: "⚽" },
  { value: "bosu ball", label: "Bosu Ball", icon: "🔵" },
  { value: "medicine ball", label: "Medicine Ball", icon: "🏀" },
  { value: "ez barbell", label: "EZ Barbell", icon: "〰️" },
  { value: "olympic barbell", label: "Olympic Barbell", icon: "🏋️" },
  { value: "trap bar", label: "Trap Bar", icon: "⬡" },
  { value: "roller", label: "Foam Roller", icon: "📏" },
  { value: "wheel roller", label: "Wheel Roller", icon: "🛞" },
  { value: "rope", label: "Rope", icon: "🪢" },
  { value: "hammer", label: "Hammer", icon: "🔨" },
  { value: "sled machine", label: "Sled Machine", icon: "🛷" },
  { value: "tire", label: "Tire", icon: "🛞" },
  { value: "elliptical machine", label: "Elliptical", icon: "🏃" },
  { value: "stationary bike", label: "Stationary Bike", icon: "🚴" },
  { value: "stepmill machine", label: "Stepmill", icon: "🪜" },
  { value: "skierg machine", label: "Ski Erg", icon: "⛷️" },
  { value: "upper body ergometer", label: "Upper Body Erg", icon: "🚣" },
  { value: "assisted", label: "Assisted Machine", icon: "🤝" },
  { value: "weighted", label: "Weighted", icon: "⚖️" },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  currentGoal,
  currentEquipment,
}: EditProfileModalProps) {
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(currentEquipment);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { goals: string; equipment: string[] }) => {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      return res.json();
    },
    onSuccess: () => {
      showToast("Profile updated successfully! ✅", "success");
      // Invalidate related queries - React Query will refetch automatically
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onClose();
      // No need for window.location.reload() - React Query handles updates!
    },
    onError: () => {
      showToast("Failed to update profile", "error");
    },
  });

  const handleEquipmentToggle = (equipment: string) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== equipment));
    } else {
      setSelectedEquipment([...selectedEquipment, equipment]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEquipment.length === 0) {
      showToast("Please select at least one equipment option", "error");
      return;
    }

    updateProfileMutation.mutate({
      goals: selectedGoal,
      equipment: selectedEquipment,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Goal Selection */}
          <div className="mb-8">
            <label className="mb-3 block text-lg font-semibold text-slate-900">Fitness Goal</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setSelectedGoal(goal.value)}
                  className={`rounded-xl border-2 p-4 text-left font-medium transition-all ${
                    selectedGoal === goal.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="mb-8">
            <label className="mb-3 block text-lg font-semibold text-slate-900">
              Available Equipment
            </label>
            <p className="mb-4 text-sm text-slate-600">Select all equipment you have access to</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipmentOptions.map((equipment) => (
                <button
                  key={equipment.value}
                  type="button"
                  onClick={() => handleEquipmentToggle(equipment.value)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    selectedEquipment.includes(equipment.value)
                      ? "border-green-500 bg-green-50 text-green-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">{equipment.icon}</span>
                  <span className="text-sm font-medium">{equipment.label}</span>
                  {selectedEquipment.includes(equipment.value) && (
                    <svg
                      className="ml-auto h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Selected: {selectedEquipment.length} item{selectedEquipment.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

