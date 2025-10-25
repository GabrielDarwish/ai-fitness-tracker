interface Step3EquipmentProps {
  formData: {
    equipment: string[];
  };
  updateFormData: (field: string, value: string[]) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

const equipmentOptions = [
  { value: "dumbbells", label: "Dumbbells", icon: "🏋️" },
  { value: "barbell", label: "Barbell", icon: "🏋️‍♂️" },
  { value: "kettlebell", label: "Kettlebell", icon: "🔔" },
  { value: "resistance-bands", label: "Resistance Bands", icon: "🎗️" },
  { value: "pull-up-bar", label: "Pull-up Bar", icon: "🚪" },
  { value: "bench", label: "Bench", icon: "🪑" },
  { value: "yoga-mat", label: "Yoga Mat", icon: "🧘‍♀️" },
  { value: "jump-rope", label: "Jump Rope", icon: "🪢" },
  { value: "foam-roller", label: "Foam Roller", icon: "📏" },
  { value: "medicine-ball", label: "Medicine Ball", icon: "⚽" },
  { value: "trx-straps", label: "TRX Straps", icon: "🎽" },
  { value: "none", label: "No Equipment (Bodyweight)", icon: "💪" },
];

export default function Step3Equipment({
  formData,
  updateFormData,
  onSubmit,
  onPrev,
  isSubmitting,
}: Step3EquipmentProps) {
  const toggleEquipment = (value: string) => {
    const current = formData.equipment;
    
    // If "none" is selected, clear all others
    if (value === "none") {
      updateFormData("equipment", current.includes("none") ? [] : ["none"]);
      return;
    }
    
    // If selecting other equipment, remove "none"
    const filtered = current.filter((item) => item !== "none");
    
    if (filtered.includes(value)) {
      updateFormData(
        "equipment",
        filtered.filter((item) => item !== value)
      );
    } else {
      updateFormData("equipment", [...filtered, value]);
    }
  };

  const handleSubmit = () => {
    if (formData.equipment.length === 0) {
      alert("Please select at least one option");
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Available Equipment</h2>
        <p className="text-slate-600">Select all equipment you have access to</p>
      </div>

      {/* Equipment Grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
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

