"use client";

interface Props {
  formData: any;
  setFormData: any;
  nextTab: () => void;
  prevTab: () => void;
}

export default function PaymentDetailsTab({
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
      <div className="flex-1 px-4 py-4 space-y-6">

        <Section title="New Payment Entry">

          <Grid>
            <Field
              label="Payment Date"
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={handleChange}
            />

            <Field
              label="Receipt Number"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleChange}
            />

            <Field
              label="Amount Paid"
              name="amountPaid"
              type="number"
              value={formData.amountPaid}
              onChange={handleChange}
            />

            <Select
              label="Payment Mode"
              name="paymentMode"
              options={["Cash", "UPI", "Bank Transfer", "Card", "Cheque"]}
              value={formData.paymentMode}
              onChange={handleChange}
            />
          </Grid>

        </Section>

      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="border-t bg-gray-50 px-4 py-3 flex justify-between">

        <button
          onClick={prevTab}
          className="px-4 py-2 rounded border text-sm font-medium hover:bg-gray-100"
        >
          Previous
        </button>

        <button
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
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-4 
      gap-4 
      text-sm
    ">
      {children}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-xs">{label}</label>
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

function Select({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-xs">{label}</label>
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