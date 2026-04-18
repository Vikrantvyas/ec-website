"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* SORTABLE */
function SortableItem({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(attributes, listeners)}
    </div>
  );
}

export default function EnglishDayMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [days, setDays] = useState<any[]>([]);
  const [dayNumber, setDayNumber] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchDays(); }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("english_courses").select("*").order("name");
    if (data) setCourses(data);
  };

  const fetchDays = async () => {
    const { data } = await supabase.from("days")
      .select("*").eq("course_id", selectedCourse).order("day_number");
    if (data) setDays(data);
  };

  // ✅ BULK ADD (MAIN FEATURE)
  const addDay = async () => {
    if (!selectedCourse || !dayNumber) return;

    const count = Number(dayNumber);

    const maxDay = days.length > 0
      ? Math.max(...days.map(d => d.day_number))
      : 0;

    const data = [];

    for (let i = 1; i <= count; i++) {
      data.push({
        course_id: selectedCourse,
        day_number: maxDay + i
      });
    }

    await supabase.from("days").insert(data);

    setDayNumber("");
    fetchDays();
  };

  // DELETE
  const deleteDay = async (id:string) => {
    await supabase.from("days").delete().eq("id", id);
    fetchDays();
  };

  // EDIT
  const startEdit = (d:any) => {
    setEditId(d.id);
    setEditValue(String(d.day_number));
  };

  const saveEdit = async () => {
    await supabase.from("days")
      .update({ day_number: Number(editValue) })
      .eq("id", editId);

    setEditId(null);
    fetchDays();
  };

  // DRAG
  const handleDragEnd = (event:any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = days.findIndex(d => d.id === active.id);
    const newIndex = days.findIndex(d => d.id === over.id);

    setDays(arrayMove(days, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    for (let i = 0; i < days.length; i++) {
      await supabase.from("days")
        .update({ day_number: i + 1 })
        .eq("id", days[i].id);
    }
    fetchDays();
  };

  return (

    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex gap-2 items-center">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Course</option>
          {courses.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={dayNumber}
          onChange={(e)=>setDayNumber(e.target.value)}
          placeholder="Enter number (e.g. 10)"
          className="border px-2 py-1 rounded w-40"
        />

        <button onClick={addDay} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>

        <button onClick={saveOrder} className="bg-purple-600 text-white px-3 py-1 rounded">
          Save Order
        </button>

      </div>

      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-120px)]">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={days.map(d=>d.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {days.map(d=>(

                <SortableItem key={d.id} id={d.id}>

                  {(attributes:any, listeners:any)=>(

                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      <div {...attributes} {...listeners} className="cursor-move">☰</div>

                      {editId === d.id ? (
                        <>
                          <input
                            value={editValue}
                            onChange={(e)=>setEditValue(e.target.value)}
                            className="border px-2 py-1 rounded w-20"
                          />
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">Day {d.day_number}</div>
                          <button onClick={()=>startEdit(d)}>Edit</button>
                          <button onClick={()=>deleteDay(d.id)}>Delete</button>
                        </>
                      )}

                    </div>

                  )}

                </SortableItem>

              ))}

            </div>

          </SortableContext>
        </DndContext>

      </div>

    </div>
  );
}