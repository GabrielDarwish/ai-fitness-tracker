"use client";

interface FilterBarProps {
  filters: {
    bodyPart: string;
    equipment: string;
    target: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const BODY_PARTS = [
  "all",
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

const EQUIPMENT = [
  "all",
  "assisted",
  "band",
  "barbell",
  "body weight",
  "bosu ball",
  "cable",
  "dumbbell",
  "elliptical machine",
  "ez barbell",
  "hammer",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "olympic barbell",
  "resistance band",
  "roller",
  "rope",
  "skierg machine",
  "sled machine",
  "smith machine",
  "stability ball",
  "stationary bike",
  "stepmill machine",
  "tire",
  "trap bar",
  "upper body ergometer",
  "weighted",
  "wheel roller",
];

const TARGETS = [
  "all",
  "abs",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "cardiovascular system",
  "delts",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "levator scapulae",
  "pectorals",
  "quads",
  "serratus anterior",
  "spine",
  "traps",
  "triceps",
  "upper back",
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search exercises by name..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-11 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <svg
          className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Body Part Filter */}
        <div>
          <label htmlFor="bodyPart" className="mb-1.5 block text-sm font-medium text-slate-700">
            Body Part
          </label>
          <select
            id="bodyPart"
            value={filters.bodyPart}
            onChange={(e) => onFilterChange("bodyPart", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {BODY_PARTS.map((part) => (
              <option key={part} value={part === "all" ? "" : part}>
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Filter */}
        <div>
          <label htmlFor="equipment" className="mb-1.5 block text-sm font-medium text-slate-700">
            Equipment
          </label>
          <select
            id="equipment"
            value={filters.equipment}
            onChange={(e) => onFilterChange("equipment", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {EQUIPMENT.map((eq) => (
              <option key={eq} value={eq === "all" ? "" : eq}>
                {eq.charAt(0).toUpperCase() + eq.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Target Muscle Filter */}
        <div>
          <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-slate-700">
            Target Muscle
          </label>
          <select
            id="target"
            value={filters.target}
            onChange={(e) => onFilterChange("target", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {TARGETS.map((tgt) => (
              <option key={tgt} value={tgt === "all" ? "" : tgt}>
                {tgt.charAt(0).toUpperCase() + tgt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.bodyPart || filters.equipment || filters.target || filters.search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              Search: {filters.search}
              <button
                onClick={() => onFilterChange("search", "")}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.bodyPart && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              {filters.bodyPart}
              <button
                onClick={() => onFilterChange("bodyPart", "")}
                className="ml-1 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.equipment && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">
              {filters.equipment}
              <button
                onClick={() => onFilterChange("equipment", "")}
                className="ml-1 hover:text-amber-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.target && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
              {filters.target}
              <button
                onClick={() => onFilterChange("target", "")}
                className="ml-1 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              onFilterChange("search", "");
              onFilterChange("bodyPart", "");
              onFilterChange("equipment", "");
              onFilterChange("target", "");
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

