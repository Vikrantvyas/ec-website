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

export default function EnglishCourseMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [name, setName] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    if (data) setCourses(data);
  };

  // ADD
  const addCourse = async () => {
    if (!name.trim()) return;

    await supabase.from("english_courses").insert([{ name }]);

    setName("");
    fetchCourses();
  };

  // DELETE
  const deleteCourse = async (id:string) => {
    await supabase.from("english_courses").delete().eq("id", id);
    fetchCourses();
  };

  // EDIT
  const startEdit = (c:any) => {
    setEditId(c.id);
    setEditText(c.name);
  };

  const saveEdit = async () => {
    if (!editId) return;

    await supabase.from("english_courses")
      .update({ name: editText })
      .eq("id", editId);

    setEditId(null);
    fetchCourses();
  };

  // DRAG
  const handleDragEnd = (event:any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = courses.findIndex(c => c.id === active.id);
    const newIndex = courses.findIndex(c => c.id === over.id);

    setCourses(arrayMove(courses, oldIndex, newIndex));
  };

  // OPTIONAL ORDER SAVE (अगर future में column add करो)
  const saveOrder = async () => {
    for (let i = 0; i < courses.length; i++) {
      await supabase.from("english_courses")
        .update({ name: courses[i].name }) // placeholder
        .eq("id", courses[i].id);
    }
    fetchCourses();
  };

  return (
<div className="h-full flex flex-col">
    

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex gap-2 items-center">

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Course name"
          className="border px-2 py-1 rounded w-72"
        />

        <button onClick={addCourse} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>

        <button onClick={saveOrder} className="bg-purple-600 text-white px-3 py-1 rounded">
          Save Order
        </button>

      </div>

      {/* LIST */}
      <div className="p-3 overflow-y-auto flex-1">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={courses.map(c=>c.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {courses.map(c=>(

                <SortableItem key={c.id} id={c.id}>

                  {(attributes:any, listeners:any)=>(

                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      <div {...attributes} {...listeners} className="cursor-move">☰</div>

                      {editId === c.id ? (
                        <>
                          <input
                            value={editText}
                            onChange={(e)=>setEditText(e.target.value)}
                            className="border px-2 py-1 rounded flex-1"
                          />
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">{c.name}</div>

                          <button onClick={()=>startEdit(c)}>Edit</button>
                          <button onClick={()=>deleteCourse(c.id)}>Delete</button>
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