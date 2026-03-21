"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  studentId: string;
};

export default function ThreeDotMenu({ studentId }: Props) {

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<string | null>(null);

  const [openUp, setOpenUp] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const dummyBatches = [
    { id: "1", batch_name: "Morning Batch" },
    { id: "2", batch_name: "Evening Batch" },
    { id: "3", batch_name: "Spoken English" },
    { id: "4", batch_name: "Computer Basic" },
  ];

  useEffect(() => {

    if (!open || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;

    setOpenUp(spaceBelow < 250);
    setOpenLeft(spaceRight < 220);

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

      {/* BUTTON */}
      <button
        ref={btnRef}
        onClick={() => {
          setOpen(!open);
          setSubMenu(null);
        }}
        className="text-lg px-1"
      >
        ⋮
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setSubMenu(null);
          }}
        />
      )}

      {/* MENU */}
      {open && (
        <div
          ref={menuRef}
          className={`absolute z-50 bg-white rounded-xl shadow-xl w-48 text-sm
            ${openUp ? "bottom-full mb-2" : "top-full mt-2"}
            ${openLeft ? "right-0" : "right-0"}
          `}
        >

          <div className="py-1">

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
              onClick={(e) => {
                e.stopPropagation();
                setSubMenu(subMenu === "add" ? null : "add");
              }}
              className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-50"
            >
              ➕ Add Batch <span>›</span>
            </div>

            {/* ADD SUBMENU */}
            {subMenu === "add" && (
              <div
                className={`absolute top-0 bg-white shadow-lg rounded-lg w-44 z-50
                  ${openLeft ? "right-full mr-1" : "left-full ml-1"}
                `}
              >
                {dummyBatches.map((b) => (
                  <div key={b.id} className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer">
                    {b.batch_name}
                  </div>
                ))}
              </div>
            )}

            {/* MOVE */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSubMenu(subMenu === "move" ? null : "move");
              }}
              className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-50"
            >
              🔄 Move Batch <span>›</span>
            </div>

            {/* MOVE SUBMENU */}
            {subMenu === "move" && (
              <div
                className={`absolute top-0 bg-white shadow-lg rounded-lg w-44 z-50
                  ${openLeft ? "right-full mr-1" : "left-full ml-1"}
                `}
              >
                {dummyBatches.map((b) => (
                  <div key={b.id} className="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer">
                    {b.batch_name}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}