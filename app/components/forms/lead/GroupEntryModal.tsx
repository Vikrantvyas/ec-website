"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (members: { name: string; mobile: string }[]) => void;
}

export default function GroupEntryModal({ isOpen, onClose, onSave }: Props) {
  const [count, setCount] = useState<number>(0);
  const [members, setMembers] = useState<{ name: string; mobile: string }[]>([]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (count <= 0) return;
    const arr = Array.from({ length: count }, () => ({
      name: "",
      mobile: "",
    }));
    setMembers(arr);
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
    setCount(0);
    setMembers([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-semibold">Add Group Members</h2>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Number of additional students"
            value={count || ""}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            className="border px-3 py-2 w-full rounded-md"
          />
          <button
            type="button"
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-3 rounded-md"
          >
            Generate
          </button>
        </div>

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

        {members.length > 0 && (
          <div className="flex justify-end gap-2">
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
        )}
      </div>
    </div>
  );
}