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

const purposes = [
  "Fresh Enquiry",
  "Follow Up",
  "Demo Reminder",
  "Fee Reminder",
  "Absent Alert",
  "Feedback Call",
  "General Call",
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
  "Not in Service",
  "Voice Issue",
];

const negativeResults = ["Cut the Call"];

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
  "Language Not Required",
];

const followUpOptions = [
  "Call in Evening",
  "Call Tomorrow",
  "Call After 3 Days",
  "Call After 7 Days",
  "Call After 1 Month",
  "Select Date",
];

const baseStatusOptions = ["Cold", "Warm", "Hot", "Open", "Closed"];

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

  const isNegative = negativeResults.includes(result);
  const isNeutral = neutralResults.includes(result);

  const needsDatePicker =
    nextAction === "Select Date" ||
    mood === "Wants Demo" ||
    mood === "Wants Admission";

  useEffect(() => {
    if (!nextAction) return;

    const today = new Date();
    const next = new Date();

    if (nextAction === "Call Tomorrow") {
      next.setDate(today.getDate() + 1);
    } else if (nextAction === "Call After 3 Days") {
      next.setDate(today.getDate() + 3);
    } else if (nextAction === "Call After 7 Days") {
      next.setDate(today.getDate() + 7);
    } else if (nextAction === "Call After 1 Month") {
      next.setMonth(today.getMonth() + 1);
    }

    if (nextAction !== "Select Date") {
      setNextCallDate(next.toISOString().split("T")[0]);
    }
  }, [nextAction]);

  useEffect(() => {
    if (needsDatePicker) {
      setTimeout(() => {
        dateRef.current?.showPicker?.();
      }, 100);
    }
  }, [needsDatePicker]);

  const autoStatus = useMemo(() => {
    if (isNegative) return "Closed";
    if (isNeutral) return "Cold";

    if (negativeMoods.includes(mood)) return "Closed";
    if (positiveMoods.includes(mood)) return "Hot";
    if (neutralMoods.includes(mood)) return "Warm";

    return "Open";
  }, [result, mood, isNeutral, isNegative]);

  useEffect(() => {
    if (result) {
      setStatus(autoStatus);
    }
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
    <div className="space-y-2 mt-2 text-xs">

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

      <select
        className="w-full border px-2 py-1 rounded"
        value={result}
        onChange={(e) => {
          setResult(e.target.value);
          setNextCallDate("");
        }}
      >
        <option value="">Call Result</option>

        <optgroup label="🟢 Positive">
          {positiveResults.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </optgroup>

        <optgroup label="🔵 Neutral">
          {neutralResults.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </optgroup>

        <optgroup label="🔴 Negative">
          {negativeResults.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </optgroup>
      </select>

      <select
        className="w-full border px-2 py-1 rounded"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
        <option value="">Student's Mood</option>

        <optgroup label="🟢 Positive">
          {positiveMoods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </optgroup>

        <optgroup label="🔵 Neutral">
          {neutralMoods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </optgroup>

        <optgroup label="🔴 Negative">
          {negativeMoods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </optgroup>
      </select>

      <select
        className="w-full border px-2 py-1 rounded"
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
          className="w-full border px-2 py-1 rounded"
          value={nextCallDate}
          onChange={(e) => setNextCallDate(e.target.value)}
        />
      )}

      <select
        className="w-full border px-2 py-1 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status</option>
        {baseStatusOptions.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <textarea
        className="w-full border px-2 py-1 rounded"
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