"use client";

interface Props {
  formData: any;
  setFormData: any;
  nextTab: () => void;
  prevTab: () => void;
}

export default function DocumentsTab({
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
      <div className="flex-1 px-4 py-4 space-y-8">

        {/* ================= Upload Section ================= */}
        <Section title="Upload Documents">

          <Grid>
            <FileField label="Student Photo" name="studentPhoto" onChange={handleChange} />
            <FileField label="Aadhar Card" name="aadharCard" onChange={handleChange} />
            <FileField label="Marksheet" name="marksheet" onChange={handleChange} />
            <FileField label="Admission Form Copy" name="admissionCopy" onChange={handleChange} />
          </Grid>

          <Grid>
            <FileField label="Fee Receipt Copy" name="feeReceipt" onChange={handleChange} />
            <FileField label="ID Proof (Other)" name="idProof" onChange={handleChange} />
            <FileField label="Address Proof" name="addressProof" onChange={handleChange} />
            <FileField label="Other Documents" name="otherDocuments" onChange={handleChange} />
          </Grid>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Save Documents
            </button>
          </div>

        </Section>

        {/* ================= Verification Section ================= */}
        <Section title="Verification Status">

          <Grid>
            <Select
              label="Documents Verified"
              name="documentsVerified"
              value={formData.documentsVerified}
              onChange={handleChange}
              options={["Pending", "Verified", "Rejected"]}
            />

            <Field
              label="Verified By"
              name="verifiedBy"
              value={formData.verifiedBy}
              onChange={handleChange}
            />

            <Field
              label="Verification Date"
              type="date"
              name="verificationDate"
              value={formData.verificationDate}
              onChange={handleChange}
            />

            <Select
              label="Overall Status"
              name="overallStatus"
              value={formData.overallStatus}
              onChange={handleChange}
              options={["Incomplete", "Complete", "Rejected"]}
            />
          </Grid>

          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-600">
              Verification Remark
            </label>
            <textarea
              name="verificationRemark"
              value={formData.verificationRemark || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </Section>

      </div>

      {/* ================= Navigation ================= */}
      <div className="border-t bg-gray-50 px-4 py-3 flex justify-between">

        <button
          type="button"
          onClick={prevTab}
          className="px-4 py-2 rounded border text-sm font-medium hover:bg-gray-100"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={nextTab}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
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
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
      {children}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-gray-600">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, value, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-gray-600">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

function FileField({ label, name, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-gray-600">{label}</label>
      <input
        name={name}
        type="file"
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}