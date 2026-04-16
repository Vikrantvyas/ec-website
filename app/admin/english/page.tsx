"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

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

  // 🔥 SPLIT INTO 2 COLUMNS
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
      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center border-b pb-2 px-2">
  <div className="text-lg">{activeTab}</div>
  <div className="text-xl">Topic Name</div>
</div>

      {/* 🔥 CONTENT */}
      <div className="flex flex-1 gap-6">

        {/* LEFT COLUMN */}
        <div className="w-1/2 space-y-1">
          {leftCol.map((item, i) => (
            <div key={item.id} className="text-2xl leading-tight">
              {i + 1}. {item.sentence}
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
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
        {/* 🔥 BUTTONS OUTSIDE */}
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

/* WHITEBOARD */

function WhiteBoard() {

  const [items, setItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [color, setColor] = useState("black");
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(24);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const historyRef = useRef<any[]>([]);
  const redoRef = useRef<any[]>([]);
  const clipboardRef = useRef<any>(null);

  const saveHistory = (newItems:any[]) => {
    historyRef.current.push(items);
    setItems(newItems);
    redoRef.current = [];
  };

  const startEditing = (id:string) => {
    setEditingId(id);
    setSelectedId(id);
  };

  const addText = (e:any) => {
    if (editingId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now().toString();

    const newItems = [
      ...items,
      { id, text:"", x, y, color, underline, fontSize }
    ];

    saveHistory(newItems);
    startEditing(id); // 🔥 always cursor ready
  };

  const updateText = (id:string, value:string) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, text:value } : i)
    );
  };

  const deleteItem = () => {
    if(!selectedId) return;
    saveHistory(items.filter(i=>i.id !== selectedId));
    setSelectedId(null);
    setEditingId(null);
  };

  const clearAll = () => {
    saveHistory([]);
    setSelectedId(null);
    setEditingId(null);
  };

  // COPY / CUT / PASTE
  const copy = () => {
    if(!selectedId) return;
    clipboardRef.current = items.find(i=>i.id === selectedId);
  };

  const cut = () => {
    copy();
    deleteItem();
  };

  const paste = () => {
    if(!clipboardRef.current) return;

    const item = clipboardRef.current;

    const newItem = {
      ...item,
      id: Date.now().toString(),
      x: item.x + 20,
      y: item.y + 20
    };

    const newItems = [...items, newItem];
    saveHistory(newItems);
    startEditing(newItem.id); // 🔥 cursor again
  };

  // DRAG
  const handleMouseDown = (id:string, e:any) => {
    e.stopPropagation();
    setDraggingId(id);
    setSelectedId(id);
  };

  const handleMouseMove = (e:any) => {
    if(!draggingId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setItems(prev =>
      prev.map(i =>
        i.id === draggingId ? { ...i, x, y } : i
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // UNDO REDO
  const undo = () => {
    if(historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    redoRef.current.push(items);
    setItems(prev || []);
    setEditingId(null);
    setSelectedId(null);
  };

  const redo = () => {
    if(redoRef.current.length === 0) return;
    const next = redoRef.current.pop();
    historyRef.current.push(items);
    setItems(next || []);
    setEditingId(null);
    setSelectedId(null);
  };

  // APPLY STYLE
  useEffect(()=>{
    if(!selectedId) return;

    setItems(prev =>
      prev.map(i =>
        i.id === selectedId
          ? { ...i, color, underline, fontSize }
          : i
      )
    );
  },[color, underline, fontSize]);

  // KEYBOARD
  useEffect(()=>{
    const handleKey = (e:any)=>{
      if(e.ctrlKey && e.key === "z") undo();
      if(e.ctrlKey && e.key === "y") redo();
      if(e.ctrlKey && e.key === "c") copy();
      if(e.ctrlKey && e.key === "x") cut();
      if(e.ctrlKey && e.key === "v") paste();
      if(e.key === "Delete") deleteItem();
    };

    window.addEventListener("keydown", handleKey);
    return ()=> window.removeEventListener("keydown", handleKey);
  },[items, selectedId]);

 return (

  <div className="h-full flex flex-col">

    {/* TOOLS */}
    <div className="flex gap-2 p-2 border-b items-center">

      <button onClick={clearAll} className="px-2 py-1 bg-red-500 text-white text-xs rounded">Clear</button>
      <button onClick={deleteItem} className="px-2 py-1 bg-gray-200 text-xs rounded">Delete</button>
      <button onClick={undo} className="px-2 py-1 bg-gray-200 text-xs rounded">Undo</button>
      <button onClick={redo} className="px-2 py-1 bg-gray-200 text-xs rounded">Redo</button>

      <button onClick={copy} className="px-2 py-1 bg-gray-200 text-xs rounded">Copy</button>
      <button onClick={cut} className="px-2 py-1 bg-gray-200 text-xs rounded">Cut</button>
      <button onClick={paste} className="px-2 py-1 bg-gray-200 text-xs rounded">Paste</button>

      <select value={color} onChange={(e)=>setColor(e.target.value)} className="text-xs border px-1">
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>

      <button
        onClick={()=>setUnderline(prev=>!prev)}
        className={`px-2 py-1 text-xs border rounded ${underline?"bg-gray-300":""}`}
      >
        U
      </button>

      <select
        value={fontSize}
        onChange={(e)=>setFontSize(Number(e.target.value))}
        className="text-xs border px-1"
      >
        <option value={18}>Small</option>
        <option value={24}>Normal</option>
        <option value={32}>Big</option>
        <option value={40}>XL</option>
      </select>

    </div>

    {/* BOARD */}
    <div
      className="flex-1 relative bg-white"
      onClick={addText}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >

      {items.map(item => (

        <div
          key={item.id}
          style={{
            position: "absolute",
            top:item.y,
            left:item.x,
            color:item.color,
            fontSize:item.fontSize,
            cursor: "text"
          }}
        >

          {editingId === item.id ? (

            <textarea
              autoFocus
              value={item.text}
              onChange={(e)=>updateText(item.id,e.target.value)}
              onBlur={()=>setEditingId(null)}
              className="outline-none bg-transparent resize-none"
              style={{
                textDecoration: item.underline?"underline":"none"
              }}
            />

          ) : (

            <div
              onDoubleClick={(e)=>{
                e.stopPropagation();
                startEditing(item.id);
              }}
              className="whitespace-pre-line cursor-text"
              style={{
                textDecoration: item.underline?"underline":"none"
              }}
            >
              {item.text}
            </div>

          )}

        </div>

      ))}

    </div>

  </div>
);
 
}