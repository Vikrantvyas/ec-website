"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

const VocabularyPlayer = forwardRef(({ data }: any, ref: any) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const safeData = data || [];

  // RESET
  useEffect(() => {
    setCurrentIndex(0);
    setRevealedAnswers([]);
  }, [data]);

  // AUTO SCROLL
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentIndex]);

  // ✅ NEXT FLOW FIX (Hindi → English → Next word)
  const handleNext = () => {

    // 1️⃣ पहले English reveal
    if (!revealedAnswers.includes(currentIndex)) {
      setRevealedAnswers(prev => [...prev, currentIndex]);
      return;
    }

    // 2️⃣ फिर अगला word (Hindi only)
    if (currentIndex < safeData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }

  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReveal = (i:number) => {
    if (!revealedAnswers.includes(i)) {
      setRevealedAnswers(prev => [...prev, i]);
    }
  };

  useImperativeHandle(ref, () => ({
    next: handleNext,
    prev: handlePrev
  }));

  const visible = safeData.slice(0, currentIndex + 1);

  return (

    <div className="flex flex-col h-full">

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 p-2">

        {visible.map((item:any, i:number)=>(

          <div
            key={item.id}
            onClick={()=>handleReveal(i)}
            className={`cursor-pointer select-none text-2xl leading-tight flex ${
              i === currentIndex ? "bg-yellow-100" : ""
            }`}
          >

            <div className="w-10 shrink-0">{i+1}.</div>

            <div className="w-1/2">
              {item.hindi}
            </div>

            <div className="w-1/2">
              {revealedAnswers.includes(i) ? item.english : ""}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
});

export default VocabularyPlayer;