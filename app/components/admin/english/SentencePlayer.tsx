"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

const shuffleArray = (arr: any[]) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

type Props = {
  data: any[];
  highlightIndex: number | null;
  setHighlightIndex: any;
  random?: boolean;
  showAll?: boolean;
  currentIndex: number;
};

const SentencePlayer = forwardRef<any, Props>(
  (
    {
      data,
      highlightIndex,
      setHighlightIndex,
      random = false,
      showAll = false,
      currentIndex,
    },
    ref
  ) => {
    const [list, setList] = useState<any[]>([]);


    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const newList = random
        ? shuffleArray(data || [])
        : (data || []);

      setList(newList);
    }, [data, random]);



    const startIndex = Math.max(0, currentIndex - 2);

    const visible = showAll
      ? list
      : currentIndex === -1
        ? []
        : list.slice(
          startIndex,
          currentIndex + 1
        );

    return (
      <div
        ref={scrollRef}
        className="space-y-2 p-2 overflow-hidden h-full"
      >
        {visible.map((item: any, i: number) => {
          const text =
            item.sentence?.replace(/^\d+\.\s*/, "") || "";

          const parts = text.split(" - ");

          const hindi = parts[0] || "";
          const english = parts.slice(1).join(" - ");

          return (
            <div
              key={item.id}
              onClick={() =>
                setHighlightIndex((p: any) =>
                  p === i ? null : i
                )
              }
              className={`text-xl flex cursor-pointer ${i === visible.length - 1 && !showAll
                ? "bg-yellow-100"
                : highlightIndex === i
                  ? "bg-blue-100"
                  : ""
                }`}
            >
              <div className="w-10">
                {Math.max(0, currentIndex - 2) + i + 1}.
              </div>

              <div className="w-1/2 text-lg leading-snug text-red-600">
                {hindi}
              </div>

              <div className="w-1/2 text-[18px] leading-[1.35] font-normal text-green-600">
                {english}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

SentencePlayer.displayName = "SentencePlayer";

export default SentencePlayer;