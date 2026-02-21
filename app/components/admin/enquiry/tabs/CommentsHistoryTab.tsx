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
    <div className="flex flex-col h-full bg-white">

      {/* ================= CONTENT AREA ================= */}
      <div className="flex-1 px-2 sm:px-4 pt-2 pb-4 overflow-auto space-y-8">

        {/* ================= Add New Comment ================= */}
        <Section title="Add New Comment / Follow-up">

          <Grid>

            <Field 
              label="Follow-up Date" 
              type="date" 
              name="followUpDate" 
              value={formData.followUpDate}
              onChange={handleChange} 
            />

            <Field 
              label="Follow-up Time" 
              type="time" 
              name="followUpTime" 
              value={formData.followUpTime}
              onChange={handleChange} 
            />

            <Select
              label="Follow-up Type"
              name="followUpType"
              value={formData.followUpType}
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
              value={formData.statusAfterFollowUp}
              onChange={handleChange}
              options={[
                "New Enquiry",
                "Follow-up",
                "Converted",
                "Closed"
              ]}
            />

          </Grid>

          <div className="mt-6 flex flex-col">
            <label className="mb-1 text-sm text-gray-600">
              Comment / Discussion Notes
            </label>
            <textarea
              name="followUpRemark"
              value={formData.followUpRemark || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
              h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Save Comment
            </button>
          </div>

        </Section>

      </div>

      {/* ================= Navigation ================= */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 pb-12 flex justify-between">

        <button
          type="button"
          onClick={prevTab}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium 
          hover:bg-gray-50 transition"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium 
          hover:bg-blue-700 transition"
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
      <h2 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
      {children}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-gray-600">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}

function Select({ label, name, value, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}