"use client";

export default function Controls({
  prevSentence,
  nextSentence,
  currentIndex,
  sentences,
  showAll,
  toggleShowAll,
  setShowAll,
  setCurrentIndex,
  showBoard,
  setShowBoard,
  prevTopic,
  nextTopic,
  showScore,
  setShowScore,
  isVocab,
  randomMode,
  setRandomMode,
  showLeft,
  setShowLeft,
  showGrammar,
  setShowGrammar,
  layout,
  setLayout
}: any) {

  const baseBtn =
    "h-10 px-3 flex items-center justify-center rounded text-sm";
  const groupBox =
    "inline-flex items-center gap-2";
  const toolBtn =
    "h-8 px-2 text-sm rounded hover:bg-gray-100 transition-colors";

  return (

    <div className={groupBox}>

      <button
        onClick={prevSentence}
        disabled={!isVocab && currentIndex === 0}
        className={`${toolBtn} disabled:opacity-40`}
      >
        Prev
      </button>

      <button
        onClick={nextSentence}
        disabled={!isVocab && currentIndex >= sentences.length}
        className={`${toolBtn} font-medium text-blue-700 disabled:opacity-40`}
      >
        Next
      </button>

      <button
        onClick={toggleShowAll}
        className={`${toolBtn} font-medium text-red-600`}
      >
        {showAll ? "Hide All" : "Show All"}
      </button>

      <button
        onClick={() => setRandomMode((p: any) => !p)}
        className={`${toolBtn} font-medium text-green-700`}
      >
        {randomMode ? "Normal" : "Random"}
      </button>

      <button
        onClick={prevTopic}
        className={`${toolBtn} font-medium text-indigo-700`}
      >
        ← Topic
      </button>

      <button
        onClick={nextTopic}
        className={`${toolBtn} font-medium text-orange-700`}
      >
        Topic →
      </button>

      {/* CHECKBOX GROUP */}
      <div className="flex items-center gap-3 pl-4 border-l border-gray-300">

        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="checkbox"
            checked={showLeft}
            onChange={() => setShowLeft((p: any) => !p)}
          />
          Left
        </label>

        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="checkbox"
            checked={showBoard}
            onChange={() => setShowBoard((p: any) => !p)}
          />
          Board
        </label>

        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="checkbox"
            checked={showScore}
            onChange={() => setShowScore((p: any) => !p)}
          />
          Score
        </label>

        {/* 🔥 FORCE SHOW */}
        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="checkbox"
            checked={showGrammar}
            onChange={() => setShowGrammar((p: any) => !p)}
          />
          Grammar
        </label>

      </div>
      <div className="flex items-center gap-3 pl-4 border-l border-gray-300">

        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="radio"
            name="layout"
            checked={layout === "horizontal"}
            onChange={() => setLayout("horizontal")}
          />
          Left-Right
        </label>

        <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
          <input
            type="radio"
            name="layout"
            checked={layout === "vertical"}
            onChange={() => setLayout("vertical")}
          />
          Up-Down
        </label>

      </div>
    </div>

  );
}