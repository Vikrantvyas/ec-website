"use client";

import { useState } from "react";
import BranchForm from "@/app/components/admin/branches/BranchForm";
import BranchList from "@/app/components/admin/branches/BranchList";

export default function BranchesMaster() {

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (

    <div className="space-y-8">

      <h2 className="text-xl font-semibold">
        Branch Management
      </h2>

      <BranchForm onSaved={handleSaved} />

      <BranchList refreshKey={refreshKey} />

    </div>

  );

}