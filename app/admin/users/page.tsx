"use client";

import { useState } from "react";
import UserForm from "@/app/components/admin/users/UserForm";
import UserList from "@/app/components/admin/users/UserList";
import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function UsersPage() {

  const [refreshKey,setRefreshKey] = useState(0);

  const handleUserSaved = ()=>{
    setRefreshKey((prev)=>prev+1);
  };

  return (

    <PermissionGuard page="Users">

      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-semibold">
            Users Management
          </h1>

          <p className="text-sm text-gray-500">
            Add and manage system users
          </p>
        </div>

        <UserForm onSaved={handleUserSaved} />

        <UserList refreshKey={refreshKey} />

      </div>

    </PermissionGuard>

  );

}