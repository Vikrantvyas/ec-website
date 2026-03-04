"use client";

type Branch = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

type Props = {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
};

export default function BranchList({
  branches,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">
        Existing Branches
      </h2>

      {branches.length === 0 && (
        <p className="text-sm text-gray-500">
          No branches created yet.
        </p>
      )}

      <div className="space-y-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="border rounded-md p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{branch.name}</h3>
              <p
                className={`text-sm mt-1 ${
                  branch.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {branch.status}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => onEdit(branch)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(branch.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}