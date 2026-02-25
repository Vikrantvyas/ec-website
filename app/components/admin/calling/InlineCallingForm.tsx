"use client";

import { useState, useEffect, useRef, useMemo } from "react";

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

/* ================= PURPOSE ================= */

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

/* ================= CALL RESULT ================= */

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

/* ================= STUDENT MOOD ================= */

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

/* ================= NEXT FOLLOW UP ================= */

const followUpOptions = [
  "Call in Evening",
  "Call Tomorrow",
  "Call After 3 Days",
  "Call After 7 Days",
  "Call After 1 Month",
  "Select Date",
];

/* ================= STATUS ================= */

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

  /* AUTO DATE */

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
      setTimeout(() => {
        dateRef.current?.showPicker?.();
      }, 100);
    }
  }, [needsDatePicker]);

  /* AUTO STATUS */

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
    <div className="space-y-1 mt-2 text-xs">

      {/* PURPOSE */}
      <select
        className="w-full border px-2 py-0.5 rounded"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      >
        <option value="">Calling Purpose</option>
        {enquiryPurposes.map((p) => <option key={p}>{p}</option>)}
        {demoPurposes.map((p) => <option key={p}>{p}</option>)}
        {admissionPurposes.map((p) => <option key={p}>{p}</option>)}
        {studentPurposes.map((p) => <option key={p}>{p}</option>)}
      </select>

      {/* RESULT */}
      <select
        className="w-full border px-2 py-0.5 rounded"
        value={result}
        onChange={(e) => setResult(e.target.value)}
      >
        <option value="">Call Result</option>
        {[...positiveResults, ...neutralResults, ...negativeResults].map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      {/* MOOD */}
      <select
        className="w-full border px-2 py-0.5 rounded"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
        <option value="">Student's Mood</option>
        {[...positiveMoods, ...neutralMoods, ...negativeMoods].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>

      {/* NEXT FOLLOW UP */}
      <select
        className="w-full border px-2 py-0.5 rounded"
        value={nextAction}
        onChange={(e) => {
          setNextAction(e.target.value);
          setNextCallDate("");
        }}
      >
        <option value="">Next Follow Up</option>
        {followUpOptions.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>

      {needsDatePicker && (
        <input
          ref={dateRef}
          type="date"
          className="w-full border px-2 py-0.5 rounded"
          value={nextCallDate}
          onChange={(e) => setNextCallDate(e.target.value)}
        />
      )}

      {/* STATUS */}
      <select
        className="w-full border px-2 py-0.5 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status</option>
        {statusOptions.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* REMARK */}
      <textarea
        className="w-full border px-2 py-0.5 rounded"
        rows={2}
        placeholder="Remark"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-1 rounded"
      >
        Save
      </button>
    </div>
  );
}