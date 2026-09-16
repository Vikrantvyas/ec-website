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
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

export default function EnglishSentenceMaster({
  initialTopicId = "",
  initialDayId = "",
  initialCourseId = ""
}: any) {

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
  const [clipboardSentences, setClipboardSentences] = useState<any[]>([]);
  const [clipboardMode, setClipboardMode] = useState<"copy" | "cut" | null>(null);

  const [selectedSentenceIds, setSelectedSentenceIds] = useState<string[]>([]);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => {
    if (initialTopicId) {
      setSelectedTopic(initialTopicId);
    }
  }, [initialTopicId]);
  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourse(initialCourseId);
    }
  }, [initialCourseId]);

  useEffect(() => {
    if (initialDayId) {
      setSelectedDay(initialDayId);
    }
  }, [initialDayId]);
  useEffect(() => { if (selectedCourse) fetchDays(); }, [selectedCourse]);
  useEffect(() => { if (selectedDay) fetchTopics(); }, [selectedDay]);
  useEffect(() => {
  if (selectedTopic && selectedCourse && courses.length > 0) {
    fetchSentences();
  }
}, [selectedTopic, selectedCourse, courses]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    const allCourses = data || [];

setCourses(allCourses);

// पुराने Image Explanation ID को actual database UUID में बदलें
if (initialCourseId === "image-explanation") {
  const imageExplanationCourse = allCourses.find(
    (c: any) => c.name === "Image Explanation"
  );

  if (imageExplanationCourse) {
    setSelectedCourse(imageExplanationCourse.id);
  }
}
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
    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    // Conversation
    // Conversation + Image Explanation
    if (
      selectedCourseName === "Conversation" ||
      selectedCourseName === "Image Explanation"
    ) {
      if (selectedCourseName === "Image Explanation") {
        const { data, error } = await supabase
          .from("image_explanation_questions")
          .select(`
      id,
      topic_id,
      hindi_question,
      english_question,
      hindi_answer,
      english_answer,
      order_no
    `)
          .eq("topic_id", selectedTopic)
          .order("order_no");

        if (error) {
          console.error("Image Explanation fetch failed:", error);
          return;
        }

        if (data) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            sentence: [
              d.hindi_question,
              d.english_question,
              d.hindi_answer,
              d.english_answer,
            ]
              .filter(Boolean)
              .join(" - "),
            order_no: d.order_no,
          }));

          setSentences(formatted);
        }

        return;
      }
      const { data, error } = await supabase
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
        .eq("topic_id", selectedTopic)
        .order("order_no");

      if (error) {
        console.error("Conversation fetch failed:", error);
        return;
      }

      if (data) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          sentence: [
            d.question_text,
            d.question_english,
            d.question_hindi_2,
            d.question_english_2,
            d.answer_hindi_3,
            d.answer_english_3,
            d.answer_hindi_4,
            d.answer_english_4,
          ]
            .filter(Boolean)
            .join(" - "),
          order_no: d.order_no,
        }));

        setSentences(formatted);
      }

      return;
    }

    // Existing courses
    const { data } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (data) {
      const formatted = data.map((d: any) => ({
        id: d.id,
        hindi: d.hindi,
        english: d.english,
        sentence: `${d.hindi} - ${d.english}`,
        order_no: d.order_no,
      }));

      setSentences(formatted);
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
    if (!text || !selectedTopic) return;

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const maxOrder = sentences.length > 0
      ? Math.max(...sentences.map(s => s.order_no || 0))
      : 0;

    // Conversation
    if (
      selectedCourseName === "Conversation" ||
      selectedCourseName === "Image Explanation"
    ) {
      if (selectedCourseName === "Image Explanation") {
        const parts = text
          .split("-")
          .map((p: string) => p.trim())
          .filter((p: string) => p);

        if (parts.length !== 4) {
          alert(
            "Image Explanation data में कुल 4 parts होने चाहिए, और उन्हें - से अलग करें."
          );
          return;
        }

        const { error: questionError } = await supabase
          .from("image_explanation_questions")
          .insert([
            {
              topic_id: selectedTopic,
              hindi_question: parts[0],
              english_question: parts[1],
              hindi_answer: parts[2],
              english_answer: parts[3],
              order_no: Number(orderNo || maxOrder + 1),
            },
          ]);

        if (questionError) {
          alert("Image Explanation save failed: " + questionError.message);
          return;
        }

        setText("");
        setOrderNo("");
        fetchSentences();
        return;
      }
      const parts = text
        .split("-")
        .map((p: string) => p.trim())
        .filter((p: string) => p);

      if (parts.length !== 8) {
        alert(
          "Conversation data में कुल 8 parts होने चाहिए, और उन्हें - से अलग करें."
        );
        return;
      }

      const { error: questionError } = await supabase
        .from("conversation_questions")
        .insert([
          {
            topic_id: selectedTopic,
            question_text: parts[0],
            question_english: parts[1],
            question_hindi_2: parts[2],
            question_english_2: parts[3],
            answer_hindi_3: parts[4],
            answer_english_3: parts[5],
            answer_hindi_4: parts[6],
            answer_english_4: parts[7],
            order_no: Number(orderNo || maxOrder + 1),
          },
        ]);

      if (questionError) {
        alert("Conversation save failed: " + questionError.message);
        return;
      }

      setText("");
      setOrderNo("");
      fetchSentences();
      return;
    }

    // Existing courses
    const parts = text.split("-");

    await supabase.from("vocabulary").insert([{
      topic_id: selectedTopic,
      hindi: parts[0]?.trim() || "",
      english: parts.slice(1).join("-").trim() || "",
      order_no: Number(orderNo || maxOrder + 1)
    }]);

    setText("");
    setOrderNo("");
    fetchSentences();
  };

  const addBulk = async () => {
    if (!bulkText || !selectedTopic) return;

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const lines = bulkText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l);

    const maxOrder = sentences.length > 0
      ? Math.max(...sentences.map(s => s.order_no || 0))
      : 0;

    // Conversation
    if (
      selectedCourseName === "Conversation" ||
      selectedCourseName === "Image Explanation"
    ) {
      if (selectedCourseName === "Image Explanation") {

        

        const questionsData = [];

        for (let i = 0; i < lines.length; i++) {

          const parts = lines[i]
            .split("-")
            .map((p: string) => p.trim())
            .filter((p: string) => p);

          if (parts.length !== 4) {
            alert(
              `Line ${i + 1} में 4 parts होने चाहिए:\nHindi Question - English Question - Hindi Answer - English Answer`
            );
            return;
          }

          questionsData.push({
            topic_id: selectedTopic,
            hindi_question: parts[0],
            english_question: parts[1],
            hindi_answer: parts[2],
            english_answer: parts[3],
            order_no: maxOrder + i + 1,
          });
        }

        const { error: questionError } = await supabase
          .from("image_explanation_questions")
          .insert(questionsData);

        if (questionError) {
          alert(
            "Image Explanation Bulk Save failed: " +
            questionError.message
          );
          return;
        }

        setBulkText("");
        fetchSentences();
        return;
      }
      for (let i = 0; i < lines.length; i++) {

        const parts = lines[i]
          .split("-")
          .map((p: string) => p.trim())
          .filter((p: string) => p);

        if (parts.length !== 8) {
          console.error(
            `Conversation line ${i + 1} में 8 parts नहीं हैं.`
          );
          continue;
        }

        const { error: questionError } = await supabase
          .from("conversation_questions")
          .insert([
            {
              topic_id: selectedTopic,
              question_text: parts[0],
              question_english: parts[1],
              question_hindi_2: parts[2],
              question_english_2: parts[3],
              answer_hindi_3: parts[4],
              answer_english_3: parts[5],
              answer_hindi_4: parts[6],
              answer_english_4: parts[7],
              order_no: maxOrder + i + 1,
            },
          ]);

        if (questionError) {
          console.error(
            "Conversation save failed:",
            questionError
          );
        }
      }

      setBulkText("");
      fetchSentences();
      return;
    }

    // Existing courses
    const data = lines.map((line, i) => {
      const parts = line.split("-");

      return {
        topic_id: selectedTopic,
        hindi: parts[0]?.trim() || "",
        english: parts.slice(1).join("-").trim() || "",
        order_no: maxOrder + i + 1,
      };
    });

    await supabase.from("vocabulary").insert(data);

    setBulkText("");
    fetchSentences();
  };
  const copySelectedSentences = () => {
    const selected = sentences.filter(s =>
      selectedSentenceIds.includes(s.id)
    );

    if (selected.length === 0) return;

    setClipboardSentences(selected);
    setClipboardMode("copy");
  };

  const cutSelectedSentences = () => {
    const selected = sentences.filter(s =>
      selectedSentenceIds.includes(s.id)
    );

    if (selected.length === 0) return;

    setClipboardSentences(selected);
    setClipboardMode("cut");
  };
  const toggleSentenceSelection = (id: string) => {
    setSelectedSentenceIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectAllSentences = () => {
    setSelectedSentenceIds(sentences.map(s => s.id));
  };

  const clearSentenceSelection = () => {
    setSelectedSentenceIds([]);
  };
  const pasteSentences = async () => {
    if (clipboardSentences.length === 0 || !selectedTopic) return;

    let insertedIds: string[] = [];

    try {
      const maxOrder = sentences.length > 0
        ? Math.max(...sentences.map(s => s.order_no || 0))
        : 0;
      const selectedCourseName =
        courses.find((c: any) => c.id === selectedCourse)?.name;

      if (selectedCourseName === "Image Explanation") {
        const data = clipboardSentences.map((s, i) => {
          const parts = s.sentence
            .split("-")
            .map((p: string) => p.trim())
            .filter((p: string) => p);

          return {
            topic_id: selectedTopic,
            hindi_question: parts[0] || "",
            english_question: parts[1] || "",
            hindi_answer: parts[2] || "",
            english_answer: parts[3] || "",
            order_no: maxOrder + i + 1
          };
        });

        const { data: insertedData, error: insertError } = await supabase
          .from("image_explanation_questions")
          .insert(data)
          .select("id");

        if (insertError) throw insertError;

        insertedIds = (insertedData || []).map((row: any) => row.id);

        if (clipboardMode === "cut") {
          const originalIds = clipboardSentences.map((s) => s.id);

          const { error: deleteError } = await supabase
            .from("image_explanation_questions")
            .delete()
            .in("id", originalIds);

          if (deleteError) throw deleteError;
        }

        setClipboardSentences([]);
        setClipboardMode(null);
        setSelectedSentenceIds([]);

        fetchSentences();
        return;
      }
      const data = clipboardSentences.map((s, i) => ({
        topic_id: selectedTopic,
        hindi: s.hindi,
        english: s.english,
        order_no: maxOrder + i + 1
      }));

      // 1. Insert all selected sentences
      const { data: insertedData, error: insertError } = await supabase
        .from("vocabulary")
        .insert(data)
        .select("id");

      if (insertError) throw insertError;

      insertedIds = (insertedData || []).map((row: any) => row.id);

      // 2. If CUT, delete original sentences
      if (clipboardMode === "cut") {
        const originalIds = clipboardSentences.map(s => s.id);

        const { error: deleteError } = await supabase
          .from("vocabulary")
          .delete()
          .in("id", originalIds);

        if (deleteError) throw deleteError;
      }

      // 3. Clear clipboard and selection
      setClipboardSentences([]);
      setClipboardMode(null);
      setSelectedSentenceIds([]);

      fetchSentences();

    } catch (error) {

      console.error("Paste Sentences failed:", error);

      // Roll back newly inserted sentences if something failed
      if (insertedIds.length > 0) {
        await supabase
          .from("vocabulary")
          .delete()
          .in("id", insertedIds);
      }

      alert(
        "Paste failed. Original Sentences have NOT been deleted."
      );
    }
  };
  const deleteSelectedSentences = async () => {
    if (selectedSentenceIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedSentenceIds.length} selected sentences?`
    );

    if (!confirmed) return;

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const tableName =
      selectedCourseName === "Image Explanation"
        ? "image_explanation_questions"
        : selectedCourseName === "Conversation"
          ? "conversation_questions"
          : "vocabulary";

    const { error } = await supabase
      .from(tableName)
      .delete()
      .in("id", selectedSentenceIds);

    if (error) {
      console.error("Delete Selected Sentences failed:", error);
      alert("Delete failed.");
      return;
    }

    setSelectedSentenceIds([]);
    fetchSentences();
  };
  const deleteSentence = async (id: string) => {

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const tableName =
      selectedCourseName === "Image Explanation"
        ? "image_explanation_questions"
        : selectedCourseName === "Conversation"
          ? "conversation_questions"
          : "vocabulary";

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    fetchSentences();
  };
  const startEdit = (s: any) => {
    setEditId(s.id);
    setEditText(s.sentence);
    setEditOrder(String(s.order_no));
  };
  const saveEdit = async () => {
    if (!editId) return;

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const parts = editText
      .split("-")
      .map((p: string) => p.trim())
      .filter((p: string) => p);

    if (selectedCourseName === "Image Explanation") {
      if (parts.length !== 4) {
        alert(
          "Image Explanation data में कुल 4 parts होने चाहिए, और उन्हें - से अलग करें."
        );
        return;
      }

      const { error } = await supabase
        .from("image_explanation_questions")
        .update({
          hindi_question: parts[0],
          english_question: parts[1],
          hindi_answer: parts[2],
          english_answer: parts[3],
          order_no: Number(editOrder),
        })
        .eq("id", editId);

      if (error) {
        alert("Image Explanation update failed: " + error.message);
        return;
      }
    } else if (selectedCourseName === "Conversation") {
      if (parts.length !== 8) {
        alert(
          "Conversation data में कुल 8 parts होने चाहिए, और उन्हें - से अलग करें."
        );
        return;
      }

      const { error } = await supabase
        .from("conversation_questions")
        .update({
          question_text: parts[0],
          question_english: parts[1],
          question_hindi_2: parts[2],
          question_english_2: parts[3],
          answer_hindi_3: parts[4],
          answer_english_3: parts[5],
          answer_hindi_4: parts[6],
          answer_english_4: parts[7],
          order_no: Number(editOrder),
        })
        .eq("id", editId);

      if (error) {
        alert("Conversation update failed: " + error.message);
        return;
      }
    } else {
      await supabase
        .from("vocabulary")
        .update({
          hindi: parts[0] || "",
          english: parts.slice(1).join(" ").trim() || "",
          order_no: Number(editOrder)
        })
        .eq("id", editId);
    }

    setEditId(null);
    fetchSentences();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sentences.findIndex(s => s.id === active.id);
    const newIndex = sentences.findIndex(s => s.id === over.id);

    setSentences(arrayMove(sentences, oldIndex, newIndex));
  };

  const saveOrder = async () => {

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const tableName =
      selectedCourseName === "Image Explanation"
        ? "image_explanation_questions"
        : selectedCourseName === "Conversation"
          ? "conversation_questions"
          : "vocabulary";

    for (let i = 0; i < sentences.length; i++) {

      await supabase
        .from(tableName)
        .update({ order_no: i + 1 })
        .eq("id", sentences[i].id);

    }

    fetchSentences();
  };
  return (

    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex flex-wrap gap-2 items-center">

        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button onClick={() => setShowCourseInput(!showCourseInput)}>+</button>
        {showCourseInput && (
          <>
            <input value={newCourse} onChange={(e) => setNewCourse(e.target.value)} className="border px-2 py-1 rounded" />
            <button onClick={addCourse}>Save</button>
          </>
        )}

        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Day</option>
          {days.map(d => <option key={d.id} value={d.id}>
            Day {d.day_number}{d.title ? ` · ${d.title}` : ""}
          </option>)}
        </select>

        <button onClick={() => setShowDayInput(!showDayInput)}>+</button>
        {showDayInput && (
          <>
            <input value={newDay} onChange={(e) => setNewDay(e.target.value)} className="border px-2 py-1 rounded w-20" />
            <button onClick={addDay}>Save</button>
          </>
        )}

        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Topic</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.topic_name}</option>)}
        </select>

        <button onClick={() => setShowTopicInput(!showTopicInput)}>+</button>
        {showTopicInput && (
          <>
            <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="border px-2 py-1 rounded" />
            <button onClick={addTopic}>Save</button>
          </>
        )}

        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Sentence"
          className="border px-2 py-1 rounded flex-1 min-w-[300px]" />

        <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)}
          placeholder="Order" className="border px-2 py-1 rounded w-20" />

        <button onClick={addSentence} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>

        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showBulk} onChange={() => setShowBulk(!showBulk)} />
          Bulk
        </label>
        <button
          onClick={selectAllSentences}
          className="border px-3 py-1 rounded"
        >
          Select All
        </button>

        <button
          onClick={clearSentenceSelection}
          className="border px-3 py-1 rounded"
        >
          Clear
        </button>



        <button
          onClick={saveOrder}
          className="bg-purple-600 text-white px-3 py-1 rounded"
        >
          Save Order
        </button>
        {clipboardSentences.length > 0 && (
          <button
            onClick={pasteSentences}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Paste {clipboardMode === "cut" ? "Cut" : "Copied"} {clipboardSentences.length} Sentences
          </button>
        )}
      </div>

      {/* BULK */}
      {showBulk && (
        <div className="p-3 border-b">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
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
          <SortableContext items={sentences.map(s => s.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {sentences.map(s => (
                <SortableItem key={s.id} s={s}>
                  {({ attributes, listeners }: any) => (
                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      {editId === s.id ? (
                        <>
                          <input value={editOrder} onChange={(e) => setEditOrder(e.target.value)} className="w-16 border px-2 py-1 rounded" />
                          <input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 border px-2 py-1 rounded" />
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            checked={selectedSentenceIds.includes(s.id)}
                            onChange={() => toggleSentenceSelection(s.id)}
                          />

                          <div className="cursor-move" {...attributes} {...listeners}>
                            ☰
                          </div>

                          <div className="w-10">{s.order_no}</div>

                          <div className="flex-1">{s.sentence}</div>

                          <button
                            onClick={copySelectedSentences}
                            disabled={!selectedSentenceIds.includes(s.id)}
                            className="disabled:opacity-40"
                          >
                            Copy Selected
                          </button>

                          <button
                            onClick={cutSelectedSentences}
                            disabled={!selectedSentenceIds.includes(s.id)}
                            className="disabled:opacity-40"
                          >
                            Cut Selected
                          </button>

                          <button onClick={() => startEdit(s)}>
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              if (selectedSentenceIds.includes(s.id)) {
                                deleteSelectedSentences();
                              } else {
                                deleteSentence(s.id);
                              }
                            }}
                          >
                            Delete
                          </button>
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