"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function ReportsPage() {

  return (

    <PermissionGuard page="Reports">

      <div>
        <h1>Report</h1>
      </div>

    </PermissionGuard>

  );

}