"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const shuffleArray = (arr: any[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
};

function TranslationPracticeContent() {
    const searchParams = useSearchParams();

    const topicIds =
        searchParams.get("topics")?.split(",").filter(Boolean) || [];

    const [sentences, setSentences] = useState<any[]>([]);
    const [list, setList] = useState<any[]>([]);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showEnglish, setShowEnglish] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);

    const [showAll, setShowAll] = useState(false);
    const [randomMode, setRandomMode] = useState(false);

    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState("");

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
                return;
            }

            setLoading(true);

            const { data, error } = await supabase
                .from("vocabulary")
                .select("*")
                .in("topic_id", topicIds)
                .order("topic_id")
                .order("order_no");

            if (error) {
                console.error("SENTENCES ERROR:", error.message);
                setLoading(false);
                return;
            }

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

            setSentences(sorted);

            const newList = randomMode
                ? shuffleArray(sorted)
                : sorted;

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

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="h-screen bg-gray-100 overflow-hidden p-4 -mt-16 md:mt-0">

            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">

                {/* =====================================================
                    HEADING BAR
                ===================================================== */}

                <div className="bg-blue-200 font-bold px-3 py-2 text-xs border-b flex items-center shrink-0">

                    <span className="bg-yellow-300 px-2 rounded">
                        Translation Practice
                    </span>

                    <span className="bg-green-300 px-2 rounded font-normal ml-1">
                        {topicIds.length} Topic
                        {topicIds.length !== 1 ? "s" : ""}
                    </span>

                    <div className="ml-auto text-blue-800 font-bold whitespace-nowrap">
                        {currentTime}
                    </div>

                </div>

                {/* =====================================================
                    SENTENCE AREA
                ===================================================== */}

                <div className="h-[calc(100vh-300px)] md:h-[520px] bg-white border-l border-r border-b shadow overflow-hidden">

                    <div className="flex flex-col h-full min-h-0">

                        <div
                            className="flex-1 min-h-0 overflow-y-auto space-y-2 p-2"
                        >

                            {loading ? (

                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                    Loading...
                                </div>

                            ) : visible.length === 0 ? (

                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                    Click Next to start practice
                                </div>

                            ) : (

                                visible.map((item: any, i: number) => {

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
                                            className={`flex text-base ${i === currentIndex && !showAll
                                                    ? "bg-yellow-100"
                                                    : ""
                                                }`}
                                        >

                                            {/* NUMBER */}

                                            <div className="w-10">
                                                {i + 1}.
                                            </div>

                                            {/* HINDI */}

                                            <div className="w-1/2 text-base leading-[1.25rem] text-red-600 pr-2">
                                                {hindi}
                                            </div>

                                            {/* ENGLISH */}

                                            <div className="w-1/2 text-base leading-[1.25rem] font-normal text-green-600 pl-2">

                                                {showAll ||
                                                    revealedAnswers.includes(i)
                                                    ? english
                                                    : ""}

                                            </div>

                                        </div>

                                    );
                                })

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