"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  leadId: string | null;
};

export default function StepForm({ leadId }: Props) {

  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    mobile_number: "",
    student_name: "",
    gender: "",
    education: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    setOpen(true);
  }, []);

  // ✅ Dynamic heading
  const remaining = 5 - step;
  const headingText =
    remaining === 4
      ? "बस 4 बातें बता दीजिए ताकि हम आपको सही जानकारी दे सके"
      : remaining === 3
      ? "बस 3 बातें और"
      : remaining === 2
      ? "बस 2 बातें और"
      : "ये आखिरी";

  async function handleNext() {

    let field: any = {};

    // STEP 1 - MOBILE
    if (step === 1) {
      if (!/^\d{10}$/.test(form.mobile_number)) {
        alert("Enter valid 10 digit mobile");
        return;
      }

      field = { mobile_number: form.mobile_number };

      if (leadId) {
        await supabase.from("leads").update(field).eq("id", leadId);
      }

      setStep(2);
      return;
    }

    // STEP 2 - NAME
    if (step === 2) {
      if (!form.student_name.trim()) {
        alert("Enter your name");
        return;
      }

      field = { student_name: form.student_name };

      if (leadId) {
        await supabase.from("leads").update(field).eq("id", leadId);
      }

      setStep(3);
      return;
    }

    // STEP 3 - GENDER
    if (step === 3) {
      if (!form.gender) {
        alert("Select gender");
        return;
      }

      field = { gender: form.gender };

      if (leadId) {
        await supabase.from("leads").update(field).eq("id", leadId);
      }

      setStep(4);
      return;
    }

    // STEP 4 - EDUCATION (LAST STEP)
    if (step === 4) {
      if (!form.education) {
        alert("Select education");
        return;
      }

      field = { education: form.education };

      if (leadId) {
        await supabase.from("leads").update(field).eq("id", leadId);
      }

      // ✅ Direct close (no thank you message)
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md p-5 rounded-lg space-y-4 relative">

        {/* CLOSE */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-3 text-gray-500"
        >
          ✕
        </button>

        {/* ✅ UPDATED HEADING */}
        <h2 className="text-lg font-semibold text-center">
          {headingText}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <p>अपना मोबाइल नंबर दर्ज करें</p>
            <input
              value={form.mobile_number}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  handleChange("mobile_number", val);
                }
              }}
              className="border px-2 py-2 rounded w-full"
              placeholder="10 digit mobile"
            />
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p>अपना नाम बताएं</p>
            <input
              value={form.student_name}
              onChange={(e) =>
                handleChange("student_name", e.target.value)
              }
              className="border px-2 py-2 rounded w-full"
              placeholder="Your name"
            />
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <p>अपना gender चुनें</p>
            <select
              value={form.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value)
              }
              className="border px-2 py-2 rounded w-full"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <p>अपनी education चुनें</p>
            <select
              value={form.education}
              onChange={(e) =>
                handleChange("education", e.target.value)
              }
              className="border px-2 py-2 rounded w-full"
            >
              <option value="">Select</option>

              <option>Class 1</option>
              <option>Class 2</option>
              <option>Class 3</option>
              <option>Class 4</option>
              <option>Class 5</option>
              <option>Class 6</option>
              <option>Class 7</option>
              <option>Class 8</option>
              <option>Class 9</option>
              <option>Class 10</option>
              <option>Class 11</option>
              <option>Class 12</option>

              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>

              <option>Graduate</option>
              <option>Post Graduate</option>
              <option>Other</option>
            </select>
          </>
        )}

        {/* BUTTON */}
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Next
        </button>

      </div>
    </div>
  );
}