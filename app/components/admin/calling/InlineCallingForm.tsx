"use client";

import { useState, useEffect, useRef } from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  leadId: string;
  currentStatus: string;
  onSave: (data: any) => void;
};

const callTypes = ["Incoming", "Outgoing"];
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

export default function InlineCallingForm({
  leadId,
  currentStatus,
  onSave,
}: Props) {

  const today = new Date().toLocaleDateString("en-GB").split("/").join("-");

  const [callingDate, setCallingDate] = useState(today);
  const [callType, setCallType] = useState("Outgoing");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [mood, setMood] = useState("");
  const [leadStage, setLeadStage] = useState("");
  const [leadChance, setLeadChance] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextCallDate, setNextCallDate] = useState("");
  const [callingPerson, setCallingPerson] = useState("");
  const [remark, setRemark] = useState("");

  const dateRef = useRef<HTMLInputElement>(null);

  // 🔥 FETCH LEAD DATA
  useEffect(() => {
    const fetchLead = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("lead_stage, lead_chances")
        .eq("id", leadId)
        .single();

      if (data) {
        setLeadStage(data.lead_stage || "");
        setLeadChance(data.lead_chances || "");
      }
    };

    if (leadId) fetchLead();
  }, [leadId]);

  useEffect(() => {
    if (!nextAction) return;

    const today = new Date();
    const next = new Date();

    if (nextAction === "Call Tomorrow")
      next.setDate(today.getDate() + 1);
    else if (nextAction === "Call After 3 Days")
      next.setDate(today.getDate() + 3);
    else if (nextAction === "Call After 7 Days")
      next.setDate(today.getDate() + 7);
    else if (nextAction === "Call After 1 Month")
      next.setMonth(today.getMonth() + 1);

    if (nextAction !== "Select Date") {
      setNextCallDate(next.toISOString().split("T")[0]);
    }
  }, [nextAction]);

  const needsDatePicker = nextAction === "Select Date";

  useEffect(() => {
    if (needsDatePicker) {
      setTimeout(() => {
        dateRef.current?.showPicker?.();
      }, 100);
    }
  }, [needsDatePicker]);

  const handleSave = () => {
    if (!purpose || !result) return;

    onSave({
      callingDate,
      callType,
      purpose,
      result,
      mood,
      leadStage,
      leadChance,
      nextAction,
      nextCallDate,
      callingPerson,
      remark,
    });

    setPurpose("");
    setResult("");
    setMood("");
    setNextAction("");
    setNextCallDate("");
    setCallingPerson("");
    setRemark("");
  };

  return (
    <div className="space-y-2 mt-3 text-xs">

      <div className="grid grid-cols-2 gap-2">
        <input
          value={callingDate}
          readOnly
          className="border px-2 py-1 rounded text-sm bg-gray-50"
        />

        <BottomSheetSelect
          label="Call Type"
          value={callType}
          options={callTypes.map((c) => ({ label: c, value: c }))}
          onChange={setCallType}
        />
      </div>

      <BottomSheetSelect
        label="Call Purpose"
        value={purpose}
        options={[
          ...enquiryPurposes,
          ...demoPurposes,
          ...admissionPurposes,
          ...studentPurposes,
        ].map((p) => ({ label: p, value: p }))}
        onChange={setPurpose}
      />

      <div className="grid grid-cols-2 gap-2">
        <BottomSheetSelect
          label="Call Result"
          value={result}
          options={[
            ...positiveResults.map((r) => ({
              label: r,
              value: r,
              color: "green" as const,
            })),
            ...neutralResults.map((r) => ({
              label: r,
              value: r,
              color: "blue" as const,
            })),
            ...negativeResults.map((r) => ({
              label: r,
              value: r,
              color: "red" as const,
            })),
          ]}
          onChange={setResult}
        />

        <BottomSheetSelect
          label="Student's Mood"
          value={mood}
          options={[
            ...positiveMoods.map((m) => ({
              label: m,
              value: m,
              color: "green" as const,
            })),
            ...neutralMoods.map((m) => ({
              label: m,
              value: m,
              color: "blue" as const,
            })),
            ...negativeMoods.map((m) => ({
              label: m,
              value: m,
              color: "red" as const,
            })),
          ]}
          onChange={setMood}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <BottomSheetSelect
          label="Lead Stage"
          value={leadStage}
          options={["Lead", "Demo", "Admission", "Student"].map((l) => ({
            label: l,
            value: l,
          }))}
          onChange={setLeadStage}
        />

        <BottomSheetSelect
          label="Lead Chances"
          value={leadChance}
          options={["High", "Medium", "Low"].map((l) => ({
            label: l,
            value: l,
          }))}
          onChange={setLeadChance}
        />
      </div>

      <BottomSheetSelect
        label="Next Follow Up"
        value={nextAction}
        options={followUpOptions.map((a) => ({
          label: a,
          value: a,
        }))}
        onChange={(val) => {
          setNextAction(val);
          setNextCallDate("");
        }}
      />

      {needsDatePicker && (
        <input
          ref={dateRef}
          type="date"
          className="w-full border px-2 py-1 rounded text-sm"
          value={nextCallDate}
          onChange={(e) => setNextCallDate(e.target.value)}
        />
      )}

      <BottomSheetSelect
        label="Calling Person"
        value={callingPerson}
        options={callingPersons.map((c) => ({
          label: c,
          value: c,
        }))}
        onChange={setCallingPerson}
      />

      <textarea
        className="w-full border px-3 py-2 rounded-md text-sm"
        rows={2}
        placeholder="Remark"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm"
      >
        Save
      </button>

    </div>
  );
}