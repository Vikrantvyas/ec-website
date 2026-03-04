"use client";

import { useState } from "react";

type Props = {
  onSaved: () => void;
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

export default function UserForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");

  const branches = ["Indore Vijay Nagar", "Indore Bhawarkua", "Online"];
  const roles = ["Admin", "Counsellor", "Teacher"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: User = {
      id: Date.now(),
      name,
      mobile,
      email,
      branch,
      role,
      status,
    };

    const existing = JSON.parse(localStorage.getItem("users") || "[]");
    localStorage.setItem("users", JSON.stringify([...existing, newUser]));

    setName("");
    setMobile("");
    setEmail("");
    setBranch("");
    setRole("");
    setStatus("Active");

    onSaved();
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <h2 className="text-lg font-medium mb-4">Add User</h2>

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
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
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