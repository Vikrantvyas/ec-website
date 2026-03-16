"use client";

import AddStudentsModal from "@/app/components/admin/batches/AddStudentsModal";
import { useSearchParams } from "next/navigation";

export default function Page() {

  const params = useSearchParams();
  const batchId = params.get("batch");

  return <AddStudentsModal batchId={batchId} />;

}