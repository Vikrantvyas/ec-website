import BatchCard from "@/app/components/admin/batches/BatchCard";

export default function BatchesPage() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold">Batches</h1>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        <BatchCard
          name="English 8 AM"
          course="Spoken English"
          subject="Basic English"
          students={12}
        />

        <BatchCard
          name="Tally 10 AM"
          course="Tally Prime"
          subject="Accounting"
          students={8}
        />

        <BatchCard
          name="Computer 4 PM"
          course="Basic Computer"
          subject="MS Office"
          students={15}
        />

      </div>

    </div>
  );
}