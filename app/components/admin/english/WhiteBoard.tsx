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

      <div
        className="flex-1 relative bg-white"
        onClick={addText}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 32px)"
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
  ? item.fontSize - 4   // 🔥 Hindi थोड़ा छोटा
  : item.fontSize,
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
  textDecoration: item.underline?"underline":"none",
  minWidth: "400px",      // 🔥 width increased
  maxWidth: "90%",
  width: "auto",
  minHeight: "400px",      // 🔥 height increased
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