"use client";

export default function Controls({
  prevSentence,
  nextSentence,
  onBack,
  currentIndex,
  sentences,
  isConversation,
  isImageExplanation,
  showAll,
  toggleShowAll,
  setShowAll,
  setCurrentIndex,
  showEnglish,
  showBoard,
  setShowBoard,
  prevTopic,
  nextTopic,
  showScore,
  setShowScore,
  randomMode,
  setRandomMode,
  showLeft,
  setShowLeft,
  onSwitch,
  switchLanguageMode,
  showGrammar,
  setShowGrammar,
  showImages,
  setShowImages,
  layout,
  setLayout,
  studentMode = false
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
        disabled={currentIndex < 0}
        className={`${toolBtn} font-medium text-blue-700 disabled:opacity-40`}
      >
        Prev
      </button>

      <button
        onClick={nextSentence}
        disabled={
          showAll
            ? currentIndex >= sentences.length - 1
            : currentIndex >= sentences.length - 1 && showEnglish
        }
        className={`${toolBtn} font-medium text-blue-700 disabled:opacity-40`}
      >
        Next
      </button>

      {!isConversation && !isImageExplanation && (
        <button
          onClick={() => {
            if (showAll) {
              setShowAll(false);
              setCurrentIndex(-1);
            } else {
              setShowAll(true);
            }
          }}
          disabled={sentences.length === 0 || (showAll && currentIndex < 0)}
          className={`${toolBtn} font-medium text-red-600 disabled:opacity-40`}
        >
          {showAll ? "Hide All" : "Show All"}
        </button>
      )}
      <button
        onClick={onSwitch}
        className="px-3 py-1 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
      >
        {switchLanguageMode ? "Eng | Hi" : "Hi | Eng"}
      </button>
      <button
        onClick={() => setRandomMode((p: any) => !p)}
        className={`${toolBtn} font-medium text-green-700`}
      >
        {randomMode ? "Normal" : "Random"}
      </button>
      {studentMode && onBack && (
        <button
          onClick={onBack}
          className={`${toolBtn} font-medium text-gray-700`}
        >
          ← Back
        </button>
      )}

      {!studentMode && !isConversation && !isImageExplanation && (
        <button
          onClick={prevTopic}
          className={`${toolBtn} font-medium text-indigo-700`}
        >
          ← T
        </button>
      )}

      {!studentMode && !isConversation && !isImageExplanation && (
        <button
          onClick={nextTopic}
          className={`${toolBtn} font-medium text-orange-700`}
        >
          T →
        </button>
      )}

      {!studentMode && (
        <>
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

            <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
              <input
                type="checkbox"
                checked={showGrammar}
                onChange={() => setShowGrammar((p: any) => !p)}
              />
              Gra
            </label>

            <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
              <input
                type="checkbox"
                checked={showImages}
                onChange={() => setShowImages((p: any) => !p)}
              />
              Img
            </label>

          </div>

          {/* LAYOUT GROUP */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-300">

            <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
              <input
                type="radio"
                name="layout"
                checked={layout === "horizontal"}
                onChange={() => setLayout("horizontal")}
              />
              L-R
            </label>

            <label className="flex items-center gap-1 text-[13px] font-normal text-gray-700">
              <input
                type="radio"
                name="layout"
                checked={layout === "vertical"}
                onChange={() => setLayout("vertical")}
              />
              Up-D
            </label>

          </div>
        </>
      )}

    </div>
  );
}