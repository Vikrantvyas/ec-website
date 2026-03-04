"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function MastersPage() {

  return (

    <PermissionGuard page="Masters">

      <div>
        <h1>Masters</h1>
      </div>

    </PermissionGuard>

  );

}