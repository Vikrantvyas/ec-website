"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const shuffleArray = (arr: any[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
};

function TranslationPracticeContent() {
    const searchParams = useSearchParams();

    const topicIds =
        searchParams.get("topics")?.split(",").filter(Boolean) || [];
    const courseName = searchParams.get("course") || "";

    const isConversation =
        courseName.trim().toLowerCase() === "conversation";

    const [sentences, setSentences] = useState<any[]>([]);
    const [topicNames, setTopicNames] = useState<string[]>([]);
    const [list, setList] = useState<any[]>([]);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showEnglish, setShowEnglish] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);

    const [showAll, setShowAll] = useState(false);
    const [randomMode, setRandomMode] = useState(false);

    const [loading, setLoading] = useState(true);
    const sentenceAreaRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [conversationStep, setConversationStep] = useState(-1);
    const [conversationImageUrl, setConversationImageUrl] =
        useState("");
    const [conversationMobileImageUrl, setConversationMobileImageUrl] = useState("");

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
    // FETCH SENTENCES
    // =========================================================

    useEffect(() => {
        const fetchSentences = async () => {
            if (topicIds.length === 0) {
                setSentences([]);
                setList([]);
                setCurrentIndex(-1);
                setShowEnglish(false);
                setRevealedAnswers([]);
                setLoading(false);
                setConversationStep(-1);
                return;
            }

            setLoading(true);
            const { data: topicData, error: topicError } = await supabase
                .from("topics")
                .select("id, topic_name")
                .in("id", topicIds);

            if (topicError) {
                console.error("TOPIC NAMES ERROR:", topicError.message);
            }

            setTopicNames(
                topicIds.map(
                    (id) => topicData?.find((topic: any) => topic.id === id)?.topic_name || ""
                ).filter(Boolean)
            );



            const { data, error } = isConversation
                ? await supabase
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
                    .in("topic_id", topicIds)
                    .order("topic_id")
                    .order("order_no")
                : await supabase
                    .from("vocabulary")
                    .select("*")
                    .in("topic_id", topicIds)
                    .order("topic_id")
                    .order("order_no");

            // Selected Topics जिस order में आए हैं,
            // उसी order में sentences रखेंगे।
            const sorted = (data || []).sort((a: any, b: any) => {
                const indexA = topicIds.indexOf(a.topic_id);
                const indexB = topicIds.indexOf(b.topic_id);

                if (indexA === indexB) {
                    return (a.order_no ?? 0) - (b.order_no ?? 0);
                }

                return indexA - indexB;
            });

            const practiceItems = isConversation
                ? sorted.map((item: any) => ({
                    ...item,

                    hindi1: item.question_text || "",
                    english1: item.question_english || "",

                    hindi2: item.question_hindi_2 || "",
                    english2: item.question_english_2 || "",

                    hindi3: item.answer_hindi_3 || "",
                    english3: item.answer_english_3 || "",

                    hindi4: item.answer_hindi_4 || "",
                    english4: item.answer_english_4 || "",
                }))
                : sorted;

            setSentences(practiceItems);
            if (isConversation) {
                const { data: topicData, error: topicError } = await supabase
                    .from("topics")
                    .select("id, day_id")
                    .in("id", topicIds);

                if (topicError) {
                    console.error(
                        "CONVERSATION TOPICS ERROR:",
                        topicError.message
                    );
                }

                const dayId = topicData?.[0]?.day_id;

                if (dayId) {
                    const { data: dayData, error: dayError } = await supabase
                        .from("days")
                        .select("conversation_image_url, conversation_mobile_image_url")
                        .eq("id", dayId)
                        .single();

                    if (dayError) {
                        console.error(
                            "CONVERSATION IMAGE ERROR:",
                            dayError.message
                        );
                    }

                    setConversationImageUrl(
                        dayData?.conversation_image_url || ""
                    );

                    setConversationMobileImageUrl(
                        dayData?.conversation_mobile_image_url || ""
                    );
                } else {
                    setConversationImageUrl("");
                }
            }
            const newList = randomMode
                ? shuffleArray(practiceItems)
                : practiceItems;

            setList(newList);

            setCurrentIndex(-1);
            setShowEnglish(false);
            setRevealedAnswers([]);
            setShowAll(false);

            setLoading(false);
        };

        fetchSentences();
    }, [searchParams]);

    // =========================================================
    // RANDOM / NORMAL
    // =========================================================

    useEffect(() => {
        if (sentences.length === 0) {
            setList([]);
            return;
        }

        const newList = randomMode
            ? shuffleArray(sentences)
            : sentences;

        setList(newList);

        setCurrentIndex(-1);
        setShowEnglish(false);
        setRevealedAnswers([]);
        setShowAll(false);
    }, [randomMode, sentences]);

    // =========================================================
    // NEXT
    // =========================================================

    const nextSentence = () => {
        if (showAll) return;
        if (list.length === 0) return;

        // =========================================================
        // CONVERSATION NEXT
        // Same logic as CoursePlayer / VocabularyPlayer
        // =========================================================
        if (isConversation) {

            // First Next → Arjun Hindi
            if (currentIndex === -1) {
                setCurrentIndex(0);
                setConversationStep(0);
                return;
            }

            // Next dialogue step
            if (conversationStep < 7) {
                setConversationStep((prev) => prev + 1);
                return;
            }

            // All 8 steps completed → next Question
            if (currentIndex < list.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                setConversationStep(0);
            }

            return;
        }

        // =========================================================
        // NORMAL COURSES
        // =========================================================

        // First click → first Hindi
        if (currentIndex === -1) {
            setCurrentIndex(0);
            setShowEnglish(false);
            return;
        }

        // Hindi visible → show English
        if (!showEnglish) {
            setShowEnglish(true);

            setRevealedAnswers((prev) => {
                if (prev.includes(currentIndex)) {
                    return prev;
                }

                return [...prev, currentIndex];
            });

            return;
        }

        // English visible → next Hindi
        if (currentIndex < list.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setShowEnglish(false);
        }
    };
    // =========================================================
    // PREVIOUS
    // =========================================================

    const prevSentence = () => {
        if (showAll) return;
        if (currentIndex < 0) return;

        // English visible → hide current English
        if (showEnglish) {
            setRevealedAnswers((prev) =>
                prev.filter((index) => index !== currentIndex)
            );

            setShowEnglish(false);
            return;
        }

        // Hindi visible → previous sentence का English
        if (currentIndex > 0) {
            const previousIndex = currentIndex - 1;

            setCurrentIndex(previousIndex);

            setRevealedAnswers((prev) =>
                prev.filter((index) => index <= previousIndex)
            );

            setShowEnglish(true);
            return;
        }

        // First Hindi → Blank
        setCurrentIndex(-1);
        setShowEnglish(false);
        setRevealedAnswers([]);
    };

    // =========================================================
    // SHOW ALL / HIDE ALL
    // =========================================================

    const toggleShowAll = () => {
        if (showAll) {
            setShowAll(false);
            setCurrentIndex(-1);
            setShowEnglish(false);
            setRevealedAnswers([]);
            return;
        }

        setShowAll(true);
        setCurrentIndex(list.length);
        setShowEnglish(true);
        setRevealedAnswers(
            list.map((_, index) => index)
        );
    };

    // =========================================================
    // VISIBLE SENTENCES
    // =========================================================

    const visible = showAll
        ? list
        : currentIndex === -1
            ? []
            : list.slice(0, currentIndex + 1);
    useEffect(() => {
        if (currentIndex < 0 || showAll) return;

        const sentenceArea = sentenceAreaRef.current;
        const sentence = document.getElementById(
            `practice-sentence-${currentIndex}`
        );

        if (sentenceArea && sentence) {
            sentenceArea.scrollTo({
                top: sentence.offsetTop - sentenceArea.offsetTop,
                behavior: "smooth",
            });
        }
    }, [currentIndex, showAll]);

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="fixed inset-0 z-40 bg-gray-100 overflow-hidden px-4 pb-4 pt-0">

            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">

                {/* =====================================================
                    HEADING BAR
                ===================================================== */}

                

                {/* =====================================================
                    SENTENCE AREA
                ===================================================== */}

                <div className="flex-1 min-h-0 md:flex-none md:h-[520px] bg-white border-l border-r border-b shadow overflow-hidden">

                    <div className="flex flex-col h-full min-h-0">

                        <div
                            ref={sentenceAreaRef}
                            className="flex-1 min-h-0 overflow-y-auto flex flex-col"
                        >

                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                    Loading...
                                </div>
                            ) : isConversation ? (
                                <div className="flex-1 min-h-0 flex flex-col">

                                    <>


                                        {/* Conversation Image + Dialogue */}
                                        <div className="relative flex-1 min-h-0 overflow-hidden bg-white flex items-center justify-center">

                                            <div className="relative w-full h-full">

                                                {conversationImageUrl || conversationMobileImageUrl ? (
                                                    <picture>
                                                        <source
                                                            media="(max-width: 767px)"
                                                            srcSet={conversationMobileImageUrl}
                                                        />

                                                        <img
                                                            src={conversationImageUrl}
                                                            alt="Conversation"
                                                            className="absolute inset-0 w-full h-full object-contain"
                                                        />
                                                    </picture>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold">
                                                        Conversation Image URL नहीं मिला
                                                    </div>
                                                )}

                                                {/* Arjun */}
                                                <div className="absolute left-[20%] top-[1%] w-[64%] h-[16%] md:left-[22%] md:top-[3%] md:w-[22%] md:h-[13%] flex items-start justify-center text-center px-1 pt-1 md:px-2 md:pt-2">
                                                    {conversationStep >= 0 && (
                                                        <div className="w-full text-[12px] md:text-base font-normal leading-tight text-center whitespace-normal md:whitespace-nowrap">
                                                            <div className="text-red-600">
                                                                {list[currentIndex]?.hindi1 || ""}
                                                            </div>

                                                            {conversationStep >= 1 && (
                                                                <div className="text-green-600">
                                                                    {list[currentIndex]?.english1 || ""}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Meera */}
                                                <div className="absolute left-[20%] top-[26%] w-[64%] h-[16%] md:left-[57%] md:top-[3%] md:w-[22%] md:h-[13%] flex items-start justify-center text-center px-1 pt-1 md:px-2 md:pt-2">
                                                    {conversationStep >= 2 && (
                                                        <div className="w-full text-[12px] md:text-base font-normal leading-tight text-center whitespace-normal md:whitespace-nowrap">
                                                            <div className="text-red-600">
                                                                {list[currentIndex]?.hindi2 || ""}
                                                            </div>

                                                            {conversationStep >= 3 && (
                                                                <div className="text-green-600">
                                                                    {list[currentIndex]?.english2 || ""}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rohan */}
                                                <div className="absolute left-[20%] top-[51%] w-[64%] h-[16%] md:left-[20%] md:top-[52%] md:w-[28%] md:h-[13%] flex items-start justify-center text-center px-1 pt-1 md:px-2 md:pt-2">
                                                    {conversationStep >= 4 && (
                                                        <div className="w-full text-[12px] md:text-base font-normal leading-tight text-center whitespace-normal md:whitespace-nowrap">
                                                            <div className="text-red-600">
                                                                {list[currentIndex]?.hindi3 || ""}
                                                            </div>

                                                            {conversationStep >= 5 && (
                                                                <div className="text-green-600">
                                                                    {list[currentIndex]?.english3 || ""}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Meera Final */}
                                                <div className="absolute left-[20%] top-[76%] w-[64%] h-[16%] md:left-[54%] md:top-[52%] md:w-[28%] md:h-[13%] flex items-start justify-center text-center px-1 pt-1 md:px-2 md:pt-2">
                                                    {conversationStep >= 6 && (
                                                        <div className="w-full text-[12px] md:text-base font-normal leading-tight text-center whitespace-normal md:whitespace-nowrap">
                                                            <div className="text-red-600">
                                                                {list[currentIndex]?.hindi4 || ""}
                                                            </div>

                                                            {conversationStep >= 7 && (
                                                                <div className="text-green-600">
                                                                    {list[currentIndex]?.english4 || ""}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </>

                                </div>
                            ) : visible.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                    Click Next to start practice
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {visible.map((item: any, i: number) => {
                                        const isVocabulary =
                                            item.hindi !== undefined;

                                        const sentenceText =
                                            item.sentence?.replace(/^\d+\.\s*/, "") || "";

                                        const hindi =
                                            isVocabulary
                                                ? item.hindi
                                                : sentenceText.split(" - ")[0];

                                        const english =
                                            isVocabulary
                                                ? item.english
                                                : sentenceText
                                                    .split(" - ")
                                                    .slice(1)
                                                    .join(" - ");

                                        return (
                                            <div
                                                key={item.id || i}
                                                id={`practice-sentence-${i}`}
                                                className={`flex text-base ${i === currentIndex && !showAll
                                                    ? "bg-yellow-100"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="w-10">
                                                    {i + 1}.
                                                </div>

                                                <div className="w-1/2 text-base leading-[1.25rem] text-red-600 pr-2">
                                                    {hindi}
                                                </div>

                                                <div className="w-1/2 text-base leading-[1.25rem] font-normal text-green-600 pl-2">
                                                    {showAll ||
                                                        revealedAnswers.includes(i)
                                                        ? english
                                                        : ""}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}


                        </div>

                    </div>

                </div>

                {/* =====================================================
                    BOTTOM CONTROL BAR
                ===================================================== */}

                <div className="flex items-center justify-center shrink-0 py-1">

                    <div className="inline-flex items-center gap-2">

                        <button
                            onClick={prevSentence}
                            disabled={currentIndex < 0}
                            className="h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                            Prev
                        </button>

                        <button
                            onClick={nextSentence}
                            disabled={
                                list.length === 0 ||
                                (
                                    currentIndex >= list.length - 1 &&
                                    showEnglish
                                )
                            }
                            className="h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors font-medium text-blue-700 disabled:opacity-40"
                        >
                            Next
                        </button>

                        <button
                            onClick={toggleShowAll}
                            className="h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors font-medium text-red-600"
                        >
                            {showAll ? "Hide All" : "Show All"}
                        </button>

                        <button
                            onClick={() =>
                                setRandomMode((prev) => !prev)
                            }
                            className="h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors font-medium text-green-700"
                        >
                            {randomMode ? "Normal" : "Random"}
                        </button>

                    </div>

                </div>

            </div>

        </div >
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