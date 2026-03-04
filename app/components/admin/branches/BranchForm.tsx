"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onSaved?: () => void;
};

export default function BranchForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const confirmSave = confirm("Add this branch?");
    if (!confirmSave) return;

    const { error } = await supabase
      .from("branches")
      .insert([
        {
          name,
          status,
        },
      ]);

    if (!error) {
      alert("Branch added successfully");

      setName("");
      setStatus("Active");

      if (onSaved) onSaved();
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4">

      <h2 className="text-lg font-medium mb-4">
        Add Branch
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4"
      >

        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="Branch Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <select
          className="border rounded-lg px-3 py-2"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>

      </form>

    </div>
  );
}