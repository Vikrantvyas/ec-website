"use client";

import { useState, useEffect } from "react";

type Props = {
  leadId: number;
  currentStatus: string;
  onSave: (data: {
    purpose: string;
    result: string;
    action: string;
    nextCallDate: string;
    status: string;
  }) => void;
};

const purposes = [
  "Admission",
  "Fee Reminder",
  "Absent Alert",
  "Assignment Reminder",
  "Feedback",
  "Holiday Info",
  "General Follow-up",
];

const callResults = [
  "Received",
  "Not Received",
  "Switched Off",
  "Busy",
  "Answered",
  "Received by Someone Else",
  "Network Issue",
];

const nextFollowUpOptions = [
  "Call Tomorrow",
  "Call After 3 Days",
  "Call After 7 Days",
  "No Further Call",
  "Visit Scheduled",
  "Demo Scheduled",
];

const statusOptions = [
  "Demo",
  "Admission",
  "Not Interested",
  "Converted",
  "Dropout",
];

export default function InlineCallingForm({
  leadId,
  currentStatus,
  onSave,
}: Props) {
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [action, setAction] = useState("");
  const [nextCallDate, setNextCallDate] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!action) return;

    const today = new Date();
    const next = new Date();

    if (action === "Call Tomorrow") {
      next.setDate(today.getDate() + 1);
    } else if (action === "Call After 3 Days") {
      next.setDate(today.getDate() + 3);
    } else if (action === "Call After 7 Days") {
      next.setDate(today.getDate() + 7);
    } else {
      setNextCallDate("");
      return;
    }

    setNextCallDate(next.toISOString().split("T")[0]);
  }, [action]);

  const handleSave = () => {
    if (!purpose || !result) return;

    onSave({
      purpose,
      result,
      action,
      nextCallDate,
      status,
    });

    setPurpose("");
    setResult("");
    setAction("");
    setNextCallDate("");
    setStatus("");
  };

  return (
    <div className="space-y-2 mt-2 text-xs">

      {/* Calling Purpose */}
      <select
        className="w-full border px-2 py-1 rounded"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      >
        <option value="">Calling Purpose</option>
        {purposes.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      {/* Call Result */}
      <select
        className="w-full border px-2 py-1 rounded"
        value={result}
        onChange={(e) => setResult(e.target.value)}
      >
        <option value="">Call Result</option>
        {callResults.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      {/* Next Follow Up (Fixed Placeholder) */}
      <select
        className="w-full border px-2 py-1 rounded"
        value={action}
        onChange={(e) => setAction(e.target.value)}
      >
        <option value="">Next Follow Up</option>
        {nextFollowUpOptions.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>

      {/* Next Call Date */}
      <input
        type="date"
        className="w-full border px-2 py-1 rounded"
        value={nextCallDate}
        onChange={(e) => setNextCallDate(e.target.value)}
      />

      {/* Status Update */}
      <select
        className="w-full border px-2 py-1 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Select Status</option>
        {statusOptions.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-1 rounded"
      >
        Save
      </button>
    </div>
  );
}