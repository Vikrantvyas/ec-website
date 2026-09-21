"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type DemoShowcaseProps = {
    courses: any[];
    days: any[];
    topics: any[];

    selectedCourse: string;
    onDemoCourseSelect: (value: string) => void;

    selectedDays: string[];
    setSelectedDays: (value: string[]) => void;

    selectedTopics: string[];
    setSelectedTopics: (value: string[]) => void;

    selectedGrammarTableId: string;
    setSelectedGrammarTableId: (value: string) => void;

    setSelectedImageId: (value: string) => void;

    setShowImages: (value: boolean) => void;
    setShowGrammar: (value: boolean) => void;
};

export default function DemoShowcase({
    courses,
    days,
    topics,

    selectedCourse,
    onDemoCourseSelect,

    selectedDays,
    setSelectedDays,

    selectedTopics,
    setSelectedTopics,

    selectedGrammarTableId,
    setSelectedGrammarTableId,

    setSelectedImageId,

    setShowImages,
    setShowGrammar,
}: DemoShowcaseProps) {
    const [expandedImages, setExpandedImages] = useState<string[]>([]);
    const [expandedVideos, setExpandedVideos] = useState<string[]>([]);
    const [expandedGrammar, setExpandedGrammar] = useState<string[]>([]);
    const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
    const [expandedDays, setExpandedDays] = useState<string[]>([]);

    const [imageTopics, setImageTopics] = useState<any[]>([]);
    const [grammarTopics, setGrammarTopics] = useState<any[]>([]);
    const [demoTopics, setDemoTopics] = useState<any[]>([]);
    /* =========================================================
       LOAD IMAGES + VIDEOS
    ========================================================= */

    useEffect(() => {
        const loadMedia = async () => {
            const { data: topicsData, error: topicsError } =
                await supabase
                    .from("image_topics")
                    .select("*")
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: true });

            if (topicsError) {
                console.error("DEMO IMAGE TOPICS ERROR:", topicsError);
                return;
            }

            const { data: imagesData, error: imagesError } =
                await supabase
                    .from("images")
                    .select(
                        "id, name, topic_id, file_path, sort_order, created_at"
                    )
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: true });

            if (imagesError) {
                console.error("DEMO IMAGES ERROR:", imagesError);
                return;
            }

            const { data: videosData, error: videosError } =
                await supabase
                    .from("videos")
                    .select(
                        "id, name, topic_id, source_type, video_url, file_path, sort_order, created_at"
                    )
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: true });

            if (videosError) {
                console.error("DEMO VIDEOS ERROR:", videosError);
                return;
            }

            const finalTopics = (topicsData || []).map((topic: any) => ({
                ...topic,

                images: (imagesData || [])
                    .filter(
                        (image: any) =>
                            image.topic_id === topic.id
                    )
                    .sort((a: any, b: any) => {
                        if (
                            (a.sort_order ?? 0) !==
                            (b.sort_order ?? 0)
                        ) {
                            return (
                                (a.sort_order ?? 0) -
                                (b.sort_order ?? 0)
                            );
                        }

                        return (
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                        );
                    }),

                videos: (videosData || [])
                    .filter(
                        (video: any) =>
                            video.topic_id === topic.id
                    )
                    .sort((a: any, b: any) => {
                        if (
                            (a.sort_order ?? 0) !==
                            (b.sort_order ?? 0)
                        ) {
                            return (
                                (a.sort_order ?? 0) -
                                (b.sort_order ?? 0)
                            );
                        }

                        return (
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                        );
                    }),
            }));

            setImageTopics(finalTopics);
        };

        loadMedia();
    }, []);

    /* =========================================================
       LOAD GRAMMAR
    ========================================================= */

    useEffect(() => {
        const loadGrammar = async () => {
            const { data: topicsData, error: topicsError } =
                await supabase
                    .from("grammar_topics")
                    .select("*")
                    .order("sort_order", {
                        ascending: true,
                    });

            if (topicsError) {
                console.error(
                    "DEMO GRAMMAR TOPICS ERROR:",
                    topicsError
                );
                return;
            }

            const { data: tablesData, error: tablesError } =
                await supabase
                    .from("grammar_tables")
                    .select(
                        "id, name, topic_id, order_no"
                    )
                    .order("order_no", {
                        ascending: true,
                    });

            if (tablesError) {
                console.error(
                    "DEMO GRAMMAR TABLES ERROR:",
                    tablesError
                );
                return;
            }

            const finalTopics =
                (topicsData || []).map((topic: any) => ({
                    ...topic,

                    grammar_tables:
                        (tablesData || []).filter(
                            (table: any) =>
                                table.topic_id === topic.id
                        ),
                }));

            setGrammarTopics(finalTopics);
        };

        loadGrammar();
    }, []);
    /* =========================================================
       LOAD COURSE TOPICS FOR DEMO
    ========================================================= */

    useEffect(() => {
        const loadDemoTopics = async () => {
            if (!selectedCourse) {
                setDemoTopics([]);
                return;
            }

            const courseDays = days.filter(
                (day: any) => day.course_id === selectedCourse
            );

            if (courseDays.length === 0) {
                setDemoTopics([]);
                return;
            }

            const dayIds = courseDays.map(
                (day: any) => day.id
            );

            const { data, error } = await supabase
                .from("topics")
                .select(`
        *,
        vocabulary(count)
    `)
                .in("day_id", dayIds)
                .order("order_no");

            if (error) {
                console.error(
                    "DEMO COURSE TOPICS ERROR:",
                    error
                );
                setDemoTopics([]);
                return;
            }

            setDemoTopics(data || []);
        };

        loadDemoTopics();
    }, [selectedCourse, days]);
    /* =========================================================
       TOGGLES
    ========================================================= */

    const toggleItem = (
        id: string,
        setter: React.Dispatch<
            React.SetStateAction<string[]>
        >
    ) => {
        setter((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    /* =========================================================
       IMAGE CLICK
    ========================================================= */

    const handleImageClick = (id: string) => {
        setSelectedImageId(id);

        // Automatically open Image Board
        setShowImages(true);

        // Close grammar
        setShowGrammar(false);
    };

    /* =========================================================
       VIDEO CLICK
    ========================================================= */

    const handleVideoClick = (id: string) => {
        setSelectedImageId(id);

        // Same media board handles video
        setShowImages(true);

        setShowGrammar(false);
    };

    /* =========================================================
       GRAMMAR TABLE CLICK
    ========================================================= */

    const handleGrammarClick = (id: string) => {
        setSelectedGrammarTableId(id);

        // Automatically open Grammar Board
        setShowGrammar(true);

        // Close image board
        setShowImages(false);
    };

    /* =========================================================
       COURSE CLICK
    ========================================================= */

    const handleCourseClick = (courseId: string) => {
        onDemoCourseSelect(courseId);

        setSelectedDays([]);
        setSelectedTopics([]);

        setShowImages(false);
        setShowGrammar(false);
    };

    /* =========================================================
       DAY CLICK
    ========================================================= */

    const handleDayClick = (dayId: string) => {
        const dayTopics = demoTopics
            .filter(
                (topic: any) =>
                    topic.day_id === dayId
            )
            .map((topic: any) => topic.id);

        const allSelected =
            dayTopics.length > 0 &&
            dayTopics.every((id: string) =>
                selectedTopics.includes(id)
            );

        if (allSelected) {
            setSelectedDays(
                selectedDays.filter(
                    (id) => id !== dayId
                )
            );

            setSelectedTopics(
                selectedTopics.filter(
                    (id) =>
                        !dayTopics.includes(id)
                )
            );

            return;
        }

        setSelectedDays([
            ...new Set([
                ...selectedDays,
                dayId,
            ]),
        ]);

        setSelectedTopics([
            ...new Set([
                ...selectedTopics,
                ...dayTopics,
            ]),
        ]);
    };

    /* =========================================================
       TOPIC CLICK
    ========================================================= */

    const handleTopicClick = (
        topicId: string
    ) => {
        if (selectedTopics.includes(topicId)) {
            setSelectedTopics(
                selectedTopics.filter(
                    (id) => id !== topicId
                )
            );
        } else {
            setSelectedTopics([
                ...selectedTopics,
                topicId,
            ]);
        }
    };

    return (
        <div className="w-full h-full flex gap-2 p-2 bg-gray-50 overflow-hidden">

            {/* =====================================================
          IMAGES
      ===================================================== */}

            <div className="flex-[1.25] min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                <div className="bg-blue-100 px-3 py-2 font-bold text-sm">
                    Images
                </div>

                <div className="flex-1 overflow-y-auto p-2">

                    {imageTopics
                        .filter(
                            (topic: any) =>
                                (topic.images?.length || 0) > 0
                        )
                        .map((topic: any) => {

                            const expanded =
                                expandedImages.includes(
                                    topic.id
                                );

                            return (
                                <div
                                    key={topic.id}
                                    className="mb-1"
                                >

                                    <div
                                        onClick={() =>
                                            toggleItem(
                                                topic.id,
                                                setExpandedImages
                                            )
                                        }
                                        className="flex justify-between items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs rounded"
                                    >
                                        <span className="truncate">
                                            {topic.name}
                                        </span>

                                        <span>
                                            {expanded
                                                ? "−"
                                                : "+"}
                                        </span>
                                    </div>

                                    {expanded && (
                                        <div className="ml-3">

                                            {topic.images.map(
                                                (image: any) => (
                                                    <div
                                                        key={image.id}
                                                        onClick={() =>
                                                            handleImageClick(
                                                                image.id
                                                            )
                                                        }
                                                        className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 rounded"
                                                    >
                                                        {image.name}
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                </div>
            </div>

            {/* =====================================================
          VIDEOS
      ===================================================== */}

            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                <div className="bg-red-100 px-3 py-2 font-bold text-sm">
                    Videos
                </div>

                <div className="flex-1 overflow-y-auto p-2">

                    {imageTopics
                        .filter(
                            (topic: any) =>
                                (topic.videos?.length || 0) > 0
                        )
                        .map((topic: any) => {

                            const expanded =
                                expandedVideos.includes(
                                    topic.id
                                );

                            return (
                                <div
                                    key={topic.id}
                                    className="mb-1"
                                >

                                    <div
                                        onClick={() =>
                                            toggleItem(
                                                topic.id,
                                                setExpandedVideos
                                            )
                                        }
                                        className="flex justify-between items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs rounded"
                                    >
                                        <span className="truncate">
                                            {topic.name}
                                        </span>

                                        <span>
                                            {expanded
                                                ? "−"
                                                : "+"}
                                        </span>
                                    </div>

                                    {expanded && (
                                        <div className="ml-3">

                                            {topic.videos.map(
                                                (video: any) => (
                                                    <div
                                                        key={video.id}
                                                        onClick={() =>
                                                            handleVideoClick(
                                                                video.id
                                                            )
                                                        }
                                                        className="px-2 py-1 text-xs cursor-pointer hover:bg-red-100 rounded"
                                                    >
                                                        {video.name}
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                </div>
            </div>

            {/* =====================================================
          GRAMMAR TABLES
      ===================================================== */}

            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                <div className="bg-amber-100 px-3 py-2 font-bold text-sm">
                    Grammar Tables
                </div>

                <div className="flex-1 overflow-y-auto p-2">

                    {grammarTopics.map(
                        (topic: any) => {

                            const expanded =
                                expandedGrammar.includes(
                                    topic.id
                                );

                            return (
                                <div
                                    key={topic.id}
                                    className="mb-1"
                                >

                                    <div
                                        onClick={() =>
                                            toggleItem(
                                                topic.id,
                                                setExpandedGrammar
                                            )
                                        }
                                        className="flex justify-between items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs rounded"
                                    >

                                        <span className="truncate">
                                            {topic.name}
                                        </span>

                                        <span>
                                            {expanded
                                                ? "−"
                                                : "+"}
                                        </span>

                                    </div>

                                    {expanded && (
                                        <div className="ml-3">

                                            {topic.grammar_tables?.map(
                                                (table: any) => (
                                                    <div
                                                        key={table.id}
                                                        onClick={() =>
                                                            handleGrammarClick(
                                                                table.id
                                                            )
                                                        }
                                                        className={`px-2 py-1 text-xs cursor-pointer rounded ${selectedGrammarTableId ===
                                                            table.id
                                                            ? "bg-amber-200 font-semibold"
                                                            : "hover:bg-amber-100"
                                                            }`}
                                                    >
                                                        {table.name}
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>
                            );
                        }
                    )}

                </div>
            </div>

            {/* =====================================================
          COURSES
      ===================================================== */}

            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                <div className="bg-green-100 px-3 py-2 font-bold text-sm">
                    Courses
                </div>

                <div className="flex-1 overflow-y-auto p-2">

                    {courses.map(
                        (course: any) => {

                            const courseExpanded =
                                expandedCourses.includes(
                                    course.id
                                );

                            const courseDays =
                                days.filter(
                                    (day: any) =>
                                        day.course_id ===
                                        course.id
                                );

                            return (
                                <div
                                    key={course.id}
                                    className="mb-1"
                                >

                                    <div
                                        onClick={() => {
                                            toggleItem(
                                                course.id,
                                                setExpandedCourses
                                            );

                                            handleCourseClick(
                                                course.id
                                            );
                                        }}
                                        className={`flex justify-between items-center px-2 py-1.5 cursor-pointer rounded text-xs ${selectedCourse ===
                                            course.id
                                            ? "bg-green-200 font-semibold"
                                            : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >

                                        <span className="truncate">
                                            {course.name}
                                        </span>

                                        <span>
                                            {courseExpanded
                                                ? "−"
                                                : "+"}
                                        </span>

                                    </div>

                                    {courseExpanded && (
                                        <div className="ml-3">

                                            {courseDays.map(
                                                (day: any) => {

                                                    const dayExpanded =
                                                        expandedDays.includes(
                                                            day.id
                                                        );

                                                    const dayTopics =
                                                        demoTopics.filter(
                                                            (topic: any) =>
                                                                topic.day_id === day.id
                                                        );

                                                    return (
                                                        <div
                                                            key={day.id}
                                                            className="mb-1"
                                                        >

                                                            <div
                                                                onClick={() => {
                                                                    toggleItem(
                                                                        day.id,
                                                                        setExpandedDays
                                                                    );

                                                                    handleDayClick(
                                                                        day.id
                                                                    );
                                                                }}
                                                                className="flex justify-between items-center px-2 py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer text-xs rounded"
                                                            >

                                                                <span>
                                                                    {String(
                                                                        day.day_number
                                                                    ).padStart(
                                                                        2,
                                                                        "0"
                                                                    )}

                                                                    {day.title
                                                                        ? ` · ${day.title}`
                                                                        : ""}
                                                                </span>

                                                                <span>
                                                                    {dayExpanded
                                                                        ? "−"
                                                                        : "+"}
                                                                </span>

                                                            </div>

                                                            {dayExpanded && (
                                                                <div className="ml-3">

                                                                    {dayTopics.map(
                                                                        (topic: any) => {

                                                                            const selected =
                                                                                selectedTopics.includes(
                                                                                    topic.id
                                                                                );

                                                                            return (
                                                                                <div
                                                                                    key={topic.id}
                                                                                    onClick={() =>
                                                                                        handleTopicClick(
                                                                                            topic.id
                                                                                        )
                                                                                    }
                                                                                    className={`px-2 py-1 text-xs cursor-pointer rounded ${selected
                                                                                        ? "bg-green-600 text-white"
                                                                                        : "hover:bg-green-100"
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex justify-between gap-1">

                                                                                        <span className="truncate">
                                                                                            {topic.topic_name}
                                                                                        </span>

                                                                                        {topic.sentence_count ||
                                                                                            topic.vocabulary?.[0]
                                                                                                ?.count ? (
                                                                                            <span className="shrink-0">
                                                                                                (
                                                                                                {topic.sentence_count ??
                                                                                                    topic.vocabulary?.[0]
                                                                                                        ?.count ??
                                                                                                    0}
                                                                                                )
                                                                                            </span>
                                                                                        ) : null}

                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>
                            );
                        }
                    )}

                </div>
            </div>

        </div>
    );
}