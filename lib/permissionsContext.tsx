"use client";

import { createContext, useContext, useState } from "react";

type PermissionContextType = {
  permissions: string[];
  branchId: string | null;
  userId: string | null; // ✅ NEW

  setPermissions: (permissions: string[]) => void;
  setBranchId: (branchId: string | null) => void;
  setUserId: (userId: string | null) => void; // ✅ NEW
};

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  branchId: null,
  userId: null,

  setPermissions: () => {},
  setBranchId: () => {},
  setUserId: () => {},
});

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // ✅ NEW

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        setPermissions,
        branchId,
        setBranchId,
        userId,
        setUserId, // ✅ NEW
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}