"use client";

import { useState, useEffect } from "react";
import BranchForm from "@/app/components/admin/branches/BranchForm";
import BranchList from "@/app/components/admin/branches/BranchList";
import {
  getBranches,
  setBranches as updateStoreBranches,
} from "@/lib/dummyBranchStore";

type Branch = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

export default function BranchesPage() {
  const [branchName, setBranchName] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    setBranches(getBranches());
  }, []);

  const syncStore = (updated: Branch[]) => {
    setBranches(updated);
    updateStoreBranches(updated);
  };

  const resetForm = () => {
    setBranchName("");
    setStatus("Active");
    setEditingId(null);
  };

  const handleSave = () => {
    if (!branchName.trim()) return;

    let updated: Branch[];

    if (editingId !== null) {
      updated = branches.map((branch) =>
        branch.id === editingId
          ? { ...branch, name: branchName, status }
          : branch
      );
    } else {
      updated = [
        ...branches,
        {
          id: Date.now(),
          name: branchName,
          status,
        },
      ];
    }

    syncStore(updated);
    resetForm();
  };

  const handleEdit = (branch: Branch) => {
    setBranchName(branch.name);
    setStatus(branch.status);
    setEditingId(branch.id);
  };

  const handleDelete = (id: number) => {
    const updated = branches.filter(
      (branch) => branch.id !== id
    );
    syncStore(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-2xl font-bold">
        Branch Management
      </h1>

      <BranchForm
        branchName={branchName}
        setBranchName={setBranchName}
        status={status}
        setStatus={setStatus}
        editing={editingId !== null}
        onSave={handleSave}
        onCancel={resetForm}
      />

      <BranchList
        branches={branches}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

    </div>
  );
}