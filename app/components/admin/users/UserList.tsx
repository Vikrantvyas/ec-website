"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  refreshKey: number;
};

type Branch = {
  id: string;
  name: string;
};

type Role = {
  id: string;
  name: string;
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
  const [branches,setBranches] = useState<Branch[]>([]);
  const [roles,setRoles] = useState<Role[]>([]);
  const [branchId,setBranchId] = useState("");
  const [roleId,setRoleId] = useState("");

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
      .order("created_at",{ascending:false});

    if(data) setUsers(data as unknown as User[]);
  };

  const loadBranches = async () => {

    const { data } = await supabase
      .from("branches")
      .select("id,name")
      .eq("status","Active")
      .order("name");

    if(data) setBranches(data);
  };

  const loadRoles = async () => {

    const { data } = await supabase
      .from("roles")
      .select("id,name")
      .order("name");

    if(data) setRoles(data);
  };

  useEffect(()=>{
    loadUsers();
    loadBranches();
    loadRoles();
  },[refreshKey]);

  const approveUser = async (id:string)=>{

    if(!branchId || !roleId){
      alert("Select branch and role first");
      return;
    }

    await supabase
      .from("users")
      .update({
        branch_id:branchId,
        role_id:roleId,
        status:"Active"
      })
      .eq("id",id);

    alert("User approved");

    setBranchId("");
    setRoleId("");

    loadUsers();
  };

  const deleteUser = async (id:string)=>{

    const confirmDelete = confirm(
      "Are you sure you want to delete this user?"
    );

    if(!confirmDelete) return;

    await supabase
      .from("users")
      .delete()
      .eq("id",id);

    alert("User deleted");

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

          {users.map((u)=>(

            <tr key={u.id} className="border-b">

              <td className="py-2">{u.name}</td>

              <td>{u.mobile}</td>

              <td>{u.email}</td>

              <td>

                {u.status==="Pending" ? (

                  <select
                    className="border px-2 py-1"
                    onChange={(e)=>setBranchId(e.target.value)}
                  >

                    <option value="">Select</option>

                    {branches.map((b)=>(
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}

                  </select>

                ):(
                  u.branch?.name || "-"
                )}

              </td>

              <td>

                {u.status==="Pending" ? (

                  <select
                    className="border px-2 py-1"
                    onChange={(e)=>setRoleId(e.target.value)}
                  >

                    <option value="">Select</option>

                    {roles.map((r)=>(
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}

                  </select>

                ):(
                  u.role?.name || "-"
                )}

              </td>

              <td>

                {u.status==="Pending" ? (
                  <span className="text-orange-600">
                    Pending
                  </span>
                ):(
                  <span className="text-green-600">
                    Active
                  </span>
                )}

              </td>

              <td className="text-right space-x-2">

                {u.status==="Pending" && (
                  <button
                    onClick={()=>approveUser(u.id)}
                    className="text-blue-600"
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={()=>deleteUser(u.id)}
                  className="text-red-600"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}