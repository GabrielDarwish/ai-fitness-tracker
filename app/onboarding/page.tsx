"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Step1Profile from "./components/Step1Profile";
import Step2Goals from "./components/Step2Goals";
import Step3Equipment from "./components/Step3Equipment";

interface FormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goals: string;
  equipment: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goals: "",
    equipment: [],
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-slate-500">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
          {/* Step Content */}
          {step === 1 && (
            <Step1Profile
              formData={formData}
              updateFormData={updateFormData}
              onNext={next}
            />
          )}
          {step === 2 && (
            <Step2Goals
              formData={formData}
              updateFormData={updateFormData}
              onNext={next}
              onPrev={prev}
            />
          )}
          {step === 3 && (
            <Step3Equipment
              formData={formData}
              updateFormData={updateFormData}
              onSubmit={handleSubmit}
              onPrev={prev}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

