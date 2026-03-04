"use client";

type Role = {
  id: number;
  name: string;
  branches: string[];
  permissions: string[];
};

type Props = {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
};

export default function RoleList({
  roles,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Existing Roles</h2>

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
                <h3 className="font-semibold">{role.name}</h3>

                <p className="text-sm text-gray-600 mt-1">
                  Branches:{" "}
                  {role.branches.length > 0
                    ? role.branches.join(", ")
                    : "None"}
                </p>

                <p className="text-sm text-gray-600">
                  Permissions:{" "}
                  {role.permissions.length > 0
                    ? role.permissions.join(", ")
                    : "None"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(role)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(role.id)}
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