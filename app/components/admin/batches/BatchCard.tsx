"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useRef, useEffect } from "react";
import AddStudentsModal from "@/app/components/admin/common/AddStudentsModal";

type BatchCardProps = {
  id: string;
  name: string;
  department?: string;
  teacher?: string;
  courses?: string[] | null;
  students?: number;
  onReload?: () => void; // optional
};

export default function BatchCard({
  id,
  name,
  teacher,
  courses,
  students = 0,
  onReload
}: BatchCardProps) {

  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e:any) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const courseList =
    Array.isArray(courses) && courses.length > 0
      ? courses.join(", ")
      : "No Courses";

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500"
  ];

  const showCircles = Math.min(students, 4);

  function openAttendance() {
    router.push(`/admin/attendance?batch=${id}`);
  }

  function openEdit() {
    router.push(`/admin/masters?tab=batches&edit=${id}`);
  }

  async function handleDelete() {
    const confirmDelete = confirm("Delete this batch?");
    if (!confirmDelete) return;

    await supabase
      .from("batches")
      .delete()
      .eq("id", id);

    location.reload();
  }

  return (

    <div className="bg-white border rounded-md p-2.5 shadow-sm hover:shadow-md transition max-w-[160px]">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <h3 className="text-xs font-semibold leading-tight">
          {name}
        </h3>

        <div className="relative" ref={menuRef}>

          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 border"
          >
            <span className="text-black text-base leading-none">⋮</span>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow text-xs z-50">
              <button
                onClick={openEdit}
                className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-red-600"
              >
                Delete
              </button>
            </div>
          )}

        </div>

      </div>

      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
        <div>{courseList}</div>
        <div>{teacher || ""}</div>
      </div>

      <div className="flex items-center mt-2">
        <div className="flex items-center">
          {Array.from({ length: showCircles }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center ${colors[i]} ${i !== 0 ? "-ml-1.5" : ""}`}
            >
              {i === showCircles - 1 && students > 4 ? `+${students}` : ""}
            </div>
          ))}
        </div>

        <span className="text-xs text-gray-600 ml-2">
          {students}
        </span>
      </div>

      <div className="flex gap-3 mt-2 text-[11px]">

        <button
          onClick={() => setShowAddModal(true)}
          className="text-gray-600 hover:text-black"
        >
          Add Student
        </button>

        <button
          onClick={openAttendance}
          className="text-blue-600 hover:text-blue-800"
        >
          Attendance
        </button>

      </div>

      {/* ✅ ADD / REMOVE MODAL */}
      {showAddModal && (
        <AddStudentsModal
          batchId={id}
          onClose={() => setShowAddModal(false)}
          onSuccess={onReload || (() => location.reload())}
        />
      )}

    </div>

  );

}