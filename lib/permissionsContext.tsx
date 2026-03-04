"use client";

import { createContext, useContext, useState } from "react";

type PermissionContextType = {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
};

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  setPermissions: () => {},
});

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <PermissionContext.Provider value={{ permissions, setPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}