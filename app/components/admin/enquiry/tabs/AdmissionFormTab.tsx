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
    <div className="p-6 space-y-8">

      {/* ================= Admission Basics ================= */}
      <Section title="Admission Details">

        <Grid>
          <Field label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />
          <Field label="Admission Number" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} />
          <Select label="Course Selected" name="courseSelected"
            options={["Spoken English", "Basic Computer", "Tally", "Digital Marketing"]}
            value={formData.courseSelected}
            onChange={handleChange}
          />
          <Select label="Course Duration" name="courseDuration"
            options={["3 Months", "6 Months", "1 Year"]}
            value={formData.courseDuration}
            onChange={handleChange}
          />
          <Select label="Mode" name="mode"
            options={["Offline", "Online"]}
            value={formData.mode}
            onChange={handleChange}
          />
        </Grid>

      </Section>


      {/* ================= Action Buttons ================= */}
      <div className="flex justify-between pt-6 border-t">

        <button
          onClick={prevTab}
          className="px-6 py-2 rounded border text-sm font-medium hover:bg-gray-100"
        >
          Previous
        </button>

        <button
          onClick={nextTab}
          className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
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

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
