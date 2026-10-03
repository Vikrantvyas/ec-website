"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const ScoreCard = forwardRef<any, any>(({
  onCorrect,
  onReset,
  onPass,
  imageMode = false,
  onImageNext,
}: any, ref) => {

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const [timer, setTimer] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [inputMin, setInputMin] = useState(1);

  const [started, setStarted] = useState(false);

  // RESULT
  const [showResult, setShowResult] = useState(false);
  const [showCelebration, setShowCelebration] = useState<number[]>([]);
  const celebrationIdRef = useRef(0);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const celebrationColors = [
    "text-green-600",
    "text-blue-600",
    "text-red-600",
    "text-purple-600",
    "text-orange-500",
    "text-pink-600",
    "text-cyan-600",
    "text-yellow-500",
  ];

  const triggerCelebration = () => {
    const id = ++celebrationIdRef.current;

    const color =
      celebrationColors[
      (id - 1) % celebrationColors.length
      ];

    setShowCelebration(prev => [
      ...prev,
      { id, color },
    ]);

    setTimeout(() => {
      setShowCelebration(prev =>
        prev.filter(item => item.id !== id)
      );
    }, 1800);
  };

  // =========================================================
  // STOPWATCH
  // =========================================================

  useEffect(() => {

    let interval: any;

    if (running) {
      interval = setInterval(() => {
        setTime(p => p + 1);
      }, 1000);
    }

    return () => clearInterval(interval);

  }, [running]);


  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {

    let interval: any;

    if (timerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(p => p - 1);
      }, 1000);
    }

    if (timer === 0 && timerRunning) {

      setTimerRunning(false);
      setTimeUp(true);
      setShowTimeUp(true);
      setRunning(false);

      audioRef.current?.play().catch(() => { });

      setTimeout(() => {
        setShowTimeUp(false);
      }, 4000);
    }

    return () => clearInterval(interval);

  }, [timerRunning, timer]);


  // =========================================================
  // LIVE TIMER UPDATE
  // =========================================================

  useEffect(() => {

    if (!timerRunning) {
      setTimer(inputMin * 60);
    }

  }, [inputMin, timerRunning]);


  // =========================================================
  // FORMAT
  // =========================================================

  const format = (t: number) => {

    const m = Math.floor(t / 60);
    const s = t % 60;

    return `${m}:${s < 10 ? "0" : ""}${s}`;

  };


  // =========================================================
  // ADD STUDENT
  // =========================================================

  const addStudent = () => {

    if (!name.trim()) return;

    setStudents(prev => [
      {
        name,
        correct: 0,
        total: 0,
      },
      ...prev,
    ]);

    setActiveIndex(0);
    setName("");

    onReset?.();

  };


  // =========================================================
  // START GAME
  // =========================================================

  const startGame = () => {

    if (students.length === 0) return;

    setStarted(true);
    setShowResult(false);

    setScore(0);
    setTotal(0);

    setActiveIndex(0);

    setTimer(inputMin * 60);
    setTimerRunning(true);

    setTimeUp(false);

    setTime(0);
    setRunning(true);

    onReset?.();

    /*
      Vocabulary mode में Start के बाद
      पहला question शुरू कराया जाता है।

      Image mode में selected image पहले से दिखाई दे रही है,
      इसलिए उसे आगे नहीं बढ़ाएँगे।
    */

    if (!imageMode) {

      setTimeout(() => {
        onPass?.();
      }, 50);

    }

  };


  // =========================================================
  // NEXT IMAGE
  // =========================================================

  const moveNextImage = () => {

    if (!imageMode) return;

    onImageNext?.();

  };


  // =========================================================
  // +1
  // =========================================================

  const handleCorrect = () => {

    if (activeIndex === null) return;

    setScore(p => p + 1);
    setTotal(p => p + 1);

    triggerCelebration();

    setStudents(prev => {

      const copy = [...prev];

      copy[activeIndex] = {
        ...copy[activeIndex],
        correct: copy[activeIndex].correct + 1,
        total: copy[activeIndex].total + 1,
      };

      return copy;

    });

    if (imageMode) {

      moveNextImage();

      return;
    }

    onCorrect?.();

  };


  // =========================================================
  // 0
  // =========================================================

  const handlePass = () => {

    if (activeIndex === null) return;

    setTotal(p => p + 1);

    setStudents(prev => {

      const copy = [...prev];

      copy[activeIndex] = {
        ...copy[activeIndex],
        total: copy[activeIndex].total + 1,
      };

      return copy;

    });

    if (imageMode) {

      moveNextImage();

      return;
    }

    onPass?.();

  };


  // =========================================================
  // -1
  // =========================================================

  const handleMinus = () => {

    if (activeIndex === null) return;

    setScore(p => p - 1);
    setTotal(p => p + 1);

    setStudents(prev => {

      const copy = [...prev];

      copy[activeIndex] = {
        ...copy[activeIndex],
        correct: Math.max(
          0,
          copy[activeIndex].correct - 1
        ),
        total: copy[activeIndex].total + 1,
      };

      return copy;

    });

    if (imageMode) {

      moveNextImage();

      return;
    }

    onPass?.();

  };


  // =========================================================
  // RESET ALL
  // =========================================================

  const resetAll = () => {
    setScore(0);
    setTotal(0);

    setStudents([]);
    setActiveIndex(null);

    setTime(0);
    setRunning(false);

    setTimer(inputMin * 60);
    setTimerRunning(false);
    setTimeUp(false);
    setShowTimeUp(false);

    setStarted(false);
    setShowResult(false);
    setShowCelebration(false);

    onReset?.();
  };


  // =========================================================
  // MCQ CORRECT
  // =========================================================

  const handleMcqCorrect = () => {

    if (activeIndex === null) return;

    setScore(p => p + 1);
    setTotal(p => p + 1);

    triggerCelebration();

    setStudents(prev => {

      const copy = [...prev];

      copy[activeIndex] = {
        ...copy[activeIndex],
        correct: copy[activeIndex].correct + 1,
        total: copy[activeIndex].total + 1,
      };

      return copy;

    });

  };


  // =========================================================
  // MCQ PASS
  // =========================================================

  const handleMcqPass = () => {

    if (activeIndex === null) return;

    setTotal(p => p + 1);

    setStudents(prev => {

      const copy = [...prev];

      copy[activeIndex] = {
        ...copy[activeIndex],
        total: copy[activeIndex].total + 1,
      };

      return copy;

    });

  };


  // =========================================================
  // IMPERATIVE HANDLE
  // =========================================================

  useImperativeHandle(ref, () => ({
    correct: handleCorrect,
    pass: handlePass,
    mcqCorrect: handleMcqCorrect,
    mcqPass: handleMcqPass,
    reset: resetAll,
  }));


  // =========================================================
  // RESULT
  // =========================================================

  const handleResult = () => {

    setShowResult(true);

    setStarted(false);
    setTimerRunning(false);
    setRunning(false);

    if (students.length > 0) {
      setShowWinnerCelebration(true);

      setTimeout(() => {
        setShowWinnerCelebration(false);
      }, 3500);
    }

  };

  // =========================================================
  // RESULT DATA
  // =========================================================

  const groupedResults: any[] = Object.values(
    students.reduce((acc: any, student: any) => {

      const marks = student.correct;

      if (!acc[marks]) {
        acc[marks] = {
          marks,
          names: [],
        };
      }

      acc[marks].names.push(student.name);

      return acc;

    }, {})
  ).sort(
    (a: any, b: any) => b.marks - a.marks
  );


  const disabled =
    !started || !timerRunning;

  const blurClass =
    disabled
      ? "opacity-40 pointer-events-none"
      : "";


  // =========================================================
  // RESULT VIEW
  // =========================================================

  if (showResult) {

    return (

      <div className="flex flex-col w-full h-full min-w-0 border bg-gray-50">

        {/* RESULT HEADER */}

        <div className="flex justify-between items-center p-3 border-b bg-white">

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
        {showWinnerCelebration && groupedResults.length > 0 && (
          <>
            <style jsx>{`
      @keyframes winnerCelebration {
        0% {
          transform: scale(0.4) translateY(40px);
          opacity: 0;
          filter: blur(8px);
        }

        25% {
          transform: scale(1.15) translateY(0);
          opacity: 1;
          filter: blur(0);
        }

        70% {
          transform: scale(1) translateY(-8px);
          opacity: 1;
        }

        100% {
          transform: scale(1.08) translateY(-20px);
          opacity: 0;
          filter: blur(6px);
        }
      }

      .winnerCelebration {
        animation: winnerCelebration 3.5s ease-out forwards;
      }
    `}</style>

            <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
              <div className="winnerCelebration text-center">

                <div className="text-[110px] leading-none">
                  🏆
                </div>

                <div className="text-[70px] leading-none font-black text-yellow-500">
                  1st
                </div>

                <div className="text-4xl font-black text-green-600 mt-2">
                  {groupedResults[0].names.join(" | ")}
                </div>

                <div className="text-2xl font-bold text-gray-700 mt-2">
                  Winner!
                </div>

              </div>
            </div>
          </>
        )}

        {/* RESULT LIST */}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {groupedResults.map((group: any, i: number) => (

            <div
              key={i}
              className={`flex justify-between items-center border p-3 rounded ${i === 0
                ? "bg-yellow-200 font-bold"
                : "bg-white"
                }`}
            >

              <div className="flex-1">
                {i + 1}. {group.names.join(" | ")}
                {i === 0 && !showWinnerCelebration && (
                  <span className="text-2xl ml-2 align-middle">
                    🏆
                  </span>
                )}
              </div>

              <div className="font-bold ml-3">
                {group.marks}
              </div>

            </div>

          ))}

          {groupedResults.length === 0 && (

            <div className="text-center text-gray-400 p-5">
              No students
            </div>

          )}

        </div>

      </div>

    );

  }


  // =========================================================
  // NORMAL SCORECARD
  // =========================================================

  return (
    <>

      {/* ===================================================== */}
      {/* +1 CELEBRATION */}
      {/* ===================================================== */}

      {showCelebration.length > 0 && (
        <>
          <style jsx>{`
      @keyframes plusOneCelebration {

  0% {
    transform: translateY(180px) scale(0.6);
    opacity: 0;
    filter: blur(4px);
  }

  20% {
    transform: translateY(80px) scale(0.9);
    opacity: 1;
    filter: blur(0);
  }

  55% {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }

  100% {
    transform: translateY(-180px) scale(1.15);
    opacity: 0;
    filter: blur(8px);
  }

}

      .plusOneCelebration {
        animation: plusOneCelebration 1.8s ease-out forwards;
      }
    `}</style>

          <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">

            {showCelebration.map(item => (
              <div
                key={item.id}
                className={`plusOneCelebration absolute text-[180px] leading-none font-black ${item.color} drop-shadow-2xl`}
              >
                +1
              </div>
            ))}

          </div>
        </>
      )}


      <div className="flex flex-col w-full h-full min-w-0 border bg-gray-50">

        <audio
          ref={audioRef}
          src="/buzzer.mp3"
        />


        {/* HEADER */}

        <div className="flex justify-between items-center p-2 border-b">

          <div className="font-semibold">
            Score Board of {students.length}
          </div>

          <button
            onClick={resetAll}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Reset All
          </button>

        </div>


        {/* CONTROLS */}

        <div className="grid grid-cols-3 gap-2 p-2">


          {/* SCORE */}

          <div
            className={`border rounded p-2 text-center ${blurClass}`}
          >

            <div className="text-xs text-gray-500">
              Score
            </div>

            <div className="text-3xl font-bold">
              {score}
            </div>

            <div className="flex gap-1 mt-2">

              <button
                disabled={disabled}
                onClick={handleCorrect}
                className="flex-1 bg-green-600 text-white rounded h-8"
              >
                +1
              </button>

              <button
                disabled={disabled}
                onClick={handlePass}
                className="flex-1 bg-gray-500 text-white rounded h-8"
              >
                0
              </button>

              <button
                disabled={disabled}
                onClick={handleMinus}
                className="flex-1 bg-red-600 text-white rounded h-8"
              >
                -1
              </button>

            </div>

          </div>


          {/* TIMER */}

          <div
            className={`border rounded p-2 text-center ${showTimeUp
              ? "bg-red-500 text-white animate-pulse"
              : ""
              }`}
          >

            <div className="text-xs text-gray-500 flex justify-center gap-1 items-center">

              Timer

              <input
                type="number"
                value={inputMin}
                onChange={(e) =>
                  setInputMin(Number(e.target.value))
                }
                className="w-10 border text-xs text-center"
              />

              <span>min</span>

            </div>

            <div
              className={`text-3xl font-bold ${timer <= 10 && timerRunning
                ? "text-red-600 animate-pulse"
                : ""
                }`}
            >
              {format(timer)}
            </div>

            <div className="flex gap-1 mt-2">

              <button
                className="flex-1 bg-green-600 text-white rounded h-8"
                onClick={() => setTimerRunning(true)}
              >
                ▶
              </button>

              <button
                className="flex-1 bg-yellow-500 text-white rounded h-8"
                onClick={() => setTimerRunning(false)}
              >
                ⏸
              </button>

            </div>

          </div>


          {/* STOPWATCH */}

          <div
            className={`border rounded p-2 text-center ${blurClass}`}
          >

            <div className="text-xs text-gray-500">
              Stopwatch
            </div>

            <div className="text-3xl font-bold">
              {format(time)}
            </div>

            <div className="flex gap-1 mt-2">

              <button
                className="flex-1 bg-blue-600 text-white rounded h-8"
                onClick={() => setRunning(true)}
              >
                ▶
              </button>

              <button
                className="flex-1 bg-yellow-500 text-white rounded h-8"
                onClick={() => setRunning(false)}
              >
                ⏸
              </button>

            </div>

          </div>

        </div>


        {/* ADD + START + RESULT */}

        <div className="p-2 border-b flex gap-2 bg-white">

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Student name"
            className="flex-1 border px-2 py-1"
          />

          <button
            onClick={addStudent}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Add
          </button>

          <button
            onClick={startGame}
            className="bg-green-600 text-white px-3 rounded"
          >
            Start
          </button>

          <button
            onClick={handleResult}
            className="bg-purple-600 text-white px-3 rounded"
          >
            Result
          </button>

        </div>


        {/* STUDENTS */}

        <div className="flex-1 overflow-y-auto p-2 space-y-2">

          {students.map((s, i) => (

            <div
              key={i}
              className={`flex items-center gap-3 justify-between border p-2 rounded ${i === activeIndex
                ? "bg-yellow-100"
                : ""
                }`}
            >

              <div>
                {s.name}
              </div>

              <div className="flex items-center gap-2">


                {/* MINUS */}

                <button
                  onClick={() => {

                    setStudents(prev => {

                      const copy = [...prev];

                      if (copy[i].correct > 0) {

                        copy[i].correct -= 1;

                        setScore(p => p - 1);

                      }

                      return copy;

                    });

                  }}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  -
                </button>


                {/* DISPLAY */}

                <div className="font-bold w-16 text-center">
                  {s.correct}/{s.total}
                </div>


                {/* PLUS */}

                <button
                  onClick={() => {

                    setStudents(prev => {

                      const copy = [...prev];

                      copy[i].correct += 1;

                      setScore(p => p + 1);

                      triggerCelebration();

                      return copy;

                    });

                  }}
                  className="bg-green-600 text-white px-2 rounded"
                >
                  +
                </button>


                {/* DELETE */}

                <button
                  onClick={() => {

                    setStudents(prev =>
                      prev.filter(
                        (_, index) => index !== i
                      )
                    );

                    if (activeIndex === i) {
                      setActiveIndex(null);
                    }

                  }}
                  className="bg-red-600 text-white px-2 rounded"
                >
                  ✕
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </>
  );

});

ScoreCard.displayName = "ScoreCard";

export default ScoreCard;