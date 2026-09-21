"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

import LeftPanel from "@/app/components/admin/english/LeftPanel";
import MainBoard from "@/app/components/admin/english/MainBoard";
import Controls from "@/app/components/admin/english/Controls";
import MemePanel from "@/app/components/admin/english/MemePanel";
import DemoShowcase from "@/app/components/admin/english/DemoShowcase";

export default function EnglishPage() {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sentences, setSentences] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicNavIndex, setTopicNavIndex] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const [showBoard, setShowBoard] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [switchLanguageMode, setSwitchLanguageMode] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [selectedGrammarTableId, setSelectedGrammarTableId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedReactionMeme, setSelectedReactionMeme] = useState<any>(null);
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
  const demoCourseSelectionRef = useRef(false);

  const handleDemoCourseSelect = (courseId: string) => {
    demoCourseSelectionRef.current = true;
    setSelectedCourse(courseId);
  };

  const selectedCourseName =
    courses.find(c => c.id === selectedCourse)?.name;


  const isGrammar = selectedCourseName === "Grammar";
  const isConversation = selectedCourseName === "Conversation";
  const isImageExplanation =
    selectedCourseName === "Image Explanation";

  const activeTopicId =
    selectedTopics[selectedTopics.length - 1];

  const activeTopic =
    topics.find(
      (t: any) => t.id === activeTopicId
    );

  const conversationDay =
    days.find(
      (d: any) => d.id === activeTopic?.day_id
    ) ||
    days.find((d: any) =>
      selectedDays.includes(d.id)
    );

  const conversationImageUrl =
    conversationDay?.conversation_image_url || "";
  const conversationMobileImageUrl =
    conversationDay?.conversation_mobile_image_url || "";

  console.log("CONVERSATION DEBUG:", {
    selectedDays,
    days,
    conversationImageUrl,
  });
  useEffect(() => {
    if (selectedGrammarTableId) {
      setShowGrammar(true);
    }
  }, [selectedGrammarTableId]);


  // 🔥 AUTO PANEL CONTROL (IMPORTANT)
  // 🔥 AUTO PANEL CONTROL
  // सभी Courses के लिए same layout
  useEffect(() => {

    if (!selectedCourse) return;

    // DemoShowcase से Course select हुआ है
    // तो Left Panel automatically open नहीं होगा.
    if (demoCourseSelectionRef.current) {
      demoCourseSelectionRef.current = false;

      if (selectedGrammarTableId) {
        setShowGrammar(true);
        setLayout("vertical");
      } else {
        setShowGrammar(false);
        setLayout("horizontal");
      }

      return;
    }

    // Normal LeftPanel Course selection
    setShowLeft(true);
    setShowBoard(false);
    setShowScore(false);

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

    // नया Course select होते ही
    // पुराने Course की selections clear करें
    setSelectedDays([]);
    setSelectedTopics([]);
    setTopicNavIndex(0);

    // Vocabulary display reset
    setCurrentIndex(-1);
    setShowAll(false);
    setHighlightIndex(null);

    vocabRef.current?.reset();
  }, [selectedCourse]);

  useEffect(() => {
    fetchTopics();
  }, [selectedDays]);

  useEffect(() => {
    setHighlightIndex(null);
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


  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    if (error) {
      console.error("FETCH COURSES ERROR:", error);
      return;
    }

    setCourses(data || []);
  };

  const fetchDays = async () => {
    let courseId = selectedCourse;


    if (!courseId) {
      setDays([]);
      return;
    }

    const { data, error } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", courseId)
      .order("day_number");

    if (error) {
      console.error("FETCH DAYS ERROR:", error);
      setDays([]);
      return;
    }

    setDays(data || []);
  };

  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .order("order_no");

    if (error) {
      console.error("TOPICS ERROR:", error);
      return;
    }

    if (!data) {
      setTopics([]);
      return;
    }
    if (isConversation) {
      const { data: counts, error: countError } = await supabase
        .from("conversation_questions")
        .select("topic_id")
        .in(
          "topic_id",
          data.map((topic: any) => topic.id)
        );

      if (countError) {
        console.error(
          "CONVERSATION COUNT ERROR:",
          countError
        );
        setTopics(data);
        return;
      }

      const countMap: Record<string, number> = {};

      (counts || []).forEach((row: any) => {
        countMap[row.topic_id] =
          (countMap[row.topic_id] || 0) + 1;
      });

      setTopics(
        data.map((topic: any) => ({
          ...topic,
          sentence_count: countMap[topic.id] || 0,
        }))
      );

      return;
    }
    if (isImageExplanation) {
      const { data: counts, error: countError } = await supabase
        .from("image_explanation_questions")
        .select("topic_id")
        .in(
          "topic_id",
          data.map((topic: any) => topic.id)
        );

      if (countError) {
        console.error(
          "IMAGE EXPLANATION COUNT ERROR:",
          countError
        );
        setTopics(data);
        return;
      }

      const countMap: Record<string, number> = {};

      (counts || []).forEach((row: any) => {
        countMap[row.topic_id] =
          (countMap[row.topic_id] || 0) + 1;
      });

      setTopics(
        data.map((topic: any) => ({
          ...topic,
          sentence_count: countMap[topic.id] || 0,
        }))
      );

      return;
    }

    const { data: vocabularyCounts, error: vocabularyError } =
      await supabase
        .from("topics")
        .select("id, vocabulary(count)")
        .in(
          "id",
          data.map((topic: any) => topic.id)
        );

    if (vocabularyError) {
      console.error(
        "VOCABULARY COUNT ERROR:",
        vocabularyError
      );
      setTopics(data);
      return;
    }

    const countMap: Record<string, any> = {};

    (vocabularyCounts || []).forEach((topic: any) => {
      countMap[topic.id] = topic.vocabulary;
    });

    setTopics(
      data.map((topic: any) => ({
        ...topic,
        vocabulary: countMap[topic.id] || [],
      }))
    );
  };
  const refreshTopicCount = async (topicId: string) => {
    const { data, error } = await supabase
      .from("topics")
      .select("id, vocabulary(count)")
      .eq("id", topicId)
      .single();

    if (error) {
      console.error("TOPIC COUNT REFRESH ERROR:", error);
      return;
    }

    if (!data) return;

    setTopics(prev =>
      prev.map(topic =>
        topic.id === topicId
          ? {
            ...topic,
            vocabulary: data.vocabulary,
          }
          : topic
      )
    );
  };
  const fetchSentences = async () => {
    if (isImageExplanation) {
      const { data: imageExplanationData, error: imageExplanationError } =
        await supabase
          .from("image_explanation_questions")
          .select(
            "id, topic_id, image_id, hindi_question, english_question, hindi_answer, english_answer, order_no"
          )
          .in("topic_id", selectedTopics)
          .order("order_no", { ascending: true });

      if (imageExplanationError) {
        console.error(
          "IMAGE EXPLANATION ERROR:",
          imageExplanationError.message
        );
      }

      setSentences(imageExplanationData || []);
      return;
    }

    if (isConversation) {
      if (selectedTopics.length === 0) {
        setSentences([]);
        return;
      }

      const { data: questions, error } = await supabase
        .from("conversation_questions")
        .select(`
          id,
          topic_id,
          question_text,
          question_english,
          question_hindi_2,
          question_english_2,
          answer_hindi_3,
          answer_english_3,
          answer_hindi_4,
          answer_english_4,
          order_no
        `)
        .in("topic_id", selectedTopics)
        .order("topic_id")
        .order("order_no");

      if (error) {
        console.error("CONVERSATION QUESTIONS ERROR:", error);
        setSentences([]);
        return;
      }

      const sorted = (questions || []).sort((a: any, b: any) => {
        const indexA = selectedTopics.indexOf(a.topic_id);
        const indexB = selectedTopics.indexOf(b.topic_id);

        if (indexA === indexB) {
          return (a.order_no ?? 0) - (b.order_no ?? 0);
        }

        return indexA - indexB;
      });

      setSentences(sorted);
      return;
    }

    const topicIds = selectedTopics;

    if (topicIds.length === 0) {
      setSentences([]);
      return;
    }

    const { data } = await supabase
      .from("vocabulary")
      .select("*")
      .in("topic_id", topicIds)
      .order("topic_id")
      .order("order_no");

    if (data) {
      const sorted = data.sort((a: any, b: any) => {
        const indexA = selectedTopics.indexOf(a.topic_id);
        const indexB = selectedTopics.indexOf(b.topic_id);

        if (indexA === indexB) {
          return a.order_no - b.order_no;
        }

        return indexA - indexB;
      });

      setSentences(sorted);
    }
  };

  const refreshData = async () => {
    await fetchTopics();
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

    if (selectedDays.length === 0) return;

    const dayTopics = topics
      .filter(
        (topic: any) =>
          selectedDays.includes(topic.day_id)
      )
      .sort(
        (a: any, b: any) =>
          (a.order_no ?? 0) - (b.order_no ?? 0)
      );

    if (dayTopics.length === 0) return;

    // अगर एक ही Topic selected है,
    // तो उसी के बाद वाला Topic लें
    if (selectedTopics.length === 1) {

      const currentIndex =
        dayTopics.findIndex(
          (topic: any) =>
            topic.id === selectedTopics[0]
        );

      if (currentIndex < 0) return;

      const nextIndex = currentIndex + 1;

      if (nextIndex >= dayTopics.length) return;

      const nextTopicId =
        dayTopics[nextIndex].id;

      setSelectedTopics([nextTopicId]);

      setCurrentIndex(0);
      setShowAll(false);
      setHighlightIndex(null);

      return;
    }

    // अगर कई Topics selected हैं
    // (जैसे Day checkbox से सभी Topics)
    // तो पहले Topic को current मानकर अगला दिखाएँ
    const firstSelectedIndex =
      dayTopics.findIndex(
        (topic: any) =>
          selectedTopics.includes(topic.id)
      );

    if (firstSelectedIndex < 0) return;

    const nextIndex =
      firstSelectedIndex + 1;

    if (nextIndex >= dayTopics.length) return;

    const nextTopicId =
      dayTopics[nextIndex].id;

    setSelectedTopics([nextTopicId]);

    setCurrentIndex(0);
    setShowAll(false);
    setHighlightIndex(null);
  };

  const prevTopic = () => {

    if (selectedDays.length === 0) return;

    const dayTopics = topics
      .filter((topic: any) =>
        selectedDays.includes(topic.day_id)
      )
      .sort(
        (a: any, b: any) =>
          (a.order_no ?? 0) - (b.order_no ?? 0)
      );

    if (dayTopics.length === 0) return;

    const currentTopicId = selectedTopics[0];

    const currentIndex = dayTopics.findIndex(
      (topic: any) =>
        topic.id === currentTopicId
    );

    if (currentIndex <= 0) return;

    const previousIndex =
      currentIndex - 1;

    const previousTopicId =
      dayTopics[previousIndex].id;

    setTopicNavIndex(previousIndex);

    setSelectedTopics([
      previousTopicId
    ]);

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
        setSelectedCourse={setSelectedCourse}
        selectedDays={selectedDays}
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}

        setSelectedDays={setSelectedDays}
        selectedGrammarTableId={selectedGrammarTableId}
        setSelectedGrammarTableId={setSelectedGrammarTableId}
        selectedImageId={selectedImageId}
        setSelectedImageId={setSelectedImageId}
        selectedReactionMeme={selectedReactionMeme}
        refreshData={refreshData}

      />
      <div className="flex-1 flex items-start pl-3 pt-1 gap-3 min-w-0 overflow-hidden">

        <div className="flex flex-col gap-2 shrink-0">

          <div
            className="bg-white border shadow flex flex-col overflow-hidden"
            style={{ width: "25cm", height: "12cm" }}
          >

            <MainBoard
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
              setShowAll={setShowAll}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              layout={layout}
              currentTime={currentTime}

              // 🔥 NEW
              selectedDays={selectedDays}
              selectedTopics={selectedTopics}
              topics={topics}
              days={days}
              selectedGrammarTableId={selectedGrammarTableId}
              setSelectedGrammarTableId={setSelectedGrammarTableId}
              selectedImageId={selectedImageId}
              selectedReactionMeme={selectedReactionMeme}
              showImages={showImages}
              setShowImages={setShowImages}
              isConversation={isConversation}
              isImageExplanation={isImageExplanation}
              conversationImageUrl={conversationImageUrl}
              conversationMobileImageUrl={conversationMobileImageUrl}
              setSelectedImageId={setSelectedImageId}
            />
            {!showLeft &&
              !showBoard &&
              !showGrammar &&
              !showImages &&
              !showScore && (
                <DemoShowcase
                  courses={courses}
                  onDemoCourseSelect={handleDemoCourseSelect}
                  days={days}
                  topics={topics}
                  selectedCourse={selectedCourse}
                  setSelectedCourse={setSelectedCourse}
                  selectedDays={selectedDays}
                  setSelectedDays={setSelectedDays}
                  selectedTopics={selectedTopics}
                  setSelectedTopics={setSelectedTopics}
                  selectedGrammarTableId={selectedGrammarTableId}
                  setSelectedGrammarTableId={
                    setSelectedGrammarTableId
                  }
                  setSelectedImageId={setSelectedImageId}
                  setShowImages={setShowImages}
                  setShowGrammar={setShowGrammar}
                />
              )}
          </div>

          <Controls
            prevSentence={prevSentence}
            nextSentence={nextSentence}
            onSwitch={() => {
              vocabRef.current?.switchLanguage();
              setSwitchLanguageMode(prev => !prev);
            }}
            switchLanguageMode={switchLanguageMode}
            currentIndex={currentIndex}
            sentences={sentences}
            isConversation={isConversation}
            isImageExplanation={isImageExplanation}
            showAll={showAll}
            toggleShowAll={toggleShowAll}
            setShowAll={setShowAll}
            setCurrentIndex={setCurrentIndex}
            showBoard={showBoard}
            setShowBoard={setShowBoard}
            showScore={showScore}
            setShowScore={setShowScore}
            randomMode={randomMode}
            setRandomMode={setRandomMode}
            showLeft={showLeft}
            setShowLeft={setShowLeft}
            showGrammar={showGrammar}
            setShowGrammar={setShowGrammar}
            isGrammar={isGrammar}
            layout={layout}
            setLayout={setLayout}
            showImages={showImages}
            setShowImages={setShowImages}
          />

        </div>

        <MemePanel
          onSelectMeme={(meme: any) => {
            setSelectedReactionMeme((prev: any) =>
              prev?.id === meme.id ? null : meme
            );
          }}
        />

      </div>
    </div>
  );
}