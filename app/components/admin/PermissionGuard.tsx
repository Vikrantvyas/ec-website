"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/permissionsContext";

type Props = {
  page: string;
  children: ReactNode;
};

export default function PermissionGuard({ page, children }: Props) {

  const { permissions } = usePermissions();

  if (!permissions.includes(page)) {
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        Access Denied
      </div>
    );
  }

  return <>{children}</>;
}