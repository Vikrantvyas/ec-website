"use client";

export default function DocumentsTab() {
  return (
    <div className="p-6 space-y-8">

      {/* ================= Upload Section ================= */}
      <Section title="Upload Documents">

        <Grid>

          <FileField label="Student Photo" />
          <FileField label="Aadhar Card" />
          <FileField label="Marksheet" />
          <FileField label="Admission Form Copy" />

        </Grid>

        <Grid>

          <FileField label="Fee Receipt Copy" />
          <FileField label="ID Proof (Other)" />
          <FileField label="Address Proof" />
          <FileField label="Other Documents" />

        </Grid>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            Save Documents
          </button>
        </div>

      </Section>


      {/* ================= Verification Section ================= */}
      <Section title="Verification Status">

        <Grid>

          <Select label="Documents Verified" options={[
            "Pending",
            "Verified",
            "Rejected"
          ]} />

          <Field label="Verified By" />
          <Field label="Verification Date" type="date" />
          <Select label="Overall Status" options={[
            "Incomplete",
            "Complete",
            "Rejected"
          ]} />

        </Grid>

        <div className="mt-4">
          <label className="block mb-2 text-sm text-gray-600">
            Verification Remark
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write verification notes here..."
          />
        </div>

      </Section>


      {/* ================= Uploaded Files Preview ================= */}
      <Section title="Uploaded Files">

        <div className="border rounded p-6 text-center text-sm text-gray-500">
          No files uploaded yet.
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

function FileField({ label }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        type="file"
        className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
