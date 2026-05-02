"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeftPanel({
  courses,
  days,
  topics,
  selectedCourse,
  selectedDays,
  selectedTopics,
  setSelectedCourse,
  setSelectedDays,
  setSelectedTopics,
  refreshData   // 👈 ADD THIS
}: any) {

  const [menu, setMenu] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTopicData, setSelectedTopicData] = useState<any>(null);
  const [editText, setEditText] = useState("");

  const selectedCourseName =
    courses.find((c:any) => c.id === selectedCourse)?.name;

  const isVocab = selectedCourseName === "Vocabulary";

  const toggleDay = (id:string) => {
    setSelectedDays((prev:string[]) =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const toggleTopic = (id:string) => {
    setSelectedTopics((prev:string[]) =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  // 🔥 RIGHT CLICK
  const handleRightClick = (e:any, topic:any) => {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      topic
    });
  };

  // 🔥 EDIT CLICK
  const handleEdit = async () => {

    const topic = menu.topic;
    setSelectedTopicData(topic);
    setShowPopup(true);

    if (isVocab) {

      const { data } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("topic_id", topic.id)
        .order("order_no");

      if (data) {
        const text = data.map((d:any)=>`${d.hindi} - ${d.english}`).join("\n");
        setEditText(text);
      }

    } else {

      const { data } = await supabase
        .from("sentences")
        .select("*")
        .eq("topic_id", topic.id)
        .order("order_no");

      if (data) {
        const text = data.map((d:any)=>d.sentence).join("\n");
        setEditText(text);
      }

    }

    setMenu(null);
  };

  // 🔥 SAVE
  const handleSave = async () => {

    const lines = editText.split("\n").map(l => l.trim()).filter(l => l);

    if (isVocab) {

      await supabase.from("vocabulary")
        .delete()
        .eq("topic_id", selectedTopicData.id);

      const newData = lines.map((line, i)=>{
        const parts = line.split("-");
        return {
          topic_id: selectedTopicData.id,
          hindi: parts[0]?.trim() || "",
          english: parts[1]?.trim() || "",
          order_no: i + 1
        };
      });

      await supabase.from("vocabulary").insert(newData);

    } else {

      await supabase.from("sentences")
        .delete()
        .eq("topic_id", selectedTopicData.id);

      const newData = lines.map((line, i)=>({
        topic_id: selectedTopicData.id,
        sentence: line,
        order_no: i + 1
      }));

      await supabase.from("sentences").insert(newData);

    }

    setShowPopup(false);
    if (refreshData) {
  await refreshData();
}
  };

  // 🔥 CLOSE MENU
  useEffect(()=>{
    const close = ()=>setMenu(null);
    window.addEventListener("click", close);
    return ()=>window.removeEventListener("click", close);
  },[]);
useEffect(() => {

  const handleKey = (e: KeyboardEvent) => {

    // ESC → Cancel
    if (e.key === "Escape") {
      setShowPopup(false);
    }

    // Ctrl + S → Save
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (showPopup) {
        handleSave();
      }
    }

  };

  window.addEventListener("keydown", handleKey);

  return () => {
    window.removeEventListener("keydown", handleKey);
  };

}, [showPopup, editText]);
  return (

    <div className="w-60 bg-white border-r flex flex-col relative">

      {/* COURSE SELECT */}
      <div className="p-3 border-b">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-2 py-2 rounded w-full"
        >
          <option value="">Select Course</option>

          {courses.map((c:any)=>(
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      {/* DAYS + TOPICS */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {days.map((d:any)=>{

          const dayTopics = topics.filter((t:any)=>t.day_id === d.id);
          const isSelected = selectedDays.includes(d.id);
          const hasTopics = dayTopics.length > 0;

          return (

            <div key={d.id} className="mb-2">

              {/* DAY CHECKBOX */}
              <label
                className={`w-full flex justify-between items-center px-3 py-2 rounded cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-gray-200 border-gray-300"
                }`}
              >

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={()=>toggleDay(d.id)}
                  />
                  <div className="flex items-center gap-2">
                    <span>Day {d.day_number}</span>

                    {hasTopics && (
                      <span className="font-bold text-lg">+</span>
                    )}
                  </div>
                </div>

              </label>

              {/* TOPICS */}
              {isSelected && hasTopics && (

                <div className="ml-4 mt-1 space-y-1">

                  {dayTopics.map((t:any)=>{

                    const count = t.sentences?.[0]?.count || 0;
                    const isTopicSelected = selectedTopics.includes(t.id);

                    return (

                      <label
                        key={t.id}
                        onContextMenu={(e)=>handleRightClick(e, t)}
                        className={`flex justify-between items-center px-2 py-1 rounded text-sm cursor-pointer ${
                          isTopicSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-100"
                        }`}
                      >

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isTopicSelected}
                            onChange={()=>toggleTopic(t.id)}
                          />
                          <span>{t.topic_name}</span>
                        </div>

                        {count > 0 && (
                          <span className="text-xs">({count})</span>
                        )}

                      </label>

                    );

                  })}

                </div>

              )}

              <div className="border-b my-2"></div>
            </div>

          );

        })}

      </div>

      {/* RIGHT CLICK MENU */}
      {menu && (
        <div
          className="fixed bg-white border shadow rounded text-sm z-50"
          style={{ top: menu.y, left: menu.x }}
        >
          <div
            onClick={handleEdit}
            className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          >
            Edit
          </div>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
  <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">

    <div
      className="bg-white rounded shadow-xl flex flex-col"
      style={{ width: "80vw", height: "80vh", maxWidth: "1200px" }}
    >

      {/* HEADER */}
      <div className="p-4 border-b text-lg font-bold">
        Edit: {selectedTopicData?.topic_name}
      </div>

      {/* BODY */}
      <div style={{ flex: 1, padding: "10px" }}>
        <textarea
          value={editText}
          onChange={(e)=>setEditText(e.target.value)}
          style={{
            width: "100%",
            height: "100%",
            fontSize: "18px",
            lineHeight: "1.6",
            padding: "10px",
            border: "1px solid #ccc",
            resize: "none"
          }}
        />
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2 p-3 border-t">
        <button
          onClick={()=>setShowPopup(false)}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>

    </div>

  </div>
)}
 </div>
  );
}