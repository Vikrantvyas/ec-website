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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const [showBoard, setShowBoard] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [showLeft, setShowLeft] = useState(true);
  const [showGrammar, setShowGrammar] = useState(false);
const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const scrollRef = useRef<HTMLDivElement>(null);
  const vocabRef = useRef<any>(null);

  const selectedCourseName =
    courses.find(c => c.id === selectedCourse)?.name;

  const isVocab = selectedCourseName === "Vocabulary";
  const isGrammar = selectedCourseName === "Grammar";

  // 🔥 AUTO PANEL CONTROL (IMPORTANT)
  useEffect(() => {

    if (isVocab) {
      setShowLeft(true);
      setShowScore(true);
      setShowBoard(false);
      setShowGrammar(false);
    }

  }, [isVocab]);

  // ---------------- FETCH ----------------

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchDays();
      fetchTopics();
    }
  }, [selectedCourse]);

useEffect(() => {
  fetchTopics();
}, [selectedDays]);

useEffect(() => {
  fetchSentences();
}, [selectedTopics, selectedDays]);
useEffect(() => {
  const filteredTopics = selectedTopics.filter(topicId => {
    const topic = topics.find(t => t.id === topicId);
    return topic && selectedDays.includes(topic.day_id);
  });

  if (filteredTopics.length !== selectedTopics.length) {
    setSelectedTopics(filteredTopics);
  }
}, [selectedDays, topics]);
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

  let topicIds = selectedTopics;

  if (topicIds.length === 0 && selectedDays.length > 0) {
    topicIds = topics
      .filter(t => selectedDays.includes(t.day_id))
      .map(t => t.id);
  }

  if (topicIds.length === 0) return;

  if (isVocab) {
    const { data } = await supabase
      .from("vocabulary")
      .select("*")
      .in("topic_id", topicIds)
      
.order("topic_id")
.order("order_no");

    if (data) {

  // 🔥 manual sort by selectedTopics order
  const sorted = data.sort((a: any, b: any) => {
    const indexA = selectedTopics.indexOf(a.topic_id);
    const indexB = selectedTopics.indexOf(b.topic_id);

    if (indexA === indexB) {
      return a.order_no - b.order_no;
    }

    return indexA - indexB;
  });

  setSentences(sorted);
  setCurrentIndex(0);
  setShowAll(false);
}
  } else {
    const { data } = await supabase
      .from("sentences")
      .select("*")
      .in("topic_id", topicIds)
      .order("order_no");

    if (data) {

  // 🔥 manual sort by selectedTopics order
  const sorted = data.sort((a: any, b: any) => {
    const indexA = selectedTopics.indexOf(a.topic_id);
    const indexB = selectedTopics.indexOf(b.topic_id);

    if (indexA === indexB) {
      return a.order_no - b.order_no;
    }

    return indexA - indexB;
  });

  setSentences(sorted);
  setCurrentIndex(0);
  setShowAll(false);
}
  }
};
const refreshData = async () => {
  await fetchSentences();
};
  // ---------------- NAV ----------------

  const nextSentence = () => {

    if (isVocab && vocabRef.current) {
      vocabRef.current.next();
      return;
    }

    if (currentIndex < sentences.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSentence = () => {

    if (isVocab && vocabRef.current) {
      vocabRef.current.prev();
      return;
    }

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
  selectedDays={selectedDays}
  selectedTopics={selectedTopics}
  setSelectedCourse={setSelectedCourse}
  setSelectedDays={setSelectedDays}
  setSelectedTopics={setSelectedTopics}
  refreshData={refreshData}
/>

      <div className="flex-1 flex flex-col items-center pt-4 gap-2">

        <div
          className="bg-white border shadow flex flex-col overflow-hidden"
          style={{ width: "25cm", height: "12cm" }}
        >

          {/* 🔥 HEADER HIDE FOR VOCAB + GRAMMAR */}
          {!(isVocab || showGrammar) && (
            <div className="shadow-md bg-white px-4 py-2 text-sm flex justify-between z-10">
              <div>
  Days: {selectedDays.map(id => {
    const d = days.find(x => x.id === id);
    return d?.day_number;
  }).join(", ")}
</div>

<div>
  Topics: {selectedTopics.length > 0
    ? selectedTopics.map(id => {
        const t = topics.find(x => x.id === id);
        return t?.topic_name;
      }).join(", ")
    : "All Topics"}
</div>
            </div>
          )}

          <MainBoard
  isVocab={isVocab}
  isGrammar={isGrammar}
  showGrammar={showGrammar}
  sentences={sentences}
  visible={visible}
  leftCol={leftCol}
  rightCol={rightCol}
  highlightIndex={highlightIndex}
  setHighlightIndex={setHighlightIndex}
  showBoard={showBoard}
  showScore={showScore}
  scrollRef={scrollRef}
  vocabRef={vocabRef}
  randomMode={randomMode}
  showLeft={showLeft}
  showAll={showAll}
  layout={layout}

  // 🔥 NEW
  selectedDays={selectedDays}
  selectedTopics={selectedTopics}
  topics={topics}
  days={days}
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
          showScore={showScore}
          setShowScore={setShowScore}
          isVocab={isVocab}
          randomMode={randomMode}
          setRandomMode={setRandomMode}
          showLeft={showLeft}
          setShowLeft={setShowLeft}
          showGrammar={showGrammar}
          setShowGrammar={setShowGrammar}
          isGrammar={isGrammar}
          layout={layout}
setLayout={setLayout}
        />

      </div>

    </div>
  );
}