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

const VocabularyPlayer = forwardRef<any, any>((props, ref) => {

    const {
        data,
        random,
        showAll,
        compact,
        highlightIndex,
        setHighlightIndex,
    } = props;

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showEnglish, setShowEnglish] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
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

    const handlePrev = () => {

        if (showAll) return;

        if (currentIndex < 0) return;

        // English visible → Hindi
        if (showEnglish) {

            setShowEnglish(false);

            return;
        }

        // Hindi visible → previous English
        if (currentIndex > 0) {

            setCurrentIndex((prev) => prev - 1);
            setShowEnglish(true);

        }

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

                            className={`flex text-base cursor-pointer ${
                                highlightIndex === i
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

        </div>

    );

});

VocabularyPlayer.displayName = "VocabularyPlayer";

export default VocabularyPlayer;