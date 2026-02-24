"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type AttendanceSignal = "P" | "A" | "N";

type FollowUp = {
  date: string;
  note: string;
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

const actions = [
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

const dummyLead = {
  id: 1,
  name: "Rahul Sharma",
  mobile: "9876543210",
  branch: "Nanda Nagar",
  course: "Spoken English",
  status: "Demo",
  attendanceLast10: ["P","A","P","P","P","A","P","P","P","P"] as AttendanceSignal[],
  followUps: [
    { date: "2026-02-01", note: "Initial enquiry" },
    { date: "2026-02-03", note: "Call back later" },
    { date: "2026-02-05", note: "Interested" },
  ],
};

export default function CallingDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { type, id } = params;

  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState(dummyLead.status);
  const [nextCallDate, setNextCallDate] = useState("");

  const attendanceColor = (signal: AttendanceSignal) => {
    if (signal === "P") return "bg-green-500";
    if (signal === "A") return "bg-red-500";
    return "bg-gray-300";
  };

  const autoSetNextDate = (selectedAction: string) => {
    const today = new Date();
    let next = new Date();

    if (selectedAction === "Call Tomorrow") {
      next.setDate(today.getDate() + 1);
    } else if (selectedAction === "Call After 3 Days") {
      next.setDate(today.getDate() + 3);
    } else if (selectedAction === "Call After 7 Days") {
      next.setDate(today.getDate() + 7);
    } else {
      setNextCallDate("");
      return;
    }

    setNextCallDate(next.toISOString().split("T")[0]);
  };

  const handleSave = () => {
    console.log({
      entityType: type,
      entityId: id,
      purpose,
      result,
      action,
      nextCallDate,
      statusAfterCall: status,
    });

    router.push("/admin/calling");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Sticky Top Section */}
      <div className="sticky top-0 bg-white shadow-sm p-4 z-40 space-y-2">

        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{dummyLead.name}</h2>
            <p className="text-sm text-gray-500">
              {dummyLead.course} | {dummyLead.branch}
            </p>
          </div>

          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {type}
          </span>
        </div>

        <div className="flex gap-4 text-sm text-blue-600">
          <a href={`tel:${dummyLead.mobile}`}>Call</a>
          <a href={`https://wa.me/91${dummyLead.mobile}`} target="_blank">
            WhatsApp
          </a>
        </div>

        <div className="flex gap-1">
          {dummyLead.attendanceLast10.map((signal, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${attendanceColor(signal)}`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-600">
          Status: <span className="font-medium">{status}</span>
        </p>
      </div>

      {/* Calling Form Section */}
      <div className="p-4 space-y-4 text-sm">

        <div>
          <label className="block mb-1 font-medium">Purpose</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="">Select Purpose</option>
            {purposes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Call Result</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <option value="">Select Result</option>
            {callResults.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Action</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              autoSetNextDate(e.target.value);
            }}
          >
            <option value="">Select Action</option>
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Next Call Date</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={nextCallDate}
            onChange={(e) => setNextCallDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Status Update</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium"
        >
          Save & Return to List
        </button>
      </div>

      {/* History Section */}
      <div className="p-4 border-t bg-white text-sm">
        <h3 className="font-semibold mb-2">Previous Follow-ups</h3>

        {dummyLead.followUps.map((fu, idx) => (
          <p key={idx} className="text-gray-600 mb-1">
            {fu.date} – {fu.note}
          </p>
        ))}
      </div>

    </div>
  );
}