"use client";

import WhiteBoard from "./WhiteBoard";
import VocabularyPlayer from "./VocabularyPlayer";
import ScoreCard from "./ScoreCard";

export default function MainBoard({
  isVocab,
  sentences,
  visible,
  leftCol,
  rightCol,
  highlightIndex,
  setHighlightIndex,
  showBoard,
  showScore,
  scrollRef,
  vocabRef,
  randomMode   // ✅ ADD THIS
}: any) {

  return (

    <div className="flex flex-1 overflow-hidden">

      {/* LEFT SIDE */}
      <div className={`${(showBoard || showScore) ? "w-1/2" : "w-full"} p-4 flex flex-col`}>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">

          {/* VOCAB */}
          {isVocab ? (
            <VocabularyPlayer
              ref={vocabRef}
              data={sentences}
              random={randomMode}   // ✅ FIXED
            />
          ) : showBoard ? (

            <div className="space-y-1">
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

            <div className="flex gap-4">

              {/* LEFT */}
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

              {/* RIGHT */}
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

      {/* RIGHT SIDE */}
      {(showBoard || showScore) && (
        <div className="w-1/2 border-l flex">
          {showBoard && <WhiteBoard />}
          {showScore && <ScoreCard />}
        </div>
      )}

    </div>

  );
}