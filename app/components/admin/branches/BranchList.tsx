"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  refreshKey?: number;
};

type Branch = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function BranchList({ refreshKey = 0 }: Props) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  const loadBranches = async () => {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBranches(data);
  };

  useEffect(() => {
    loadBranches();
  }, [refreshKey]);

  const startEdit = (b: Branch) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditStatus(b.status);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const confirmSave = confirm("Save changes?");
    if (!confirmSave) return;

    await supabase
      .from("branches")
      .update({
        name: editName,
        status: editStatus,
      })
      .eq("id", editingId);

    alert("Branch updated successfully");

    setEditingId(null);
    loadBranches();
  };

  const deleteBranch = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this branch?"
    );

    if (!confirmDelete) return;

    await supabase.from("branches").delete().eq("id", id);

    alert("Branch deleted successfully");

    loadBranches();
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <h2 className="text-lg font-medium mb-4">Branches</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {branches.map((b) => (
            <tr key={b.id} className="border-b">

              <td className="py-2">
                {editingId === b.id ? (
                  <input
                    className="border px-2 py-1 rounded"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                  />
                ) : (
                  b.name
                )}
              </td>

              <td>
                {editingId === b.id ? (
                  <select
                    className="border px-2 py-1 rounded"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value)
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                ) : (
                  b.status
                )}
              </td>

              <td className="text-right space-x-3">

                {editingId === b.id ? (
                  <>
                    <button
                      className="text-green-600"
                      onClick={saveEdit}
                    >
                      Save
                    </button>

                    <button
                      className="text-gray-600"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="text-blue-600"
                    onClick={() => startEdit(b)}
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => deleteBranch(b.id)}
                  className="text-red-600"
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}

          {branches.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-gray-500">
                No branches found
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
}