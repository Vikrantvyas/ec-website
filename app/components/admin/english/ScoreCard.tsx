"use client";

import { useState, useEffect, useRef } from "react";

export default function ScoreCard({ onCorrect, onReset, onPass }: any) {

  const [score, setScore] = useState(0);

  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const [timer, setTimer] = useState(60);
  const [inputMin, setInputMin] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

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
      audioRef.current?.play();
    }

    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  const format = (t:number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // STUDENT
  const addStudent = () => {
    if (!name.trim()) return;
    setStudents(prev => [...prev, { name, score: 0 }]);
    setName("");
  };

  const selectStudent = (i:number) => setActiveIndex(i);

  // ACTIONS
  const handleCorrect = () => {
    setScore(p => p + 1);

    if (activeIndex !== null) {
      setStudents(prev => {
        const copy = [...prev];
        copy[activeIndex].score += 1;
        return copy;
      });
    }

    onCorrect?.();
  };

  const handlePass = () => onPass?.();

  const resetAll = () => {
    setScore(0);
    setStudents(prev => prev.map(s => ({ ...s, score: 0 })));
    setActiveIndex(null);

    setTime(0);
    setRunning(false);

    const newTime = inputMin * 60;
    setTimer(newTime);
    setTimerRunning(false);
    setTimeUp(false);

    onReset?.();
  };

  return (

    <div className="h-full flex flex-col">

      <audio ref={audioRef} src="/buzzer.mp3" />

      {/* 🔥 TOP CONTROL BAR (PRO LOOK) */}
      <div className="bg-white border-b p-3 flex flex-col gap-3">

  {/* ROW 1 */}
  <div className="flex justify-between items-center">

  <div className="font-semibold text-lg tracking-wide">
    Score Board
  </div>

  <button
    onClick={resetAll}
    className="px-4 py-1.5 bg-red-600 text-white text-sm rounded shadow"
  >
    Reset All
  </button>

</div>

  {/* ROW 2 */}
  <div className="grid grid-cols-3 gap-3 items-stretch">

  {/* SCORE BOX */}
  <div className="border rounded p-3 flex flex-col justify-between">

    <div className="text-center">
      <div className="text-xs text-gray-500">Score</div>
      <div className="text-3xl font-bold">{score}</div>
    </div>

    <div className="flex gap-2 mt-3">

      <button
        onClick={handleCorrect}
        className="flex-1 bg-green-600 text-white py-1 rounded"
      >
        +1
      </button>

      <button
        onClick={handlePass}
        className="flex-1 bg-gray-500 text-white py-1 rounded"
      >
        0
      </button>

      <button
        onClick={()=>{
          setScore(p => p - 1);

          if (activeIndex !== null) {
            setStudents(prev=>{
              const copy = [...prev];
              copy[activeIndex].score -= 1;
              return copy;
            });
          }
        }}
        className="flex-1 bg-red-600 text-white py-1 rounded"
      >
        -1
      </button>

    </div>

  </div>

  {/* TIMER BOX */}
  <div className={`border rounded p-3 flex flex-col justify-between ${timeUp ? "bg-red-100" : ""}`}>

    <div className="text-center">
      <div className="text-xs text-gray-500">Timer</div>
      <div className="text-xl font-semibold">{format(timer)}</div>
    </div>

    <div className="flex gap-1 items-center justify-center mt-2">
      <input
        type="number"
        value={inputMin}
        min={1}
        onChange={(e)=>setInputMin(Number(e.target.value))}
        className="w-12 border px-1 text-xs text-center"
      />

      <button
        onClick={()=>{
          setTimer(inputMin * 60);
          setTimerRunning(false);
          setTimeUp(false);
        }}
        className="px-2 bg-gray-600 text-white rounded text-xs"
      >
        Set
      </button>
    </div>

    <div className="flex justify-center gap-1 mt-2">
      <button onClick={()=>{setTimerRunning(true);setTimeUp(false);}} className="px-2 bg-green-600 text-white rounded text-xs">▶</button>
      <button onClick={()=>setTimerRunning(false)} className="px-2 bg-yellow-500 text-white rounded text-xs">⏸</button>
    </div>

  </div>

  {/* STOPWATCH BOX */}
  <div className="border rounded p-3 flex flex-col justify-between">

    <div className="text-center">
      <div className="text-xs text-gray-500">Stopwatch</div>
      <div className="text-xl font-semibold">{format(time)}</div>
    </div>

    <div className="flex justify-center gap-1 mt-2">
      <button onClick={()=>setRunning(true)} className="px-2 bg-blue-600 text-white rounded text-xs">▶</button>
      <button onClick={()=>setRunning(false)} className="px-2 bg-yellow-500 text-white rounded text-xs">⏸</button>
      <button onClick={()=>{setTime(0);setRunning(false);}} className="px-2 bg-gray-500 text-white rounded text-xs">⟲</button>
    </div>

  </div>

</div>

</div>

      {/* 🔥 STUDENTS LIST */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Student name"
            className="flex-1 border px-2 py-1"
          />
          <button onClick={addStudent} className="px-3 bg-blue-600 text-white rounded">
            Add
          </button>
        </div>

        <div className="space-y-1">
          {students.map((s, i)=>(
            <div
              key={i}
              onClick={()=>selectStudent(i)}
              className={`flex justify-between px-2 py-2 border rounded cursor-pointer ${
                i === activeIndex ? "bg-blue-100" : ""
              }`}
            >
              <span>{s.name}</span>
              <span className="font-bold">{s.score}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}