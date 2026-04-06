"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  leadId: string | null;
};

export default function StepForm({ leadId }: Props) {

  const [open, setOpen] = useState(true); // ✅ popup control
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(leadId);

  const [form, setForm] = useState({
    mobile_number: "",
    student_name: "",
    gender: "",
    education: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const remaining = 5 - step;
  const headingText =
    remaining === 4
      ? "बस 4 बातें, ताकि हम आपको सही जानकारी दे सके"
      : remaining === 3
      ? "बस 3 बातें और"
      : remaining === 2
      ? "बस 2 बातें और"
      : "ये आखिरी";

  async function createLead() {
    const now = new Date();

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          mobile_number: form.mobile_number,
          enquiry_date: now.toISOString().split("T")[0],
          enquiry_time: now.toLocaleTimeString(),
          method: "Social Media",
          channel: "Meta Ad",
          department: "English",
          course: "Basic + Adv. English",
          lead_stage: "Lead",
          lead_chances: "High",
          action: "Follow up",
          next_follow_date: now.toISOString().split("T")[0],
          branch_id: "628ac5fa-0289-48e0-9ae8-35bf8806ff78",
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Error creating lead");
      return null;
    }

    return data.id;
  }

  async function updateLead(field: any) {
    if (!currentLeadId) return;

    await supabase.from("leads").update(field).eq("id", currentLeadId);
  }

  async function handleNext() {

    if (loading) return;
    setLoading(true);

    if (step === 1) {
      if (!/^\d{10}$/.test(form.mobile_number)) {
        alert("Enter valid mobile");
        setLoading(false);
        return;
      }

      let id = currentLeadId;

      if (!id) {
        id = await createLead();
        if (!id) {
          setLoading(false);
          return;
        }
        setCurrentLeadId(id);
      }

      setStep(2);
      setLoading(false);
      return;
    }

    if (step === 2) {
      if (!form.student_name.trim()) {
        alert("Enter name");
        setLoading(false);
        return;
      }

      await updateLead({ student_name: form.student_name });
      setStep(3);
      setLoading(false);
      return;
    }

    if (step === 3) {
      if (!form.gender) {
        alert("Select gender");
        setLoading(false);
        return;
      }

      await updateLead({ gender: form.gender });
      setStep(4);
      setLoading(false);
      return;
    }

    if (step === 4) {
      if (!form.education) {
        alert("Select education");
        setLoading(false);
        return;
      }

      await updateLead({ education: form.education });

      // ✅ DONE STATE
      setDone(true);

      // ✅ auto close (NO reload)
      setTimeout(() => {
        setOpen(false);
      }, 1500);

      setLoading(false);
    }
  }

  // ✅ popup close
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">

      <div className="bg-white w-full max-w-sm p-5 rounded-xl space-y-4">

        <h2 className="text-lg font-semibold text-center">
          {done ? "Thanks 😊" : headingText}
        </h2>

        {!done && (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <p>मोबाइल नंबर दर्ज करें</p>
                <input
                  value={form.mobile_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      handleChange("mobile_number", val);
                    }
                  }}
                  className="border px-3 py-2 rounded w-full"
                />
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <p>आपका नाम</p>
                <input
                  value={form.student_name}
                  onChange={(e) =>
                    handleChange("student_name", e.target.value)
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <p>आपका gender</p>

                <div className="flex gap-4 justify-center">

                  <div
                    onClick={() => handleChange("gender", "Male")}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      form.gender === "Male" ? "bg-blue-100" : ""
                    }`}
                  >
                    👨 Male
                  </div>

                  <div
                    onClick={() => handleChange("gender", "Female")}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      form.gender === "Female" ? "bg-pink-100" : ""
                    }`}
                  >
                    👩 Female
                  </div>

                </div>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <p>आपकी education</p>
                <select
                  value={form.education}
                  onChange={(e) =>
                    handleChange("education", e.target.value)
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Select</option>

                  {[...Array(12)].map((_, i) => (
                    <option key={i}>Class {i + 1}</option>
                  ))}

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
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {loading ? "Please wait..." : "Next"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}