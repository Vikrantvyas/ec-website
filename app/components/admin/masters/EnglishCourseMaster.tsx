"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnglishCourseMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("english_courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setCourses(data);
  };

  const saveCourse = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await supabase
        .from("english_courses")
        .update({ name })
        .eq("id", editingId);

      setEditingId(null);
    } else {
      await supabase
        .from("english_courses")
        .insert([{ name }]);
    }

    setName("");
    fetchCourses();
  };

  const editCourse = (c:any) => {
    setName(c.name);
    setEditingId(c.id);
  };

  const deleteCourse = async (id:string) => {
    if (!confirm("Delete course?")) return;

    await supabase
      .from("english_courses")
      .delete()
      .eq("id", id);

    fetchCourses();
  };

  return (

    <div className="space-y-4">

      {/* FORM */}
      <div className="flex gap-2">

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Course name"
          className="border px-3 py-2 rounded w-64"
        />

        <button
          onClick={saveCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-2">

        {courses.map((c)=>(
          <div
            key={c.id}
            className="flex justify-between items-center border p-2 rounded"
          >

            <div>{c.name}</div>

            <div className="flex gap-2">

              <button
                onClick={()=>editCourse(c)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>

              <button
                onClick={()=>deleteCourse(c.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}