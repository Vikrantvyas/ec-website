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

  const scrollRef = useRef<HTMLDivElement>(null);

  const safeData = data || [];

  useEffect(() => {
    const newList = random ? shuffleArray(safeData) : safeData;
    setList(newList);
    setCurrentIndex(-1);
    setRevealedAnswers([]);
  }, [data, random]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

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

  const handlePrev = () => {
    if (showAll) return;
    if (currentIndex <= 0) return;

    const prevIndex = currentIndex - 1;

    setRevealedAnswers((prev) =>
      prev.filter((i) => i < prevIndex)
    );

    setCurrentIndex(prevIndex);
  };

  const handleReset = () => {
    setCurrentIndex(-1);
    setRevealedAnswers([]);
  };

  useImperativeHandle(ref, () => ({
    next: handleNext,
    prev: handlePrev,
    reset: handleReset
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
            className={`text-2xl flex ${
              i === currentIndex && !showAll ? "bg-yellow-100" : ""
            }`}
          >
            <div className="w-10">{i + 1}.</div>
            <div className="w-1/2">{item.hindi}</div>
            <div className="w-1/2">
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