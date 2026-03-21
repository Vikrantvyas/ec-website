"use client";

import { useRouter } from "next/navigation";

type Props = {
  studentId: string;
};

export default function StudentQuickActions({ studentId }: Props) {

  const router = useRouter();

  return (
    <div className="mt-3 border-t pt-3 flex flex-wrap gap-2">

      <button
        onClick={() => router.push(`/admin/students/${studentId}/admission`)}
        className="px-2 py-1 text-xs bg-gray-100 rounded"
      >
        Admission
      </button>

      <button
        onClick={() => router.push(`/admin/students/${studentId}/receipt`)}
        className="px-2 py-1 text-xs bg-gray-100 rounded"
      >
        Receipt
      </button>

      <button
        onClick={() => router.push(`/admin/students/${studentId}/progress`)}
        className="px-2 py-1 text-xs bg-gray-100 rounded"
      >
        Progress
      </button>

      <button
        onClick={() => router.push(`/admin/students/${studentId}/notes`)}
        className="px-2 py-1 text-xs bg-gray-100 rounded"
      >
        Notes
      </button>

      <button
        onClick={() => router.push(`/admin/students/${studentId}/certificate`)}
        className="px-2 py-1 text-xs bg-gray-100 rounded"
      >
        Certificate
      </button>

      <button className="px-2 py-1 text-xs bg-blue-100 rounded">
        ➕ Add Batch
      </button>

      <button className="px-2 py-1 text-xs bg-yellow-100 rounded">
        🔄 Move Batch
      </button>

    </div>
  );
}