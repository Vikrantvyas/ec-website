"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

const shuffleArray = (arr:any[]) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

const VocabularyPlayer = forwardRef(({ data, random, showAll }: any, ref: any) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  const [list, setList] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const safeData = data || [];

  // RESET
  useEffect(() => {
    const newList = random ? shuffleArray(safeData) : safeData;
    setList(newList);
    setCurrentIndex(0);
    setRevealedAnswers([]);
  }, [data, random]);

  // AUTO SCROLL
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  // NEXT
  const handleNext = () => {

    if (showAll) return; // ✅ showAll में control disable

    // पहले English दिखाओ
    if (!revealedAnswers.includes(currentIndex)) {
      setRevealedAnswers(prev => [...prev, currentIndex]);
      return;
    }

    // फिर अगला Hindi
    if (currentIndex < list.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }

  };

  // PREV
  const handlePrev = () => {

    if (showAll) return;

    if (currentIndex === 0) return;

    const prevIndex = currentIndex - 1;

    setRevealedAnswers(prev =>
      prev.filter(i => i < prevIndex)
    );

    setCurrentIndex(prevIndex);
  };

  useImperativeHandle(ref, () => ({
    next: handleNext,
    prev: handlePrev
  }));

  // ✅ SHOW ALL FIX
  const visible = showAll
    ? list
    : list.slice(0, currentIndex + 1);

  return (

    <div className="flex flex-col h-full">

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 p-2">

        {visible.map((item:any, i:number)=>(

          <div
            key={item.id}
            className={`text-2xl flex ${
              i === currentIndex && !showAll ? "bg-yellow-100" : ""
            }`}
          >

            <div className="w-10">{i+1}.</div>

            {/* ✅ HINDI ALWAYS */}
            <div className="w-1/2">{item.hindi}</div>

            {/* ✅ ENGLISH CONTROL */}
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