"use client";

interface Props {
  formData: any;
  setFormData: any;
  nextTab: () => void;
  prevTab: () => void;
}

export default function AdmissionFormTab({
  formData,
  setFormData,
  nextTab,
  prevTab,
}: Props) {

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ================= FORM AREA ================= */}
      <div className="flex-1 px-2 sm:px-4 pt-2 pb-4 overflow-auto space-y-6">

        <Section title="Admission Details">

          <Grid>
            <Field
              label="Admission Date"
              name="admissionDate"
              type="date"
              value={formData.admissionDate}
              onChange={handleChange}
            />

            <Field
              label="Admission Number"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
            />

            <Select
              label="Course Selected"
              name="courseSelected"
              options={["Spoken English", "Basic Computer", "Tally", "Digital Marketing"]}
              value={formData.courseSelected}
              onChange={handleChange}
            />

            <Select
              label="Course Duration"
              name="courseDuration"
              options={["3 Months", "6 Months", "1 Year"]}
              value={formData.courseDuration}
              onChange={handleChange}
            />

            <Select
              label="Mode"
              name="mode"
              options={["Offline", "Online"]}
              value={formData.mode}
              onChange={handleChange}
            />
          </Grid>

        </Section>

      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 pb-12 flex justify-between">

        <button
          onClick={prevTab}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium 
          hover:bg-gray-50 transition"
        >
          Previous
        </button>

        <button
          onClick={nextTab}
          className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium 
          hover:bg-blue-700 transition"
        >
          Next →
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
      <label className="mb-1 text-gray-600 text-sm">{label}</label>
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

function Select({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm">{label}</label>
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