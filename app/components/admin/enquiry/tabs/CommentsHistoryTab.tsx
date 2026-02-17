"use client";

export default function CommentsHistoryTab() {
  return (
    <div className="p-6 space-y-8">

      {/* ================= Add New Comment ================= */}
      <Section title="Add New Comment / Follow-up">

        <div className="grid grid-cols-4 gap-6 text-sm">

          <Field label="Follow-up Date" type="date" />
          <Field label="Follow-up Time" type="time" />
          <Select label="Follow-up Type" options={[
            "Call",
            "WhatsApp",
            "Visit",
            "Demo Given",
            "Converted",
            "Not Interested"
          ]} />
          <Select label="Status After Follow-up" options={[
            "New Enquiry",
            "Follow-up",
            "Converted",
            "Closed"
          ]} />

        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm text-gray-600">
            Comment / Discussion Notes
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write detailed follow-up notes here..."
          />
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            Save Comment
          </button>
        </div>

      </Section>


      {/* ================= Timeline Section ================= */}
      <Section title="Activity Timeline">

        <TimelineItem
          type="Follow-up Call"
          date="26 Aug 2025"
          time="10:30 AM"
          user="Riya (Telecaller)"
          note="Student interested in Spoken English. Asked about batch timing."
        />

        <TimelineItem
          type="WhatsApp"
          date="25 Aug 2025"
          time="04:00 PM"
          user="Riya"
          note="Shared course details PDF and fee structure."
        />

        <TimelineItem
          type="Status Changed"
          date="24 Aug 2025"
          time="11:15 AM"
          user="Admin"
          note="Status changed from New Enquiry → Follow-up."
        />

        <TimelineItem
          type="Admission Confirmed"
          date="23 Aug 2025"
          time="05:45 PM"
          user="Admin"
          note="Student paid ₹5000 advance."
        />

      </Section>


      {/* ================= Navigation ================= */}
      <div className="flex justify-between pt-6 border-t">

        <button className="px-6 py-2 rounded border text-sm font-medium hover:bg-gray-100">
          Previous
        </button>

        <button className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          Finish
        </button>

      </div>

    </div>
  );
}


/* ================= Reusable Components ================= */

function Section({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, type = "text" }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        type={type}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, options }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        {options.map((opt: string, i: number) => (
          <option key={i}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TimelineItem({ type, date, time, user, note }: any) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-2 text-sm">

      <div className="flex justify-between items-center">
        <span className="font-medium text-blue-600">{type}</span>
        <span className="text-gray-500">{date} • {time}</span>
      </div>

      <div className="text-gray-700">
        {note}
      </div>

      <div className="text-xs text-gray-500">
        By: {user}
      </div>

    </div>
  );
}
