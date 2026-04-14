"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  leadId: string | null;
  onClose?: () => void;
};

export default function StepForm({ leadId, onClose }: Props) {

  const [open, setOpen] = useState(true);
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

  const remaining = 4 - step;
  const headingText =
    remaining === 3
      ? "सिर्फ अपना नम्‍बर, नाम और शिक्षा बता दीजिए, ताकि आपको आपके अनुसार क्‍लास की लिंक भेजी जा सके"
      : remaining === 2
      ? "बस 2 बातें और"
      : remaining === 1
      ? "बस 1 बात और"
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

      if (!form.gender) {
        alert("Select gender");
        setLoading(false);
        return;
      }

      if (!form.student_name.trim()) {
        alert("Enter name");
        setLoading(false);
        return;
      }

      await updateLead({
        student_name: form.student_name,
        gender: form.gender,
      });

      setStep(3);
      setLoading(false);
      return;
    }

    if (step === 3) {

      if (!form.education) {
        alert("Select education");
        setLoading(false);
        return;
      }

      await updateLead({ education: form.education });

      setDone(true);

      // ✅ WhatsApp
      const message = `Hi 👋
कृपया डेमो क्‍लास का समय और क्‍लास की लिंक भेजिये.

Name: ${form.student_name}
Mobile: ${form.mobile_number}`;

      window.open(
        `https://wa.me/919713014234?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      setTimeout(() => {
        setOpen(false);
      }, 3000);

      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">

      <div className="bg-white w-full max-w-sm p-5 rounded-xl space-y-4 relative">
  
        <button
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
          className="absolute top-2 right-3 text-xl text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-sm font-semibold text-center">
          {done ? "🎉 Demo Booked Successfully" : headingText}
        </h2>

        {!done && (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <p>मोबाइल नंबर </p>
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
    {/* 🔥 CLEAR INSTRUCTION */}
    <p className="text-center text-sm font-medium text-gray-700">
      👉 पहले Gender के लिए बटन दबाएँ
    </p>

    <div className="flex gap-3">
      <div
        onClick={() => handleChange("gender", "Male")}
        className={`flex-1 flex items-center justify-center gap-1 p-2 border rounded cursor-pointer ${
          form.gender === "Male" ? "bg-blue-100 border-blue-500" : ""
        }`}
      >
        👨 <span className="text-xs">M</span>
      </div>

      <div
        onClick={() => handleChange("gender", "Female")}
        className={`flex-1 flex items-center justify-center gap-1 p-2 border rounded cursor-pointer ${
          form.gender === "Female" ? "bg-pink-100 border-pink-500" : ""
        }`}
      >
        👩 <span className="text-xs">F</span>
      </div>
    </div>

    {/* 🔥 SECOND INSTRUCTION */}
    <p className="text-xs text-gray-500 text-center mt-2">
      👉 फिर नीचे अपना पूरा नाम लिखें
    </p>

    <input
      value={form.student_name}
      disabled={!form.gender}
      onChange={(e) => {
        let value = e.target.value;

        // ✅ Only text allow
        value = value.replace(/[^a-zA-Z\s]/g, "");

        // ✅ Capitalize first letter of each word
        value = value
          .split(" ")
          .map((word) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        handleChange("student_name", value);
      }}
      placeholder="अपना पूरा नाम यहाँ लिखें"
      className={`border px-3 py-2 rounded w-full ${
        !form.gender ? "bg-gray-100" : ""
      }`}
    />
  </>
)}

            {/* ✅ STEP 3 FULL GRID (UNCHANGED) */}
            {step === 3 && (
              <>
                <p>स्‍टूडेन्‍ट की शिक्षा </p>

                <div className="space-y-2">

                  <div className="grid grid-cols-6 gap-2">
                    {["1st","2nd","3rd","4th","5th","6th"].map((item) => (
                      <div key={item} onClick={() => handleChange("education", item)}
                        className={`text-center py-2 border rounded text-xs ${form.education === item ? "bg-blue-100 border-blue-500" : ""}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {["7th","8th","9th","10th","11th","12th"].map((item) => (
                      <div key={item} onClick={() => handleChange("education", item)}
                        className={`text-center py-2 border rounded text-xs ${form.education === item ? "bg-blue-100 border-blue-500" : ""}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1st Y.","2nd Y.","3rd Y.","Graduate"].map((item) => (
                      <div key={item} onClick={() => handleChange("education", item)}
                        className={`text-center py-2 border rounded text-xs ${form.education === item ? "bg-blue-100 border-blue-500" : ""}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["PG","Other"].map((item) => (
                      <div key={item} onClick={() => handleChange("education", item)}
                        className={`text-center py-2 border rounded text-xs ${form.education === item ? "bg-blue-100 border-blue-500" : ""}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                </div>
              </>
            )}

            <button
  onClick={handleNext}
  disabled={loading}
  className="w-full bg-blue-600 text-white py-2 rounded"
>
  {loading ? "Please wait..." : step === 3 ? "Finish" : "Next"}
</button>
</>
        )}
        {done && (
          <div className="text-center space-y-3">
            <p className="text-green-600">आपका डेमो बुक हो गया ✅</p>

            <a
              href="https://zoom.us/j/xxxx"
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
            >
              Join Demo Class
            </a>
          </div>
        )}

      </div>
    </div>
  );
}