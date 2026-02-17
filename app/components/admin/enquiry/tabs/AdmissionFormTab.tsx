"use client";

export default function AdmissionFormTab() {
  return (
    <div className="p-6 space-y-8">

      {/* ================= Admission Basics ================= */}
      <Section title="Admission Details">

        <Grid>
          <Field label="Admission Date" type="date" />
          <Field label="Admission Number" placeholder="Auto Generated Later" />
          <Select label="Course Selected" options={["Spoken English", "Basic Computer", "Tally", "Digital Marketing"]} />
          <Select label="Course Duration" options={["3 Months", "6 Months", "1 Year"]} />
          <Select label="Mode" options={["Offline", "Online"]} />
        </Grid>

      </Section>


      {/* ================= Fee Structure ================= */}
      <Section title="Fee Structure">

        <Grid>
          <Field label="Total Course Fee" type="number" />
          <Select label="Discount Type" options={["None", "Flat", "Percentage"]} />
          <Field label="Discount Value" type="number" />
          <Field label="Registration Fee" type="number" />
          <Field label="Study Material Fee" type="number" />
          <Field label="Final Payable Fee" type="number" placeholder="Auto Calculated Later" />
        </Grid>

      </Section>


      {/* ================= Installment Plan ================= */}
      <Section title="Installment Plan">

        <Grid>
          <Select label="Payment Type" options={["Full Payment", "Installments"]} />
          <Field label="Number of Installments" type="number" />
          <Field label="Installment Amount" type="number" />
          <Field label="First Due Date" type="date" />
          <Field label="Second Due Date" type="date" />
          <Field label="Third Due Date" type="date" />
        </Grid>

      </Section>


      {/* ================= Admission Status ================= */}
      <Section title="Admission Status">

        <Grid>
          <Select label="Admission Status" options={["Confirmed", "Pending Payment", "Cancelled"]} />
          <Field label="Counsellor Name" />
          <Field label="Remarks" />
        </Grid>

      </Section>


      {/* ================= Action Buttons ================= */}
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
