"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";
import { supabase } from "@/lib/supabaseClient";

const callingPersons = ["Admin", "Counsellor", "Reception"];

const enquiryPurposes = ["Fresh Enquiry Follow-up", "General Follow-up"];
const demoPurposes = ["Demo Reminder", "Demo Feedback"];
const admissionPurposes = ["Admission Discussion", "Admission Confirmation"];
const studentPurposes = ["Fee Reminder", "Absent Alert", "Feedback Call"];

const positiveResults = ["Received by Student", "Received by Parent"];
const neutralResults = [
  "Phone Busy",
  "Not Received",
  "Not Reachable",
  "Switched Off",
  "Voice Issue",
];
const negativeResults = ["Cut the Call", "Not in Service"];

const positiveMoods = [
  "Very Interested",
  "Interested",
  "Wants Demo",
  "Wants Admission",
  "Will Visit Institute",
  "Fees Ready",
];
const neutralMoods = [
  "Call Back Later",
  "Thinking",
  "Need Time",
  "Discussing with Family",
  "Asked for Details on WhatsApp",
];
const negativeMoods = [
  "Not Interested",
  "Joined Somewhere Else",
  "Fees Too High",
];

const followUpOptions = [
  "Call in Evening",
  "Call Tomorrow",
  "Call After 3 Days",
  "Call After 7 Days",
  "Call After 1 Month",
  "Select Date",
];

