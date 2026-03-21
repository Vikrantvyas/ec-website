"use client";

type Props = {
  receipts: any[];
};

export default function LeadFees({ receipts }: Props) {

  const totalFee = receipts[0]?.total_fee || 0;
  const totalPaid = receipts.reduce((s, r) => s + (r.amount || 0), 0);
  const totalDue = receipts[0]?.due || 0;

  return (
    <div className="space-y-3">

      {/* SUMMARY */}
      <div className="bg-white p-3 rounded shadow flex justify-between text-sm">
        <div>
          <p>Total Fee</p>
          <b>₹{totalFee}</b>
        </div>
        <div>
          <p>Paid</p>
          <b>₹{totalPaid}</b>
        </div>
        <div>
          <p>Due</p>
          <b className="text-red-500">₹{totalDue}</b>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">

        {/* HEADER */}
        <div className="flex text-xs font-semibold border-b bg-gray-50">

          {/* FIXED DATE */}
          <div className="min-w-[90px] p-2 border-r bg-white sticky left-0 z-10">
            Date
          </div>

          {/* SCROLLABLE */}
          <div className="flex overflow-x-auto w-full">

            <div className="min-w-[100px] p-2">Amount</div>
            <div className="min-w-[100px] p-2">Mode</div>
            <div className="min-w-[120px] p-2">Receipt No</div>
            <div className="min-w-[100px] p-2">Total</div>
            <div className="min-w-[100px] p-2">Discount</div>
            <div className="min-w-[100px] p-2">Due</div>
            <div className="min-w-[150px] p-2">Remark</div>

          </div>
        </div>

        {/* BODY */}
        {receipts.length === 0 && (
          <div className="p-4 text-center text-gray-400">
            No records
          </div>
        )}

        {receipts.map((r, i) => (
          <div key={i} className="flex text-xs border-b">

            {/* FIXED DATE */}
            <div className="min-w-[90px] p-2 border-r bg-white sticky left-0">
              {r.date}
            </div>

            {/* SCROLLABLE */}
            <div className="flex overflow-x-auto w-full">

              <div className="min-w-[100px] p-2 font-semibold">
                ₹{r.amount}
              </div>

              <div className="min-w-[100px] p-2">
                {r.mode}
              </div>

              <div className="min-w-[120px] p-2">
                {r.receipt_no}
              </div>

              <div className="min-w-[100px] p-2">
                ₹{r.total_fee}
              </div>

              <div className="min-w-[100px] p-2">
                ₹{r.discount}
              </div>

              <div className="min-w-[100px] p-2 text-red-500">
                ₹{r.due}
              </div>

              <div className="min-w-[150px] p-2">
                {r.remark}
              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}