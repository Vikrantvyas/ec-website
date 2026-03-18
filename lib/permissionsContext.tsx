"use client";

import { createContext, useContext, useState } from "react";

type PermissionContextType = {
  permissions: string[];
  branchId: string | null;
  role: string | null;
  userId: string | null;              // ✅ ADD
  teacherId: string | null;           // ✅ ADD

  setPermissions: (permissions: string[]) => void;
  setBranchId: (branchId: string | null) => void;
  setRole: (role: string | null) => void;
  setUserId: (id: string | null) => void;       // ✅ ADD
  setTeacherId: (id: string | null) => void;    // ✅ ADD
};

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  branchId: null,
  role: null,
  userId: null,          // ✅ ADD
  teacherId: null,       // ✅ ADD

  setPermissions: () => {},
  setBranchId: () => {},
  setRole: () => {},
  setUserId: () => {},       // ✅ ADD
  setTeacherId: () => {},    // ✅ ADD
});

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [permissions, setPermissions] = useState<string[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);     // ✅ ADD
  const [teacherId, setTeacherId] = useState<string | null>(null); // ✅ ADD

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        setPermissions,
        branchId,
        setBranchId,
        role,
        setRole,
        userId,
        setUserId,
        teacherId,
        setTeacherId,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}