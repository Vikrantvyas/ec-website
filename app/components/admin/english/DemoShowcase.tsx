"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import WhiteBoard from "@/app/components/admin/english/WhiteBoard";

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
    const [demoDays, setDemoDays] = useState<any[]>([]);
    const [demoTabs, setDemoTabs] = useState<any[]>([]);
    const [activeDemoTab, setActiveDemoTab] = useState<string>("");
    const [selectedImageTopicId, setSelectedImageTopicId] = useState<string>("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [selectedVideoTopicId, setSelectedVideoTopicId] = useState<string>("");
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
    const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
    const [selectedMCQIndex, setSelectedMCQIndex] = useState(0);
    const [reactionMemes, setReactionMemes] = useState<any[]>([]);
    const [selectedReactionIndex, setSelectedReactionIndex] = useState(0);
    const [classStartTime, setClassStartTime] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [tabsHovered, setTabsHovered] = useState(false);
    const activeTab = demoTabs.find(
        (tab: any) => tab.id === activeDemoTab
    );
    const activeTabType = activeTab?.tab_type || "";

    const activeCourseId =
        activeTabType === "course"
            ? (
                courses.find(
                    (course: any) =>
                        course.id ===
                        activeTab?.tab_key?.replace("course:", "")
                )?.id
                ||
                courses.find(
                    (course: any) =>
                        course.name === activeTab?.tab_name
                )?.id
                ||
                ""
            )
            : "";
    const activeCourseName =
        courses.find(
            (course: any) => course.id === activeCourseId
        )?.name || activeTab?.tab_name || "";
    useEffect(() => {
        if (activeTabType !== "images") return;

        const firstTopic = imageTopics.find(
            (topic: any) => topic.media_type === "image"
        );

        if (firstTopic && !selectedImageTopicId) {
            setSelectedImageTopicId(firstTopic.id);
            setSelectedImageIndex(0);
        }
    }, [activeTabType, imageTopics, selectedImageTopicId]);
    useEffect(() => {
        if (activeTabType !== "videos") return;

        const firstTopic = imageTopics.find(
            (topic: any) => topic.media_type === "video"
        );

        if (firstTopic && !selectedVideoTopicId) {
            setSelectedVideoTopicId(firstTopic.id);
            setSelectedVideoIndex(0);
        }
    }, [activeTabType, imageTopics, selectedVideoTopicId]);
    useEffect(() => {
        const loadDemoTabs = async () => {
            const { data, error } = await supabase
                .from("demo_tabs")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("DEMO TABS ERROR:", error);
                return;
            }

            setDemoTabs(data || []);

            if (data && data.length > 0) {
                setActiveDemoTab(data[0].id);
            }
        };

        loadDemoTabs();
    }, []);
    useEffect(() => {
        if (!classStartTime) {
            setElapsedSeconds(0);
            return;
        }

        const updateTimer = () => {
            setElapsedSeconds(
                Math.floor((Date.now() - classStartTime) / 1000)
            );
        };

        updateTimer();

        const timer = window.setInterval(updateTimer, 1000);

        return () => window.clearInterval(timer);
    }, [classStartTime]);

    const formatElapsedTime = (seconds: number) => {
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${totalMinutes} : ${String(remainingSeconds).padStart(2, "0")} minutes`;
    };
    useEffect(() => {
        if (activeTabType !== "course") return;

        const courseName = courses.find(
            (course: any) => course.id === activeCourseId
        )?.name;

        if (courseName !== "MCQ") {
            setMcqQuestions([]);
            return;
        }

        const topicId = selectedTopics[0];

        if (!topicId) {
            setMcqQuestions([]);
            return;
        }

        const loadMCQQuestions = async () => {
            const { data, error } = await supabase
                .from("mcq_questions")
                .select(`
                id,
                topic_id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                order_no
            `)
                .eq("topic_id", topicId)
                .order("order_no", {
                    ascending: true
                });

            if (error) {
                console.error(
                    "DEMO MCQ ERROR:",
                    error
                );
                setMcqQuestions([]);
                return;
            }

            setMcqQuestions(data || []);
            setSelectedMCQIndex(0);
        };

        loadMCQQuestions();
    }, [
        activeTabType,
        activeCourseId,
        selectedTopics,
        courses
    ]);

    useEffect(() => {
        const loadReactionMemes = async () => {
            const { data, error } = await supabase
                .from("reaction_memes")
                .select(`
                id,
                name,
                media_type,
                image_path,
                video_path,
                sound_path,
                thumbnail_path,
                sort_order
            `)
                .order("sort_order", {
                    ascending: true
                });

            if (error) {
                console.error(
                    "DEMO REACTION MEMES ERROR:",
                    error
                );
                return;
            }

            setReactionMemes(data || []);
        };

        loadReactionMemes();
    }, []);
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

    /* =========================================================
   LOAD COURSE DAYS + TOPICS FOR DEMO
========================================================= */

    useEffect(() => {
        const loadDemoCourseData = async () => {
            if (
                activeTabType !== "course" ||
                !activeCourseId
            ) {
                setDemoDays([]);
                setDemoTopics([]);
                return;
            }

            // CURRENT COURSE DAYS
            const { data: courseDays, error: daysError } =
                await supabase
                    .from("days")
                    .select("id, course_id, day_number, title")
                    .eq("course_id", activeCourseId)
                    .order("day_number", {
                        ascending: true
                    });

            if (daysError) {
                console.error(
                    "DEMO COURSE DAYS ERROR:",
                    daysError
                );
                setDemoDays([]);
                setDemoTopics([]);
                return;
            }

            const loadedDays = courseDays || [];

            setDemoDays(loadedDays);

            const dayIds = loadedDays.map(
                (day: any) => day.id
            );

            if (dayIds.length === 0) {
                setDemoTopics([]);
                return;
            }

            // CURRENT COURSE TOPICS
            const { data: courseTopics, error: topicsError } =
                await supabase
                    .from("topics")
                    .select("*")
                    .in("day_id", dayIds)
                    .order("order_no", {
                        ascending: true
                    });

            if (topicsError) {
                console.error(
                    "DEMO COURSE TOPICS ERROR:",
                    topicsError
                );
                setDemoTopics([]);
                return;
            }

            // SENTENCE COUNTS
            const topicIds = (courseTopics || []).map(
                (topic: any) => topic.id
            );

            let sentenceCounts: any[] = [];

            if (topicIds.length > 0) {
                const { data: vocabularyData, error: vocabularyError } =
                    await supabase
                        .from("vocabulary")
                        .select("topic_id")
                        .in("topic_id", topicIds);

                if (vocabularyError) {
                    console.error(
                        "DEMO VOCABULARY COUNT ERROR:",
                        vocabularyError
                    );
                }

                sentenceCounts = vocabularyData || [];
            }

            const topicsWithCount = (courseTopics || []).map(
                (topic: any) => ({
                    ...topic,
                    sentence_count: sentenceCounts.filter(
                        (item: any) =>
                            item.topic_id === topic.id
                    ).length
                })
            );

            if (topicsError) {
                console.error(
                    "DEMO COURSE TOPICS ERROR:",
                    topicsError
                );
                setDemoTopics([]);
                return;
            }

            setDemoTopics(topicsWithCount);
        };

        loadDemoCourseData();
    }, [
        activeTabType,
        activeCourseId
    ]);
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
        <>
            <style jsx>{`
            @keyframes demoClassTicker {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-50%);
    }
}
        `}</style>

            <div className="w-full h-full flex flex-col gap-1 p-1 bg-gray-50 overflow-hidden">


                {/* CLASS NOTICE + DEMO TABS */}
                <div className="shrink-0">
                    {/* DEMO TABS */}
                    <div
                        className="relative px-1 py-0 overflow-hidden"
                        onMouseEnter={() => setTabsHovered(true)}
                        onMouseLeave={() => setTabsHovered(false)}
                    >

                        {/* LATE JOIN NOTICE — BLUE STRIP */}
                        {classStartTime && !tabsHovered && (
                            <div className="absolute inset-0 z-30 flex items-center bg-blue-600 text-xs text-white whitespace-nowrap pointer-events-none overflow-hidden">
                                <div
                                    className="flex w-max whitespace-nowrap"
                                    style={{
                                        animation: "demoClassTicker 75s linear infinite",
                                    }}
                                >
                                    <span className="inline-block whitespace-nowrap pr-8 text-sm">
                                        ⚠️ क्लास शुरू हुए{" "}
                                        <span className="text-yellow-300 mx-1">
                                            {formatElapsedTime(elapsedSeconds)}
                                        </span>
                                        हो चुके हैं। जो देर से जुड़े हैं, हो सकता है कुछ बातें छुट जाने के कारण उन्‍हें लगे कि चल क्‍या रहा है, आप क्‍लास में बने रहें... दोबारा भी डेमो ले सकते हैं। यह बेसिक कोर्स की डेमो क्‍लास है, यदि आपको एडवांस्‍ड कोर्स की जरूरत है, तो वह भी क्‍लास मिल जाएगी।
                                    </span>

                                    <span className="inline-block whitespace-nowrap pr-8 text-sm">
                                        ⚠️ क्लास शुरू हुए{" "}
                                        <span className="text-yellow-300 mx-1">
                                            {formatElapsedTime(elapsedSeconds)}
                                        </span>
                                        हो चुके हैं। जो देर से जुड़े हैं, हो सकता है कुछ बातें छुट जाने के कारण उन्‍हें लगे कि चल क्‍या रहा है, आप क्‍लास में बने रहें... दोबारा भी डेमो ले सकते हैं। यह बेसिक कोर्स की डेमो क्‍लास है, यदि आपको एडवांस्‍ड कोर्स की जरूरत है, तो वह भी क्‍लास मिल जाएगी।
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 min-w-max items-center">

                            {demoTabs.map((tab: any) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveDemoTab(tab.id)}
                                    className={`text-xs font-semibold whitespace-nowrap cursor-pointer ${activeDemoTab === tab.id
                                        ? "text-blue-600"
                                        : "text-gray-700 hover:text-blue-600"
                                        }`}
                                >
                                    {tab.tab_name}
                                </button>
                            ))}

                            {/* CLASS ON / OFF TOGGLE */}
                            <button
                                onClick={() => {
                                    if (classStartTime) {
                                        setClassStartTime(null);
                                        setElapsedSeconds(0);
                                        setTabsHovered(false);
                                    } else {
                                        setClassStartTime(Date.now());
                                        setElapsedSeconds(0);
                                    }
                                }}
                                className={`text-xs font-bold text-white px-2 py-1 rounded whitespace-nowrap ${classStartTime
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {classStartTime ? "■ Demo OFF" : "▶ Demo ON"}
                            </button>

                        </div>
                    </div>
                </div>

                {/* DEMO CONTENT */}
                <div className="flex-1 min-h-0 flex gap-1 overflow-hidden">
                    {/* BOARD */}
                    {activeTabType === "board" && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <WhiteBoard />
                        </div>
                    )}

                    {/* IMAGES */}
                    {activeTabType === "images" && (
                        <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">

                            {/* IMAGE TOPICS */}
                            <div className="shrink-0 px-1 py-0 overflow-x-auto">
                                <div className="flex gap-4 min-w-max">
                                    {imageTopics
                                        .filter(
                                            (topic: any) =>
                                                topic.media_type === "image"
                                        )
                                        .map((topic: any) => {
                                            const active =
                                                selectedImageTopicId === topic.id;

                                            return (
                                                <button
                                                    key={topic.id}
                                                    onClick={() => {
                                                        setSelectedImageTopicId(topic.id);
                                                        setSelectedImageIndex(0);
                                                    }}
                                                    className={`text-xs font-semibold whitespace-nowrap cursor-pointer ${active
                                                        ? "text-blue-600"
                                                        : "text-gray-700 hover:text-blue-600"
                                                        }`}
                                                >
                                                    {topic.name}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* IMAGE CAROUSEL */}
                            <div
                                className="flex-1 min-h-0 flex items-center justify-center px-1 overflow-hidden"
                            >

                                {(() => {

                                    const selectedTopic =
                                        imageTopics.find(
                                            (topic: any) =>
                                                topic.id === selectedImageTopicId
                                        );

                                    const images =
                                        selectedTopic?.images || [];

                                    if (!selectedTopic) {
                                        return (
                                            <div className="text-gray-400 text-sm">
                                                Select a topic
                                            </div>
                                        );
                                    }

                                    if (images.length === 0) {
                                        return (
                                            <div className="text-gray-400 text-sm">
                                                No images in this topic
                                            </div>
                                        );
                                    }

                                    const getImageUrl = (image: any) =>
                                        supabase.storage
                                            .from("images")
                                            .getPublicUrl(
                                                image.file_path
                                            ).data.publicUrl;

                                    const currentIndex =
                                        selectedImageIndex % images.length;

                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">

                                            {images.map((image: any, i: number) => {

                                                let position = "hidden";

                                                if (i === currentIndex) {
                                                    position = "center";
                                                } else if (
                                                    i ===
                                                    (currentIndex - 1 + images.length) %
                                                    images.length
                                                ) {
                                                    position = "left";
                                                } else if (
                                                    i ===
                                                    (currentIndex + 1) %
                                                    images.length
                                                ) {
                                                    position = "right";
                                                }

                                                return (
                                                    <div
                                                        key={image.id}
                                                        onClick={() => {

                                                            if (position === "left") {
                                                                setSelectedImageIndex(
                                                                    (currentIndex - 1 + images.length) %
                                                                    images.length
                                                                );
                                                            }

                                                            if (position === "right") {
                                                                setSelectedImageIndex(
                                                                    (currentIndex + 1) %
                                                                    images.length
                                                                );
                                                            }

                                                        }}
                                                        className={`
                                absolute
                                transition-all
                                duration-500
                                ease-in-out
                                ${position === "center"
                                                                ? "scale-100 opacity-100 z-20 w-[56%] h-[96%]"
                                                                : position === "left"
                                                                    ? "-translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                    : position === "right"
                                                                        ? "translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                        : "opacity-0 scale-75 pointer-events-none"
                                                            }
                            `}
                                                    >
                                                        <img
                                                            src={getImageUrl(image)}
                                                            alt={image.name}
                                                            className="w-full h-full object-contain rounded-2xl"
                                                        />

                                                        {position === "center" && (
                                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/65 text-white px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
                                                                {image.name}
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            })}

                                            {/* LEFT ARROW */}
                                            {images.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        setSelectedImageIndex(
                                                            (currentIndex - 1 + images.length) %
                                                            images.length
                                                        )
                                                    }
                                                    className="absolute left-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                >
                                                    ‹
                                                </button>
                                            )}

                                            {/* RIGHT ARROW */}
                                            {images.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        setSelectedImageIndex(
                                                            (currentIndex + 1) %
                                                            images.length
                                                        )
                                                    }
                                                    className="absolute right-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                >
                                                    ›
                                                </button>
                                            )}

                                        </div>
                                    );

                                })()}

                            </div>
                        </div>
                    )
                    }

                    {/* VIDEOS */}
                    {activeTabType === "videos" && (
                        <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">

                            {/* VIDEO TOPICS */}
                            <div className="shrink-0 px-1 py-0 overflow-x-auto">
                                <div className="flex gap-4 min-w-max">

                                    {imageTopics
                                        .filter(
                                            (topic: any) =>
                                                topic.media_type === "video"
                                        )
                                        .map((topic: any) => {

                                            const active =
                                                selectedVideoTopicId === topic.id;

                                            return (
                                                <button
                                                    key={topic.id}
                                                    onClick={() => {
                                                        setSelectedVideoTopicId(topic.id);
                                                        setSelectedVideoIndex(0);
                                                    }}
                                                    className={`text-xs font-semibold whitespace-nowrap cursor-pointer ${active
                                                        ? "text-red-600"
                                                        : "text-gray-700 hover:text-red-600"
                                                        }`}
                                                >
                                                    {topic.name}
                                                </button>
                                            );
                                        })}

                                </div>
                            </div>

                            {/* VIDEO CAROUSEL */}
                            <div className="flex-1 min-h-0 flex items-center justify-center px-1 overflow-hidden">

                                {(() => {

                                    const selectedTopic =
                                        imageTopics.find(
                                            (topic: any) =>
                                                topic.id === selectedVideoTopicId
                                        );

                                    const videos =
                                        selectedTopic?.videos || [];

                                    if (!selectedTopic) {
                                        return (
                                            <div className="text-gray-400 text-sm">
                                                Select a topic
                                            </div>
                                        );
                                    }

                                    if (videos.length === 0) {
                                        return (
                                            <div className="text-gray-400 text-sm">
                                                No videos in this topic
                                            </div>
                                        );
                                    }

                                    const currentIndex =
                                        selectedVideoIndex % videos.length;

                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">

                                            {videos.map((video: any, i: number) => {

                                                let position = "hidden";

                                                if (i === currentIndex) {
                                                    position = "center";
                                                } else if (
                                                    i ===
                                                    (currentIndex - 1 + videos.length) %
                                                    videos.length
                                                ) {
                                                    position = "left";
                                                } else if (
                                                    i ===
                                                    (currentIndex + 1) %
                                                    videos.length
                                                ) {
                                                    position = "right";
                                                }

                                                const getYouTubeId = (url: string) => {
                                                    if (!url) return "";

                                                    const match =
                                                        url.match(
                                                            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
                                                        );

                                                    return match?.[1] || "";
                                                };

                                                const videoId =
                                                    getYouTubeId(video.video_url);

                                                const thumbnail =
                                                    videoId
                                                        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                                        : "";

                                                return (
                                                    <div
                                                        key={video.id}
                                                        onClick={() => {

                                                            if (position === "left") {
                                                                setSelectedVideoIndex(
                                                                    (currentIndex - 1 + videos.length) %
                                                                    videos.length
                                                                );
                                                            }

                                                            if (position === "right") {
                                                                setSelectedVideoIndex(
                                                                    (currentIndex + 1) %
                                                                    videos.length
                                                                );
                                                            }

                                                        }}
                                                        className={`
                                        absolute
                                        transition-all
                                        duration-500
                                        ease-in-out
                                        ${position === "center"
                                                                ? "scale-100 opacity-100 z-20 w-[56%] h-[96%]"
                                                                : position === "left"
                                                                    ? "-translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                    : position === "right"
                                                                        ? "translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                        : "opacity-0 scale-75 pointer-events-none"
                                                            }
                                    `}
                                                    >

                                                        {position === "center" ? (
                                                            <iframe
                                                                src={
                                                                    videoId
                                                                        ? `https://www.youtube.com/embed/${videoId}`
                                                                        : video.video_url
                                                                }
                                                                title={video.name}
                                                                className="w-full h-full rounded-2xl"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        ) : (
                                                            <div className="relative w-full h-full">

                                                                {thumbnail ? (
                                                                    <img
                                                                        src={thumbnail}
                                                                        alt={video.name}
                                                                        className="w-full h-full object-cover rounded-2xl"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                                                                        Video
                                                                    </div>
                                                                )}

                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center text-lg">
                                                                        ▶
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        )}

                                                        {position === "center" && (
                                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/65 text-white px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
                                                                {video.name}
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            })}

                                            {/* LEFT ARROW */}
                                            {videos.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        setSelectedVideoIndex(
                                                            (currentIndex - 1 + videos.length) %
                                                            videos.length
                                                        )
                                                    }
                                                    className="absolute left-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                >
                                                    ‹
                                                </button>
                                            )}

                                            {/* RIGHT ARROW */}
                                            {videos.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        setSelectedVideoIndex(
                                                            (currentIndex + 1) %
                                                            videos.length
                                                        )
                                                    }
                                                    className="absolute right-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                >
                                                    ›
                                                </button>
                                            )}

                                        </div>
                                    );

                                })()}

                            </div>

                        </div>
                    )}

                    {/* GRAMMAR TABLES */}
                    {
                        activeTabType === "grammar_tables" && (
                            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                                <div className="bg-amber-100 px-3 py-2 font-bold text-sm">
                                    Grammar Tables
                                </div>

                                <div className="flex-1 overflow-y-auto p-2">

                                    {grammarTopics.map(
                                        (topic: any) => {

                                            const expanded =
                                                expandedGrammar.includes(topic.id);

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
                                                            {expanded ? "−" : "+"}
                                                        </span>

                                                    </div>

                                                    {expanded && (
                                                        <div className="ml-3 flex flex-col gap-1">

                                                            {topic.grammar_tables?.map(
                                                                (table: any) => (
                                                                    <div
                                                                        key={table.id}
                                                                        onClick={() =>
                                                                            handleGrammarClick(
                                                                                table.id
                                                                            )
                                                                        }
                                                                        className={`px-2 py-1 text-xs cursor-pointer rounded ${selectedGrammarTableId === table.id
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
                        )
                    }
                    {/* MCQ */}
                    {activeTabType === "course" &&
                        activeCourseName === "MCQ" && (
                            <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">

                                {/* MCQ TOPICS */}
                                <div className="shrink-0 px-1 py-0 overflow-x-auto">
                                    <div className="flex gap-4 min-w-max">

                                        {demoTopics.map((topic: any) => (
                                            <button
                                                key={topic.id}
                                                onClick={() => {
                                                    setSelectedTopics([topic.id]);
                                                    setSelectedMCQIndex(0);
                                                }}
                                                className={`text-xs font-semibold whitespace-nowrap cursor-pointer ${selectedTopics.includes(topic.id)
                                                    ? "text-green-600"
                                                    : "text-gray-700 hover:text-green-600"
                                                    }`}
                                            >
                                                {topic.topic_name || topic.name}
                                            </button>
                                        ))}

                                    </div>
                                </div>

                                {/* MCQ CAROUSEL */}
                                <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">

                                    {mcqQuestions.length === 0 ? (
                                        <div className="text-gray-400 text-sm">
                                            Select a topic
                                        </div>
                                    ) : (() => {

                                        const currentIndex =
                                            selectedMCQIndex % mcqQuestions.length;

                                        return (
                                            <div className="relative w-full h-full flex items-center justify-center">

                                                {mcqQuestions.map(
                                                    (mcq: any, i: number) => {

                                                        let position = "hidden";

                                                        if (i === currentIndex) {
                                                            position = "center";
                                                        } else if (
                                                            i ===
                                                            (
                                                                currentIndex -
                                                                1 +
                                                                mcqQuestions.length
                                                            ) %
                                                            mcqQuestions.length
                                                        ) {
                                                            position = "left";
                                                        } else if (
                                                            i ===
                                                            (
                                                                currentIndex + 1
                                                            ) %
                                                            mcqQuestions.length
                                                        ) {
                                                            position = "right";
                                                        }

                                                        return (
                                                            <div
                                                                key={mcq.id}
                                                                onClick={() => {

                                                                    if (position === "left") {
                                                                        setSelectedMCQIndex(
                                                                            (
                                                                                currentIndex -
                                                                                1 +
                                                                                mcqQuestions.length
                                                                            ) %
                                                                            mcqQuestions.length
                                                                        );
                                                                    }

                                                                    if (position === "right") {
                                                                        setSelectedMCQIndex(
                                                                            (
                                                                                currentIndex + 1
                                                                            ) %
                                                                            mcqQuestions.length
                                                                        );
                                                                    }

                                                                }}
                                                                className={`
                                                absolute
                                                transition-all
                                                duration-500
                                                ease-in-out
                                                ${position === "center"
                                                                        ? "scale-100 opacity-100 z-20 w-[58%] h-[90%]"
                                                                        : position === "left"
                                                                            ? "-translate-x-[28vw] scale-90 opacity-30 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                            : position === "right"
                                                                                ? "translate-x-[28vw] scale-90 opacity-30 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                                : "opacity-0 scale-75 pointer-events-none"
                                                                    }
                                            `}
                                                            >
                                                                <div className="w-full h-full flex flex-col justify-center bg-white border border-gray-200 rounded-2xl shadow-lg px-8 py-6">

                                                                    <div className="text-center mb-6">

                                                                        <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
                                                                            Question {currentIndex + 1}
                                                                        </div>

                                                                        <div className="text-xl font-bold text-gray-800 leading-relaxed">
                                                                            {mcq.question}
                                                                        </div>

                                                                    </div>

                                                                    <div className="flex flex-col gap-3 w-full">

                                                                        {[
                                                                            {
                                                                                key: "A",
                                                                                text: mcq.option_a
                                                                            },
                                                                            {
                                                                                key: "B",
                                                                                text: mcq.option_b
                                                                            },
                                                                            {
                                                                                key: "C",
                                                                                text: mcq.option_c
                                                                            },
                                                                            {
                                                                                key: "D",
                                                                                text: mcq.option_d
                                                                            }
                                                                        ].map((option) => (
                                                                            <div
                                                                                key={option.key}
                                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                                                                            >
                                                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 font-semibold text-gray-600">
                                                                                    {option.key}
                                                                                </span>

                                                                                {option.text}
                                                                            </div>
                                                                        ))}

                                                                    </div>

                                                                    <div className="text-center text-xs text-gray-400 mt-4">
                                                                        {currentIndex + 1}
                                                                        {" / "}
                                                                        {mcqQuestions.length}
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}

                                                {mcqQuestions.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            setSelectedMCQIndex(
                                                                (
                                                                    currentIndex -
                                                                    1 +
                                                                    mcqQuestions.length
                                                                ) %
                                                                mcqQuestions.length
                                                            )
                                                        }
                                                        className="absolute left-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                    >
                                                        ‹
                                                    </button>
                                                )}

                                                {mcqQuestions.length > 1 && (
                                                    <button
                                                        onClick={() =>
                                                            setSelectedMCQIndex(
                                                                (
                                                                    currentIndex + 1
                                                                ) %
                                                                mcqQuestions.length
                                                            )
                                                        }
                                                        className="absolute right-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                                    >
                                                        ›
                                                    </button>
                                                )}

                                            </div>
                                        );
                                    })()}

                                </div>

                            </div>
                        )}
                    {/* COURSE */}
                    {activeTabType === "course" &&
                        activeCourseName !== "MCQ" && (
                            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                                <div className="flex-1 overflow-y-auto p-2">

                                    {(() => {
                                        const courseDays = demoDays
                                            .filter(
                                                (day: any) =>
                                                    day.course_id === activeCourseId
                                            )
                                            .sort(
                                                (a: any, b: any) =>
                                                    (a.day_number ?? 0) -
                                                    (b.day_number ?? 0)
                                            );

                                        if (courseDays.length === 0) {
                                            return (
                                                <div className="text-gray-400 text-sm text-center mt-4">
                                                    No days
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-4 gap-x-4">

                                                {Array.from({ length: 4 }, (_, columnIndex) => {
                                                    const columnDays = courseDays.slice(
                                                        columnIndex * 10,
                                                        columnIndex * 10 + 10
                                                    );

                                                    return (
                                                        <div
                                                            key={columnIndex}
                                                            className="flex flex-col gap-1"
                                                        >

                                                            {columnDays.map((day: any) => {

                                                                const dayTopics = demoTopics
                                                                    .filter(
                                                                        (topic: any) =>
                                                                            topic.day_id === day.id
                                                                    )
                                                                    .sort(
                                                                        (a: any, b: any) =>
                                                                            (a.order_no ?? 0) -
                                                                            (b.order_no ?? 0)
                                                                    );

                                                                const expanded =
                                                                    expandedDays.includes(day.id);

                                                                return (
                                                                    <div
                                                                        key={day.id}
                                                                    >

                                                                        {/* DAY */}
                                                                        <div
                                                                            onClick={() =>
                                                                                setExpandedDays((prev) =>
                                                                                    prev.includes(day.id)
                                                                                        ? prev.filter(
                                                                                            (id) =>
                                                                                                id !== day.id
                                                                                        )
                                                                                        : [
                                                                                            ...prev,
                                                                                            day.id
                                                                                        ]
                                                                                )
                                                                            }
                                                                            className="flex justify-between items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs rounded"
                                                                        >

                                                                            <span className="truncate">
                                                                                {day.day_number != null
                                                                                    ? `${String(
                                                                                        day.day_number
                                                                                    ).padStart(2, "0")} - `
                                                                                    : ""}
                                                                                {day.title}
                                                                            </span>

                                                                            <span>
                                                                                {expanded ? "−" : "+"}
                                                                            </span>

                                                                        </div>

                                                                        {/* TOPICS — SINGLE COLUMN */}
                                                                        {expanded && (
                                                                            <div className="ml-3 flex flex-col gap-1">

                                                                                {dayTopics.length === 0 ? (
                                                                                    <div className="px-2 py-1 text-xs text-gray-400">
                                                                                        No topics
                                                                                    </div>
                                                                                ) : (
                                                                                    dayTopics.map(
                                                                                        (topic: any) => (
                                                                                            <div
                                                                                                key={topic.id}
                                                                                                onClick={() =>
                                                                                                    setSelectedTopics([
                                                                                                        topic.id
                                                                                                    ])
                                                                                                }
                                                                                                className={`px-2 py-1 text-xs cursor-pointer rounded flex items-center justify-between gap-1 ${selectedTopics.includes(
                                                                                                    topic.id
                                                                                                )
                                                                                                    ? "bg-green-100 text-green-700 font-semibold"
                                                                                                    : "hover:bg-green-50"
                                                                                                    }`}
                                                                                            >

                                                                                                <span className="truncate">
                                                                                                    {topic.topic_name ||
                                                                                                        topic.name}
                                                                                                </span>

                                                                                                <span className="text-[10px] text-gray-500 shrink-0">
                                                                                                    (
                                                                                                    {
                                                                                                        topic.sentence_count ??
                                                                                                        0
                                                                                                    }
                                                                                                    )
                                                                                                </span>

                                                                                            </div>
                                                                                        )
                                                                                    )
                                                                                )}

                                                                            </div>
                                                                        )}

                                                                    </div>
                                                                );
                                                            })}

                                                        </div>
                                                    );
                                                })}

                                            </div>
                                        );
                                    })()}

                                </div>

                            </div>
                        )}
                    {/* REACTION MEMES */}
                    {activeTabType === "reaction_memes" && (
                        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

                            <div className="flex-1 min-h-0 flex items-center justify-center px-1 overflow-hidden">

                                {reactionMemes.length === 0 ? (
                                    <div className="text-gray-400 text-sm">
                                        No reaction memes
                                    </div>
                                ) : (

                                    <div className="relative w-full h-full flex items-center justify-center">

                                        {reactionMemes.map(
                                            (meme: any, i: number) => {

                                                let position = "hidden";

                                                if (
                                                    i === selectedReactionIndex
                                                ) {
                                                    position = "center";
                                                } else if (
                                                    i ===
                                                    (
                                                        selectedReactionIndex -
                                                        1 +
                                                        reactionMemes.length
                                                    ) %
                                                    reactionMemes.length
                                                ) {
                                                    position = "left";
                                                } else if (
                                                    i ===
                                                    (
                                                        selectedReactionIndex +
                                                        1
                                                    ) %
                                                    reactionMemes.length
                                                ) {
                                                    position = "right";
                                                }

                                                const getUrl = (
                                                    path: string
                                                ) =>
                                                    path
                                                        ? supabase.storage
                                                            .from("memes")
                                                            .getPublicUrl(path)
                                                            .data.publicUrl
                                                        : "";

                                                const mediaPath =
                                                    meme.media_type === "video"
                                                        ? meme.video_path
                                                        : meme.media_type === "audio"
                                                            ? meme.sound_path
                                                            : meme.image_path || meme.thumbnail_path;

                                                const mediaUrl =
                                                    getUrl(mediaPath);

                                                const thumbnailUrl =
                                                    getUrl(
                                                        meme.thumbnail_path ||
                                                        meme.image_path ||
                                                        mediaPath
                                                    );

                                                return (
                                                    <div
                                                        key={meme.id}
                                                        onClick={() => {

                                                            if (
                                                                position === "left"
                                                            ) {
                                                                setSelectedReactionIndex(
                                                                    (
                                                                        selectedReactionIndex -
                                                                        1 +
                                                                        reactionMemes.length
                                                                    ) %
                                                                    reactionMemes.length
                                                                );
                                                            }

                                                            if (
                                                                position === "right"
                                                            ) {
                                                                setSelectedReactionIndex(
                                                                    (
                                                                        selectedReactionIndex +
                                                                        1
                                                                    ) %
                                                                    reactionMemes.length
                                                                );
                                                            }

                                                        }}
                                                        className={`
                                        absolute
                                        transition-all
                                        duration-500
                                        ease-in-out
                                        ${position === "center"
                                                                ? "scale-100 opacity-100 z-20 w-[56%] h-[96%]"
                                                                : position === "left"
                                                                    ? "-translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                    : position === "right"
                                                                        ? "translate-x-[28vw] scale-90 opacity-40 z-10 w-[32%] h-[72%] cursor-pointer"
                                                                        : "opacity-0 scale-75 pointer-events-none"
                                                            }
                                    `}
                                                    >

                                                        {position === "center" &&
                                                            meme.media_type === "video" ? (
                                                            <video
                                                                src={mediaUrl}
                                                                controls
                                                                className="w-full h-full object-contain rounded-2xl"
                                                            />
                                                        ) : position === "center" &&
                                                            meme.media_type === "audio" ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-2xl">

                                                                <div className="text-6xl mb-6">
                                                                    🔊
                                                                </div>

                                                                <audio
                                                                    src={mediaUrl}
                                                                    controls
                                                                    className="w-[80%]"
                                                                />

                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={
                                                                    position === "center"
                                                                        ? mediaUrl
                                                                        : thumbnailUrl
                                                                }
                                                                alt={meme.name}
                                                                className="w-full h-full object-contain rounded-2xl"
                                                            />
                                                        )}

                                                        {position === "center" && (
                                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/65 text-white px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
                                                                {meme.name}
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            }
                                        )}

                                        {/* LEFT ARROW */}
                                        {reactionMemes.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    setSelectedReactionIndex(
                                                        (
                                                            selectedReactionIndex -
                                                            1 +
                                                            reactionMemes.length
                                                        ) %
                                                        reactionMemes.length
                                                    )
                                                }
                                                className="absolute left-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                            >
                                                ‹
                                            </button>
                                        )}

                                        {/* RIGHT ARROW */}
                                        {reactionMemes.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    setSelectedReactionIndex(
                                                        (
                                                            selectedReactionIndex +
                                                            1
                                                        ) %
                                                        reactionMemes.length
                                                    )
                                                }
                                                className="absolute right-1 z-30 w-9 h-9 rounded-full bg-white shadow-md text-gray-700 text-xl hover:bg-gray-100"
                                            >
                                                ›
                                            </button>
                                        )}

                                    </div>
                                )}

                            </div>

                        </div>
                    )}
                    {/* NO CHILD */}
                    {
                        ![
                            "board",
                            "images",
                            "videos",
                            "grammar_tables",
                            "course",
                            "reaction_memes"
                        ].includes(activeTabType) && (
                            <div className="flex-1 bg-white border rounded flex items-center justify-center">

                                <div className="text-center">

                                    <div className="text-lg font-semibold text-gray-700">
                                        {activeTab?.tab_name}
                                    </div>

                                    <div className="text-sm text-gray-400 mt-1">
                                        No child items
                                    </div>

                                </div>

                            </div>
                        )
                    }

                </div >
            </div >
        </>
    );
}