"use client";

type Props = {
  branchName: string;
  setBranchName: (v: string) => void;
  status: "Active" | "Inactive";
  setStatus: (v: "Active" | "Inactive") => void;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export default function BranchForm({
  branchName,
  setBranchName,
  status,
  setStatus,
  editing,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-6 shadow-sm">

      <div>
        <label className="block text-sm font-medium mb-1">
          Branch Name
        </label>
        <input
          type="text"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="w-full border rounded-md px-3 h-10"
          placeholder="Enter branch name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "Active" | "Inactive")
          }
          className="w-full border rounded-md px-3 h-10"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="bg-[#0a1f44] text-white px-6 h-10 rounded-md"
        >
          {editing ? "Update Branch" : "Save Branch"}
        </button>

        {editing && (
          <button
            onClick={onCancel}
            className="border px-6 h-10 rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}