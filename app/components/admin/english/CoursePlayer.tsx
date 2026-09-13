"use client";

import {
    useState,
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";

const shuffleArray = (arr: any[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
};
const getConversationFontSize = (text: string) => {
    const length = text?.length || 0;

    if (length <= 20) return "clamp(13px, 1.45cqw, 18px)";
    if (length <= 30) return "clamp(12px, 1.30cqw, 17px)";
    if (length <= 42) return "clamp(11px, 1.15cqw, 15px)";
    return "clamp(10px, 1.00cqw, 14px)";
};
const VocabularyPlayer = forwardRef<any, any>((props, ref) => {

    const {
        data,
        random,
        showAll,
        compact,
        highlightIndex,
        setHighlightIndex,
        isConversation,
        conversationImageUrl,
    } = props;
    const conversationData = (data || []).map((item: any) => ({
        ...item,

        hindi1: item.question_text || "",
        english1: item.question_english || "",

        hindi2: item.question_hindi_2 || "",
        english2: item.question_english_2 || "",

        hindi3: item.answer_hindi_3 || "",
        english3: item.answer_english_3 || "",

        hindi4: item.answer_hindi_4 || "",
        english4: item.answer_english_4 || "",
    }));
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showEnglish, setShowEnglish] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
    const [conversationStep, setConversationStep] = useState(-1);
    const [list, setList] = useState<any[]>([]);
    const [marks, setMarks] = useState<{ [key: number]: string }>({});

    const scrollRef = useRef<HTMLDivElement>(null);

    const safeData = data || [];

    // =========================================================
    // RESET ON DATA CHANGE
    // =========================================================

    useEffect(() => {

        const newList = isConversation
            ? (random
                ? shuffleArray(conversationData)
                : conversationData)
            : (random
                ? shuffleArray(safeData)
                : safeData);

        setList(newList);
        setCurrentIndex(-1);
        setConversationStep(-1);
        setShowEnglish(false);
        setRevealedAnswers([]);
        setMarks({});

    }, [data, random]);


    // =========================================================
    // NORMAL NEXT
    //
    // Hindi → English
    // English → Next Hindi
    // =========================================================
    console.log("CONVERSATION DEBUG", {
        isConversation,
        currentIndex,
        conversationStep,
        currentItem: conversationData[currentIndex],
    });
    const handleNext = () => {
        if (isConversation) {
            if (showAll) return;

            // First Next → Arjun Hindi
            if (currentIndex === -1) {
                setCurrentIndex(0);
                setConversationStep(0);
                return;
            }

            // Same question: move through all 8 dialogue steps
            if (conversationStep < 7) {
                setConversationStep((prev) => prev + 1);
                return;
            }

            // 8 steps complete → next question
            if (currentIndex < list.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                setConversationStep(0);
            }

            return;
        }
    };
    // =========================================================
    // SCORE NAVIGATION
    //
    // +1 / 0 / -1 के बाद:
    //
    // Current Hindi
    //      ↓
    // Current English + Next Hindi
    //
    // अगली बार:
    //
    // Current English + Next Hindi
    //      ↓
    // Next English + Next Hindi
    // =========================================================

    const handleScoreNext = () => {

        if (showAll) return;

        // अगर अभी कोई question शुरू ही नहीं हुआ है,
        // तो पहला Hindi question दिखाएँ।
        if (currentIndex === -1) {

            setCurrentIndex(0);
            setShowEnglish(false);

            return;
        }

        // Current answer reveal करें
        setRevealedAnswers((prev) => {

            if (prev.includes(currentIndex)) {
                return prev;
            }

            return [...prev, currentIndex];

        });

        // अगर current question आखिरी है,
        // तो सिर्फ उसका English दिखाएँ।
        if (currentIndex >= list.length - 1) {

            setShowEnglish(true);

            return;
        }

        // Current answer के साथ अगला Hindi question दिखाएँ।
        setCurrentIndex((prev) => prev + 1);
        setShowEnglish(false);

    };


    // =========================================================
    // PREVIOUS
    // =========================================================

    // =========================================================
    // PREVIOUS
    // Reverse of NEXT
    // =========================================================

    const handlePrev = () => {
        if (isConversation) {
            if (currentIndex === -1) return;

            if (conversationStep > 0) {
                setConversationStep((prev) => prev - 1);
                return;
            }

            if (currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
                setConversationStep(7);
                return;
            }

            setCurrentIndex(-1);
            setConversationStep(-1);
            return;
        }

        if (showEnglish) {
            setShowEnglish(false);
            setRevealedAnswers((prev) =>
                prev.filter((i) => i !== currentIndex)
            );
            return;
        }

        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setShowEnglish(true);
            setRevealedAnswers((prev) =>
                prev.filter((i) => i <= prevIndex)
            );
            return;
        }

        setCurrentIndex(-1);
    };

    // =========================================================
    // MARK CORRECT
    // =========================================================

    const markCorrect = () => {

        // अगर question शुरू नहीं हुआ है,
        // तो पहला Hindi question दिखाएँ।
        if (currentIndex < 0) {

            handleScoreNext();

            return;
        }

        setMarks((prev) => ({
            ...prev,
            [currentIndex]: "correct",
        }));

        handleScoreNext();

    };


    // =========================================================
    // MARK WRONG / PASS
    // =========================================================

    const markWrong = () => {

        // अगर question शुरू नहीं हुआ है,
        // तो पहला Hindi question दिखाएँ।
        if (currentIndex < 0) {

            handleScoreNext();

            return;
        }

        setMarks((prev) => ({
            ...prev,
            [currentIndex]: "wrong",
        }));

        handleScoreNext();

    };


    // =========================================================
    // RESET
    // =========================================================

    const handleReset = () => {

        setCurrentIndex(-1);
        setConversationStep(-1);
        setShowEnglish(false);
        setRevealedAnswers([]);
        setMarks({});

    };


    // =========================================================
    // EXPOSE METHODS
    // =========================================================

    useImperativeHandle(ref, () => ({

        next: handleNext,
        prev: handlePrev,
        reset: handleReset,

        markCorrect,
        markWrong,

    }));


    /*
      SHOW ALL:
      All sentences.
 
      NORMAL:
      All sentences shown so far.
 
      COMPACT:
      All sentences shown so far,
      but the latest sentence is automatically
      brought into view.
    */

    const visible =
        showAll
            ? list
            : currentIndex === -1
                ? []
                : list.slice(0, currentIndex + 1);


    // =========================================================
    // AUTO MOVE TO CURRENT SENTENCE
    // =========================================================

    useEffect(() => {

        if (!compact || showAll || currentIndex < 0) {
            return;
        }

        const container = scrollRef.current;

        if (!container) {
            return;
        }

        requestAnimationFrame(() => {

            const currentRow = container.children[
                currentIndex
            ] as HTMLElement | undefined;

            if (!currentRow) {
                return;
            }

            currentRow.scrollIntoView({
                block: "nearest",
                behavior: "auto",
            });

        });

    }, [
        currentIndex,
        compact,
        showAll,
        visible.length,
        showEnglish,
    ]);


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="flex flex-col h-full min-h-0">
            {isConversation ? (
                <div className="flex-1 min-h-0 flex flex-col">

                    {conversationData.length > 0 && currentIndex >= 0 && (
                        <>

                            {/* Fixed Conversation Image */}
                            <div
                                className="relative flex-1 min-h-0 overflow-hidden bg-white"
                                style={{ containerType: "inline-size" }}
                            >

                                {conversationImageUrl ? (
                                    <img
                                        src={conversationImageUrl}
                                        alt="Conversation"
                                        className="absolute inset-0 w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold">
                                        Conversation Image URL नहीं मिला
                                    </div>
                                )}

                                {/* Arjun */}
                                <div className="absolute left-[22%] top-[2%] w-[22%] h-[13%] flex items-start justify-center text-center px-2 pt-2">
                                    {conversationStep >= 0 && (
                                        <div className="w-full text-sm md:text-base font-semibold leading-tight text-center whitespace-nowrap">
                                            <div className="text-red-600">
                                                {conversationData[currentIndex]?.hindi1 || ""}
                                            </div>

                                            {conversationStep >= 1 && (
                                                <div className="text-green-600">
                                                    {conversationData[currentIndex]?.english1 || ""}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Meera */}
                                <div className="absolute left-[57%] top-[2%] w-[22%] h-[13%] flex items-start justify-center text-center px-2 pt-2">
                                    {conversationStep >= 2 && (
                                        <div className="w-full text-sm md:text-base font-semibold leading-tight text-center whitespace-nowrap">
                                            <div className="text-red-600">
                                                {conversationData[currentIndex]?.hindi2 || ""}
                                            </div>

                                            {conversationStep >= 3 && (
                                                <div className="text-green-600">
                                                    {conversationData[currentIndex]?.english2 || ""}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Rohan */}
                                <div className="absolute left-[20%] top-[51%] w-[28%] h-[13%] flex items-start justify-center text-center px-2 pt-2">
                                    {conversationStep >= 4 && (
                                        <div className="w-full text-sm md:text-base font-semibold leading-tight text-center whitespace-nowrap">
                                            <div className="text-red-600">
                                                {conversationData[currentIndex]?.hindi3 || ""}
                                            </div>

                                            {conversationStep >= 5 && (
                                                <div className="text-green-600">
                                                    {conversationData[currentIndex]?.english3 || ""}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Meera Final */}
                                <div className="absolute left-[54%] top-[51%] w-[28%] h-[13%] flex items-start justify-center text-center px-2 pt-2">
                                    {conversationStep >= 6 && (
                                        <div className="w-full text-sm md:text-base font-semibold leading-tight text-center whitespace-nowrap">
                                            <div className="text-red-600">
                                                {conversationData[currentIndex]?.hindi4 || ""}
                                            </div>

                                            {conversationStep >= 7 && (
                                                <div className="text-green-600">
                                                    {conversationData[currentIndex]?.english4 || ""}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </>
                    )}

                </div>
            ) : (
                <div
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto space-y-2 p-2"
                >

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
                                key={item.id}

                                onClick={() => {

                                    if (!setHighlightIndex) {
                                        return;
                                    }

                                    setHighlightIndex(
                                        (prev: number | null) =>
                                            prev === i
                                                ? null
                                                : i
                                    );

                                }}

                                className={`flex text-base cursor-pointer hover:bg-yellow-200 transition-colors ${highlightIndex === i
                                    ? "bg-blue-100"
                                    : marks[i] === "correct"
                                        ? "bg-green-200"
                                        : marks[i] === "wrong"
                                            ? "bg-red-200"
                                            : i === currentIndex && !showAll
                                                ? "bg-yellow-100"
                                                : ""
                                    }`}
                            >

                                <div className="w-10">
                                    {i + 1}.
                                </div>

                                <div className="w-1/2 text-base leading-[1.25rem] text-red-600">
                                    {hindi}
                                </div>

                                <div className="w-1/2 text-base leading-[1.25rem] font-normal text-green-600">

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

    );

});

VocabularyPlayer.displayName = "VocabularyPlayer";

export default VocabularyPlayer;