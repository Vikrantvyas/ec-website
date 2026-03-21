"use client";

type Props = {
  attendance: any[];
};

export default function LeadAttendance({ attendance }: Props) {

  // 🔹 unique batches
  const batches = [...new Set(attendance.map(a => a.batch_name))];

  // 🔹 last 10 dates (today first)
  const dates = [...new Set(attendance.map(a => a.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 10);

  const getStatus = (batch: string, date: string) => {
    const record = attendance.find(
      (a) => a.batch_name === batch && a.date === date
    );
    return record?.status || "N";
  };

  const getColor = (status: string) => {
    if (status === "P") return "bg-green-500";
    if (status === "A") return "bg-red-500";
    return "bg-gray-300";
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden text-xs">

      {/* HEADER */}
      <div className="flex border-b bg-gray-50">

        {/* FIXED LEFT (BATCH) */}
        <div className="min-w-[120px] p-2 border-r sticky left-0 bg-white z-10">
          Batch
        </div>

        {/* SCROLLABLE DATES */}
        <div className="flex overflow-x-auto w-full">
          {dates.map((d, i) => (
            <div key={i} className="min-w-[60px] p-2 text-center">
              {new Date(d).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      {batches.map((batch, i) => (
        <div key={i} className="flex border-b">

          {/* FIXED LEFT */}
          <div className="min-w-[120px] p-2 border-r sticky left-0 bg-white">
            {batch}
          </div>

          {/* SCROLLABLE */}
          <div className="flex overflow-x-auto w-full">

            {dates.map((d, j) => {
              const status = getStatus(batch, d);

              return (
                <div
                  key={j}
                  className="min-w-[60px] p-2 flex justify-center"
                >
                  <span
                    className={`h-4 w-4 rounded-full ${getColor(status)}`}
                  />
                </div>
              );
            })}

          </div>

        </div>
      ))}

      {batches.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          No attendance data
        </div>
      )}

    </div>
  );
}