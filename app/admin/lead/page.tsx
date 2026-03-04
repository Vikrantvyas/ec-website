"use client";

import LeadForm from "./LeadForm";
import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function LeadPage() {

  return (

    <PermissionGuard page="Lead">

      <div className="w-full px-3 sm:px-6 py-4 bg-white">
        <LeadForm />
      </div>

    </PermissionGuard>

  );

}