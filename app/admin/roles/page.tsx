"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RoleForm from "@/app/components/admin/roles/RoleForm";
import RoleList from "@/app/components/admin/roles/RoleList";

type Role = {
  id: string;
  name: string;
  branch_access: string[];
  permissions: string[];
};

export default function RolesPage() {

  const [roleName, setRoleName] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const resetForm = () => {
    setRoleName("");
    setSelectedBranches([]);
    setSelectedPermissions([]);
    setEditingId(null);
  };

  const handleSave = async () => {

    if (!roleName.trim()) return;

    if (editingId) {

      await supabase
        .from("roles")
        .update({
          name: roleName,
          branch_access: selectedBranches,
          permissions: selectedPermissions,
        })
        .eq("id", editingId);

      alert("Role updated successfully");

    } else {

      await supabase
        .from("roles")
        .insert({
          name: roleName,
          branch_access: selectedBranches,
          permissions: selectedPermissions,
        });

      alert("Role saved successfully");

    }

    resetForm();
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (role: Role) => {

    setRoleName(role.name);
    setSelectedBranches(role.branch_access || []);
    setSelectedPermissions(role.permissions || []);
    setEditingId(role.id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <h1 className="text-2xl font-bold">
        Role Management
      </h1>

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
        refreshKey={refreshKey}
        onEdit={handleEdit}
      />

    </div>
  );
}