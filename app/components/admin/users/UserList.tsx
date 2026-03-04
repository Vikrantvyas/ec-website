"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  refreshKey: number;
};

type User = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  branch?: { name: string };
  role?: { name: string };
};

export default function UserList({ refreshKey }: Props) {

  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {

    const { data } = await supabase
      .from("users")
      .select(`
        id,
        name,
        mobile,
        email,
        status,
        branch:branches(name),
        role:roles(name)
      `)
      .order("created_at", { ascending: false });

    if (data) setUsers(data as unknown as User[]);
  };

  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  const deleteUser = async (id: string) => {

    const confirmDelete = confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("users")
      .delete()
      .eq("id", id);

    alert("User deleted successfully");

    loadUsers();
  };

  return (
    <div className="bg-white border rounded-xl p-4">

      <h2 className="text-lg font-medium mb-4">
        Users List
      </h2>

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

              <td>{u.branch?.name || "-"}</td>

              <td>{u.role?.name || "-"}</td>

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