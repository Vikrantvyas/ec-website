"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function SettingsPage() {

  return (

    <PermissionGuard page="Settings">

      <div>
        <h1>Setting</h1>
      </div>

    </PermissionGuard>

  );

}