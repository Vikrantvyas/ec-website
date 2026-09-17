"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import MainBoard from "@/app/components/admin/english/MainBoard";
import Controls from "@/app/components/admin/english/Controls";

function TranslationPracticeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseName = searchParams.get("course") || "";

    const topicIds =
        searchParams.get("topics")?.split(",").filter(Boolean) || [];

    const [courseId, setCourseId] = useState("");
    const [days, setDays] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [sentences, setSentences] = useState<any[]>([]);

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const [showBoard, setShowBoard] = useState(false);
    const [showScore, setShowScore] = useState(false);
    const [showLeft, setShowLeft] = useState(true);
    const [showGrammar, setShowGrammar] = useState(false);
    const [showImages, setShowImages] = useState(false);

    const [selectedGrammarTableId, setSelectedGrammarTableId] =
        useState("");

    const [selectedImageId, setSelectedImageId] = useState("");

    const [highlightIndex, setHighlightIndex] = useState(-1);

    const [randomMode, setRandomMode] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const [layout] =
        useState<"horizontal" | "vertical">("horizontal");

    const [currentTime, setCurrentTime] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);
    const vocabRef = useRef<any>(null);

    const selectedCourseName = courseName.trim();

    const isGrammar =
        selectedCourseName.toLowerCase() === "grammar";

    const isConversation =
        selectedCourseName.toLowerCase() === "conversation";

    const isImageExplanation =
        selectedCourseName.toLowerCase() === "image explanation";

    // =========================================================
    // CLOCK
    // =========================================================

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

    // =========================================================
    // FETCH COURSE
    // =========================================================

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseName) return;

            const { data, error } = await supabase
                .from("english_courses")
                .select("id, name")
                .eq("name", courseName)
                .single();

            if (error) {
                console.error("COURSE ERROR:", error.message);
                return;
            }

            setCourseId(data?.id || "");
        };

        fetchCourse();
    }, [courseName]);

    // =========================================================
    // FETCH DAYS + TOPICS
    // =========================================================

    useEffect(() => {
        const fetchDaysTopics = async () => {
            if (!courseId) return;

            const { data: dayData, error: dayError } =
                await supabase
                    .from("days")
                    .select("*")
                    .eq("course_id", courseId)
                    .order("day_number");

            if (dayError) {
                console.error("DAYS ERROR:", dayError.message);
                return;
            }

            const loadedDays = dayData || [];

            setDays(loadedDays);


            const dayIds = loadedDays.map(
                (day: any) => day.id
            );

            if (dayIds.length === 0) {
                setTopics([]);
                setSelectedTopics([]);
                return;
            }

            const { data: topicData, error: topicError } =
                await supabase
                    .from("topics")
                    .select("*")
                    .in("day_id", dayIds)
                    .order("day_id")
                    .order("topic_name");

            if (topicError) {
                console.error(
                    "TOPICS ERROR:",
                    topicError.message
                );
                return;
            }

            const loadedTopics = topicData || [];

            setTopics(loadedTopics);

            // Use topics selected on the previous page.
            // If no topics are present in URL, use all topics.
            const initialTopics =
                topicIds.length > 0
                    ? loadedTopics
                        .filter((topic: any) =>
                            topicIds.includes(topic.id)
                        )
                        .map((topic: any) => topic.id)
                    : loadedTopics.map(
                        (topic: any) => topic.id
                    );

            setSelectedTopics(initialTopics);
            const initialDays =
                topicIds.length > 0
                    ? loadedDays
                        .filter((day: any) =>
                            loadedTopics.some(
                                (topic: any) =>
                                    initialTopics.includes(topic.id) &&
                                    topic.day_id === day.id
                            )
                        )
                        .map((day: any) => day.id)
                    : loadedDays.map((day: any) => day.id);

            setSelectedDays(initialDays);
        };

        fetchDaysTopics();
    }, [courseId]);

    // =========================================================
    // FETCH SENTENCES
    // =========================================================

    useEffect(() => {
        const fetchSentences = async () => {
            if (selectedTopics.length === 0) {
                setSentences([]);
                return;
            }

            // IMAGE EXPLANATION
            if (isImageExplanation) {
                const { data, error } = await supabase
                    .from("image_explanation_questions")
                    .select(
                        "id, topic_id, image_id, hindi_question, english_question, hindi_answer, english_answer, order_no"
                    )
                    .in("topic_id", selectedTopics)
                    .order("order_no", {
                        ascending: true,
                    });

                if (error) {
                    console.error(
                        "IMAGE EXPLANATION ERROR:",
                        error.message
                    );
                }

                setSentences(data || []);
                return;
            }

            // CONVERSATION
            if (isConversation) {
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
                    .in("topic_id", selectedTopics)
                    .order("topic_id")
                    .order("order_no");

                if (error) {
                    console.error(
                        "CONVERSATION ERROR:",
                        error.message
                    );
                }

                const sorted = (data || []).sort(
                    (a: any, b: any) => {
                        const indexA =
                            selectedTopics.indexOf(
                                a.topic_id
                            );

                        const indexB =
                            selectedTopics.indexOf(
                                b.topic_id
                            );

                        if (indexA === indexB) {
                            return (
                                (a.order_no ?? 0) -
                                (b.order_no ?? 0)
                            );
                        }

                        return indexA - indexB;
                    }
                );

                setSentences(sorted);
                return;
            }

            // NORMAL VOCABULARY
            const { data, error } = await supabase
                .from("vocabulary")
                .select("*")
                .in("topic_id", selectedTopics)
                .order("topic_id")
                .order("order_no");

            if (error) {
                console.error(
                    "VOCABULARY ERROR:",
                    error.message
                );
            }

            const sorted = (data || []).sort(
                (a: any, b: any) => {
                    const indexA =
                        selectedTopics.indexOf(
                            a.topic_id
                        );

                    const indexB =
                        selectedTopics.indexOf(
                            b.topic_id
                        );

                    if (indexA === indexB) {
                        return (
                            (a.order_no ?? 0) -
                            (b.order_no ?? 0)
                        );
                    }

                    return indexA - indexB;
                }
            );

            setSentences(sorted);
        };

        fetchSentences();
    }, [
        selectedTopics,
        isConversation,
        isImageExplanation,
    ]);

    // =========================================================
    // CONVERSATION / IMAGE EXPLANATION IMAGE
    // =========================================================

    const conversationDay =
        days.find((d: any) =>
            selectedTopics.some((topicId: string) =>
                topics.some(
                    (t: any) =>
                        t.id === topicId &&
                        t.day_id === d.id
                )
            )
        ) ||
        days.find((d: any) =>
            selectedDays.includes(d.id)
        );

    const conversationImageUrl =
        conversationDay?.conversation_image_url || "";
    // =========================================================
    // MAINBOARD DATA
    // =========================================================

    const [currentIndex, setCurrentIndex] = useState(-1);

    const visible: any[] = [];

    const leftCol: any[] = [];

    const rightCol: any[] = [];
    const nextSentence = () => {
        vocabRef.current?.next();

        setCurrentIndex((prev) =>
            prev < sentences.length - 1 ? prev + 1 : prev
        );
    };

    const prevSentence = () => {
        vocabRef.current?.prev();

        setCurrentIndex((prev) =>
            prev > -1 ? prev - 1 : prev
        );
    };

    const toggleShowAll = () => {
        setShowAll((prev) => !prev);
    };

    const prevTopic = () => {
        if (selectedTopics.length === 0) return;

        const currentTopicIndex = topics.findIndex(
            (topic: any) => topic.id === selectedTopics[0]
        );

        if (currentTopicIndex <= 0) return;

        setSelectedTopics([
            topics[currentTopicIndex - 1].id,
        ]);

        setCurrentIndex(-1);
        setShowAll(false);
    };

    const nextTopic = () => {
        if (selectedTopics.length === 0) return;

        const currentTopicIndex = topics.findIndex(
            (topic: any) => topic.id === selectedTopics[0]
        );

        if (
            currentTopicIndex < 0 ||
            currentTopicIndex >= topics.length - 1
        ) {
            return;
        }

        setSelectedTopics([
            topics[currentTopicIndex + 1].id,
        ]);

        setCurrentIndex(-1);
        setShowAll(false);
    };
    const handleNext = () => {
        vocabRef.current?.next();
    };

    const handlePrevious = () => {
        vocabRef.current?.prev();
    };

    const handleReset = () => {
        vocabRef.current?.reset();
    };

    const handleShowAll = () => {
        setShowAll((prev) => !prev);
    };

    const handleRandom = () => {
        setRandomMode((prev) => !prev);
    };

    // =========================================================
    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="fixed inset-0 z-40 bg-gray-100 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
                <div
                    style={{ width: "min(25cm, 100vw)" }}
                    className="flex flex-col"
                >

                    {/* MAIN BOARD */}
                    <div
                        className="bg-white border shadow overflow-hidden flex flex-col"
                        style={{
    width: "min(25cm, 100vw)",
    height: "min(11cm, calc(100vh - 140px))",
}}
                    >
                        <MainBoard
                            isGrammar={isGrammar}
                            showGrammar={showGrammar}
                            sentences={sentences}
                            visible={visible}
                            leftCol={leftCol}
                            rightCol={rightCol}
                            highlightIndex={highlightIndex}
                            setHighlightIndex={
                                setHighlightIndex
                            }
                            showBoard={false}
                            showScore={showScore}
                            showLeft={showLeft}
                            scrollRef={scrollRef}
                            vocabRef={vocabRef}
                            randomMode={randomMode}
                            showAll={showAll}
                            currentIndex={currentIndex}
                            selectedDays={selectedDays}
                            selectedTopics={selectedTopics}
                            setSelectedTopics={
                                setSelectedTopics
                            }
                            topics={topics}
                            layout={layout}
                            days={days}
                            currentTime=""
                            studentMode={true}
                            selectedGrammarTableId={
                                selectedGrammarTableId
                            }
                            setSelectedGrammarTableId={
                                setSelectedGrammarTableId
                            }
                            selectedImageId={selectedImageId}
                            setSelectedImageId={
                                setSelectedImageId
                            }
                            showImages={showImages}
                            isConversation={isConversation}
                            conversationImageUrl={
                                conversationImageUrl
                            }
                            isImageExplanation={
                                isImageExplanation
                            }
                        />
                    </div>

                    {/* CONTROLS - MAIN BOARD KE NICHE */}
                    <div className="relative flex justify-center mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                router.push(
                                    `/practice/translation?course=${encodeURIComponent(
                                        courseName
                                    )}&topics=${encodeURIComponent(
                                        topicIds.join(",")
                                    )}`
                                );
                            }}
                            className="absolute left-0 top-0 h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors"
                        >
                            ← Back
                        </button>

                        <Controls
                            
                            prevSentence={prevSentence}
                            nextSentence={nextSentence}
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
                            prevTopic={prevTopic}
                            nextTopic={nextTopic}
                            showScore={showScore}
                            setShowScore={setShowScore}
                            randomMode={randomMode}
                            setRandomMode={setRandomMode}
                            showLeft={showLeft}
                            setShowLeft={setShowLeft}
                            showGrammar={showGrammar}
                            setShowGrammar={setShowGrammar}
                            showImages={showImages}
                            setShowImages={setShowImages}
                            layout={layout}
                            setLayout={() => { }}
                            studentMode={true}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function TranslationPracticePage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Loading...
                </div>
            }
        >
            <TranslationPracticeContent />
        </Suspense>
    );
}