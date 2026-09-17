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

/* SORTABLE */
function SortableItem({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(attributes, listeners)}
    </div>
  );
}

export default function EnglishDayMaster({
  initialCourseId = "",
  onManageTopics
}: any) {

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [conversationImageFile, setConversationImageFile] = useState<File | null>(null);
  const [conversationMobileImageFile, setConversationMobileImageFile] = useState<File | null>(null);

  const [days, setDays] = useState<any[]>([]);
  const [dayNumber, setDayNumber] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [clipboardDays, setClipboardDays] = useState<any[]>([]);
  const [clipboardMode, setClipboardMode] = useState<"copy" | "cut" | null>(null);

  const [selectedDayIds, setSelectedDayIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourse(initialCourseId);
    }
  }, [initialCourseId]);
  useEffect(() => {
    if (selectedCourse) fetchDays();
  }, [selectedCourse]);

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
  const uploadConversationImage = async (
    file: File | null,
    type: "desktop" | "mobile"
  ) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `conversation-${type}-${Date.now()}.${fileExt}`;
    const filePath = `backgrounds/${fileName}`;

    const { error } = await supabase.storage
      .from("conversation")
      .upload(filePath, file);

    if (error) {
      alert("Image upload failed: " + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("conversation")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };
  const fetchDays = async () => {
    const courseId = selectedCourse;

    if (!courseId) {
      setDays([]);
      return;
    }

    setDays([]);

    const { data, error } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", courseId)
      .order("day_number");

    if (error) {
      console.error("Fetch Days failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      alert(
        `Fetch Days failed:\n${error.message}\n\nCode: ${error.code || ""}`
      );

      return;
    }

    // पुराने course की request का result नए course को overwrite न करे
    if (courseId !== selectedCourse) return;

    setDays(data || []);
  };

  // ✅ BULK ADD (MAIN FEATURE)
  const addDay = async () => {
    if (!selectedCourse || !dayNumber) return;

    const selectedCourseName =
      courses.find((c: any) => c.id === selectedCourse)?.name;

    const count = Number(dayNumber);

    const maxDay = days.length > 0
      ? Math.max(...days.map(d => d.day_number))
      : 0;

    let conversationImageUrl: string | null = null;
    let conversationMobileImageUrl: string | null = null;

    if (
      selectedCourseName === "Conversation" ||
      selectedCourseName === "Image Explanation"
    ) {
      if (!conversationImageFile || !conversationMobileImageFile) {
        alert(
          "Please select both Desktop/Wide and Mobile (9:16) images."
        );
        return;
      }

      conversationImageUrl = await uploadConversationImage(
        conversationImageFile,
        "desktop"
      );

      conversationMobileImageUrl = await uploadConversationImage(
        conversationMobileImageFile,
        "mobile"
      );

      if (!conversationImageUrl || !conversationMobileImageUrl) {
        return;
      }
    }

    const data = [];

    for (let i = 1; i <= count; i++) {
      data.push({
        course_id: selectedCourse,
        day_number: maxDay + i,
        conversation_image_url: conversationImageUrl,
        conversation_mobile_image_url: conversationMobileImageUrl
      });
    }

    const { error } = await supabase
      .from("days")
      .insert(data);

    if (error) {
      alert("Day save failed: " + error.message);
      return;
    }

    setDayNumber("");
    setConversationImageFile(null);
    setConversationMobileImageFile(null);
    fetchDays();
  };
  const copySelectedDays = () => {
    const selected = days.filter(d =>
      selectedDayIds.includes(d.id)
    );

    if (selected.length === 0) return;

    setClipboardDays(selected);
    setClipboardMode("copy");
  };

  const cutSelectedDays = () => {
    const selected = days.filter(d =>
      selectedDayIds.includes(d.id)
    );

    if (selected.length === 0) return;

    setClipboardDays(selected);
    setClipboardMode("cut");
  };
  const toggleDaySelection = (id: string) => {
    setSelectedDayIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectAllDays = () => {
    setSelectedDayIds(days.map(d => d.id));
  };

  const clearDaySelection = () => {
    setSelectedDayIds([]);
  };
  const pasteDays = async () => {
    if (clipboardDays.length === 0 || !selectedCourse) return;

    try {
      // Target course में current maximum day number
      let nextDayNumber = days.length > 0
        ? Math.max(...days.map(d => d.day_number))
        : 0;

      const createdDayIds: string[] = [];

      // Selected days को उनके original order में process करें
      const sortedDays = [...clipboardDays].sort(
        (a, b) => a.day_number - b.day_number
      );

      for (const oldDay of sortedDays) {

        nextDayNumber++;

        // 1. Create new Day
        const { data: newDayData, error: newDayError } = await supabase
          .from("days")
          .insert([{
            course_id: selectedCourse,
            day_number: nextDayNumber,
            title: oldDay.title || "",
            conversation_image_url: oldDay.conversation_image_url || null,
            conversation_mobile_image_url:
              oldDay.conversation_mobile_image_url || null
          }])
          .select()
          .single();

        if (newDayError) throw newDayError;

        const newDay = newDayData;
        createdDayIds.push(newDay.id);

        // 2. Get Topics
        const { data: oldTopics, error: topicsError } = await supabase
          .from("topics")
          .select("*")
          .eq("day_id", oldDay.id)
          .order("order_no");

        if (topicsError) throw topicsError;

        // 3. Copy Topics
        for (const oldTopic of oldTopics || []) {

          const { data: newTopicData, error: newTopicError } =
            await supabase
              .from("topics")
              .insert([{
                day_id: newDay.id,
                topic_name: oldTopic.topic_name,
                order_no: oldTopic.order_no
              }])
              .select()
              .single();

          if (newTopicError) throw newTopicError;

          const newTopic = newTopicData;

          // 4. Get Sentences
          const selectedCourseName =
            courses.find((c: any) => c.id === selectedCourse)?.name;

          if (
            selectedCourseName === "Conversation" ||
            selectedCourseName === "Image Explanation"
          ) {
            const questionTable =
              selectedCourseName === "Image Explanation"
                ? "image_explanation_questions"
                : "conversation_questions";

            const { data: oldQuestions, error: questionsError } =
              await supabase
                .from(questionTable)
                .select("*")
                .eq("topic_id", oldTopic.id)
                .order("order_no");

            if (questionsError) throw questionsError;

            if (oldQuestions && oldQuestions.length > 0) {
              const questionsData =
                selectedCourseName === "Image Explanation"
                  ? oldQuestions.map((q: any) => ({
                    topic_id: newTopic.id,
                    image_id: q.image_id,
                    hindi_question: q.hindi_question,
                    english_question: q.english_question,
                    hindi_answer: q.hindi_answer,
                    english_answer: q.english_answer,
                    order_no: q.order_no
                  }))
                  : oldQuestions.map((q: any) => ({
                    topic_id: newTopic.id,
                    question_text: q.question_text,
                    question_english: q.question_english,
                    question_hindi_2: q.question_hindi_2,
                    question_english_2: q.question_english_2,
                    answer_hindi_3: q.answer_hindi_3,
                    answer_english_3: q.answer_english_3,
                    answer_hindi_4: q.answer_hindi_4,
                    answer_english_4: q.answer_english_4,
                    order_no: q.order_no
                  }));

              const { error: insertQuestionsError } =
                await supabase
                  .from(questionTable)
                  .insert(questionsData);

              if (insertQuestionsError) throw insertQuestionsError;
            }
          } else {
            const { data: oldVocabulary, error: vocabularyError } =
              await supabase
                .from("vocabulary")
                .select("*")
                .eq("topic_id", oldTopic.id)
                .order("order_no");

            if (vocabularyError) throw vocabularyError;

            if (oldVocabulary && oldVocabulary.length > 0) {
              const vocabularyData = oldVocabulary.map((v: any) => ({
                topic_id: newTopic.id,
                hindi: v.hindi,
                english: v.english,
                order_no: v.order_no
              }));

              const { error: insertVocabularyError } =
                await supabase
                  .from("vocabulary")
                  .insert(vocabularyData);

              if (insertVocabularyError) throw insertVocabularyError;
            }
          }
        }
      }

      // 6. अगर CUT है तो सभी original Days delete करें
      if (clipboardMode === "cut") {

        const originalDayIds = clipboardDays.map(d => d.id);

        const { error: deleteError } = await supabase
          .from("days")
          .delete()
          .in("id", originalDayIds);

        if (deleteError) throw deleteError;
      }

      // 7. Clear clipboard
      setClipboardDays([]);
      setClipboardMode(null);
      setSelectedDayIds([]);

      fetchDays();

    } catch (error) {

      console.error("Paste Days failed:", error);

      alert(
        "Paste failed. Original Days have NOT been deleted."
      );
    }
  };
  // DELETE
  const deleteSelectedDays = async () => {
    if (selectedDayIds.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedDayIds.length} selected days?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("days")
      .delete()
      .in("id", selectedDayIds);

    if (error) {
      console.error("Delete Selected Days failed:", error);
      alert("Delete failed.");
      return;
    }

    setSelectedDayIds([]);
    fetchDays();
  };
  const deleteDay = async (id: string) => {
    await supabase.from("days").delete().eq("id", id);
    fetchDays();
  };

  // EDIT
  const startEdit = (d: any) => {
    setEditId(d.id);
    setEditValue(String(d.day_number));
    setEditTitle(d.title || "");
    setConversationImageFile(null);
  };

  const saveEdit = async () => {
    let conversationImageUrl: string | null = null;

    if (conversationImageFile) {
      conversationImageUrl = await uploadConversationImage();

      if (!conversationImageUrl) {
        return;
      }
    }

    const updateData: any = {
      day_number: Number(editValue),
      title: editTitle
    };

    if (conversationImageUrl) {
      updateData.conversation_image_url = conversationImageUrl;
    }

    await supabase
      .from("days")
      .update(updateData)
      .eq("id", editId);

    setEditId(null);
    setConversationImageFile(null);
    fetchDays();
  };


  // DRAG
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = days.findIndex(d => d.id === active.id);
    const newIndex = days.findIndex(d => d.id === over.id);

    setDays(arrayMove(days, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    for (let i = 0; i < days.length; i++) {
      await supabase.from("days")
        .update({ day_number: i + 1 })
        .eq("id", days[i].id);
    }
    fetchDays();
  };

  return (

    <div className="h-full overflow-hidden">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white z-20 p-3 border-b flex gap-2 items-center">

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {["Conversation", "Image Explanation"].includes(
  courses.find((c: any) => c.id === selectedCourse)?.name
) && (
  <>
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium">
        Desktop / Wide
      </span>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setConversationImageFile(e.target.files?.[0] || null)
        }
        className="border px-2 py-1 rounded"
      />
    </div>

    <div className="flex items-center gap-2">
      <span className="text-xs font-medium">
        Mobile (9:16)
      </span>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setConversationMobileImageFile(
            e.target.files?.[0] || null
          )
        }
        className="border px-2 py-1 rounded"
      />
    </div>
  </>
)}
        <input
          type="number"
          value={dayNumber}
          onChange={(e) => setDayNumber(e.target.value)}
          placeholder="Enter number (e.g. 10)"
          className="border px-2 py-1 rounded w-40"
        />

        <button onClick={addDay} className="bg-blue-600 text-white px-3 py-1 rounded">
          Add
        </button>

        <button
          onClick={selectAllDays}
          className="border px-3 py-1 rounded"
        >
          Select All
        </button>

        <button
          onClick={clearDaySelection}
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

        {clipboardDays.length > 0 && (
          <button
            onClick={pasteDays}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Paste {clipboardMode === "cut" ? "Cut" : "Copied"}{" "}
            {clipboardDays.length} Day{clipboardDays.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-120px)]">

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={days.map(d => d.id)} strategy={verticalListSortingStrategy}>

            <div className="space-y-2">

              {days.map(d => (

                <SortableItem key={d.id} id={d.id}>

                  {(attributes: any, listeners: any) => (

                    <div className="flex items-center gap-2 border p-2 rounded bg-white">

                      <input
                        type="checkbox"
                        checked={selectedDayIds.includes(d.id)}
                        onChange={() => toggleDaySelection(d.id)}
                      />
                      <div {...attributes} {...listeners} className="cursor-move">
                        ☰
                      </div>

                      {editId === d.id ? (
                        <>
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border px-2 py-1 rounded w-20"
                          />
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="border px-2 py-1 rounded flex-1"
                          />
                          {["Conversation", "Image Explanation"].includes(
                            courses.find((c: any) => c.id === selectedCourse)?.name
                          ) && (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setConversationImageFile(e.target.files?.[0] || null)
                                }
                                className="border px-2 py-1 rounded"
                              />
                            )}
                          <button onClick={saveEdit}>Save</button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">

                            {String(d.day_number).padStart(2, "0")}

                            {d.title
                              ? ` · ${d.title}`
                              : ""}

                          </div>
                          {d.conversation_image_url && (
                            <img
                              src={d.conversation_image_url}
                              alt={
                                courses.find((c: any) => c.id === selectedCourse)?.name ===
                                  "Image Explanation"
                                  ? "Image Explanation"
                                  : "Conversation background"
                              }
                              className="w-16 h-10 object-cover rounded border"
                            />
                          )}
                          <button onClick={() => onManageTopics(d.id)}>
                            Manage Topics →
                          </button>

                          <button
                            onClick={copySelectedDays}
                            disabled={!selectedDayIds.includes(d.id)}
                            className="disabled:opacity-40"
                          >
                            Copy Selected
                          </button>

                          <button
                            onClick={cutSelectedDays}
                            disabled={!selectedDayIds.includes(d.id)}
                            className="disabled:opacity-40"
                          >
                            Cut Selected
                          </button>

                          <button onClick={() => startEdit(d)}>
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              if (selectedDayIds.includes(d.id)) {
                                deleteSelectedDays();
                              } else {
                                deleteDay(d.id);
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