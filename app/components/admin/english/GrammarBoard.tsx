"use client";

import GrammarTable from "./grammar/GrammarTable";

export default function GrammarBoard() {

  const data = [
  {
    id: 1,
    hindi: "मैं क्रिकेट खेल सकता हूँ",
    rows: [
      { subject: "I", hv1: "can", verb: "play", object: "cricket" }
    ]
  },
  {
    id: 2,
    hindi: "मुझे क्रिकेट खेलना चाहिए",
    rows: [
      { subject: "I", hv1: "should", verb: "play", object: "cricket" }
    ]
  },
  {
    id: 3,
    hindi: "मैं क्रिकेट खेलता हूँ",
    rows: [
      { subject: "I", hv1: "", verb: "play", object: "cricket" }
    ]
  },
  {
    id: 4,
    hindi: "मेरे पास बैट है",
    rows: [
      { subject: "I", hv1: "have", verb: "", object: "a bat" }
    ]
  },
  {
    id: 5,
    hindi: "मैं खिलाड़ी हूँ",
    rows: [
      { subject: "I", hv1: "am", verb: "", object: "a player" }
    ]
  },
  {
    id: 6,
    hindi: "मैं क्रिकेट खेल रहा हूँ",
    rows: [
      { subject: "I", hv1: "am", verb: "playing", object: "cricket" }
    ]
  },
  {
    id: 7,
    hindi: "मेरी कॉलोनी में एक मैदान है",
    rows: [
      { subject: "There", hv1: "is", verb: "", object: "a ground in my colony" }
    ]
  }
];

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <GrammarTable data={data} />
    </div>
  );
}