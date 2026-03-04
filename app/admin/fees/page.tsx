"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function FeesPage() {

  return (

    <PermissionGuard page="Fees">

      <div>
        <h1>Fees</h1>
      </div>

    </PermissionGuard>

  );

}