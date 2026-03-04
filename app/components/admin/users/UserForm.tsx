"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  onSaved: () => void;
};

type Branch = {
  id: string;
  name: string;
};

type Role = {
  id: string;
  name: string;
};

export default function UserForm({ onSaved }: Props) {

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("Active");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    loadBranches();
    loadRoles();
  }, []);

  const loadBranches = async () => {
    const { data } = await supabase
      .from("branches")
      .select("id,name")
      .eq("status", "Active")
      .order("name");

    if (data) setBranches(data);
  };

  const loadRoles = async () => {
    const { data } = await supabase
      .from("roles")
      .select("id,name")
      .order("name");

    if (data) setRoles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("users")
      .insert({
        name,
        mobile,
        email,
        branch_id: branchId,
        role_id: roleId,
        status,
      });

    if (!error) {

      alert("User saved successfully");

      setName("");
      setMobile("");
      setEmail("");
      setBranchId("");
      setRoleId("");
      setStatus("Active");

      onSaved();
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4">

      <h2 className="text-lg font-medium mb-4">
        Add User
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <option value="">Select Branch</option>

          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}

        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          <option value="">Select Role</option>

          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}

        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <div className="col-span-2">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Save User
          </button>
        </div>

      </form>

    </div>
  );
}