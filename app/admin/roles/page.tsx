"use client";

import { useState } from "react";
import RoleForm from "@/app/components/admin/roles/RoleForm";
import RoleList from "@/app/components/admin/roles/RoleList";

type Role = {
  id: number;
  name: string;
  branches: string[];
  permissions: string[];
};

export default function RolesPage() {
  const [roleName, setRoleName] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setRoleName("");
    setSelectedBranches([]);
    setSelectedPermissions([]);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!roleName.trim()) return;

    if (editingId !== null) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingId
            ? {
                ...role,
                name: roleName,
                branches: selectedBranches,
                permissions: selectedPermissions,
              }
            : role
        )
      );
    } else {
      setRoles((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: roleName,
          branches: selectedBranches,
          permissions: selectedPermissions,
        },
      ]);
    }

    resetForm();
  };

  const handleEdit = (role: Role) => {
    setRoleName(role.name);
    setSelectedBranches(role.branches);
    setSelectedPermissions(role.permissions);
    setEditingId(role.id);
  };

  const handleDelete = (id: number) => {
    setRoles((prev) => prev.filter((role) => role.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Role Management</h1>

      <RoleForm
        roleName={roleName}
        setRoleName={setRoleName}
        selectedBranches={selectedBranches}
        setSelectedBranches={setSelectedBranches}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
        editing={editingId !== null}
        onSave={handleSave}
        onCancel={resetForm}
      />

      <RoleList
        roles={roles}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}