"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import WhiteBoard from "@/app/components/admin/english/WhiteBoard";

export default function EnglishPage() {

  const [activeTab, setActiveTab] = useState("Day 1");
  const [whiteboard, setWhiteboard] = useState(false);

  const [sentences, setSentences] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const tabs = ["Day 1", "Day 2", "Day 3"];

  useEffect(() => {
    fetchSentences();
  }, [activeTab]);

  const fetchSentences = async () => {
    const { data } = await supabase
      .from("english_sentences")
      .select("*")
      .eq("day", activeTab)
      .order("order_no", { ascending: true });

    if (data) {
      setSentences(data);
      setCurrentIndex(0);
    }
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSentence = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const visible = sentences.slice(0, currentIndex + 1);
  const leftCol = visible.slice(0, 10);
  const rightCol = visible.slice(10, 20);

  return (

    <div className="flex h-[calc(100vh-56px)] bg-gray-100 overflow-hidden">

      {/* LEFT TOOLBAR */}
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col items-center pt-4 gap-2">

        {/* TABS */}
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

        {/* BOX */}
        <div
          className="bg-white border shadow flex flex-col p-4 gap-3"
          style={{ width: "25cm", height: "12cm" }}
        >

          {!whiteboard ? (

            <>
              {/* HEADER */}
              <div className="flex justify-between items-center border-b pb-2 px-2">
                <div className="text-lg">{activeTab}</div>
                <div className="text-xl">Topic Name</div>
              </div>

              {/* CONTENT */}
              <div className="flex flex-1 gap-6">

                {/* LEFT */}
                <div className="w-1/2 space-y-1">
                  {leftCol.map((item, i) => (
                    <div key={item.id} className="text-2xl leading-tight">
                      {i + 1}. {item.sentence}
                    </div>
                  ))}
                </div>

                {/* RIGHT */}
                <div className="w-1/2 space-y-1">
                  {rightCol.map((item, i) => (
                    <div key={item.id} className="text-2xl leading-tight">
                      {i + 11}. {item.sentence}
                    </div>
                  ))}
                </div>

              </div>

            </>

          ) : (
            <WhiteBoard />
          )}

        </div>

        {/* BUTTONS */}
        {!whiteboard && (
          <div className="flex gap-4 mt-2">

            <button
              onClick={prevSentence}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              ← Prev
            </button>

            <button
              onClick={nextSentence}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next →
            </button>

          </div>
        )}

      </div>

    </div>
  );
}