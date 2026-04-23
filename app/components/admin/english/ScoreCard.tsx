"use client";

import { useEffect, useRef, useState } from "react";

export default function ScoreCard({
  onCorrect,
  onReset,
  onPass,
  onShowResult
}: any) {

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
  const [inputMin, setInputMin] = useState(1);

  const [started, setStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // STOPWATCH
  useEffect(() => {
    let interval:any;
    if (running) {
      interval = setInterval(() => setTime(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  // TIMER
  useEffect(() => {
    let interval:any;

    if (timerRunning && timer > 0) {
      interval = setInterval(() => setTimer(p => p - 1), 1000);
    }

    if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      setTimeUp(true);
      setRunning(false);
      audioRef.current?.play().catch(()=>{});
    }

    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  // LIVE TIMER UPDATE
  useEffect(() => {
    if (!timerRunning) {
      setTimer(inputMin * 60);
    }
  }, [inputMin, timerRunning]);

  const format = (t:number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const addStudent = () => {
    if (!name.trim()) return;

    setStudents(prev => [
      { name, correct: 0, total: 0 },
      ...prev
    ]);

    setActiveIndex(0);
    setName("");
  };

  const startGame = () => {
    if (students.length === 0) return;

    setStarted(true);
    setScore(0);
    setTotal(0);
    setActiveIndex(0);
    setTimer(inputMin * 60);

    setTimerRunning(true);
    setTimeUp(false);

    setTime(0);
    setRunning(true);

    onReset?.();

    setTimeout(() => {
      onPass?.();
    }, 50);
  };

  const handleCorrect = () => {
    if (activeIndex === null) return;

    setScore(p => p + 1);
    setTotal(p => p + 1);

    setStudents(prev => {
      const copy = [...prev];
      copy[activeIndex].correct += 1;
      copy[activeIndex].total += 1;
      return copy;
    });

    onCorrect?.();
  };

  const handlePass = () => {
  if (activeIndex === null) return;

  setTotal(p => p + 1);

  setStudents(prev => {
    const copy = [...prev];
    copy[activeIndex].total += 1;
    return copy;
  });

  onPass?.();
};

  const handleMinus = () => {
  if (activeIndex === null) return;

  setScore(p => p - 1);
  setTotal(p => p + 1);

  setStudents(prev => {
    const copy = [...prev];
    if (copy[activeIndex].correct > 0) {
      copy[activeIndex].correct -= 1;
    }
    copy[activeIndex].total += 1;
    return copy;
  });

  onPass?.();
};

  const resetAll = () => {
    setScore(0);
    setTotal(0);

    setTime(0);
    setRunning(false);

    setTimer(inputMin * 60);
    setTimerRunning(false);
    setTimeUp(false);

    setStarted(false);

    onReset?.();
  };

  const handleResult = () => {
    const sorted = [...students].sort(
      (a, b) => b.correct - a.correct
    );

    onShowResult?.(sorted);

    setStarted(false);
    setTimerRunning(false);
    setRunning(false);
  };

  const disabled = !started || !timerRunning;
  const blurClass = disabled ? "opacity-40 pointer-events-none" : "";

  return (
    <div className="flex flex-col h-full border bg-gray-50">

      <audio ref={audioRef} src="/buzzer.mp3" />

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
        <div className={`border rounded p-2 text-center ${blurClass}`}>
          <div className="text-xs text-gray-500">Score</div>
          <div className="text-3xl font-bold">{score}</div>

          <div className="flex gap-1 mt-2">
            <button disabled={disabled} onClick={handleCorrect} className="flex-1 bg-green-600 text-white rounded h-8">+1</button>
            <button disabled={disabled} onClick={handlePass} className="flex-1 bg-gray-500 text-white rounded h-8">0</button>
            <button disabled={disabled} onClick={handleMinus} className="flex-1 bg-red-600 text-white rounded h-8">-1</button>
          </div>
        </div>

        {/* TIMER (ALWAYS ENABLED INPUT) */}
        <div className="border rounded p-2 text-center">
          <div className="text-xs text-gray-500 flex justify-center gap-1 items-center">
            Timer
            <input
              type="number"
              value={inputMin}
              onChange={(e)=>setInputMin(Number(e.target.value))}
              className="w-10 border text-xs text-center"
            />
            <span>min</span>
          </div>

          <div className="text-3xl font-bold">{format(timer)}</div>

          <div className="flex gap-1 mt-2">
            <button className="flex-1 bg-green-600 text-white rounded h-8" onClick={()=>setTimerRunning(true)}>▶</button>
            <button className="flex-1 bg-yellow-500 text-white rounded h-8" onClick={()=>setTimerRunning(false)}>⏸</button>
          </div>
        </div>

        {/* STOPWATCH */}
        <div className={`border rounded p-2 text-center ${blurClass}`}>
          <div className="text-xs text-gray-500">Stopwatch</div>
          <div className="text-3xl font-bold">{format(time)}</div>

          <div className="flex gap-1 mt-2">
            <button className="flex-1 bg-blue-600 text-white rounded h-8" onClick={()=>setRunning(true)}>▶</button>
            <button className="flex-1 bg-yellow-500 text-white rounded h-8" onClick={()=>setRunning(false)}>⏸</button>
          </div>
        </div>

      </div>

      {/* ADD + START + RESULT */}
      <div className="p-2 border-b flex gap-2 bg-white">

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Student name"
          className="flex-1 border px-2 py-1"
        />

        <button onClick={addStudent} className="bg-blue-600 text-white px-3 rounded">
          Add
        </button>

        <button onClick={startGame} className="bg-green-600 text-white px-3 rounded">
          Start
        </button>

        <button onClick={handleResult} className="bg-purple-600 text-white px-3 rounded">
          Result
        </button>

      </div>

      {/* STUDENTS */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">

        {students.map((s, i) => (
  <div
    key={i}
    className={`flex items-center justify-between border p-2 rounded ${
      i === activeIndex ? "bg-yellow-100" : ""
    }`}
  >
    <div>{s.name}</div>

    <div className="flex items-center gap-2">

      {/* MINUS (only correct -1) */}
      <button
        onClick={()=>{
          setStudents(prev=>{
            const copy=[...prev];
            if(copy[i].correct > 0){
              copy[i].correct -= 1;
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

      {/* PLUS (correct +1, total +1) */}
      <button
  onClick={()=>{
    setStudents(prev=>{
      const copy=[...prev];
      copy[i].correct += 1;
      return copy;
    });
  }}
  className="bg-green-600 text-white px-2 rounded"
>
  +
</button>

    </div>
  </div>
))}

      </div>

    </div>
  );
}