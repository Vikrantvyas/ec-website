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
    const [demoTabs, setDemoTabs] = useState<any[]>([]);
    const [activeDemoTab, setActiveDemoTab] = useState<string>("");
    const [selectedImageTopicId, setSelectedImageTopicId] = useState<string>("");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [selectedVideoTopicId, setSelectedVideoTopicId] = useState<string>("");
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
    const [reactionMemes, setReactionMemes] = useState<any[]>([]);
    const [selectedReactionIndex, setSelectedReactionIndex] = useState(0);
    const activeTab = demoTabs.find(
        (tab: any) => tab.id === activeDemoTab
    );
    const activeTabType = activeTab?.tab_type || "";

    const activeCourseId =
        activeTabType === "course"
            ? activeTab?.tab_key?.replace("course:", "")
            : "";
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
                .order("sort_order", { ascending: true });

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
        <>

            <div className="w-full h-full flex flex-col gap-2 p-2 bg-gray-50 overflow-hidden">

                {/* DEMO TABS */}
                <div className="shrink-0 bg-white px-1 py-0.5 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {demoTabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveDemoTab(tab.id)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${activeDemoTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.tab_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DEMO CONTENT */}
                <div className="flex-1 min-h-0 flex gap-1 overflow-hidden">

                    {/* IMAGES */}
                    {activeTabType === "images" && (
                        <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">

                            {/* IMAGE TOPICS */}
                            <div className="shrink-0 border-b px-1 py-1 overflow-x-auto">
                                <div className="flex gap-2 min-w-max">

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
                                                    className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${active
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                            <div className="shrink-0 px-1 py-0.5 overflow-x-auto">
                                <div className="flex gap-2 min-w-max">

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
                                                    className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${active
                                                        ? "bg-red-600 text-white"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

                    {/* COURSE */}
                    {
                        activeTabType === "course" && (
                            <div className="flex-1 min-w-0 bg-white border rounded flex flex-col overflow-hidden">

                                <div className="bg-green-100 px-3 py-2 font-bold text-sm">
                                    {activeTab?.tab_name}
                                </div>

                                <div className="flex-1 overflow-y-auto p-2">

                                    {courses
                                        .filter(
                                            (course: any) =>
                                                course.id === activeCourseId
                                        )
                                        .map((course: any) => {

                                            const courseDays =
                                                days.filter(
                                                    (day: any) =>
                                                        day.course_id === course.id
                                                );

                                            return (
                                                <div
                                                    key={course.id}
                                                    className="w-full"
                                                >

                                                    <div
                                                        onClick={() =>
                                                            handleCourseClick(
                                                                course.id
                                                            )
                                                        }
                                                        className="flex justify-between items-center px-2 py-1.5 cursor-pointer rounded text-xs bg-green-200 font-semibold"
                                                    >

                                                        <span className="truncate">
                                                            {course.name}
                                                        </span>

                                                        <span>−</span>

                                                    </div>

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
                                                                            topic.day_id ===
                                                                            day.id
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={day.id}
                                                                        className="mt-1"
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
                                                                                                        topic.vocabulary?.[0]?.count ? (
                                                                                                        <span className="shrink-0">
                                                                                                            (
                                                                                                            {topic.sentence_count ??
                                                                                                                topic.vocabulary?.[0]?.count ??
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

                                                </div>
                                            );
                                        })}

                                </div>

                            </div>
                        )
                    }
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