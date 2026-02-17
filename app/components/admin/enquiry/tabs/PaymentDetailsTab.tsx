"use client";

export default function PaymentDetailsTab() {
  return (
    <div className="p-6 space-y-8">

      {/* ================= Payment Entry Section ================= */}
      <Section title="New Payment Entry">

        <Grid>
          <Field label="Payment Date" type="date" />
          <Field label="Receipt Number" placeholder="Auto Generated Later" />
          <Field label="Amount Paid" type="number" />
          <Select label="Payment Mode" options={["Cash", "UPI", "Bank Transfer", "Card", "Cheque"]} />
          <Field label="Transaction ID / Reference" />
          <Select label="Payment For" options={["Registration Fee", "Installment", "Full Payment", "Other"]} />
        </Grid>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            Add Payment
          </button>
        </div>

      </Section>


      {/* ================= Payment Summary ================= */}
      <Section title="Payment Summary">

        <div className="grid grid-cols-4 gap-6 text-sm">

          <SummaryCard title="Total Course Fee" value="₹ 0" />
          <SummaryCard title="Total Paid" value="₹ 0" />
          <SummaryCard title="Total Discount" value="₹ 0" />
          <SummaryCard title="Balance Due" value="₹ 0" highlight />

        </div>

      </Section>


      {/* ================= Payment History Table ================= */}
      <Section title="Payment History">

        <div className="overflow-x-auto border rounded">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Receipt No.</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Mode</th>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 text-gray-500">No Payments Yet</td>
                <td colSpan={5}></td>
              </tr>
            </tbody>

          </table>

        </div>

      </Section>


      {/* ================= Navigation Buttons ================= */}
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
        highlight ? "bg-red-50 border-red-300" : "bg-white"
      }`}
    >
      <div className="text-gray-500 text-xs">{title}</div>
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-red-600" : "text-gray-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
