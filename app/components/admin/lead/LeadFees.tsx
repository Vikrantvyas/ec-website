"use client";

type Props = {
  receipts: any[];
};

export default function LeadFees({ receipts }: Props) {

  const format = (num: any) => Number(num || 0).toFixed(2);

  // ✅ DATE FORMAT (dd-mm-yyyy)
  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // ✅ SORT: OLD → NEW
  const sortedReceipts = [...receipts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalFee = receipts[0]?.total_fee || 0;
  const totalPaid = receipts.reduce((s, r) => s + (r.amount || 0), 0);
  const totalDue = receipts[0]?.due || 0;

  return (
    <div className="space-y-3">

      {/* SUMMARY */}
      <div className="bg-white p-3 rounded shadow flex justify-between text-sm">
        <div>
          <p>Total Fee</p>
          <b>{format(totalFee)}</b>
        </div>
        <div>
          <p>Paid</p>
          <b>{format(totalPaid)}</b>
        </div>
        <div>
          <p>Due</p>
          <b className={Number(totalDue) === 0 ? "text-green-600" : "text-red-500"}>
            {format(totalDue)}
          </b>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow text-xs overflow-x-auto">

        <div className="min-w-max">

          {/* HEADER */}
          <div className="flex font-semibold border-b bg-gray-50">

            <div className="w-[90px] p-2 border-r sticky left-0 bg-white z-10">
              Date
            </div>

            <div className="w-[100px] p-2">Amount</div>
            <div className="w-[100px] p-2">Mode</div>
            <div className="w-[120px] p-2">Receipt No</div>
            <div className="w-[100px] p-2">Total</div>
            <div className="w-[100px] p-2">Discount</div>
            <div className="w-[100px] p-2">Due</div>
            <div className="w-[150px] p-2">Remark</div>

          </div>

          {/* BODY */}
          {sortedReceipts.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No records
            </div>
          )}

          {sortedReceipts.map((r, i) => {

            const dueValue = Number(r.due || 0);

            return (
              <div key={i} className="flex border-b">

                <div className="w-[90px] p-2 border-r sticky left-0 bg-white">
                  {formatDate(r.date)}
                </div>

                <div className="w-[100px] p-2 font-semibold">
                  {format(r.amount)}
                </div>

                <div className="w-[100px] p-2">
                  {r.mode}
                </div>

                <div className="w-[120px] p-2">
                  {r.receipt_no}
                </div>

                <div className="w-[100px] p-2">
                  {format(r.total_fee)}
                </div>

                <div className="w-[100px] p-2">
                  {format(r.discount)}
                </div>

                <div className={`w-[100px] p-2 ${dueValue === 0 ? "text-green-600" : "text-red-500"}`}>
                  {format(dueValue)}
                </div>

                <div className="w-[150px] p-2">
                  {r.remark}
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}