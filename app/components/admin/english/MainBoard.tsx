"use client";

import { useState, useEffect } from "react";
import WhiteBoard from "./WhiteBoard";
import CoursePlayer from "./CoursePlayer";
import ScoreCard from "./ScoreCard";
import GrammarBoard from "./GrammarBoard";
import SentencePlayer from "./SentencePlayer";
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
  currentIndex,

  // 🔥 NEW PROPS
  selectedDays,
  selectedTopics,
  topics,
  layout,
  days,
  currentTime,
  selectedGrammarTableId,
}: any) {

  const [resultData, setResultData] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [panelOrder, setPanelOrder] = useState<string[]>([]);

  const activePanels = [
    showLeft && "left",
    showGrammar && "grammar",
    showBoard && "board",
    showScore && "score"
  ].filter(Boolean) as string[];

  useEffect(() => {
    setPanelOrder(prev => {
      const stillActive = prev.filter(panel =>
        activePanels.includes(panel)
      );

      const newlyActive = activePanels.filter(panel =>
        !prev.includes(panel)
      );

      return [...stillActive, ...newlyActive];
    });
  }, [showLeft, showGrammar, showBoard, showScore]);

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
  const renderPanel = (panel: string) => {

    if (panel === "left" && showLeft) {
      return (
        <div
          key="left"
          className={`${isVertical && showGrammar ? "w-full h-[30%]" : widthClass
            } flex flex-col border-l`}
        >

          <div className="bg-blue-200 font-bold px-3 py-2 text-xs border-b flex items-center">

            <span className="bg-yellow-300 px-2 rounded">
              Day {selectedDays?.map((id: any) => {
                const d = days?.find((x: any) => x.id === id);
                return d?.day_number;
              }).join(", ")}
            </span>

            <span className="bg-green-300 px-2 rounded font-normal">
              {selectedTopics?.length > 0
                ? selectedTopics.map((id: any) => {
                  const t = topics?.find((x: any) => x.id === id);
                  return t?.topic_name;
                }).join(", ")
                : "All Topics"}
            </span>

            <div className="ml-auto text-blue-800 font-bold whitespace-nowrap">
              {currentTime}
            </div>

          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-hidden text-xs"
          >

            {showResult ? (

              <div className="p-4 space-y-3">

                <div className="flex justify-between items-center mb-3">

                  <div className="text-xl font-bold">
                    Result
                  </div>

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
                    className={`flex justify-between border p-2 rounded ${i === 0
                      ? "bg-yellow-200 font-bold"
                      : ""
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

              <div className="text-xs h-full min-h-0">
                <CoursePlayer
                  ref={vocabRef}
                  data={sentences}
                  random={randomMode}
                  showAll={showAll}
                  compact={true}
                />
              </div>

            ) : (

  <div className="text-xs h-full min-h-0">
    <CoursePlayer
      ref={vocabRef}
      data={sentences}
      random={randomMode}
      showAll={showAll}
      compact={true}
      highlightIndex={highlightIndex}
      setHighlightIndex={setHighlightIndex}
    />
  </div>

)}

          </div>

        </div>
      );
    }

    if (panel === "grammar" && showGrammar) {
      return (
        <div
          key="grammar"
          className={`${isVertical && showLeft ? "w-full h-[70%]" : widthClass
            } ${isVertical ? "border-t" : "border-l"} flex`}
        >
          <GrammarBoard
            selectedGrammarTableId={selectedGrammarTableId}
          />
        </div>
      );
    }

    if (panel === "board" && showBoard) {
      return (
        <div
          key="board"
          className={`${widthClass} ${isVertical ? "border-t" : "border-l"} flex`}
        >
          <WhiteBoard />
        </div>
      );
    }

    if (panel === "score" && showScore) {
      return (
        <div
          key="score"
          className={`${widthClass} ${isVertical ? "border-t" : "border-l"} flex`}
        >
          <ScoreCard
            onCorrect={handleCorrect}
            onPass={handlePass}
            onReset={handleReset}
            onShowResult={(data: any) => {
              setResultData(data);
              setShowResult(true);
            }}
          />
        </div>
      );
    }

    return null;
  };
  return (
    <>
      <div
        className={`flex flex-1 overflow-hidden ${isVertical ? "flex-col" : "flex-row"
          }`}
      >
        {panelOrder.map(renderPanel)}
      </div>
    </>
  );
}

