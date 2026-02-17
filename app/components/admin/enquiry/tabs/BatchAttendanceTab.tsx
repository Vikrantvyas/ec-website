"use client";

export default function BatchAttendanceTab() {
  return (
    <div className="p-6 space-y-8">

      {/* ================= Batch Assignment ================= */}
      <Section title="Batch Assignment">

        <Grid>
          <Select label="Course" options={[
            "Spoken English",
            "Basic Computer",
            "Tally",
            "Graphic Design",
            "Web Development"
          ]} />

          <Select label="Batch Name" options={[
            "Morning A",
            "Morning B",
            "Afternoon",
            "Evening A",
            "Evening B"
          ]} />

          <Select label="Trainer" options={[
            "Trainer 1",
            "Trainer 2",
            "Trainer 3"
          ]} />

          <Field label="Start Date" type="date" />
        </Grid>

        <Grid>
          <Field label="Batch Timing" placeholder="10:00 AM - 11:00 AM" />
          <Field label="Duration (Months)" type="number" />
          <Field label="Expected End Date" type="date" />
          <Select label="Status" options={[
            "Active",
            "Completed",
            "Transferred",
            "Dropped"
          ]} />
        </Grid>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            Assign Batch
          </button>
        </div>

      </Section>


      {/* ================= Attendance Summary ================= */}
      <Section title="Attendance Summary">

        <div className="grid grid-cols-4 gap-6 text-sm">

          <SummaryCard title="Total Classes" value="0" />
          <SummaryCard title="Present" value="0" />
          <SummaryCard title="Absent" value="0" />
          <SummaryCard title="Attendance %" value="0%" highlight />

        </div>

      </Section>


      {/* ================= Attendance Records ================= */}
      <Section title="Attendance Records">

        <div className="overflow-x-auto border rounded">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Day</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Marked By</th>
                <th className="px-4 py-2">Remark</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 text-gray-500">
                  No Attendance Records Yet
                </td>
                <td colSpan={4}></td>
              </tr>
            </tbody>

          </table>

        </div>

      </Section>


      {/* ================= Navigation ================= */}
      <div className="flex justify-between pt-6 border-t">

        <button className="px-6 py-2 rounded border text-sm font-medium hover:bg-gray-100">
          Previous
        </button>

        <button className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          Next
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

function Grid({ children }: any) {
  return (
    <div className="grid grid-cols-4 gap-6 text-sm">
      {children}
    </div>
  );
}

function Field({ label, type = "text", placeholder = "" }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
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

function SummaryCard({ title, value, highlight }: any) {
  return (
    <div
      className={`border rounded p-4 ${
        highlight ? "bg-blue-50 border-blue-300" : "bg-white"
      }`}
    >
      <div className="text-gray-500 text-xs">{title}</div>
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-blue-600" : "text-gray-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
