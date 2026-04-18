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

/* ✅ CORRECT SORTABLE ITEM */
function SortableItem({ id, children }: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

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

export default function EnglishTopicMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [topicName, setTopicName] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editOrder, setEditOrder] = useState("");

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchDays(); }, [selectedCourse]);
  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("english_courses").select("*").order("name");
    if (data) setCourses(data);
  };

  const fetchDays = async () => {
    const { data } = await supabase.from("days")
      .select("*").eq("course_id", selectedCourse).order("day_number");
    if (data) setDays(data);
  };

  const fetchTopics = async () => {
    const { data } = await supabase.from("topics")
      .select("*").eq("day_id", selectedDay).order("order_no");
    if (data) setTopics(data);
  };

  // ADD
  const addTopic = async () => {
    if (!topicName || !selectedDay) return;

    const maxOrder = topics.length > 0
      ? Math.max(...topics.map(t => t.order_no || 0))
      : 0;

    await supabase.from("topics").insert([{
      day_id: selectedDay,
      topic_name: topicName,
      order_no: Number(orderNo || maxOrder + 1)
    }]);

    setTopicName("");
    setOrderNo("");
    fetchTopics();
  };

  // BULK
  const addBulk = async () => {
    if (!bulkText || !selectedDay) return;

    const lines = bulkText.split("\n").map(l => l.trim()).filter(l => l);

    const maxOrder = topics.length > 0
      ? Math.max(...topics.map(t => t.order_no || 0))
      : 0;

    const data = lines.map((line, i) => ({
      day_id: selectedDay,
      topic_name: line,
      order_no: maxOrder + i + 1
    }));

    await supabase.from("topics").insert(data);

    setBulkText("");
    fetchTopics();
  };

  // DELETE
  const deleteTopic = async (id:string) => {
    await supabase.from("topics").delete().eq("id", id);
    fetchTopics();
  };

  // EDIT
  const startEdit = (t:any) => {
    setEditId(t.id);
    setEditText(t.topic_name);
    setEditOrder(String(t.order_no));
  };

  const saveEdit = async () => {
    if (!editId) return;

    await supabase.from("topics")
      .update({
        topic_name: editText,
        order_no: Number(editOrder)
      })
      .eq("id", editId);

    setEditId(null);
    fetchTopics();
  };

  // DRAG
  const handleDragEnd = (event:any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topics.findIndex(t => t.id === active.id);
    const newIndex = topics.findIndex(t => t.id === over.id);

    setTopics(arrayMove(topics, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    for (let i = 0; i < topics.length; i++) {
      await supabase.from("topics")
        .update({ order_no: i + 1 })
        .eq("id", topics[i].id);
    }
    fetchTopics();
  };

  return (

    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex flex-wrap gap-2 items-center">

        <select value={selectedCourse} onChange={(e)=>setSelectedCourse(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Course</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={selectedDay} onChange={(e)=>setSelectedDay(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Day</option>
          {days.map(d=><option key={d.id} value={d.id}>Day {d.day_number}</option>)}
        </select>

        <input value={topicName} onChange={(e)=>setTopicName(e.target.value)}
          placeholder="Topic"
          className="border px-2 py-1 rounded flex-1 min-w-[250px]" />

        <input value={orderNo} onChange={(e)=>setOrderNo(e.target.value)}
          placeholder="Order"
          className="border px-2 py-1 rounded w-20" />

        <button onClick={addTopic} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>

        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showBulk} onChange={()=>setShowBulk(!showBulk)} />
          Bulk
        </label>

        <button onClick={saveOrder} className="bg-purple-600 text-white px-3 py-1 rounded">
          Save Order
        </button>

      </div>

      {/* BULK */}
      {showBulk && (
        <div className="p-3 border-b">
          <textarea
            value={bulkText}
            onChange={(e)=>setBulkText(e.target.value)}
            className="border w-full h-32 p-2 rounded"
            placeholder="Paste topics (one per line)"
          />
          <button onClick={addBulk} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
            Add Bulk
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-180px)]">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={topics.map(t=>t.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {topics.map(t=>(

                <SortableItem key={t.id} id={t.id}>

                  {(attributes:any, listeners:any)=>(

                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      {/* DRAG HANDLE */}
                      <div {...attributes} {...listeners} className="cursor-move px-1">☰</div>

                      {editId === t.id ? (
                        <>
                          <input value={editOrder} onChange={(e)=>setEditOrder(e.target.value)} className="w-16 border px-2 py-1 rounded" />
                          <input value={editText} onChange={(e)=>setEditText(e.target.value)} className="flex-1 border px-2 py-1 rounded" />
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <div className="w-10">{t.order_no}</div>
                          <div className="flex-1">{t.topic_name}</div>

                          <button onClick={()=>startEdit(t)}>Edit</button>
                          <button onClick={()=>deleteTopic(t.id)}>Delete</button>
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