export default function CallingFeedbackPage() {

  const params = useParams();
  const router = useRouter();

  const leadId = typeof params?.leadId === "string"
    ? params.leadId
    : Array.isArray(params?.leadId)
    ? params.leadId[0]
    : "";

  console.log("✅ Lead ID from URL:", leadId);

  const today = new Date().toISOString().split("T")[0];

  const [callingDate] = useState(today);
  const [callType, setCallType] = useState("Dialled");

  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [mood, setMood] = useState("");

  const [leadStage, setLeadStage] = useState("");
  const [leadChance, setLeadChance] = useState("");

  const [leadStageOptions, setLeadStageOptions] = useState<string[]>([]);
  const [leadChanceOptions, setLeadChanceOptions] = useState<string[]>([]);

  const [nextAction, setNextAction] = useState("");
  const [nextCallDate, setNextCallDate] = useState("");
  const [callingPerson, setCallingPerson] = useState("");
  const [remark, setRemark] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMasters = async () => {
      const { data: stageData } = await supabase.from("lead_stages").select("name");
      const { data: chanceData } = await supabase.from("lead_chances").select("name");

      if (stageData) setLeadStageOptions(stageData.map((s: any) => s.name));
      if (chanceData) setLeadChanceOptions(chanceData.map((c: any) => c.name));
    };

    fetchMasters();
  }, []);

  // ✅ FINAL HISTORY FIX
  const fetchHistory = async () => {
    if (!leadId) return;

    const { data: followups, error } = await supabase
      .from("lead_followups")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch Error:", error);
      return;
    }

    if (!followups) return;

    const { data: leadData } = await supabase
      .from("leads")
      .select("lead_stage, lead_chances")
      .eq("id", leadId)
      .single();

    const finalData = followups.map((f: any) => ({
      ...f,
      lead_stage: leadData?.lead_stage,
      lead_chances: leadData?.lead_chances,
    }));

    setHistory(finalData);
  };

  useEffect(() => {
    if (leadId) fetchHistory();
  }, [leadId]);

  useEffect(() => {
    if (!nextAction) return;

    const today = new Date();
    const next = new Date();

    if (nextAction === "Call Tomorrow") next.setDate(today.getDate() + 1);
    else if (nextAction === "Call After 3 Days") next.setDate(today.getDate() + 3);
    else if (nextAction === "Call After 7 Days") next.setDate(today.getDate() + 7);
    else if (nextAction === "Call After 1 Month") next.setMonth(today.getMonth() + 1);

    if (nextAction !== "Select Date") {
      setNextCallDate(next.toISOString().split("T")[0]);
    }
  }, [nextAction]);

  const needsDatePicker = nextAction === "Select Date";

  useEffect(() => {
    if (needsDatePicker) {
      setTimeout(() => dateRef.current?.showPicker?.(), 100);
    }
  }, [needsDatePicker]);

  const handleSave = async () => {

    if (!leadId) {
      alert("Lead ID missing ❌");
      return;
    }

    if (!purpose || !result) {
      alert("Purpose aur Result required hai");
      return;
    }

    if (!leadStage || !leadChance) {
      alert("Lead Stage aur Lead Chances select karo");
      return;
    }

    if (!confirm("Save this call feedback?")) return;

    setSaving(true);

    const { error: insertError } = await supabase.from("lead_followups").insert([
      {
        lead_id: leadId,
        call_type: callType,
        purpose,
        result,
        mood: mood || null,
        status: null,
        next_follow_up: nextCallDate || null,
        calling_person: callingPerson || null,
        remark: remark || null,
        call_date: callingDate,
      },
    ]);

    if (insertError) {
      console.log("Insert Error:", insertError);
      alert("Insert Error ❌");
      setSaving(false);
      return;
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("leads")
      .update({
        lead_stage: leadStage,
        lead_chances: leadChance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId as any)
      .select();

    console.log("UPDATED ROW:", updatedData);

    if (updateError) {
      console.log("Update Error:", updateError);
      alert("Update Error ❌");
      setSaving(false);
      return;
    }

    setSaving(false);

alert("Saved Successfully ✅");

// ✅ reload history immediately
await fetchHistory();

// ✅ optional form reset
setPurpose("");
setResult("");
setMood("");
setRemark("");
setNextAction("");
setNextCallDate("");
setCallingPerson("");
  };

  return (
    <div className="p-3 max-w-xl mx-auto space-y-4 text-sm">

      {/* ✅ FORM (UNCHANGED) */}
      <div className="bg-white border rounded-xl p-3 shadow space-y-3">

        <div className="grid grid-cols-2 gap-2">
          <input value={callingDate} readOnly className="border px-3 py-2 rounded bg-gray-50" />

          <div className="flex border rounded overflow-hidden">
            <button onClick={() => setCallType("Received")} className={`flex-1 py-2 ${callType === "Received" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Received</button>
            <button onClick={() => setCallType("Dialled")} className={`flex-1 py-2 ${callType === "Dialled" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Dialled</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <BottomSheetSelect label="Purpose" value={purpose}
            options={[...enquiryPurposes, ...demoPurposes, ...admissionPurposes, ...studentPurposes].map(p => ({ label: p, value: p }))}
            onChange={setPurpose}
          />

          <BottomSheetSelect label="Result" value={result}
            options={[...positiveResults, ...neutralResults, ...negativeResults].map(r => ({ label: r, value: r }))}
            onChange={setResult}
          />

          <BottomSheetSelect label="Mood" value={mood}
            options={[...positiveMoods, ...neutralMoods, ...negativeMoods].map(m => ({ label: m, value: m }))}
            onChange={setMood}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <BottomSheetSelect label="Lead Stage" value={leadStage}
            options={leadStageOptions.map(l => ({ label: l, value: l }))}
            onChange={setLeadStage}
          />

          <BottomSheetSelect label="Lead Chances" value={leadChance}
            options={leadChanceOptions.map(l => ({ label: l, value: l }))}
            onChange={setLeadChance}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <BottomSheetSelect label="Next Follow" value={nextAction}
            options={followUpOptions.map(a => ({ label: a, value: a }))}
            onChange={(val) => {
              setNextAction(val);
              setNextCallDate("");
            }}
          />

          <BottomSheetSelect label="Calling Person" value={callingPerson}
            options={callingPersons.map(c => ({ label: c, value: c }))}
            onChange={setCallingPerson}
          />
        </div>

        {needsDatePicker && (
          <input ref={dateRef} type="date" className="w-full border px-3 py-2 rounded"
            value={nextCallDate} onChange={(e) => setNextCallDate(e.target.value)} />
        )}

        <textarea className="w-full border px-3 py-2 rounded" rows={2}
          placeholder="Remark" value={remark}
          onChange={(e) => setRemark(e.target.value)} />

        <div className="flex gap-2">
          <button onClick={() => router.back()} className="w-1/2 bg-gray-400 text-white py-2 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="w-1/2 bg-blue-600 text-white py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

      </div>

      {/* ✅ HISTORY */}
      <div className="space-y-2">
        <h2 className="font-semibold text-gray-600">Call History</h2>

        {history.map((h, i) => (
          <div key={i} className="border rounded p-2 bg-gray-50 text-xs space-y-1">

            <div className="font-medium">
              {(h.call_date || new Date(h.created_at).toLocaleDateString("en-GB"))} · {h.call_type} · {h.purpose}
            </div>

            <div className="grid grid-cols-2">
              <div>{h.result}</div>
              <div>{h.mood}</div>
            </div>

            <div className="grid grid-cols-2">
              <div>Stage: {h.lead_stage || "-"}</div>
              <div>Chance: {h.lead_chances || "-"}</div>
            </div>

            <div className="grid grid-cols-2">
              <div>{h.next_follow_up || "-"}</div>
              <div>{h.calling_person}</div>
            </div>

            {h.remark && <div>{h.remark}</div>}

          </div>
        ))}

      </div>

    </div>
  );
}