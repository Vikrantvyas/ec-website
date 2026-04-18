"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnglishTopicMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [topicName, setTopicName] = useState("");
  const [orderNo, setOrderNo] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchDays();
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedDay) fetchTopics();
  }, [selectedDay]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("english_courses")
      .select("*")
      .order("name");

    if (data) setCourses(data);
  };

  const fetchDays = async () => {
    const { data } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("day_number");

    if (data) setDays(data);
  };

  const fetchTopics = async () => {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("day_id", selectedDay)
      .order("order_no");

    if (data) setTopics(data);
  };

  const addTopic = async () => {
    if (!selectedDay || !topicName) return;

    await supabase.from("topics").insert([
      {
        day_id: selectedDay,
        topic_name: topicName,
        order_no: Number(orderNo || 0)
      }
    ]);

    setTopicName("");
    setOrderNo("");
    fetchTopics();
  };

  const deleteTopic = async (id:string) => {
    if (!confirm("Delete topic?")) return;

    await supabase.from("topics").delete().eq("id", id);
    fetchTopics();
  };

  return (

    <div className="space-y-4">

      {/* SELECTORS */}
      <div className="flex gap-2">

        <select
          value={selectedCourse}
          onChange={(e)=>setSelectedCourse(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Course</option>
          {courses.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(e)=>setSelectedDay(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Day</option>
          {days.map(d=>(
            <option key={d.id} value={d.id}>
              Day {d.day_number}
            </option>
          ))}
        </select>

      </div>

      {/* FORM */}
      <div className="flex gap-2">

        <input
          value={topicName}
          onChange={(e)=>setTopicName(e.target.value)}
          placeholder="Topic name"
          className="border px-3 py-2 rounded"
        />

        <input
          type="number"
          value={orderNo}
          onChange={(e)=>setOrderNo(e.target.value)}
          placeholder="Order"
          className="border px-3 py-2 rounded w-24"
        />

        <button
          onClick={addTopic}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Topic
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-2">

        {topics.map(t=>(
          <div
            key={t.id}
            className="flex justify-between items-center border p-2 rounded"
          >

            <div>
              {t.order_no}. {t.topic_name}
            </div>

            <button
              onClick={()=>deleteTopic(t.id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}