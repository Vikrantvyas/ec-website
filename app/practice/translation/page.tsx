"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TranslationPracticePage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [days, setDays] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    useEffect(() => {
        if (selectedTopics.length === 0) {
            setSentences([]);
            setCurrentIndex(0);
            return;
        }

        const fetchSentences = async () => {
            const { data, error } = await supabase
                .from("vocabulary")
                .select("*")
                .in("topic_id", selectedTopics)
                .order("topic_id")
                .order("order_no");

            if (error) {
                console.error("SENTENCES ERROR:", error.message);
                return;
            }

            const sorted = (data || []).sort((a: any, b: any) => {
                const indexA = selectedTopics.indexOf(a.topic_id);
                const indexB = selectedTopics.indexOf(b.topic_id);

                if (indexA === indexB) {
                    return a.order_no - b.order_no;
                }

                return indexA - indexB;
            });

            setSentences(sorted);
            setCurrentIndex(0);
        };

        fetchSentences();
    }, [selectedTopics]);
    const [expandedDays, setExpandedDays] = useState<string[]>([]);
    const [sentences, setSentences] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from("english_courses")
                .select("*")
                .order("name");

            if (error) {
                console.error("COURSES ERROR:", error.message);
                return;
            }

            setCourses(data || []);
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        if (!selectedCourse) {
            setDays([]);
            setTopics([]);
            setSelectedTopics([]);
            setExpandedDays([]);
            return;
        }

        const fetchDaysAndTopics = async () => {
            const { data: daysData, error: daysError } = await supabase
                .from("days")
                .select("*")
                .eq("course_id", selectedCourse)
                .order("day_number");

            if (daysError) {
                console.error("DAYS ERROR:", daysError.message);
                return;
            }

            const loadedDays = daysData || [];
            setDays(loadedDays);

            const dayIds = loadedDays.map((day: any) => day.id);

            if (dayIds.length === 0) {
                setTopics([]);
                setSelectedTopics([]);
                setExpandedDays([]);
                return;
            }

            const { data: topicsData, error: topicsError } = await supabase
                .from("topics")
                .select("id, topic_name, day_id, order_no")
                .in("day_id", dayIds)
                .order("order_no");

            if (topicsError) {
                console.error("TOPICS ERROR:", topicsError.message);
                return;
            }

            setTopics(topicsData || []);
            setSelectedTopics([]);
            setExpandedDays([]);
        };

        fetchDaysAndTopics();
    }, [selectedCourse]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">

                {/* STICKY HEADER + COURSE + START */}
                <div className="sticky top-0 z-20 bg-white rounded-lg shadow p-4 mb-4">

                    <h1 className="text-xl font-bold text-center mb-4">
                        Translation Practice
                    </h1>

                    <div className="flex items-end gap-4">

                        <div className="w-80">
                            <label className="block text-sm font-semibold mb-1">
                                Course
                            </label>

                            <select
                                value={selectedCourse}
                                onChange={(e) =>
                                    setSelectedCourse(e.target.value)
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                            >
                                <option value="">
                                    Select Course
                                </option>

                                {courses.map((course) => (
                                    <option
                                        key={course.id}
                                        value={course.id}
                                    >
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedTopics.length > 0 && (
                            <button
                                onClick={() => {
                                    console.log(
                                        "START PRACTICE:",
                                        selectedTopics
                                    );
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Start Practice
                            </button>
                        )}

                    </div>
                </div>

                {/* DAYS + TOPICS */}
                {selectedCourse && (
                    <div className="border-t pt-4">

                        <div className="font-semibold text-sm mb-2">
                            Select Topics
                        </div>

                        <div className="flex flex-col gap-1">

                            {days.map((day) => {

                                const dayTopics = topics.filter(
                                    (topic) => topic.day_id === day.id
                                );

                                const isExpanded =
                                    expandedDays.includes(day.id);

                                return (
                                    <div key={day.id}>

                                        {/* DAY */}
                                        <div
                                            className="flex items-center justify-between px-2 py-2 rounded cursor-pointer hover:bg-gray-100"
                                            onClick={() =>
                                                setExpandedDays((prev) =>
                                                    prev.includes(day.id)
                                                        ? prev.filter(
                                                            (id) =>
                                                                id !== day.id
                                                        )
                                                        : [
                                                            ...prev,
                                                            day.id,
                                                        ]
                                                )
                                            }
                                        >

                                            <div className="flex items-center gap-2 min-w-0">

                                                <input
                                                    type="checkbox"
                                                    className="w-3.5 h-3.5 shrink-0"
                                                    checked={
                                                        dayTopics.length > 0 &&
                                                        dayTopics.every(
                                                            (topic) =>
                                                                selectedTopics.includes(
                                                                    topic.id
                                                                )
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    onChange={() => {

                                                        const dayTopicIds =
                                                            dayTopics.map(
                                                                (topic) =>
                                                                    topic.id
                                                            );

                                                        const allSelected =
                                                            dayTopicIds.length > 0 &&
                                                            dayTopicIds.every(
                                                                (id) =>
                                                                    selectedTopics.includes(
                                                                        id
                                                                    )
                                                            );

                                                        setSelectedTopics(
                                                            (prev) =>
                                                                allSelected
                                                                    ? prev.filter(
                                                                        (id) =>
                                                                            !dayTopicIds.includes(
                                                                                id
                                                                            )
                                                                    )
                                                                    : [
                                                                        ...prev,
                                                                        ...dayTopicIds.filter(
                                                                            (id) =>
                                                                                !prev.includes(
                                                                                    id
                                                                                )
                                                                        ),
                                                                    ]
                                                        );
                                                    }}
                                                />

                                                <span className="font-medium text-sm">
                                                    {String(
                                                        day.day_number
                                                    ).padStart(2, "0")}

                                                    {day.title
                                                        ? ` · ${day.title}`
                                                        : ""}
                                                </span>

                                            </div>

                                            <span className="font-bold">
                                                {isExpanded ? "−" : "+"}
                                            </span>

                                        </div>

                                        {/* TOPICS */}
                                        {isExpanded && (
                                            <div className="ml-5 flex flex-col gap-1 pb-2">

                                                {dayTopics.map((topic) => (

                                                    <label
                                                        key={topic.id}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm"
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTopics.includes(
                                                                topic.id
                                                            )}
                                                            onChange={() =>
                                                                setSelectedTopics(
                                                                    (prev) =>
                                                                        prev.includes(
                                                                            topic.id
                                                                        )
                                                                            ? prev.filter(
                                                                                (id) =>
                                                                                    id !==
                                                                                    topic.id
                                                                            )
                                                                            : [
                                                                                ...prev,
                                                                                topic.id,
                                                                            ]
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {topic.topic_name}
                                                        </span>

                                                    </label>

                                                ))}

                                            </div>
                                        )}

                                    </div>
                                );
                            })}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
           
}