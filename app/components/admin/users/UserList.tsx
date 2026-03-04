"use client";

import { useEffect, useState } from "react";

type Props = {
  refreshKey: number;
};

type User = {
  id: number;
  name: string;
  mobile: string;
  email: string;
  branch: string;
  role: string;
  status: string;
};

export default function UserList({ refreshKey }: Props) {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = () => {
    const data = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  const deleteUser = (id: number) => {
    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem("users", JSON.stringify(filtered));
    setUsers(filtered);
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <h2 className="text-lg font-medium mb-4">Users List</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Role</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.name}</td>
              <td>{u.mobile}</td>
              <td>{u.email}</td>
              <td>{u.branch}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td className="text-right">
                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}