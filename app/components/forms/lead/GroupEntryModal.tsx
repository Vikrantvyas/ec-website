"use client";

import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (members: { name: string; mobile: string }[]) => void;
}

export default function GroupEntryModal({ isOpen, onClose, onSave }: Props) {

  const [count, setCount] = useState<number>(1);
  const [members, setMembers] = useState<{ name: string; mobile: string }[]>([
    { name: "", mobile: "" }
  ]);

  useEffect(() => {
    if (isOpen) {
      setCount(1);
      setMembers([{ name: "", mobile: "" }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCountChange = (value: number) => {
    if (value < 1) value = 1;

    setCount(value);

    const updated = Array.from({ length: value }, (_, i) =>
      members[i] || { name: "", mobile: "" }
    );

    setMembers(updated);
  };

  const handleChange = (index: number, field: string, value: string) => {
    if (field === "mobile") {
      value = value.replace("+91", "").replace(/\D/g, "").slice(0, 10);
    }

    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSave = () => {
    const valid = members.every(
      (m) => m.name.trim() && /^\d{10}$/.test(m.mobile)
    );

    if (!valid) {
      alert("Fill all group member details correctly.");
      return;
    }

    onSave(members);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-5 space-y-4 max-h-[80vh] overflow-y-auto">

        <h2 className="text-lg font-semibold">Add Group Members</h2>

        {/* Member Count */}
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => handleCountChange(parseInt(e.target.value) || 1)}
          className="border px-3 py-2 w-full rounded-md"
        />

        {/* Dynamic Members */}
        {members.map((m, i) => (
          <div key={i} className="space-y-2 border p-3 rounded-md">
            <input
              type="text"
              placeholder="Student Name"
              value={m.name}
              onChange={(e) =>
                handleChange(i, "name", e.target.value)
              }
              className="border px-3 py-2 w-full rounded-md"
            />

            <input
              type="text"
              placeholder="Mobile"
              value={m.mobile}
              onChange={(e) =>
                handleChange(i, "mobile", e.target.value)
              }
              className="border px-3 py-2 w-full rounded-md"
            />
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Save Group
          </button>
        </div>

      </div>
    </div>
  );
}