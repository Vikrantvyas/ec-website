"use client";

import { useState, useEffect, useRef } from "react";

export default function ScoreCard() {

  const [score, setScore] = useState(0);

  // ⏱ STOPWATCH
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // ⏳ TIMER
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
      interval = setInterval(() => {
        setTimer(p => p - 1);
      }, 1000);
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

  return (

    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center p-2 border-b">

        <div className="font-semibold">Score Board</div>

        <button
          onClick={()=>setScore(0)}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
        >
          Reset Score
        </button>

      </div>

      {/* BUZZER */}
      <audio ref={audioRef} src="/buzzer.mp3" />

      {/* BODY */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">

        {/* SCORE */}
        <div className="flex flex-col items-center justify-center border rounded">

          <div className="text-4xl font-bold">{score}</div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={()=>setScore(p=>p+1)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              +1
            </button>

            <button
              onClick={()=>setScore(p=>Math.max(0,p-1))}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              -1
            </button>
          </div>

        </div>

        {/* STOPWATCH */}
        <div className="flex flex-col items-center justify-center border rounded">

          <div className="font-semibold">Stopwatch</div>

          <div className="text-2xl mt-2">{format(time)}</div>

          <div className="flex gap-2 mt-3">
            <button onClick={()=>setRunning(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
            <button onClick={()=>setRunning(false)} className="px-3 py-1 bg-yellow-500 text-white rounded">Stop</button>
            <button onClick={()=>{setTime(0); setRunning(false)}} className="px-3 py-1 bg-gray-500 text-white rounded">Reset</button>
          </div>

        </div>

        {/* TIMER */}
        <div className={`flex flex-col items-center justify-center border rounded col-span-2 ${
          timeUp ? "bg-red-100" : ""
        }`}>

          <div className="font-semibold">Timer</div>

          <div className="text-3xl mt-2">
            {format(timer)}
          </div>

          {/* INPUT */}
          <div className="flex gap-2 mt-3 items-center">

            <input
              type="number"
              value={inputMin}
              min={1}
              onChange={(e)=>setInputMin(Number(e.target.value))}
              className="w-16 border px-2 py-1 text-center"
            />

            <button
              onClick={()=>{
                setTimer(inputMin * 60);
                setTimerRunning(false);
                setTimeUp(false);
              }}
              className="px-3 py-1 bg-gray-600 text-white rounded"
            >
              Set
            </button>

          </div>

          {/* CONTROLS */}
          <div className="flex gap-2 mt-3">

            <button
              onClick={()=>{
                setTimerRunning(true);
                setTimeUp(false);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Start
            </button>

            <button
              onClick={()=>setTimerRunning(false)}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Pause
            </button>

            <button
              onClick={()=>{
                setTimer(inputMin * 60);
                setTimerRunning(false);
                setTimeUp(false);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded"
            >
              Reset
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}