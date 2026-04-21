"use client";

import GrammarTable from "./grammar/GrammarTable";

export default function GrammarBoard() {

  const data = [
    {
      id: 1,
      hindi: "मैं क्या खेल रहा हूँ?",
      rows: [
        { wh: "What", hv1: "am", subject: "I", hv2: "", verb: "playing?", object: "" },
        { wh: "What", hv1: "are", subject: "you", hv2: "", verb: "playing?", object: "" },
        { wh: "What", hv1: "is", subject: "he", hv2: "", verb: "playing?", object: "" },
      ]
    },
    {
      id: 2,
      hindi: "मैं क्या पढ़ रहा हूँ?",
      rows: [
        { wh: "What", hv1: "am", subject: "I", hv2: "", verb: "reading?", object: "" },
        { wh: "What", hv1: "are", subject: "you", hv2: "", verb: "reading?", object: "" },
        { wh: "What", hv1: "is", subject: "she", hv2: "", verb: "reading?", object: "" },
      ]
    }
  ];

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <GrammarTable data={data} />
    </div>
  );
}