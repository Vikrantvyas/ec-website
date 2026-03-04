"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  refreshKey?: number;
  onEdit?: (role: Role) => void;
};

type Role = {
  id: string;
  name: string;
  branch_access: string[];
  permissions: string[];
};

export default function RoleList({ refreshKey = 0, onEdit }: Props) {

  const [roles, setRoles] = useState<Role[]>([]);

  const loadRoles = async () => {
    const { data } = await supabase
      .from("roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setRoles(data);
  };

  useEffect(() => {
    loadRoles();
  }, [refreshKey]);

  const deleteRole = async (id: string) => {

    const confirmDelete = confirm(
      "Are you sure you want to delete this role?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("roles")
      .delete()
      .eq("id", id);

    alert("Role deleted successfully");

    loadRoles();
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">

      <h2 className="text-lg font-semibold mb-4">
        Existing Roles
      </h2>

      {roles.length === 0 ? (
        <p className="text-sm text-gray-500">
          No roles created yet.
        </p>
      ) : (
        <div className="space-y-4">

          {roles.map((role) => (

            <div
              key={role.id}
              className="border rounded-md p-4 flex justify-between items-start"
            >

              <div>

                <h3 className="font-semibold">
                  {role.name}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Branches:{" "}
                  {role.branch_access?.length
                    ? role.branch_access.join(", ")
                    : "None"}
                </p>

                <p className="text-sm text-gray-600">
                  Permissions:{" "}
                  {role.permissions?.length
                    ? role.permissions.join(", ")
                    : "None"}
                </p>

              </div>

              <div className="flex gap-4">

                <button
                  onClick={() => onEdit && onEdit(role)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}