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
  showLeft,        // ✅ NEW
  setShowLeft      // ✅ NEW
}: any) {

  return (

    <div className="flex gap-3 flex-wrap justify-center items-center">

      {/* PREV */}
      <button
        onClick={prevSentence}
        disabled={!isVocab && currentIndex === 0}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
      >
        Prev
      </button>

      {/* NEXT */}
      <button
        onClick={nextSentence}
        disabled={!isVocab && currentIndex >= sentences.length}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
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
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Reset
        </button>
      )}

      {/* SHOW ALL */}
      <button
        onClick={toggleShowAll}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {showAll ? "Hide All" : "Show All"}
      </button>

      {/* RANDOM */}
      {isVocab && (
        <button
          onClick={()=>setRandomMode((p:any)=>!p)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {randomMode ? "Normal" : "Random"}
        </button>
      )}

      {/* BOARD */}
      <button
        onClick={()=>setShowBoard((p:any)=>!p)}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {showBoard ? "Hide Board" : "Show Board"}
      </button>

      {/* TOPIC */}
      <button
        onClick={prevTopic}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        ← Prev Topic
      </button>

      <button
        onClick={nextTopic}
        className="px-4 py-2 bg-orange-600 text-white rounded"
      >
        Next Topic →
      </button>

      {/* SCORE */}
      <button
        onClick={()=>{
          if (showScore) {
            setShowScore(false);
            setShowBoard(true);
          } else {
            setShowBoard(false);
            setShowScore(true);
          }
        }}
        className="px-4 py-2 bg-green-700 text-white rounded"
      >
        {showScore ? "Hide Score" : "Show Score"}
      </button>

      {/* ✅ CHECKBOX GROUP */}
      <div className="flex gap-3 items-center border px-3 py-2 rounded bg-white">

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showLeft}
            onChange={()=>setShowLeft((p:any)=>!p)}
          />
          Left
        </label>

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showBoard}
            onChange={()=>setShowBoard((p:any)=>!p)}
          />
          Board
        </label>

        <label className="flex items-center gap-1 text-sm">
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