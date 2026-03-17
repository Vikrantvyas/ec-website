"use client";

export default function AdminSplitLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">

      {/* LEFT */}
      <div className="w-[300px] flex flex-col h-full overflow-hidden">
        {left}
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {right}
      </div>

    </div>
  );
}