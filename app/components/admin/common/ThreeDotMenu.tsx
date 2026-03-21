"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import BatchSelectModal from "@/app/components/admin/common/BatchSelectModal";

type Props = {
  studentId: string;
};

export default function ThreeDotMenu({ studentId }: Props) {

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "move" | null>(null);

  const [openUp, setOpenUp] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    if (!open || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    setOpenUp(spaceBelow < 220);

  }, [open]);

  function handleAction(val: string) {

    setOpen(false);

    if (val === "admission") router.push(`/admin/students/${studentId}/admission`);
    if (val === "receipt") router.push(`/admin/students/${studentId}/receipt`);
    if (val === "progress") router.push(`/admin/students/${studentId}/progress`);
    if (val === "notes") router.push(`/admin/students/${studentId}/notes`);
    if (val === "certificate") router.push(`/admin/students/${studentId}/certificate`);

  }

  return (
    <div className="relative">

      {/* 3 DOT */}
      <button
        onClick={() => {
          setOpen(!open);
        }}
        className="text-lg px-1"
      >
        ⋮
      </button>

      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MENU */}
      {open && (
        <div
          ref={menuRef}
          className={`absolute z-50 bg-white rounded-xl shadow-xl w-48 overflow-hidden
            ${openUp ? "bottom-6" : "top-6"}
            right-0
          `}
        >

          <div className="py-1 text-sm">

            <div onClick={() => handleAction("admission")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              📄 Admission
            </div>

            <div onClick={() => handleAction("receipt")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              💰 Receipt
            </div>

            <div onClick={() => handleAction("progress")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              📊 Progress
            </div>

            <div onClick={() => handleAction("notes")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              📝 Notes
            </div>

            <div onClick={() => handleAction("certificate")} className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              🎓 Certificate
            </div>

            <div className="border-t my-1" />

            {/* ADD */}
            <div
              onClick={() => {
                setOpen(false);
                setModalType("add");
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-50"
            >
              ➕ Add Batch
            </div>

            {/* MOVE */}
            <div
              onClick={() => {
                setOpen(false);
                setModalType("move");
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-50"
            >
              🔄 Move Batch
            </div>

          </div>

        </div>
      )}

      {/* ✅ MODAL */}
      {modalType && (
        <BatchSelectModal
          studentId={studentId}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}

    </div>
  );
}