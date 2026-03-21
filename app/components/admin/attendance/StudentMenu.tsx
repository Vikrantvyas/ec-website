"use client";

import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  studentId: string;
};

export default function StudentMenu({ studentId }: Props) {

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const options = [
    { label: "📄 Admission", value: "admission" },
    { label: "💰 Receipt", value: "receipt" },
    { label: "📊 Progress", value: "progress" },
    { label: "📝 Notes", value: "notes" },
    { label: "🎓 Certificate", value: "certificate" },
    { label: "➕ Add Batch", value: "add_batch" },
    { label: "🔄 Move Batch", value: "move_batch" },
  ];

  function handleChange(val: string) {

    setOpen(false);

    if (val === "admission") {
      router.push(`/admin/students/${studentId}/admission`);
    }

    if (val === "receipt") {
      router.push(`/admin/students/${studentId}/receipt`);
    }

    if (val === "progress") {
      router.push(`/admin/students/${studentId}/progress`);
    }

    if (val === "notes") {
      router.push(`/admin/students/${studentId}/notes`);
    }

    if (val === "certificate") {
      router.push(`/admin/students/${studentId}/certificate`);
    }

  }

  return (
    <div className="relative">

      {/* 3 DOT BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="text-lg px-1"
      >
        ⋮
      </button>

      {/* HIDDEN SELECT TRIGGER */}
      {open && (
        <div className="absolute right-0 top-6 w-40">
          <BottomSheetSelect
            label="Select Action"
            value=""
            options={options}
            onChange={handleChange}
          />
        </div>
      )}

    </div>
  );
}