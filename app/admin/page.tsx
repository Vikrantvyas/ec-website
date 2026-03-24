"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHome() {

  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-semibold text-gray-700">
        Redirecting to Dashboard...
      </h1>
    </div>
  );
}