"use client";

interface Props {
  formData: any;
  setFormData: any;
  nextTab: () => void;
  prevTab: () => void;
}

export default function BatchAttendanceTab({
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

      {/* ================= CONTENT AREA ================= */}
      <div className="flex-1 px-2 sm:px-4 pt-2 pb-4 overflow-auto space-y-8">

        {/* ================= Batch Assignment ================= */}
        <Section title="Batch Assignment">

          <Grid>
            <Select 
              label="Course"
              name="batchCourse"
              value={formData.batchCourse}
              onChange={handleChange}
              options={[
                "Spoken English",
                "Basic Computer",
                "Tally",
                "Graphic Design",
                "Web Development"
              ]}
            />

            <Select
              label="Batch Name"
              name="batchName"
              value={formData.batchName}
              onChange={handleChange}
              options={[
                "Morning A",
                "Morning B",
                "Afternoon",
                "Evening A",
                "Evening B"
              ]}
            />

            <Select
              label="Trainer"
              name="trainer"
              value={formData.trainer}
              onChange={handleChange}
              options={[
                "Trainer 1",
                "Trainer 2",
                "Trainer 3"
              ]}
            />

            <Field
              label="Start Date"
              type="date"
              name="batchStartDate"
              value={formData.batchStartDate}
              onChange={handleChange}
            />
          </Grid>

          <Grid>
            <Field
              label="Batch Timing"
              name="batchTiming"
              value={formData.batchTiming}
              onChange={handleChange}
              placeholder="10:00 AM - 11:00 AM"
            />

            <Field
              label="Duration (Months)"
              type="number"
              name="batchDuration"
              value={formData.batchDuration}
              onChange={handleChange}
            />

            <Field
              label="Expected End Date"
              type="date"
              name="batchEndDate"
              value={formData.batchEndDate}
              onChange={handleChange}
            />

            <Select
              label="Status"
              name="batchStatus"
              value={formData.batchStatus}
              onChange={handleChange}
              options={[
                "Active",
                "Completed",
                "Transferred",
                "Dropped"
              ]}
            />
          </Grid>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Assign Batch
            </button>
          </div>

        </Section>


        {/* ================= Attendance Summary ================= */}
        <Section title="Attendance Summary">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <SummaryCard title="Total Classes" value="0" />
            <SummaryCard title="Present" value="0" />
            <SummaryCard title="Absent" value="0" />
            <SummaryCard title="Attendance %" value="0%" highlight />
          </div>

        </Section>


        {/* ================= Attendance Records ================= */}
        <Section title="Attendance Records">

          <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">

            <table className="min-w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Day</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Marked By</th>
                  <th className="px-4 py-2">Remark</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 text-gray-500">
                    No Attendance Records Yet
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>

            </table>

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

function Field({ label, name, type = "text", value, onChange, placeholder = "" }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-gray-600">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
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

function SummaryCard({ title, value, highlight }: any) {
  return (
    <div
      className={`border border-gray-200 rounded-md p-4 shadow-sm ${
        highlight ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="text-gray-500 text-xs">{title}</div>
      <div className={`text-lg font-semibold ${highlight ? "text-blue-600" : "text-gray-800"}`}>
        {value}
      </div>
    </div>
  );
}