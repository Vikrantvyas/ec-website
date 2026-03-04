"use client";

import { useState } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import BranchForm from "@/app/components/admin/branches/BranchForm";
import BranchList from "@/app/components/admin/branches/BranchList";

export default function BranchesPage() {

  const [refreshKey,setRefreshKey] = useState(0);

  const handleSaved = ()=>{
    setRefreshKey((prev)=>prev+1);
  };

  return (

    <PermissionGuard page="Masters">

      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold">
          Branch Management
        </h1>

        <BranchForm onSaved={handleSaved} />

        <BranchList refreshKey={refreshKey} />

      </div>

    </PermissionGuard>

  );

}