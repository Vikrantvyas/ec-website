"use client";

import { useState, useRef, useEffect } from "react";

export default function EnglishPage() {

  const [activeTab, setActiveTab] = useState("Day 1");
  const [whiteboard, setWhiteboard] = useState(false);

  const tabs = ["Day 1", "Day 2", "Day 3"];

  return (

    <div className="flex h-[calc(100vh-56px)] bg-gray-100 overflow-hidden english-page">

      {/* 🔥 LEFT MINI TOOLBAR */}
      <div className="w-14 bg-white border-r flex flex-col items-center py-3 gap-3">

        <button
          onClick={() => setWhiteboard(false)}
          className={`w-10 h-10 rounded ${
            !whiteboard ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📄
        </button>

        <button
          onClick={() => setWhiteboard(true)}
          className={`w-10 h-10 rounded ${
            whiteboard ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          ✏️
        </button>

      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col items-center justify-start pt-4 gap-2 overflow-hidden">

        {/* 🔽 TABS */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 📺 MAIN BOX */}
        <div
          className="bg-white border shadow"
          style={{
            width: "25cm",
            height: "12cm",
          }}
        >

          {!whiteboard ? (
            <div className="h-full overflow-y-auto p-3 space-y-2">

              <h2 className="font-semibold">{activeTab}</h2>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

              <p>Teaching content...</p>
              <p>Scroll content...</p>
              <p>More content...</p>

            </div>
          ) : (
            <WhiteBoard />
          )}

        </div>

      </div>

    </div>
  );
}

/* ================= WHITEBOARD ================= */

function WhiteBoard() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  const start = (e: any) => {
    setDrawing(true);
    draw(e);
  };

  const end = () => setDrawing(false);

  const draw = (e: any) => {

    if (!drawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clear = () => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (

    <div className="h-full flex flex-col">

      <div className="p-1">
        <button
          onClick={clear}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={250}
        className="flex-1 border"
        onMouseDown={start}
        onMouseUp={end}
        onMouseMove={draw}
      />

    </div>
  );
}