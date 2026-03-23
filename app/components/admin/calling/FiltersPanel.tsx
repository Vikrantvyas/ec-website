"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
};

export default function FiltersPanel({ open, onClose, onApply }: Props) {

  const [courses, setCourses] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selected, setSelected] = useState<any>({
    gender: [],
    course: [],
    city: []
  });

  useEffect(() => {
    if (open) loadMasters();
  }, [open]);

  async function loadMasters() {

    const { data: courseData } = await supabase.from("courses").select("name");
    const { data: cityData } = await supabase.from("city").select("name");

    setCourses(courseData?.map((d: any) => d.name) || []);
    setCities(cityData?.map((d: any) => d.name) || []);
  }

  function toggle(key: string, value: string) {

    setSelected((prev: any) => {

      const arr = prev[key] || [];

      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [key]: [...arr, value] };
      }

    });

  }

  function applyFilters() {
    onApply(selected);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative ml-auto h-full w-full bg-white md:w-[400px] overflow-y-auto">

        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="p-4 space-y-6">

          {/* Gender */}
          <div>
            <h3 className="text-sm mb-2">Gender</h3>
            <div className="flex gap-2">
              {["Male", "Female"].map((g) => (
                <button key={g}
                  onClick={() => toggle("gender", g)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selected.gender.includes(g) ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Course */}
          <div>
            <h3 className="text-sm mb-2">Course</h3>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <button key={c}
                  onClick={() => toggle("course", c)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selected.course.includes(c) ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <h3 className="text-sm mb-2">City</h3>
            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button key={c}
                  onClick={() => toggle("city", c)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selected.city.includes(c) ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full bg-black text-white py-2 rounded"
          >
            Apply Filters
          </button>

        </div>

      </div>

    </div>
  );
}