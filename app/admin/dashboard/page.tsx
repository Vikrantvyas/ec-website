"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function AdminDashboard() {

  return (

    <PermissionGuard page="Dashboard">

      <div className="flex items-center justify-center min-h-[70vh]">
        <h1 className="text-3xl font-semibold text-gray-700">
          Welcome to Dashboard
        </h1>
      </div>

    </PermissionGuard>

  );

}