"use client";

import { useMemo } from "react";
import { getBranches } from "@/lib/dummyBranchStore";

type Props = {
  roleName: string;
  setRoleName: (v: string) => void;
  selectedBranches: string[];
  setSelectedBranches: (v: string[]) => void;
  selectedPermissions: string[];
  setSelectedPermissions: (v: string[]) => void;
  editing: boolean;
  onSave: () => void;
  onCancel: () => void;
};

const dummyPermissions = [
  "Dashboard",
  "Leads View",
  "Add Lead",
  "Admission",
  "Students",
  "Attendance",
  "Fees",
  "Reports",
  "Masters",
  "Settings",
  "Role Management",
  "User Management",
];

export default function RoleForm({
  roleName,
  setRoleName,
  selectedBranches,
  setSelectedBranches,
  selectedPermissions,
  setSelectedPermissions,
  editing,
  onSave,
  onCancel,
}: Props) {

  const branches = useMemo(() => {
    return getBranches().filter((b) => b.status === "Active");
  }, []);

  const toggleBranch = (branch: string) => {
    setSelectedBranches(
      selectedBranches.includes(branch)
        ? selectedBranches.filter((b) => b !== branch)
        : [...selectedBranches, branch]
    );
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(
      selectedPermissions.includes(permission)
        ? selectedPermissions.filter((p) => p !== permission)
        : [...selectedPermissions, permission]
    );
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6 shadow-sm">

      <div>
        <label className="block text-sm font-medium mb-1">
          Role Name
        </label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full border rounded-md px-3 h-10"
        />
      </div>

      <div>
        <h2 className="font-semibold mb-2">Branch Access</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {branches.map((branch) => (
            <label
              key={branch.id}
              className="flex items-center gap-2 border rounded-md p-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBranches.includes(branch.name)}
                onChange={() => toggleBranch(branch.name)}
              />
              {branch.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Page Permissions</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {dummyPermissions.map((permission) => (
            <label
              key={permission}
              className="flex items-center gap-2 border rounded-md p-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission)}
                onChange={() => togglePermission(permission)}
              />
              {permission}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="bg-[#0a1f44] text-white px-6 h-10 rounded-md"
        >
          {editing ? "Update Role" : "Save Role"}
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