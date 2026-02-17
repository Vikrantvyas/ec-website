"use client";

interface Props {
  formData: any;
  setFormData: any;
  prevTab: () => void;
  handleFinalSubmit: () => void;
}

export default function CommentsHistoryTab({
  formData,
  setFormData,
  prevTab,
  handleFinalSubmit,
}: Props) {

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 space-y-8">

      {/* ================= Add New Comment ================= */}
      <Section title="Add New Comment / Follow-up">

        <div className="grid grid-cols-4 gap-6 text-sm">

          <Field label="Follow-up Date" type="date" name="followUpDate" onChange={handleChange} />
          <Field label="Follow-up Time" type="time" name="followUpTime" onChange={handleChange} />

          <Select
            label="Follow-up Type"
            name="followUpType"
            onChange={handleChange}
            options={[
              "Call",
              "WhatsApp",
              "Visit",
              "Demo Given",
              "Converted",
              "Not Interested"
            ]}
          />

          <Select
            label="Status After Follow-up"
            name="statusAfterFollowUp"
            onChange={handleChange}
            options={[
              "New Enquiry",
              "Follow-up",
              "Converted",
              "Closed"
            ]}
          />

        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm text-gray-600">
            Comment / Discussion Notes
          </label>
          <textarea
            name="followUpRemark"
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            Save Comment
          </button>
        </div>

      </Section>

      {/* ================= Navigation ================= */}
      <div className="flex justify-between pt-6 border-t">

        <button
          type="button"
          onClick={prevTab}
          className="px-6 py-2 rounded border text-sm font-medium hover:bg-gray-100"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Finish & Save
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

function Field({ label, name, type = "text", onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <select
        name={name}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt: string, i: number) => (
          <option key={i}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
