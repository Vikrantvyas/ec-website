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

function SortableItem({ s, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: s.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function EnglishSentenceMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sentences, setSentences] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [text, setText] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const [newCourse, setNewCourse] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showDayInput, setShowDayInput] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editOrder, setEditOrder] = useState("");
const isVocab =
  courses.find(c => c.id === selectedCourse)?.name === "Vocabulary";
  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchDays(); }, [selectedCourse]);
  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);
  useEffect(() => { if (selectedTopic) fetchSentences(); }, [selectedTopic]);

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

  const fetchSentences = async () => {

  if (isVocab) {

    const { data } = await supabase.from("vocabulary")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (data) {
      // convert into same structure
      const formatted = data.map((d:any) => ({
        id: d.id,
        sentence: `${d.hindi} - ${d.english}`,
        order_no: d.order_no
      }));

      setSentences(formatted);
    }

  } else {

    const { data } = await supabase.from("sentences")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (data) setSentences(data);

  }

};
     

  const addCourse = async () => {
    if (!newCourse) return;
    const { data } = await supabase.from("english_courses").insert([{ name: newCourse }]).select();
    setNewCourse("");
    setShowCourseInput(false);
    fetchCourses();
    if (data) setSelectedCourse(data[0].id);
  };

  const addDay = async () => {
    if (!newDay) return;
    const { data } = await supabase.from("days").insert([{
      course_id: selectedCourse,
      day_number: Number(newDay)
    }]).select();
    setNewDay("");
    setShowDayInput(false);
    fetchDays();
    if (data) setSelectedDay(data[0].id);
  };

  const addTopic = async () => {
    if (!newTopic) return;

    const maxOrder = topics.length > 0
      ? Math.max(...topics.map(t => t.order_no || 0))
      : 0;

    const { data } = await supabase.from("topics").insert([{
      day_id: selectedDay,
      topic_name: newTopic,
      order_no: maxOrder + 1
    }]).select();

    setNewTopic("");
    setShowTopicInput(false);
    fetchTopics();
    if (data) setSelectedTopic(data[0].id);
  };

  const addSentence = async () => {
    if (!text) return;

    const maxOrder = sentences.length > 0
      ? Math.max(...sentences.map(s => s.order_no || 0))
      : 0;

    if (isVocab) {

  const parts = text.split("-");

  await supabase.from("vocabulary").insert([{
    topic_id: selectedTopic,
    hindi: parts[0]?.trim() || "",
    english: parts[1]?.trim() || "",
    order_no: Number(orderNo || maxOrder + 1)
  }]);

} else {

  await supabase.from("sentences").insert([{
    topic_id: selectedTopic,
    sentence: text,
    order_no: Number(orderNo || maxOrder + 1)
  }]);

}

    setText("");
    setOrderNo("");
    fetchSentences();
  };

  const addBulk = async () => {
    if (!bulkText) return;

    const lines = bulkText.split("\n").map(l => l.trim()).filter(l => l);

    const maxOrder = sentences.length > 0
      ? Math.max(...sentences.map(s => s.order_no || 0))
      : 0;

    if (isVocab) {

  const data = lines.map((line, i) => {
    const parts = line.split("-");

    return {
      topic_id: selectedTopic,
      hindi: parts[0]?.trim() || "",
      english: parts[1]?.trim() || "",
      order_no: maxOrder + i + 1
    };
  });

  await supabase.from("vocabulary").insert(data);

} else {

  const data = lines.map((line, i) => ({
    topic_id: selectedTopic,
    sentence: line,
    order_no: maxOrder + i + 1
  }));

  await supabase.from("sentences").insert(data);

}
    setBulkText("");
    fetchSentences();
  };

  const deleteSentence = async (id:string) => {
    await supabase.from("sentences").delete().eq("id", id);
    fetchSentences();
  };

  const startEdit = (s:any) => {
    setEditId(s.id);
    setEditText(s.sentence);
    setEditOrder(String(s.order_no));
  };

  const saveEdit = async () => {
    await supabase.from("sentences")
      .update({
        sentence: editText,
        order_no: Number(editOrder)
      })
      .eq("id", editId);

    setEditId(null);
    fetchSentences();
  };

  const handleDragEnd = (event:any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sentences.findIndex(s => s.id === active.id);
    const newIndex = sentences.findIndex(s => s.id === over.id);

    setSentences(arrayMove(sentences, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    for (let i = 0; i < sentences.length; i++) {
      await supabase.from("sentences")
        .update({ order_no: i + 1 })
        .eq("id", sentences[i].id);
    }
    fetchSentences();
  };

  return (

    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex flex-wrap gap-2 items-center">

        <select value={selectedCourse} onChange={(e)=>setSelectedCourse(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Course</option>
          {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button onClick={()=>setShowCourseInput(!showCourseInput)}>+</button>
        {showCourseInput && (
          <>
            <input value={newCourse} onChange={(e)=>setNewCourse(e.target.value)} className="border px-2 py-1 rounded" />
            <button onClick={addCourse}>Save</button>
          </>
        )}

        <select value={selectedDay} onChange={(e)=>setSelectedDay(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Day</option>
          {days.map(d=><option key={d.id} value={d.id}>Day {d.day_number}</option>)}
        </select>

        <button onClick={()=>setShowDayInput(!showDayInput)}>+</button>
        {showDayInput && (
          <>
            <input value={newDay} onChange={(e)=>setNewDay(e.target.value)} className="border px-2 py-1 rounded w-20" />
            <button onClick={addDay}>Save</button>
          </>
        )}

        <select value={selectedTopic} onChange={(e)=>setSelectedTopic(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Topic</option>
          {topics.map(t=><option key={t.id} value={t.id}>{t.topic_name}</option>)}
        </select>

        <button onClick={()=>setShowTopicInput(!showTopicInput)}>+</button>
        {showTopicInput && (
          <>
            <input value={newTopic} onChange={(e)=>setNewTopic(e.target.value)} className="border px-2 py-1 rounded" />
            <button onClick={addTopic}>Save</button>
          </>
        )}

        <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Sentence"
          className="border px-2 py-1 rounded flex-1 min-w-[300px]" />

        <input value={orderNo} onChange={(e)=>setOrderNo(e.target.value)}
          placeholder="Order" className="border px-2 py-1 rounded w-20" />

        <button onClick={addSentence} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>

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
            placeholder="Paste sentences (one per line)"
          />
          <button onClick={addBulk} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
            Add Bulk
          </button>
        </div>
      )}

      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-180px)]">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sentences.map(s=>s.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {sentences.map(s=>(

                <SortableItem key={s.id} s={s}>

                  <div className="flex items-center gap-2 border p-2 rounded bg-white">

                    {editId === s.id ? (
                      <>
                        <input value={editOrder} onChange={(e)=>setEditOrder(e.target.value)} className="w-16 border px-2 py-1 rounded" />
                        <input value={editText} onChange={(e)=>setEditText(e.target.value)} className="flex-1 border px-2 py-1 rounded" />
                        <button onClick={saveEdit}>Save</button>
                      </>
                    ) : (
                      <>
                        <div className="cursor-move">☰</div>
                        <div className="w-10">{s.order_no}</div>
                        <div className="flex-1">{s.sentence}</div>
                        <button onClick={()=>startEdit(s)}>Edit</button>
                        <button onClick={()=>deleteSentence(s.id)}>Delete</button>
                      </>
                    )}

                  </div>

                </SortableItem>

              ))}

            </div>

          </SortableContext>
        </DndContext>

      </div>

    </div>
  );
}