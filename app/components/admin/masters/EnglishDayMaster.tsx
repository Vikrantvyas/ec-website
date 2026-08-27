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

export default function EnglishDayMaster({
  initialCourseId = "",
  onManageTopics
}: any) {

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [days, setDays] = useState<any[]>([]);
  const [dayNumber, setDayNumber] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [clipboardDay, setClipboardDay] = useState<any>(null);
  const [clipboardMode, setClipboardMode] = useState<"copy" | "cut" | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourse(initialCourseId);
    }
  }, [initialCourseId]);

  useEffect(() => {
    if (selectedCourse) fetchDays();
  }, [selectedCourse]);

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
  const copyDay = (day: any) => {
    setClipboardDay(day);
    setClipboardMode("copy");
  };

  const cutDay = (day: any) => {
    setClipboardDay(day);
    setClipboardMode("cut");
  };
  const pasteDay = async () => {
  if (!clipboardDay || !selectedCourse) return;

  try {
    // 1. Get all topics of the source day
    const { data: oldTopics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("day_id", clipboardDay.id)
      .order("order_no");

    if (topicsError) throw topicsError;

    // 2. Find the next day number in target course
    const maxDay = days.length > 0
      ? Math.max(...days.map(d => d.day_number))
      : 0;

    // 3. Create the new day
    const { data: newDayData, error: newDayError } = await supabase
      .from("days")
      .insert([{
        course_id: selectedCourse,
        day_number: maxDay + 1,
        title: clipboardDay.title || ""
      }])
      .select()
      .single();

    if (newDayError) throw newDayError;

    const newDay = newDayData;

    // 4. Copy every topic
    for (const oldTopic of oldTopics || []) {

      const { data: newTopicData, error: newTopicError } = await supabase
        .from("topics")
        .insert([{
          day_id: newDay.id,
          topic_name: oldTopic.topic_name,
          order_no: oldTopic.order_no
        }])
        .select()
        .single();

      if (newTopicError) throw newTopicError;

      const newTopic = newTopicData;

      // 5. Get sentences of this topic
      const { data: oldVocabulary, error: vocabularyError } =
        await supabase
          .from("vocabulary")
          .select("*")
          .eq("topic_id", oldTopic.id)
          .order("order_no");

      if (vocabularyError) throw vocabularyError;

      // 6. Copy sentences
      if (oldVocabulary && oldVocabulary.length > 0) {

        const vocabularyData = oldVocabulary.map((v: any) => ({
          topic_id: newTopic.id,
          hindi: v.hindi,
          english: v.english,
          order_no: v.order_no
        }));

        const { error: insertVocabularyError } = await supabase
          .from("vocabulary")
          .insert(vocabularyData);

        if (insertVocabularyError) throw insertVocabularyError;
      }
    }

    // 7. Only after successful copy, delete original for CUT
    if (clipboardMode === "cut") {

      const { error: deleteError } = await supabase
        .from("days")
        .delete()
        .eq("id", clipboardDay.id);

      if (deleteError) throw deleteError;
    }

    // 8. Clear clipboard
    setClipboardDay(null);
    setClipboardMode(null);

    // 9. Refresh target course
    fetchDays();

  } catch (error) {

    console.error("Paste Day failed:", error);

    alert(
      "Paste failed. Original Day has NOT been deleted."
    );
  }
};
  // DELETE
  const deleteDay = async (id: string) => {
    await supabase.from("days").delete().eq("id", id);
    fetchDays();
  };

  // EDIT
  const startEdit = (d: any) => {
    setEditId(d.id);
    setEditValue(String(d.day_number));
    setEditTitle(d.title || "");
  };

  const saveEdit = async () => {
    await supabase.from("days")
      .update({
        day_number: Number(editValue),
        title: editTitle
      })
      .eq("id", editId);

    setEditId(null);
    fetchDays();
  };

  // DRAG
  const handleDragEnd = (event: any) => {
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
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={dayNumber}
          onChange={(e) => setDayNumber(e.target.value)}
          placeholder="Enter number (e.g. 10)"
          className="border px-2 py-1 rounded w-40"
        />

        <button onClick={addDay} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>

        <button onClick={saveOrder} className="bg-purple-600 text-white px-3 py-1 rounded">
          Save Order
        </button>
        {clipboardDay && (
          <button
            onClick={pasteDay}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Paste {clipboardMode === "cut" ? "Cut" : "Copied"} Day
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-120px)]">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={days.map(d => d.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {days.map(d => (

                <SortableItem key={d.id} id={d.id}>

                  {(attributes: any, listeners: any) => (

                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      <div {...attributes} {...listeners} className="cursor-move">☰</div>

                      {editId === d.id ? (
                        <>
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border px-2 py-1 rounded w-20"
                          />
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="border px-2 py-1 rounded flex-1"
                          />
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">

                            {String(d.day_number).padStart(2, "0")}

                            {d.title
                              ? ` · ${d.title}`
                              : ""}

                          </div>

                          <button onClick={() => onManageTopics(d.id)}>
                            Manage Topics →
                          </button>

                          <button onClick={() => copyDay(d)}>
                            Copy
                          </button>

                          <button onClick={() => cutDay(d)}>
                            Cut
                          </button>

                          <button onClick={() => startEdit(d)}>Edit</button>
                          <button onClick={() => deleteDay(d.id)}>Delete</button>
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