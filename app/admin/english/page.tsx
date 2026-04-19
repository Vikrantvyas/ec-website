"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import WhiteBoard from "@/app/components/admin/english/WhiteBoard";
import VocabularyPlayer from "@/app/components/admin/english/VocabularyPlayer";
import ScoreCard from "@/app/components/admin/english/ScoreCard";
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
const [showScore, setShowScore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
const isVocab =
  courses.find(c => c.id === selectedCourse)?.name === "Vocabulary";
  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => {
  if (selectedCourse) {
    fetchDays();
    fetchTopics(); // 🔥 ALL topics
  }
}, [selectedCourse]);
  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);
  useEffect(() => { if (selectedTopic) fetchSentences(); }, [selectedTopic]);

  
   useEffect(() => {
  if (scrollRef.current) {
    if (showAll) {
      scrollRef.current.scrollTop = 0; // 🔥 TOP
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight; // bottom
    }
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
  const { data } = await supabase
    .from("topics")
    .select("*, sentences(count)")
    .order("order_no");

  if (data) setTopics(data);
};

 const fetchSentences = async () => {

  if (!selectedTopic) return;

  if (isVocab) {

    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (!error && data) {
      setSentences(data);
      setCurrentIndex(0);
      setShowAll(false);
    }

  } else {

    const { data, error } = await supabase
      .from("sentences")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (!error && data) {
      setSentences(data);
      setCurrentIndex(0);
      setShowAll(false);
    }

  }

};

  // 🔥 SENTENCE NAV
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

  // 🔥 TOPIC NAV
  const nextTopic = () => {

  const dayTopics = topics.filter(t => t.day_id === selectedDay);

  const idx = dayTopics.findIndex(t => t.id === selectedTopic);

  if (idx < dayTopics.length - 1) {
    setSelectedTopic(dayTopics[idx + 1].id);
  } else {
    const dayIdx = days.findIndex(d => d.id === selectedDay);

    if (dayIdx < days.length - 1) {
      const nextDay = days[dayIdx + 1].id;
      setSelectedDay(nextDay);

      setTimeout(() => {
        const nextDayTopics = topics.filter(t => t.day_id === nextDay);
        if (nextDayTopics.length > 0) {
          setSelectedTopic(nextDayTopics[0].id);
        }
      }, 200);
    }
  }
};

  const prevTopic = () => {

  const dayTopics = topics.filter(t => t.day_id === selectedDay);

  const idx = dayTopics.findIndex(t => t.id === selectedTopic);

  if (idx > 0) {
    setSelectedTopic(dayTopics[idx - 1].id);
  } else {
    const dayIdx = days.findIndex(d => d.id === selectedDay);

    if (dayIdx > 0) {
      const prevDay = days[dayIdx - 1].id;
      setSelectedDay(prevDay);

      setTimeout(() => {
        const prevDayTopics = topics.filter(t => t.day_id === prevDay);
        if (prevDayTopics.length > 0) {
          setSelectedTopic(prevDayTopics[prevDayTopics.length - 1].id);
        }
      }, 200);
    }
  }
};
  const toggleShowAll = () => {
  if (showAll) {
    setShowAll(false);
    setCurrentIndex(0);
  } else {
    setShowAll(true);
    setCurrentIndex(sentences.length); // 🔥 yaha fix
  }
};

  const visible = showAll
    ? sentences
    : sentences.slice(0, currentIndex);

  const leftCol = visible.slice(0, 10);
  const rightCol = visible.slice(10);

  return (

    <div className="english-page flex h-[calc(100vh-56px)] bg-gray-100 overflow-hidden">
      {/* LEFT PANEL */}
{/* LEFT PANEL */}
<div className="w-60 bg-white border-r flex flex-col">

  {/* 🔥 FIXED COURSE */}
  <div className="p-3 border-b">

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

  </div>

  {/* 🔥 SCROLL AREA */}
  <div className="flex-1 overflow-y-auto p-3 space-y-2">

    {days.map(d => {

      const dayTopics = topics.filter(t => t.day_id === d.id);
      const isExpanded = selectedDay === d.id;
      const hasTopics = dayTopics.length > 0;

      return (

        <div key={d.id}>

          {/* DAY */}
          <button
            onClick={()=>setSelectedDay(isExpanded ? "" : d.id)}
            className={`w-full flex justify-between items-center px-2 py-2 rounded ${
              isExpanded ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            <span>Day {d.day_number}</span>

            {hasTopics && (
              <span className="text-lg font-bold">
                {isExpanded ? "−" : "+"}
              </span>
            )}
          </button>

          {/* TOPICS */}
          {isExpanded && hasTopics && (
            <div className="ml-3 mt-1 space-y-1">

              {dayTopics.map(t => {

                const count = t.sentences?.[0]?.count || 0;

                return (

                  <button
                    key={t.id}
                    onClick={()=>setSelectedTopic(t.id)}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                      selectedTopic === t.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {t.topic_name}

                    {count > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({count})
                      </span>
                    )}

                  </button>

                );

              })}

            </div>
          )}

        </div>

      );

    })}

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

  <div className={`${(showBoard || showScore) ? "w-1/2" : "w-full"} p-4 flex flex-col`}>

    <div ref={scrollRef} className="flex-1 overflow-y-auto">

      

  {isVocab ? (
  <VocabularyPlayer data={sentences} />
) : showBoard ? (
    <div className="space-y-1">
      {visible.map((item, i)=>(

        <div
          key={item.id}
          onClick={()=>{
            setHighlightIndex(prev => prev === i ? null : i);
          }}
          className={`cursor-pointer select-none text-2xl leading-tight flex ${
            highlightIndex === i ? "bg-yellow-200" : ""
          }`}
        >

          <div className="w-10 shrink-0">
            {i+1}.
          </div>

          <div className="flex-1">
            {item.sentence}
          </div>

        </div>

      ))}
    </div>

  )

 : (

        <div className="flex gap-4">

          {/* LEFT COLUMN */}
          <div className="w-1/2 space-y-1">
            {leftCol.map((item, i)=>(

              <div
                key={item.id}
                onClick={()=>{
                  setHighlightIndex(prev => prev === i ? null : i);
                }}
                className={`cursor-pointer select-none text-2xl leading-tight ${
                  highlightIndex === i ? "bg-yellow-200" : ""
                }`}
              >
                {i+1}. {item.sentence}
              </div>

            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/2 space-y-1">
            {rightCol.map((item, i)=>{

              const realIndex = i + 10;

              return (
                <div
                  key={item.id}
                  onClick={()=>{
                    setHighlightIndex(prev => prev === realIndex ? null : realIndex);
                  }}
                  className={`cursor-pointer select-none text-2xl leading-tight ${
                    highlightIndex === realIndex ? "bg-yellow-200" : ""
                  }`}
                >
                  {realIndex + 1}. {item.sentence}
                </div>
              );

            })}
          </div>

        </div>

      )}

    </div>

  </div>

  {(showBoard || showScore) && (
    
  <div className="w-1/2 border-l">

    {showBoard && <WhiteBoard />}
    {showScore && <ScoreCard />}

  </div>
)}

</div>

        </div>

        {/* CONTROLS */}
        <div className="flex gap-3 flex-wrap justify-center">

          <button onClick={prevSentence} disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40">
            Prev
          </button>

          <button onClick={nextSentence} disabled={currentIndex >= sentences.length}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40">
            Next
          </button>

          {(currentIndex >= sentences.length || showAll) && (
            <button onClick={()=>{ setShowAll(false); setCurrentIndex(0); }}
              className="px-4 py-2 bg-red-600 text-white rounded">
              Reset
            </button>
          )}

          {!showAll && currentIndex < sentences.length && (
            <button onClick={toggleShowAll}
              className="px-4 py-2 bg-green-600 text-white rounded">
              Show All
            </button>
          )}

          <button onClick={()=>setShowBoard(prev=>!prev)}
            className="px-4 py-2 bg-purple-600 text-white rounded">
            {showBoard ? "Hide Board" : "Show Board"}
          </button>

          {/* 🔥 TOPIC BUTTONS */}
          <button onClick={prevTopic}
            className="px-4 py-2 bg-orange-500 text-white rounded">
            ← Prev Topic
          </button>

          <button onClick={nextTopic}
            className="px-4 py-2 bg-orange-600 text-white rounded">
            Next Topic →
          </button>
<button
  onClick={()=>{
    if (showScore) {
      setShowScore(false);
      setShowBoard(true);
    } else {
      setShowBoard(false);
      setShowScore(true);
    }
  }}
  className="px-4 py-2 bg-green-700 text-white rounded"
>
  {showScore ? "Hide Score" : "Show Score"}
</button>


        </div>

      </div>

    </div>
  );
}