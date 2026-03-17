"use client";

export default function AdminSplitLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">

      {/* LEFT */}
      <div className="w-full md:w-[300px] h-[40%] md:h-full flex flex-col overflow-hidden">
        {left}
      </div>

      {/* RIGHT */}
      <div className="flex-1 h-[60%] md:h-full flex flex-col overflow-hidden">
        {right}
      </div>

    </div>
  );
}