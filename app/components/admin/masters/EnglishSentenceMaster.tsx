"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnglishSentenceMaster() {

  const [day, setDay] = useState("Day 1");
  const [sentence, setSentence] = useState("");
  const [list, setList] = useState<any[]>([]);

  const days = ["Day 1", "Day 2", "Day 3"];

  useEffect(() => {
    fetchData();
  }, [day]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("english_sentences")
      .select("*")
      .eq("day", day)
      .order("order_no", { ascending: true });

    if (data) setList(data);
  };

  const addSentence = async () => {

    if (!sentence.trim()) return;

    const nextOrder = list.length + 1;

    await supabase.from("english_sentences").insert([
      {
        day,
        sentence,
        order_no: nextOrder,
      },
    ]);

    setSentence("");
    fetchData();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("english_sentences").delete().eq("id", id);
    fetchData();
  };

  return (

    <div className="space-y-4">

      {/* TOP FORM */}
      <div className="flex gap-2">

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <input
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Enter sentence"
          className="border px-2 py-1 rounded flex-1"
        />

        <button
          onClick={addSentence}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">

        {list.map((item, i) => (
          <div
            key={item.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <span className="mr-2 font-semibold">{i + 1}.</span>
              {item.sentence}
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="text-red-500 text-xs"
            >
              Delete
            </button>
          </div>
        ))}

      </div>

    </div>
  );
}