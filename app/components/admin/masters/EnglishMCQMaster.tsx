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
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";


function SortableItem({ q, children }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: q.id });

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


export default function EnglishMCQMaster({
  initialTopicId = "",
  initialDayId = "",
  initialCourseId = "",
}: any) {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [text, setText] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editOrder, setEditOrder] = useState("");

  const [clipboardQuestions, setClipboardQuestions] = useState<any[]>([]);
  const [clipboardMode, setClipboardMode] =
    useState<"copy" | "cut" | null>(null);

  const [selectedQuestionIds, setSelectedQuestionIds] =
    useState<string[]>([]);


  useEffect(() => {
    fetchCourses();
  }, []);


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


  useEffect(() => {
    if (initialTopicId) {
      setSelectedTopic(initialTopicId);
    }
  }, [initialTopicId]);


  useEffect(() => {
    if (selectedCourse) {
      fetchDays();
    } else {
      setDays([]);
      setSelectedDay("");
    }
  }, [selectedCourse]);


  useEffect(() => {
    if (selectedDay) {
      fetchTopics();
    } else {
      setTopics([]);
      setSelectedTopic("");
    }
  }, [selectedDay]);


  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedTopic]);


  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    if (error) {
      console.error("Fetch Courses failed:", error);
      return;
    }

    const allCourses = data || [];

    setCourses(allCourses);

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
    const { data, error } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("day_number");

    if (error) {
      console.error("Fetch Days failed:", error);
      return;
    }

    setDays(data || []);
  };


  const fetchTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("day_id", selectedDay)
      .order("order_no");

    if (error) {
      console.error("Fetch Topics failed:", error);
      return;
    }

    setTopics(data || []);
  };


  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("mcq_questions")
      .select("*")
      .eq("topic_id", selectedTopic)
      .order("order_no");

    if (error) {
      console.error("Fetch MCQs failed:", error);
      return;
    }

    const formatted = (data || []).map((q: any) => ({
      ...q,
      text: [
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        getCorrectAnswerText(q),
      ].join(" - "),
    }));

    setQuestions(formatted);
  };


  const getCorrectAnswerText = (q: any) => {
    if (q.correct_option === "A") return q.option_a;
    if (q.correct_option === "B") return q.option_b;
    if (q.correct_option === "C") return q.option_c;
    if (q.correct_option === "D") return q.option_d;

    return "";
  };


  const getCorrectOption = (
    optionA: string,
    optionB: string,
    optionC: string,
    optionD: string,
    correctAnswer: string
  ) => {
    if (correctAnswer === optionA) return "A";
    if (correctAnswer === optionB) return "B";
    if (correctAnswer === optionC) return "C";
    if (correctAnswer === optionD) return "D";

    return "";
  };


  const validateParts = (textValue: string) => {
    return textValue
      .split("-")
      .map((p: string) => p.trim())
      .filter((p: string) => p);
  };


  const addQuestion = async () => {
    if (!text || !selectedTopic) return;

    const parts = validateParts(text);

    if (parts.length !== 6) {
      alert(
        "MCQ में कुल 6 parts होने चाहिए:\nQuestion - Option 1 - Option 2 - Option 3 - Option 4 - Correct Answer"
      );
      return;
    }

    const [
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    ] = parts;

    const correctOption = getCorrectOption(
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer
    );

    if (!correctOption) {
      alert(
        "Correct Answer, दिए गए चारों options में से किसी एक के बिल्कुल समान होना चाहिए।"
      );
      return;
    }

    const maxOrder =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.order_no || 0))
        : 0;

    const { error } = await supabase
      .from("mcq_questions")
      .insert([
        {
          topic_id: selectedTopic,
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_option: correctOption,
          order_no: Number(orderNo || maxOrder + 1),
          status: true,
        },
      ]);

    if (error) {
      alert("MCQ save failed: " + error.message);
      return;
    }

    setText("");
    setOrderNo("");

    fetchQuestions();
  };


  const addBulk = async () => {
    if (!bulkText || !selectedTopic) return;

    const lines = bulkText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l);

    const maxOrder =
      questions.length > 0
        ? Math.max(...questions.map((q) => q.order_no || 0))
        : 0;

    const questionsData: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = validateParts(lines[i]);

      if (parts.length !== 6) {
        alert(
          `Line ${i + 1} में 6 parts होने चाहिए:\nQuestion - Option 1 - Option 2 - Option 3 - Option 4 - Correct Answer`
        );
        return;
      }

      const [
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
      ] = parts;

      const correctOption = getCorrectOption(
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer
      );

      if (!correctOption) {
        alert(
          `Line ${i + 1} में Correct Answer चारों options में से किसी एक से match नहीं कर रहा है।`
        );
        return;
      }

      questionsData.push({
        topic_id: selectedTopic,
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        order_no: maxOrder + i + 1,
        status: true,
      });
    }

    const { error } = await supabase
      .from("mcq_questions")
      .insert(questionsData);

    if (error) {
      alert("MCQ Bulk Save failed: " + error.message);
      return;
    }

    setBulkText("");
    fetchQuestions();
  };


  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };


  const selectAllQuestions = () => {
    setSelectedQuestionIds(questions.map((q) => q.id));
  };


  const clearQuestionSelection = () => {
    setSelectedQuestionIds([]);
  };


  const copySelectedQuestions = () => {
    const selected = questions.filter((q) =>
      selectedQuestionIds.includes(q.id)
    );

    if (selected.length === 0) return;

    setClipboardQuestions(selected);
    setClipboardMode("copy");
  };


  const cutSelectedQuestions = () => {
    const selected = questions.filter((q) =>
      selectedQuestionIds.includes(q.id)
    );

    if (selected.length === 0) return;

    setClipboardQuestions(selected);
    setClipboardMode("cut");
  };


  const pasteQuestions = async () => {
    if (clipboardQuestions.length === 0 || !selectedTopic) {
      return;
    }

    let insertedIds: string[] = [];

    try {
      const maxOrder =
        questions.length > 0
          ? Math.max(...questions.map((q) => q.order_no || 0))
          : 0;

      const data = clipboardQuestions.map((q, i) => ({
        topic_id: selectedTopic,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation || null,
        order_no: maxOrder + i + 1,
        status: q.status ?? true,
      }));

      const { data: insertedData, error: insertError } =
        await supabase
          .from("mcq_questions")
          .insert(data)
          .select("id");

      if (insertError) throw insertError;

      insertedIds = (insertedData || []).map(
        (row: any) => row.id
      );

      if (clipboardMode === "cut") {
        const originalIds = clipboardQuestions.map(
          (q) => q.id
        );

        const { error: deleteError } = await supabase
          .from("mcq_questions")
          .delete()
          .in("id", originalIds);

        if (deleteError) throw deleteError;
      }

      setClipboardQuestions([]);
      setClipboardMode(null);
      setSelectedQuestionIds([]);

      fetchQuestions();

    } catch (error: any) {
      console.error("Paste MCQs failed:", error);

      if (insertedIds.length > 0) {
        await supabase
          .from("mcq_questions")
          .delete()
          .in("id", insertedIds);
      }

      alert(
        "Paste failed. Original MCQs have NOT been deleted."
      );
    }
  };


  const deleteSelectedQuestions = async () => {
    if (selectedQuestionIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedQuestionIds.length} selected MCQs?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("mcq_questions")
      .delete()
      .in("id", selectedQuestionIds);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    setSelectedQuestionIds([]);
    fetchQuestions();
  };


  const deleteQuestion = async (id: string) => {
    const { error } = await supabase
      .from("mcq_questions")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    fetchQuestions();
  };


  const startEdit = (q: any) => {
    setEditId(q.id);

    setEditText(
      [
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        getCorrectAnswerText(q),
      ].join(" - ")
    );

    setEditOrder(String(q.order_no));
  };


  const saveEdit = async () => {
    if (!editId) return;

    const parts = validateParts(editText);

    if (parts.length !== 6) {
      alert(
        "MCQ में कुल 6 parts होने चाहिए:\nQuestion - Option 1 - Option 2 - Option 3 - Option 4 - Correct Answer"
      );
      return;
    }

    const [
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    ] = parts;

    const correctOption = getCorrectOption(
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer
    );

    if (!correctOption) {
      alert(
        "Correct Answer चारों options में से किसी एक से match नहीं कर रहा है।"
      );
      return;
    }

    const { error } = await supabase
      .from("mcq_questions")
      .update({
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_option: correctOption,
        order_no: Number(editOrder),
      })
      .eq("id", editId);

    if (error) {
      alert("MCQ update failed: " + error.message);
      return;
    }

    setEditId(null);
    setEditText("");
    setEditOrder("");

    fetchQuestions();
  };


  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(
      (q) => q.id === active.id
    );

    const newIndex = questions.findIndex(
      (q) => q.id === over.id
    );

    setQuestions(
      arrayMove(questions, oldIndex, newIndex)
    );
  };


  const saveOrder = async () => {
    for (let i = 0; i < questions.length; i++) {
      await supabase
        .from("mcq_questions")
        .update({ order_no: i + 1 })
        .eq("id", questions[i].id);
    }

    fetchQuestions();
  };


  return (
    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex flex-wrap gap-2 items-center">

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Course</option>

          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>


        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Day</option>

          {days.map((d) => (
            <option key={d.id} value={d.id}>
              Day {d.day_number}
              {d.title ? ` · ${d.title}` : ""}
            </option>
          ))}
        </select>


        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Topic</option>

          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.topic_name}
            </option>
          ))}
        </select>


        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Question - Option 1 - Option 2 - Option 3 - Option 4 - Correct Answer"
          className="border px-2 py-1 rounded flex-1 min-w-[400px]"
        />


        <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          placeholder="Order"
          className="border px-2 py-1 rounded w-20"
        />


        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>


        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showBulk}
            onChange={() => setShowBulk(!showBulk)}
          />
          Bulk
        </label>


        <button
          onClick={selectAllQuestions}
          className="border px-3 py-1 rounded"
        >
          Select All
        </button>


        <button
          onClick={clearQuestionSelection}
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


        {clipboardQuestions.length > 0 && (
          <button
            onClick={pasteQuestions}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Paste{" "}
            {clipboardMode === "cut"
              ? "Cut"
              : "Copied"}{" "}
            {clipboardQuestions.length} MCQs
          </button>
        )}

      </div>


      {/* BULK */}
      {showBulk && (
        <div className="p-3 border-b">

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="border w-full h-40 p-2 rounded"
            placeholder={
              "One MCQ per line:\nQuestion - First Option - Second Option - Third Option - Fourth Option - Correct Answer"
            }
          />

          <button
            onClick={addBulk}
            className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
          >
            Add Bulk
          </button>

        </div>
      )}


      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-180px)]">

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >

            <div className="space-y-2">

              {questions.map((q) => (

                <SortableItem key={q.id} q={q}>

                  {({
                    attributes,
                    listeners,
                  }: any) => (

                    <div className="border p-2 rounded bg-white">

                      {editId === q.id ? (

                        <div className="flex items-center gap-2">

                          <input
                            value={editOrder}
                            onChange={(e) =>
                              setEditOrder(e.target.value)
                            }
                            className="w-16 border px-2 py-1 rounded"
                          />

                          <input
                            value={editText}
                            onChange={(e) =>
                              setEditText(e.target.value)
                            }
                            className="flex-1 border px-2 py-1 rounded"
                          />

                          <button
                            onClick={saveEdit}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => setEditId(null)}
                            className="border px-3 py-1 rounded"
                          >
                            Cancel
                          </button>

                        </div>

                      ) : (

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(
                              q.id
                            )}
                            onChange={() =>
                              toggleQuestionSelection(q.id)
                            }
                          />


                          <div
                            className="cursor-move px-1"
                            {...attributes}
                            {...listeners}
                          >
                            ☰
                          </div>


                          <div className="w-10">
                            {q.order_no}
                          </div>


                          <div className="flex-1">
                            {q.text}
                          </div>


                          <button
                            onClick={copySelectedQuestions}
                            disabled={
                              !selectedQuestionIds.includes(
                                q.id
                              )
                            }
                            className="disabled:opacity-40"
                          >
                            Copy Selected
                          </button>


                          <button
                            onClick={cutSelectedQuestions}
                            disabled={
                              !selectedQuestionIds.includes(
                                q.id
                              )
                            }
                            className="disabled:opacity-40"
                          >
                            Cut Selected
                          </button>


                          <button
                            onClick={() => startEdit(q)}
                          >
                            Edit
                          </button>


                          <button
                            onClick={() => {
                              if (
                                selectedQuestionIds.includes(
                                  q.id
                                )
                              ) {
                                deleteSelectedQuestions();
                              } else {
                                deleteQuestion(q.id);
                              }
                            }}
                          >
                            Delete
                          </button>

                        </div>

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