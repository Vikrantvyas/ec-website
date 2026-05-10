"use client";

import { useState } from "react";
import WhiteBoard from "./WhiteBoard";
import VocabularyPlayer from "./VocabularyPlayer";
import ScoreCard from "./ScoreCard";
import GrammarBoard from "./GrammarBoard";

export default function MainBoard({
  isVocab,
  isGrammar,
  showGrammar,
  sentences,
  visible,
  leftCol,
  rightCol,
  highlightIndex,
  setHighlightIndex,
  showBoard,
  showScore,
  showLeft,
  scrollRef,
  vocabRef,
  randomMode,
  showAll,

  // 🔥 NEW PROPS
  selectedDays,
  selectedTopics,
  topics,
  layout,
  days

}: any) {

  const [resultData, setResultData] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  const activePanels = [
  showLeft && "left",
  showGrammar && "grammar",
  showBoard && "board",
  showScore && "score"
].filter(Boolean);

const isVertical = layout === "vertical";

const widthClass = isVertical
  ? "w-full"
  : activePanels.length === 1
  ? "w-full"
  : activePanels.length === 2
  ? "w-1/2"
  : activePanels.length === 3
  ? "w-1/3"
  : "w-1/4";

  const handleCorrect = () => {
    vocabRef?.current?.markCorrect();
  };

  const handlePass = () => {
    vocabRef?.current?.markWrong();
  };

  const handleReset = () => {
    vocabRef?.current?.reset();
  };

  // 🔹 GROUPING LOGIC
  const groupedResult = resultData.reduce((acc: any, s: any) => {
    if (!acc[s.correct]) acc[s.correct] = [];
    acc[s.correct].push(s.name);
    return acc;
  }, {});

  const sortedScores = Object.keys(groupedResult)
    .map(Number)
    .sort((a, b) => b - a);

  return (

  <>
    {/* SPECIAL CASE: TOP-BOTTOM */}
    {isVertical && showGrammar && showLeft ? (

      <div className="flex flex-col w-full h-full overflow-hidden min-h-0">

        {/* TOP */}
        <div className="h-[70%] min-h-0 border-b overflow-auto">
          <GrammarBoard />
        </div>

        {/* BOTTOM */}
        <div className="h-[30%] min-h-0 overflow-hidden">
          <div className="w-full h-full overflow-y-auto">

            {/* LEFT PANEL CONTENT COPY */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">

              {showResult ? (
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xl font-bold">Result</div>
                    <button
                      onClick={() => setShowResult(false)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Back
                    </button>
                  </div>

                  {sortedScores.map((score, i) => (
                    <div
                      key={i}
                      className={`flex justify-between border p-2 rounded ${
                        i === 0 ? "bg-yellow-200 font-bold" : ""
                      }`}
                    >
                      <div>
                        {i + 1}. {groupedResult[score].join(" | ")}
                      </div>
                      <div className="font-bold">{score}</div>
                    </div>
                  ))}
                </div>

              ) : isVocab ? (

                <VocabularyPlayer
                  ref={vocabRef}
                  data={sentences}
                  random={randomMode}
                  showAll={showAll}
                />

              ) : showBoard ? (

                <div className="space-y-1 p-2">
                  {visible.map((item:any, i:number)=>(
                    <div
                      key={item.id}
                      onClick={()=>setHighlightIndex((p:any)=>p===i ? null : i)}
                      className={`cursor-pointer text-2xl ${
                        highlightIndex === i ? "bg-yellow-200" : ""
                      }`}
                    >
                      {i+1}. {item.sentence}
                    </div>
                  ))}
                </div>

              ) : (

                <div className="flex gap-4 p-2">
                  <div className="w-1/2">
                    {leftCol.map((item:any, i:number)=>(
                      <div key={item.id}>
                        {i+1}. {item.sentence}
                      </div>
                    ))}
                  </div>

                  <div className="w-1/2">
                    {rightCol.map((item:any, i:number)=>(
                      <div key={item.id}>
                        {i+11}. {item.sentence}
                      </div>
                    ))}
                  </div>
                </div>

              )}

            </div>

          </div>
        </div>

      </div>

    ) : (

      <div className={`flex flex-1 overflow-hidden ${isVertical ? "flex-col" : ""}`}>

        {/* EXISTING OLD LAYOUT (UNCHANGED) */}

        {showLeft && (
  <div className={`${widthClass} flex flex-col`}>

    {/* 🔥 TOP HEADER */}
    <div className="bg-blue-200 font-bold px-3 py-2 text-sm border-b flex flex-wrap gap-2">

      <span className="bg-yellow-300 px-2 rounded">
        Day {selectedDays?.map((id:any) => {
          const d = days?.find((x:any) => x.id === id);
          return d?.day_number;
        }).join(", ")}
      </span>

      <span className="bg-green-300 px-2 rounded">
        {selectedTopics?.length > 0
          ? selectedTopics.map((id:any) => {
              const t = topics?.find((x:any) => x.id === id);
              return t?.topic_name;
            }).join(", ")
          : "All Topics"}
      </span>

    </div>

    <div ref={scrollRef} className="flex-1 overflow-y-auto">

      {/* RESULT VIEW */}
      {showResult ? (
        <div className="p-4 space-y-3">

          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-bold">Result</div>

            <button
              onClick={() => setShowResult(false)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Back
            </button>
          </div>

          {sortedScores.map((score, i) => (
            <div
              key={i}
              className={`flex justify-between border p-2 rounded ${
                i === 0 ? "bg-yellow-200 font-bold" : ""
              }`}
            >
              <div>
                {i + 1}. {groupedResult[score].join(" | ")}
              </div>

              <div className="font-bold">
                {score}
              </div>
            </div>
          ))}

        </div>

      ) : isVocab ? (

        <VocabularyPlayer
          ref={vocabRef}
          data={sentences}
          random={randomMode}
          showAll={showAll}
        />

      ) : showBoard ? (

        <div className="space-y-1 p-2">
          {visible.map((item:any, i:number)=>(
            <div
              key={item.id}
              onClick={()=>setHighlightIndex((p:any)=>p===i ? null : i)}
              className={`cursor-pointer select-none text-2xl leading-tight flex ${
                highlightIndex === i ? "bg-yellow-200" : ""
              }`}
            >
              <div className="w-10 shrink-0">{i+1}.</div>
              <div className="flex-1">{item.sentence}</div>
            </div>
          ))}
        </div>

      ) : (

        <div className="flex gap-4 p-2">

          <div className="w-1/2 space-y-1">
            {leftCol.map((item:any, i:number)=>(
              <div
                key={item.id}
                onClick={()=>setHighlightIndex((p:any)=>p===i ? null : i)}
                className={`cursor-pointer select-none text-2xl leading-tight ${
                  highlightIndex === i ? "bg-yellow-200" : ""
                }`}
              >
                {i+1}. {item.sentence}
              </div>
            ))}
          </div>

          <div className="w-1/2 space-y-1">
            {rightCol.map((item:any, i:number)=>{
              const realIndex = i + 10;

              return (
                <div
                  key={item.id}
                  onClick={()=>setHighlightIndex((p:any)=>p===realIndex ? null : realIndex)}
                  className={`cursor-pointer select-none text-2xl leading-tight ${
                    highlightIndex === realIndex ? "bg-yellow-200" : ""
                  }`}
                >
                  {realIndex + 1}. {item.sentence}
                </div>
              );
            })}
          </div>

        </div>

      )}

    </div>
  </div>
)}

        {showGrammar && (
          <div className={`${widthClass} ${!isVertical ? "border-l" : "border-t"} flex`}>
            <GrammarBoard />
          </div>
        )}

        {showBoard && (
          <div className={`${widthClass} ${!isVertical ? "border-l" : "border-t"} flex`}>
            <WhiteBoard />
          </div>
        )}

        {showScore && (
          <div className={`${widthClass} border-l flex`}>
            <ScoreCard />
          </div>
        )}

      </div>

    )}
   </>
  
);
}