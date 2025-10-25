"use client";
import { useState } from "react";
import { profileSchema } from "@/lib/validations/onboarding";
import { z } from "zod";

interface Step1ProfileProps {
  formData: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
  };
  updateFormData: (field: string, value: string) => void;
  onNext: () => void;
}

type ValidationErrors = {
  name?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
};

export default function Step1Profile({
  formData,
  updateFormData,
  onNext,
}: Step1ProfileProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any) => {
    try {
      // Validate single field
      const schema = profileSchema.shape[field as keyof typeof profileSchema.shape];
      schema.parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.issues[0].message }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Convert string to number for numeric fields
    const value = ["age", "height", "weight"].includes(field)
      ? parseFloat(formData[field as keyof typeof formData] || "0")
      : formData[field as keyof typeof formData];
    
    validateField(field, value);
  };

  const handleNext = () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      age: true,
      gender: true,
      height: true,
      weight: true,
    });

    // Validate all fields
    try {
      profileSchema.parse({
        name: formData.name,
        age: parseFloat(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
      });
      
      // Clear errors and proceed
      setErrors({});
      onNext();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field as keyof ValidationErrors] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Let's get to know you</h2>
        <p className="text-slate-600">Tell us about yourself to personalize your fitness journey</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={`w-full rounded-lg border px-4 py-3 text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
              touched.name && errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
            placeholder="John Doe"
          />
          {touched.name && errors.name && (
            <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Age & Gender */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="mb-2 block text-sm font-medium text-slate-700">
              Age
            </label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => updateFormData("age", e.target.value)}
              onBlur={() => handleBlur("age")}
              className={`w-full rounded-lg border px-4 py-3 text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                touched.age && errors.age
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
              placeholder="25"
              min="13"
              max="120"
            />
            {touched.age && errors.age && (
              <p className="mt-1.5 text-sm text-red-600">{errors.age}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => updateFormData("gender", e.target.value)}
              onBlur={() => handleBlur("gender")}
              className={`w-full rounded-lg border px-4 py-3 text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                touched.gender && errors.gender
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {touched.gender && errors.gender && (
              <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height" className="mb-2 block text-sm font-medium text-slate-700">
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              value={formData.height}
              onChange={(e) => updateFormData("height", e.target.value)}
              onBlur={() => handleBlur("height")}
              className={`w-full rounded-lg border px-4 py-3 text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                touched.height && errors.height
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
              placeholder="175"
              min="50"
              max="300"
              step="0.1"
            />
            {touched.height && errors.height && (
              <p className="mt-1.5 text-sm text-red-600">{errors.height}</p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="mb-2 block text-sm font-medium text-slate-700">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight}
              onChange={(e) => updateFormData("weight", e.target.value)}
              onBlur={() => handleBlur("weight")}
              className={`w-full rounded-lg border px-4 py-3 text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                touched.weight && errors.weight
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
              placeholder="70"
              min="20"
              max="500"
              step="0.1"
            />
            {touched.weight && errors.weight && (
              <p className="mt-1.5 text-sm text-red-600">{errors.weight}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="w-full rounded-lg bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Continue
      </button>
    </div>
  );
}

