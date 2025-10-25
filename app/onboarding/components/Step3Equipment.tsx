"use client";
import { useState } from "react";
import { equipmentSchema } from "@/lib/validations/onboarding";
import { z } from "zod";

interface Step3EquipmentProps {
  formData: {
    equipment: string[];
  };
  updateFormData: (field: string, value: string[]) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

// Equipment options matching ExerciseDB API values EXACTLY
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

export default function Step3Equipment({
  formData,
  updateFormData,
  onSubmit,
  onPrev,
  isSubmitting,
}: Step3EquipmentProps) {
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const toggleEquipment = (value: string) => {
    const current = formData.equipment;
    
    if (current.includes(value)) {
      // Remove if already selected
      updateFormData(
        "equipment",
        current.filter((item) => item !== value)
      );
    } else {
      // Add if not selected
      updateFormData("equipment", [...current, value]);
    }
  };

  const handleSubmit = () => {
    setTouched({ equipment: true });
    try {
      equipmentSchema.parse(formData);
      setErrors([]);
      onSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Available Equipment</h2>
        <p className="text-slate-600">Select all equipment you have access to</p>
      </div>

      {/* Equipment Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {equipmentOptions.map((equipment) => {
          const isSelected = formData.equipment.includes(equipment.value);
          return (
            <button
              key={equipment.value}
              onClick={() => toggleEquipment(equipment.value)}
              className={`rounded-lg border-2 p-4 text-center transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="mb-2 text-3xl">{equipment.icon}</div>
              <div className="text-sm font-medium text-slate-900">{equipment.label}</div>
              {isSelected && (
                <div className="mt-2 flex justify-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Counter */}
      {formData.equipment.length > 0 && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-green-800">
            {formData.equipment.length} item{formData.equipment.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-green-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
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
              Saving...
            </span>
          ) : (
            "Complete Setup"
          )}
        </button>
      </div>
    </div>
  );
}

