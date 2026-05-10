"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

const shuffleArray = (arr: any[]) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

const VocabularyPlayer = forwardRef<any, any>((props, ref) => {

  const { data, random, showAll } = props;

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  const [list, setList] = useState<any[]>([]);
  const [marks, setMarks] = useState<{ [key: number]: string }>({}); // 🔥 NEW

  const scrollRef = useRef<HTMLDivElement>(null);

  const safeData = data || [];

  // RESET ON DATA CHANGE
  useEffect(() => {
    const newList = random ? shuffleArray(safeData) : safeData;
    setList(newList);
    setCurrentIndex(-1);
    setRevealedAnswers([]);
    setMarks({}); // 🔥 reset marks
  }, [data, random]);

  // AUTO SCROLL
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  // NEXT
  const handleNext = () => {
    if (showAll) return;

    if (currentIndex === -1) {
      setCurrentIndex(0);
      return;
    }

    setRevealedAnswers((prev) => {
      if (prev.includes(currentIndex)) return prev;
      return [...prev, currentIndex];
    });

    if (currentIndex < list.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // PREV
  const handlePrev = () => {
    if (showAll) return;
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;

    setRevealedAnswers((prev) =>
      prev.filter((i) => i < prevIndex)
    );

    setCurrentIndex(prevIndex);
  };

  // 🔥 MARK CORRECT
  const markCorrect = () => {
  if (currentIndex >= 0) {

    // 🔥 ensure reveal
    setRevealedAnswers(prev => {
      if (prev.includes(currentIndex)) return prev;
      return [...prev, currentIndex];
    });

    setMarks(prev => ({ ...prev, [currentIndex]: "correct" }));
  }

  handleNext();
};

  // 🔥 MARK WRONG / PASS
  const markWrong = () => {
    if (currentIndex >= 0) {
      setMarks(prev => ({ ...prev, [currentIndex]: "wrong" }));
    }
    handleNext();
  };

  // RESET
  const handleReset = () => {
    setCurrentIndex(-1);
    setRevealedAnswers([]);
    setMarks({});
  };

  // EXPOSE METHODS
  useImperativeHandle(ref, () => ({
    next: handleNext,
    prev: handlePrev,
    reset: handleReset,
    markCorrect,
    markWrong
  }));

  const visible =
    showAll
      ? list
      : currentIndex === -1
      ? []
      : list.slice(0, currentIndex + 1);

  return (
    <div className="flex flex-col h-full">

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 p-2"
      >

        {visible.map((item: any, i: number) => (
          <div
            key={item.id}
            className={`text-xl flex ${
              marks[i] === "correct"
                ? "bg-green-200"
                : marks[i] === "wrong"
                ? "bg-red-200"
                : i === currentIndex && !showAll
                ? "bg-yellow-100"
                : ""
            }`}
          >
            <div className="w-10">{i + 1}.</div>

            <div className="w-1/2 text-lg leading-snug">
  {item.hindi}
</div>

            <div className="w-1/2 text-[18px] leading-[1.35] font-normal">
              {showAll || revealedAnswers.includes(i)
                ? item.english
                : ""}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
});

export default VocabularyPlayer;