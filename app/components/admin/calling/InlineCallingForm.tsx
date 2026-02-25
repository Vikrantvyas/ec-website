"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

type Props = {
  leadId: number;
  currentStatus: string;
  onSave: (data: {
    purpose: string;
    result: string;
    mood: string;
    nextAction: string;
    nextCallDate: string;
    status: string;
    remark: string;
  }) => void;
};

/* ================= DATA ================= */

const enquiryPurposes = [
  "Fresh Enquiry Follow-up",
  "General Follow-up",
];

const demoPurposes = [
  "Demo Reminder",
  "Demo Feedback",
];

const admissionPurposes = [
  "Admission Discussion",
  "Admission Confirmation",
];

const studentPurposes = [
  "Fee Reminder",
  "Absent Alert",
  "Feedback Call",
];

const positiveResults = [
  "Received by Student",
  "Received by Parent",
];

const neutralResults = [
  "Phone Busy",
  "Not Received",
  "Not Reachable",
  "Switched Off",
  "Voice Issue",
];

const negativeResults = [
  "Cut the Call",
  "Not in Service",
];

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

const statusOptions = ["Cold", "Warm", "Hot", "Closed"];

export default function InlineCallingForm({
  leadId,
  currentStatus,
  onSave,
}: Props) {
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [mood, setMood] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextCallDate, setNextCallDate] = useState("");
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  const dateRef = useRef<HTMLInputElement>(null);

  /* ================= AUTO DATE ================= */

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

  /* ================= AUTO STATUS ================= */

  const autoStatus = useMemo(() => {
    if (negativeResults.includes(result)) return "Closed";
    if (negativeMoods.includes(mood)) return "Closed";
    if (positiveMoods.includes(mood)) return "Hot";
    if (neutralMoods.includes(mood)) return "Warm";
    if (neutralResults.includes(result)) return "Cold";
    return "Warm";
  }, [result, mood]);

  useEffect(() => {
    if (result) setStatus(autoStatus);
  }, [autoStatus, result]);

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!purpose || !result) return;
    if (!remark.trim()) return;

    onSave({
      purpose,
      result,
      mood,
      nextAction,
      nextCallDate,
      status,
      remark,
    });

    setPurpose("");
    setResult("");
    setMood("");
    setNextAction("");
    setNextCallDate("");
    setStatus("");
    setRemark("");
  };

  return (
    <div className="space-y-2 mt-3 text-xs">

      {/* PURPOSE */}
      <BottomSheetSelect
        label="Calling Purpose"
        value={purpose}
        options={[
          ...enquiryPurposes,
          ...demoPurposes,
          ...admissionPurposes,
          ...studentPurposes,
        ].map((p) => ({ label: p, value: p }))}
        onChange={setPurpose}
      />

      {/* RESULT + MOOD */}
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

      {/* NEXT FOLLOW UP + STATUS */}
      <div className="grid grid-cols-2 gap-2">
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

        <BottomSheetSelect
          label="Status"
          value={status}
          options={statusOptions.map((s) => ({
            label: s,
            value: s,
          }))}
          onChange={setStatus}
        />
      </div>

      {needsDatePicker && (
        <input
          ref={dateRef}
          type="date"
          className="w-full border px-2 py-1 rounded text-sm"
          value={nextCallDate}
          onChange={(e) => setNextCallDate(e.target.value)}
        />
      )}

      {/* REMARK */}
      <textarea
  className="
    w-full 
    border border-gray-300 
    px-3 py-2 
    rounded-md 
    text-sm
    shadow-[0_1px_2px_rgba(0,0,0,0.05)]
    focus:outline-none
    focus:ring-2 focus:ring-blue-500
    focus:border-blue-500
    transition
  "
  rows={2}
  placeholder="Remark"
  value={remark}
  onChange={(e) => setRemark(e.target.value)}
/>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium"
      >
        Save
      </button>
    </div>
  );
}