"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import WhiteBoard from "@/app/components/admin/english/WhiteBoard";

export default function EnglishPage() {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sentences, setSentences] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const [showBoard, setShowBoard] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchDays(); }, [selectedCourse]);
  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);
  useEffect(() => { if (selectedTopic) fetchSentences(); }, [selectedTopic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex, showAll]);

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
    const { data } = await supabase.from("sentences")
      .select("*").eq("topic_id", selectedTopic).order("order_no");

    if (data) {
      setSentences(data);
      setCurrentIndex(0);
      setShowAll(false);
    }
  };

  // 🔥 FIXED NEXT LOGIC
  const nextSentence = () => {
    if (currentIndex < sentences.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSentence = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleShowAll = () => {
    if (showAll) {
      setShowAll(false);
      setCurrentIndex(0);
    } else {
      setShowAll(true);
    }
  };

  const visible = showAll
    ? sentences
    : sentences.slice(0, currentIndex);

  const leftCol = visible.slice(0, 10);
  const rightCol = visible.slice(10);

  return (

    <div className="flex h-[calc(100vh-56px)] bg-gray-100 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-60 bg-white border-r p-3 space-y-3">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-2 py-2 rounded w-full"
        >
          <option value="">Select Course</option>
          {courses.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="space-y-1 max-h-40 overflow-y-auto">
          {days.map(d=>(
            <button
              key={d.id}
              onClick={()=>setSelectedDay(d.id)}
              className={`block w-full text-left px-2 py-1 rounded ${
                selectedDay === d.id ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>

        <div className="space-y-1 border-t pt-2 max-h-40 overflow-y-auto">
          {topics.map(t=>(
            <button
              key={t.id}
              onClick={()=>setSelectedTopic(t.id)}
              className={`block w-full text-left px-2 py-1 rounded ${
                selectedTopic === t.id ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              {t.topic_name}
            </button>
          ))}
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col items-center pt-4 gap-2">

        <div
          className="bg-white border shadow flex flex-col overflow-hidden"
          style={{ width: "25cm", height: "12cm" }}
        >

          {/* HEADER */}
          <div className="shadow-md bg-white px-4 py-2 text-sm flex justify-between z-10">
            <div>Day {days.find(d=>d.id===selectedDay)?.day_number}</div>
            <div>{topics.find(t=>t.id===selectedTopic)?.topic_name}</div>
          </div>

          {/* BODY */}
          <div className="flex flex-1 overflow-hidden">

            <div className={`${showBoard ? "w-1/2" : "w-full"} p-4 flex flex-col`}>

              <div ref={scrollRef} className="flex-1 overflow-y-auto">

                {showBoard ? (

                  <div className="space-y-1"> {/* 🔥 GAP REDUCED */}
                    {visible.map((item, i)=>(
                      <div
                        key={item.id}
                        onClick={()=>setHighlightIndex(i)}
                        className={`cursor-pointer text-2xl leading-tight ${
                          highlightIndex === i ? "bg-yellow-200" : ""
                        }`}
                      >
                        {i+1}. {item.sentence}
                      </div>
                    ))}
                  </div>

                ) : (

                  <div className="flex gap-4">

                    <div className="w-1/2 space-y-1">
                      {leftCol.map((item, i)=>(
                        <div key={item.id} className="text-2xl leading-tight">
                          {i+1}. {item.sentence}
                        </div>
                      ))}
                    </div>

                    <div className="w-1/2 space-y-1">
                      {rightCol.map((item, i)=>(
                        <div key={item.id} className="text-2xl leading-tight">
                          {i+11}. {item.sentence}
                        </div>
                      ))}
                    </div>

                  </div>

                )}

              </div>

            </div>

            {showBoard && (
              <div className="w-1/2 border-l">
                <WhiteBoard />
              </div>
            )}

          </div>

        </div>

        {/* CONTROLS */}
        <div className="flex gap-3">

  <button
    onClick={prevSentence}
    disabled={currentIndex === 0}
    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
  >
    Prev
  </button>

  {/* 🔥 NEXT BUTTON */}
  <button
    onClick={nextSentence}
    disabled={currentIndex >= sentences.length}
    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
  >
    Next
  </button>

  {/* 🔥 RESET (ONLY WHEN END REACHED OR SHOW ALL) */}
  {(currentIndex >= sentences.length || showAll) && (
    <button
      onClick={()=>{
        setShowAll(false);
        setCurrentIndex(0);
      }}
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      Reset
    </button>
  )}

  {/* SHOW ALL */}
  {!showAll && currentIndex < sentences.length && (
    <button
      onClick={()=>setShowAll(true)}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Show All
    </button>
  )}

  {/* WHITEBOARD */}
  <button
    onClick={()=>setShowBoard(prev=>!prev)}
    className="px-4 py-2 bg-purple-600 text-white rounded"
  >
    {showBoard ? "Hide Board" : "Show Board"}
  </button>

</div>

      </div>

    </div>
  );
}