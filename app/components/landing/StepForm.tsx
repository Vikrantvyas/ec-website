"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  leadId: string | null;
};

export default function StepForm({ leadId }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    student_name: "",
    city: "",
    course: "",
    preferred_timing: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleNext() {
    if (!leadId) return;

    let field: any = {};

    if (step === 1) field = { student_name: form.student_name };
    if (step === 2) field = { city: form.city };
    if (step === 3) field = { course: form.course };
    if (step === 4) field = { preferred_timing: form.preferred_timing };

    const { error } = await supabase
      .from("leads")
      .update(field)
      .eq("id", leadId);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    setStep(step + 1);
  }

  return (
    <div className="space-y-3 text-sm">

      {step === 1 && (
        <>
          <p>What is your name?</p>
          <input
            value={form.student_name}
            onChange={(e) => handleChange("student_name", e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </>
      )}

      {step === 2 && (
        <>
          <p>Your city?</p>
          <input
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </>
      )}

      {step === 3 && (
        <>
          <p>Which course?</p>
          <input
            value={form.course}
            onChange={(e) => handleChange("course", e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
        </>
      )}

      {step === 4 && (
        <>
          <p>Preferred timing?</p>
          <input
            value={form.preferred_timing}
            onChange={(e) =>
              handleChange("preferred_timing", e.target.value)
            }
            className="border px-2 py-1 rounded w-full"
          />
        </>
      )}

      {step <= 4 ? (
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Next
        </button>
      ) : (
        <p className="text-green-600">
          Thank you! We will contact you soon 😊
        </p>
      )}
    </div>
  );
}