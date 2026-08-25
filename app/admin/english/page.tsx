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
  const [topicNavIndex, setTopicNavIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const [showBoard, setShowBoard] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [selectedGrammarTableId, setSelectedGrammarTableId] = useState("");
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);
  const vocabRef = useRef<any>(null);

  const selectedCourseName =
    courses.find(c => c.id === selectedCourse)?.name;

  const isVocab = selectedCourseName === "Vocabulary";
  const isGrammar = selectedCourseName === "Grammar";

  useEffect(() => {
    if (selectedGrammarTableId) {
      setShowGrammar(true);
    }
  }, [selectedGrammarTableId]);
  useEffect(() => {
    if (isVocab && selectedTopics?.length > 0) {
      setShowLeft(true);
    }
  }, [isVocab, selectedTopics]);

  // 🔥 AUTO PANEL CONTROL (IMPORTANT)
  // 🔥 AUTO PANEL CONTROL
// सभी Courses के लिए same layout
useEffect(() => {

  if (!selectedCourse) return;

  // Course select होते ही:
  // Left ON
  // Board OFF
  // Score OFF
  setShowLeft(true);
  setShowBoard(false);
  setShowScore(false);

  // Grammar Table selected है
  if (selectedGrammarTableId) {

    setShowGrammar(true);
    setLayout("vertical");

  } else {

    setShowGrammar(false);
    setLayout("horizontal");

  }

}, [selectedCourse, selectedGrammarTableId]);

  // ---------------- FETCH ----------------

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchDays();
      fetchTopics();
    }
  }, [selectedCourse]);
  useEffect(() => {
  if (!selectedCourse) return;

  setCurrentIndex(-1);
  setShowAll(false);
  setHighlightIndex(null);

  vocabRef.current?.reset();
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

    if (vocabRef.current) {
      vocabRef.current.next();
      return;
    }

    if (currentIndex < sentences.length) {
      setCurrentIndex(prev => prev + 1);
    }

  };

  const prevSentence = () => {

    if (vocabRef.current) {
      vocabRef.current.prev();
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

  };


  const nextTopic = () => {

    if (selectedTopics.length === 0) return;

    if (topicNavIndex < selectedTopics.length - 1) {

      const nextIndex = topicNavIndex + 1;

      setTopicNavIndex(nextIndex);

      setSelectedTopics([
        selectedTopics[nextIndex]
      ]);

    }

  };

  const prevTopic = () => {

    if (topicNavIndex > 0) {

      const prevIndex = topicNavIndex - 1;

      setTopicNavIndex(prevIndex);

      setSelectedTopics([
        selectedTopics[prevIndex]
      ]);

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
        selectedGrammarTableId={selectedGrammarTableId}
        setSelectedGrammarTableId={setSelectedGrammarTableId}
        refreshData={refreshData}
      />

      <div className="flex-1 flex flex-col items-center pt-4 gap-2">

        <div
          className="bg-white border shadow flex flex-col overflow-hidden"
          style={{ width: "25cm", height: "12cm" }}
        >



          <MainBoard
            isVocab={isVocab}
            isGrammar={isGrammar}
            showGrammar={showGrammar}
            prevTopic={prevTopic}
            nextTopic={nextTopic}
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
            currentIndex={currentIndex}
            layout={layout}
            currentTime={currentTime}

            // 🔥 NEW
            selectedDays={selectedDays}
            selectedTopics={selectedTopics}
            topics={topics}
            days={days}
            selectedGrammarTableId={selectedGrammarTableId}
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