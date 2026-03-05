"use client";

import { createContext, useContext, useState } from "react";

type PermissionContextType = {
  permissions: string[];
  branchId: string | null;
  setPermissions: (permissions: string[]) => void;
  setBranchId: (branchId: string | null) => void;
};

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  branchId: null,
  setPermissions: () => {},
  setBranchId: () => {},
});

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        setPermissions,
        branchId,
        setBranchId,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}