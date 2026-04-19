"use client";

import { useState, useEffect, useRef } from "react";

export default function VocabularyPlayer({ data }: any) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

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

  // NEXT (🔥 AUTO REVEAL)
  const handleNext = () => {

    // reveal current
    setRevealedAnswers(prev => {
      if (!prev.includes(currentIndex)) {
        return [...prev, currentIndex];
      }
      return prev;
    });

    // move next
    if (currentIndex < data.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const safeData = data || [];
  const visible = safeData.slice(0, currentIndex + 1);

  return (

    <div className="flex flex-col h-full">

      {/* LIST */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 p-2">

        {visible.map((item:any, i:number)=>(

          <div
            key={item.id}
            className="text-2xl leading-tight flex"
          >

            {/* NUMBER */}
            <div className="w-10 shrink-0">
              {i+1}.
            </div>

            {/* HINDI */}
            <div className="w-1/2">
              {item.hindi}
            </div>

            {/* ANSWER */}
            <div className="w-1/2">
              {revealedAnswers.includes(i) ? item.english : ""}
            </div>

          </div>

        ))}

      </div>

      {/* CONTROLS */}
      <div className="p-2 flex justify-center gap-2 border-t">

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>

      </div>

    </div>
  );
}