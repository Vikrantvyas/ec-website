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
  setShowLeft
}: any) {

  const baseBtn =
    "h-10 px-3 flex items-center justify-center rounded text-sm";

  return (

    <div className="flex flex-wrap gap-2 justify-center items-center">

      {/* PREV */}
      <button
        onClick={prevSentence}
        disabled={!isVocab && currentIndex === 0}
        className={`${baseBtn} bg-gray-200 disabled:opacity-40`}
      >
        Prev
      </button>

      {/* NEXT */}
      <button
        onClick={nextSentence}
        disabled={!isVocab && currentIndex >= sentences.length}
        className={`${baseBtn} bg-blue-600 text-white disabled:opacity-40`}
      >
        Next
      </button>

      {/* RESET */}
      {!isVocab && (currentIndex >= sentences.length || showAll) && (
        <button
          onClick={()=>{
            setShowAll(false);
            setCurrentIndex(0);
          }}
          className={`${baseBtn} bg-red-600 text-white`}
        >
          Reset
        </button>
      )}

      {/* SHOW ALL */}
      <button
        onClick={toggleShowAll}
        className={`${baseBtn} bg-green-600 text-white`}
      >
        {showAll ? "Hide All" : "Show All"}
      </button>

      {/* RANDOM */}
      {isVocab && (
        <button
          onClick={()=>setRandomMode((p:any)=>!p)}
          className={`${baseBtn} bg-indigo-600 text-white`}
        >
          {randomMode ? "Normal" : "Random"}
        </button>
      )}

      {/* TOPIC */}
      <button
        onClick={prevTopic}
        className={`${baseBtn} bg-orange-500 text-white`}
      >
        ← Topic
      </button>

      <button
        onClick={nextTopic}
        className={`${baseBtn} bg-orange-600 text-white`}
      >
        Topic →
      </button>

      {/* PANEL CHECKBOX GROUP */}
      <div className={`${baseBtn} border bg-white gap-3`}>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showLeft}
            onChange={()=>setShowLeft((p:any)=>!p)}
          />
          Left
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showBoard}
            onChange={()=>setShowBoard((p:any)=>!p)}
          />
          Board
        </label>

        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showScore}
            onChange={()=>setShowScore((p:any)=>!p)}
          />
          Score
        </label>

      </div>

    </div>
  );
}