"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnglishDayMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [days, setDays] = useState<any[]>([]);
  const [dayNumber, setDayNumber] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchDays();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    if (data) setCourses(data);
  };

  const fetchDays = async () => {
    const { data } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("day_number");

    if (data) setDays(data);
  };

  const addDay = async () => {
    if (!selectedCourse || !dayNumber) return;

    await supabase.from("days").insert([
      {
        course_id: selectedCourse,
        day_number: Number(dayNumber)
      }
    ]);

    setDayNumber("");
    fetchDays();
  };

  const deleteDay = async (id:string) => {
    if (!confirm("Delete day?")) return;

    await supabase.from("days").delete().eq("id", id);
    fetchDays();
  };

  return (

    <div className="space-y-4">

      {/* COURSE SELECT */}
      <div className="flex gap-2">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Course</option>
          {courses.map(c=>(
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={dayNumber}
          onChange={(e)=>setDayNumber(e.target.value)}
          placeholder="Day number"
          className="border px-3 py-2 rounded w-32"
        />

        <button
          onClick={addDay}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Day
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-2">

        {days.map(d=>(
          <div
            key={d.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>Day {d.day_number}</div>

            <button
              onClick={()=>deleteDay(d.id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}