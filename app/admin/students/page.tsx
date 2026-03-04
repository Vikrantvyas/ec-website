"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function StudentsPage() {

  return (

    <PermissionGuard page="Students">

      <div>
        <h1>Students</h1>
      </div>

    </PermissionGuard>

  );

}