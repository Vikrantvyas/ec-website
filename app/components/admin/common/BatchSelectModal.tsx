"use client";

import { useEffect, useState } from "react";

type Batch = {
  id: string;
  batch_name: string;
};

type Props = {
  studentId: string;
  type: "add" | "move";
  onClose: () => void;
};

export default function BatchSelectModal({ studentId, type, onClose }: Props) {

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // 🔥 replace with real API later
    setBatches([
      { id: "1", batch_name: "Morning Batch" },
      { id: "2", batch_name: "Evening Batch" },
      { id: "3", batch_name: "Spoken English" },
      { id: "4", batch_name: "Computer Basic" },
    ]);
  }, []);

  function toggle(id: string) {
    if (type === "move") {
      setSelected([id]); // single select
    } else {
      setSelected((prev) =>
        prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id]
      );
    }
  }

  function handleSave() {
    console.log("student:", studentId);
    console.log("type:", type);
    console.log("selected:", selected);

    // 🔥 NEXT: DB logic

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-white w-full sm:w-[400px] rounded-t-2xl sm:rounded-xl p-4 max-h-[80vh] overflow-y-auto">

        <h2 className="text-sm font-semibold mb-3">
          {type === "move" ? "Move to Batch" : "Add to Batches"}
        </h2>

        <div className="space-y-2">

          {batches.map((b) => (
            <div
              key={b.id}
              onClick={() => toggle(b.id)}
              className={`px-3 py-2 rounded cursor-pointer border
                ${selected.includes(b.id)
                  ? "bg-blue-50 border-blue-400"
                  : "hover:bg-gray-50"
                }
              `}
            >
              {b.batch_name}
            </div>
          ))}

        </div>

        <div className="flex justify-end gap-2 mt-4">

          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}