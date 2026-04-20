"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

import LeftPanel from "@/app/components/admin/english/LeftPanel";
import MainBoard from "@/app/components/admin/english/MainBoard";
import Controls from "@/app/components/admin/english/Controls";

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

  // ✅ NEW
  const vocabRef = useRef<any>(null);

  const isVocab =
    courses.find(c => c.id === selectedCourse)?.name === "Vocabulary";

  // ---------------- FETCH ----------------

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchDays();
      fetchTopics();
    }
  }, [selectedCourse]);

  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);
  useEffect(() => { if (selectedTopic) fetchSentences(); }, [selectedTopic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = showAll
        ? 0
        : scrollRef.current.scrollHeight;
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

      const { data } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("topic_id", selectedTopic)
        .order("order_no");

      if (data) {
        setSentences(data);
        setCurrentIndex(0);
        setShowAll(false);
      }

    } else {

      const { data } = await supabase
        .from("sentences")
        .select("*")
        .eq("topic_id", selectedTopic)
        .order("order_no");

      if (data) {
        setSentences(data);
        setCurrentIndex(0);
        setShowAll(false);
      }

    }
  };

  // ---------------- NAV ----------------

  const nextSentence = () => {

    // ✅ VOCAB MODE
    if (isVocab && vocabRef.current) {
      vocabRef.current.next();
      return;
    }

    if (currentIndex < sentences.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSentence = () => {

    // ✅ VOCAB MODE
    if (isVocab && vocabRef.current) {
      vocabRef.current.prev();
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

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
          const prevTopics = topics.filter(t => t.day_id === prevDay);
          if (prevTopics.length > 0) {
            setSelectedTopic(prevTopics[prevTopics.length - 1].id);
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
      setCurrentIndex(sentences.length);
    }
  };

  // ---------------- DATA ----------------

  const visible = showAll
    ? sentences
    : sentences.slice(0, currentIndex);

  const leftCol = visible.slice(0, 10);
  const rightCol = visible.slice(10);

  // ---------------- UI ----------------

  return (

    <div className="english-page flex h-[calc(100vh-56px)] bg-gray-100 overflow-hidden">

      <LeftPanel
        courses={courses}
        days={days}
        topics={topics}
        selectedCourse={selectedCourse}
        selectedDay={selectedDay}
        selectedTopic={selectedTopic}
        setSelectedCourse={setSelectedCourse}
        setSelectedDay={setSelectedDay}
        setSelectedTopic={setSelectedTopic}
      />

      <div className="flex-1 flex flex-col items-center pt-4 gap-2">

        <div
          className="bg-white border shadow flex flex-col overflow-hidden"
          style={{ width: "25cm", height: "12cm" }}
        >

          <div className="shadow-md bg-white px-4 py-2 text-sm flex justify-between z-10">
            <div>Day {days.find(d=>d.id===selectedDay)?.day_number}</div>
            <div>{topics.find(t=>t.id===selectedTopic)?.topic_name}</div>
          </div>

          <MainBoard
            isVocab={isVocab}
            sentences={sentences}
            visible={visible}
            leftCol={leftCol}
            rightCol={rightCol}
            highlightIndex={highlightIndex}
            setHighlightIndex={setHighlightIndex}
            showBoard={showBoard}
            showScore={showScore}
            scrollRef={scrollRef}
            vocabRef={vocabRef} // ✅ NEW
          />

        </div>

        <Controls
          prevSentence={prevSentence}
          nextSentence={nextSentence}
          currentIndex={currentIndex}
          sentences={sentences}
          showAll={showAll}
          toggleShowAll={toggleShowAll}
          setShowAll={setShowAll}
          setCurrentIndex={setCurrentIndex}
          showBoard={showBoard}
          setShowBoard={setShowBoard}
          prevTopic={prevTopic}
          nextTopic={nextTopic}
          showScore={showScore}
          setShowScore={setShowScore}
          isVocab={isVocab} // ✅ NEW
        />

      </div>

    </div>
  );
}