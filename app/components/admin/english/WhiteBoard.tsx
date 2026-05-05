"use client";

import { useState, useRef, useEffect } from "react";

export default function WhiteBoard() {

  const LINE_HEIGHT = 32;

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
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // ---------------- HISTORY ----------------
  const saveHistory = (newItems:any[]) => {
    historyRef.current.push(items);
    setItems(newItems);
    redoRef.current = [];
  };

  // ---------------- EDIT ----------------
  const startEditing = (id:string) => {
    setEditingId(id);
    setSelectedId(id);
  };

  const updateText = (id:string, value:string) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, text:value } : i)
    );
  };

  // ---------------- ADD ----------------
  const addText = (e:any) => {

    // अगर drag हो रहा है तो नया text मत बनाओ
    if (draggingId) return;

    const rect = e.currentTarget.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    y = Math.round(y / LINE_HEIGHT) * LINE_HEIGHT;

    const id = Date.now().toString();

    const newItems = [
      ...items,
      { id, text:"", x, y, color, underline, fontSize }
    ];

    saveHistory(newItems);
    startEditing(id);
  };

  // ---------------- DELETE ----------------
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

  // ---------------- CLIPBOARD ----------------
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
      y: item.y + LINE_HEIGHT
    };

    const newItems = [...items, newItem];
    saveHistory(newItems);
    startEditing(newItem.id);
  };

  // ---------------- DRAG ----------------
  const handleMouseDown = (id:string, e:any) => {
    e.stopPropagation();
    setDraggingId(id);
    setSelectedId(id);
  };

  const handleMouseMove = (e:any) => {
    if(!draggingId) return;

    const rect = e.currentTarget.getBoundingClientRect();

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    y = Math.floor(y / LINE_HEIGHT) * LINE_HEIGHT;

    setItems(prev =>
      prev.map(i =>
        i.id === draggingId ? { ...i, x, y } : i
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // ---------------- UNDO / REDO ----------------
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

  // ---------------- STYLE APPLY ----------------


  // ---------------- SHORTCUTS ----------------
  useEffect(()=>{
    const handleKey = (e:any)=>{

      if(e.ctrlKey && e.key === "z") undo();
      if(e.ctrlKey && e.key === "y") redo();
      if(e.ctrlKey && e.key === "c") copy();
      if(e.ctrlKey && e.key === "x") cut();
      if(e.ctrlKey && e.key === "v") paste();

      if(e.key === "Delete") deleteItem();

      // ESC → exit editing
      if(e.key === "Escape") {
        setEditingId(null);
      }

    };

    window.addEventListener("keydown", handleKey);
    return ()=> window.removeEventListener("keydown", handleKey);

  },[items, selectedId]);

  // ---------------- UI ----------------
  return (

    <div className="h-full flex flex-col">

      {/* TOOLBAR */}
      <div className="flex gap-2 p-2 border-b items-center flex-wrap">

        <button onClick={clearAll} className="px-2 py-1 bg-red-500 text-white text-xs rounded">Clear</button>
        <button onClick={deleteItem} className="px-2 py-1 bg-gray-200 text-xs rounded">Delete</button>
        <button onClick={undo} className="px-2 py-1 bg-gray-200 text-xs rounded">Undo</button>
        <button onClick={redo} className="px-2 py-1 bg-gray-200 text-xs rounded">Redo</button>

        <button onClick={copy} className="px-2 py-1 bg-gray-200 text-xs rounded">Copy</button>
        <button onClick={cut} className="px-2 py-1 bg-gray-200 text-xs rounded">Cut</button>
        <button onClick={paste} className="px-2 py-1 bg-gray-200 text-xs rounded">Paste</button>

        <div className="flex gap-2 items-center">

  {["black","red","blue","green","purple","orange"].map(c => (
    <div
      key={c}
      onMouseDown={(e)=>{
        e.preventDefault();

        setColor(c);

        if (editingId) {

          const current = items.find(i => i.id === editingId);
          if (!current) return;

          // 🔥 TEXT WIDTH CALCULATION (PERFECT)
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) return;

          ctx.font = `${fontSize}px Arial`;

          const textWidth = ctx.measureText(current.text || "").width;

          const id = Date.now().toString();

          const newItem = {
            id,
            text: "",
            x: current.x + textWidth + 15,
            y: current.y,
            color: c,
            underline,
            fontSize
          };

          setItems(prev => [...prev, newItem]);

          setEditingId(id);
          setSelectedId(id);
        }
      }}
      className={`w-7 h-7 rounded-full cursor-pointer border-2 border-gray-500 ${
        color === c ? "ring-2 ring-black scale-110" : ""
      }`}
      style={{ backgroundColor: c }}
    />
  ))}

</div>

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
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 32px)"
        }}
      >

        {items.map(item => (

          <div
            key={item.id}
            onMouseDown={(e)=>handleMouseDown(item.id,e)}
            onDoubleClick={(e)=>{
              e.stopPropagation();
              startEditing(item.id);
            }}
            style={{
              position: "absolute",
              top:item.y,
              left:item.x,
              color:item.color,
              fontSize: /[\u0900-\u097F]/.test(item.text)
                ? item.fontSize - 4
                : item.fontSize,
              cursor: "text"
            }}
          >

            {editingId === item.id ? (

              <textarea
  ref={(el) => { if (el) textareaRefs.current[item.id] = el; }}
             
                autoFocus
                value={item.text}
                onChange={(e)=>updateText(item.id,e.target.value)}
                onBlur={()=>setEditingId(null)}
                className="outline-none bg-transparent resize-none"
                style={{
                  textDecoration: item.underline?"underline":"none",
                  minWidth: "700px",
maxWidth: "95%",
                  minHeight: "320px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}
              />

            ) : (

              <div
                className="whitespace-pre-line"
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