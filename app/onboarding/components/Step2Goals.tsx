interface Step2GoalsProps {
  formData: {
    goals: string;
  };
  updateFormData: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const goalOptions = [
  {
    value: "weight-loss",
    label: "Weight Loss",
    description: "Reduce body fat and get leaner",
    icon: "🔥",
  },
  {
    value: "muscle-gain",
    label: "Muscle Gain",
    description: "Build strength and muscle mass",
    icon: "💪",
  },
  {
    value: "endurance",
    label: "Endurance",
    description: "Improve stamina and cardiovascular fitness",
    icon: "🏃",
  },
  {
    value: "flexibility",
    label: "Flexibility",
    description: "Enhance mobility and range of motion",
    icon: "🧘",
  },
  {
    value: "general-fitness",
    label: "General Fitness",
    description: "Overall health and wellness",
    icon: "⚡",
  },
];

export default function Step2Goals({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: Step2GoalsProps) {
  const handleNext = () => {
    if (!formData.goals) {
      alert("Please select a fitness goal");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">What's your goal?</h2>
        <p className="text-slate-600">Choose your primary fitness objective</p>
      </div>

      {/* Goal Options */}
      <div className="space-y-3">
        {goalOptions.map((goal) => (
          <button
            key={goal.value}
            onClick={() => updateFormData("goals", goal.value)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
              formData.goals === goal.value
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{goal.icon}</div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-slate-900">{goal.label}</h3>
                <p className="text-sm text-slate-600">{goal.description}</p>
              </div>
              {formData.goals === goal.value && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="h-4 w-4 text-white"
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
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 rounded-lg bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

