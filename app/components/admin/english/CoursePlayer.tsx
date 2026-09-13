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
    const conversationData = data || [];
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

        const newList = random
            ? shuffleArray(safeData)
            : safeData;

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

    const handleNext = () => {
        if (isConversation) {
            if (showAll) return;

            // पहला Next → पहला Question
            if (currentIndex === -1) {
                setCurrentIndex(0);
                setConversationStep(0);
                return;
            }

            // अगले dialogue step पर जाएँ
            if (conversationStep < 4) {
                setConversationStep(prev => prev + 1);
                return;
            }

            // पाँचों parts पूरे → अगला Question
            if (currentIndex < conversationData.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setConversationStep(0);
            }

            return;
        }
        if (showAll) return;

        // First click → first Hindi
        if (currentIndex === -1) {

            setCurrentIndex(0);
            setShowEnglish(false);

            return;
        }

        // Hindi is visible → show English
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

        // English is visible → next Hindi
        if (currentIndex < list.length - 1) {

            setCurrentIndex((prev) => prev + 1);
            setShowEnglish(false);

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
        if (showAll) return;

        if (currentIndex < 0) return;

        // English visible:
        // केवल current sentence का English hide करें
        if (showEnglish) {
            setRevealedAnswers((prev) =>
                prev.filter((index) => index !== currentIndex)
            );

            setShowEnglish(false);
            return;
        }

        // Hindi visible:
        // Current Hindi को भी पीछे करें और
        // उसके previous sentence का English दिखाएँ
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
                            {/* Question */}
                            <div className="shrink-0 flex items-center justify-center px-4 py-2 bg-white">
                                <div className="text-center font-bold text-lg md:text-xl text-gray-800 leading-tight">
                                    {conversationData[currentIndex]?.question_text || ""}
                                </div>
                            </div>

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
                                <div className="absolute left-[24%] top-[2%] w-[22%] h-[13%] flex items-center justify-center text-center px-2">
                                    {conversationStep >= 1 && (
                                        <div
                                            className="w-full text-black font-semibold leading-tight text-center break-words"
                                            style={{
                                                fontSize: getConversationFontSize(
                                                    conversationData[currentIndex]?.conversation_lines
                                                        ?.find((line: any) => line.step_no === 1)?.text || ""
                                                ),
                                            }}
                                        >
                                            {conversationData[currentIndex]?.conversation_lines
                                                ?.find((line: any) => line.step_no === 1)?.text || ""}
                                        </div>
                                    )}
                                </div>

                                {/* Meera */}
                                <div className="absolute left-[55%] top-[2%] w-[22%] h-[13%] flex items-center justify-center text-center px-2">
                                    {conversationStep >= 2 && (
                                        <div
                                            className="w-full text-black font-semibold leading-tight text-center break-words"
                                            style={{
                                                fontSize: getConversationFontSize(
                                                    conversationData[currentIndex]?.conversation_lines
                                                        ?.find((line: any) => line.step_no === 2)?.text || ""
                                                ),
                                            }}
                                        >
                                            {conversationData[currentIndex]?.conversation_lines
                                                ?.find((line: any) => line.step_no === 2)?.text || ""}
                                        </div>
                                    )}
                                </div>

                                {/* Rohan */}
                                <div className="absolute left-[22%] top-[50%] w-[28%] h-[13%] flex items-center justify-center text-center px-2">
                                    {conversationStep >= 3 && (
                                        <div
                                            className="w-full text-black font-semibold leading-tight text-center break-words"
                                            style={{
                                                fontSize: getConversationFontSize(
                                                    conversationData[currentIndex]?.conversation_lines
                                                        ?.find((line: any) => line.step_no === 3)?.text || ""
                                                ),
                                            }}
                                        >
                                            {conversationData[currentIndex]?.conversation_lines
                                                ?.find((line: any) => line.step_no === 3)?.text || ""}
                                        </div>
                                    )}
                                </div>

                                {/* Meera Final */}
                                <div className="absolute left-[50%] top-[50%] w-[28%] h-[13%] flex items-center justify-center text-center px-2">
                                    {conversationStep >= 4 && (
                                        <div
                                            className="w-full text-black font-semibold leading-tight text-center break-words"
                                            style={{
                                                fontSize: getConversationFontSize(
                                                    conversationData[currentIndex]?.conversation_lines
                                                        ?.find((line: any) => line.step_no === 4)?.text || ""
                                                ),
                                            }}
                                        >
                                            {conversationData[currentIndex]?.conversation_lines
                                                ?.find((line: any) => line.step_no === 4)?.text || ""}
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