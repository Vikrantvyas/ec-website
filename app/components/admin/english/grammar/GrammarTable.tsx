"use client";

import { useState, useEffect } from "react";

type Row = {
  [key: string]: any;
};

type Group = {
  id: number;
  hindi: string;
  rows: Row[];
};

export default function GrammarTable({ data }: { data: Group[] }) {

  const [tableData, setTableData] = useState<Group[]>(data);

  const [columns, setColumns] = useState([
    "index","hindi","wh","hv1","subject","hv2","verb","object"
  ]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [menu, setMenu] = useState<any>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [mergedCells, setMergedCells] = useState<any>({});

  // 🔴 UNDO REDO STACK
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const saveHistory = () => {
    setHistory(prev => [...prev, {
      tableData: JSON.parse(JSON.stringify(tableData)),
      columns,
      mergedCells
    }]);
    setRedoStack([]);
  };

  const undo = () => {
    if(history.length === 0) return;

    const last = history[history.length - 1];

    setRedoStack(prev => [...prev, {
      tableData,
      columns,
      mergedCells
    }]);

    setTableData(last.tableData);
    setColumns(last.columns);
    setMergedCells(last.mergedCells);

    setHistory(prev => prev.slice(0,-1));
  };

  const redo = () => {
    if(redoStack.length === 0) return;

    const last = redoStack[redoStack.length - 1];

    setHistory(prev => [...prev, {
      tableData,
      columns,
      mergedCells
    }]);

    setTableData(last.tableData);
    setColumns(last.columns);
    setMergedCells(last.mergedCells);

    setRedoStack(prev => prev.slice(0,-1));
  };

  // 🔴 KEYBOARD LISTENER
  useEffect(()=>{
    const handleKey = (e:any)=>{
      if(e.ctrlKey && e.key === "z"){
        e.preventDefault();
        undo();
      }
      if(e.ctrlKey && e.key === "y"){
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKey);
    return ()=>window.removeEventListener("keydown", handleKey);
  });

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null) return;
    saveHistory();

    const newCols = [...columns];
    const dragged = newCols[dragIndex];

    newCols.splice(dragIndex, 1);
    newCols.splice(dropIndex, 0, dragged);

    setColumns(newCols);
    setDragIndex(null);
  };

  const handleAddColumn = (index:number) => {
    const name = prompt("Column name?");
    if(!name) return;
    saveHistory();

    const newCols = [...columns];
    newCols.splice(index+1, 0, name);

    const updatedData = tableData.map(g => ({
      ...g,
      rows: g.rows.map(r => ({ ...r, [name]: "" }))
    }));

    setColumns(newCols);
    setTableData(updatedData);
    setMenu(null);
  };

  const handleRenameColumn = (index:number) => {
    const oldName = columns[index];
    const name = prompt("New name?", oldName);
    if(!name) return;
    saveHistory();

    const newCols = [...columns];
    newCols[index] = name;

    const updatedData = tableData.map(g => ({
      ...g,
      rows: g.rows.map(r => {
        const newRow = { ...r };
        newRow[name] = newRow[oldName];
        delete newRow[oldName];
        return newRow;
      })
    }));

    setColumns(newCols);
    setTableData(updatedData);
    setMenu(null);
  };

  const handleDeleteColumn = (index:number) => {
    const col = columns[index];

    if(col === "index" || col === "hindi"){
      alert("Cannot delete this column");
      return;
    }
    saveHistory();

    const newCols = columns.filter((_,i)=>i!==index);

    const updatedData = tableData.map(g => ({
      ...g,
      rows: g.rows.map(r => {
        const newRow = { ...r };
        delete newRow[col];
        return newRow;
      })
    }));

    setColumns(newCols);
    setTableData(updatedData);
    setMenu(null);
  };

  const handleCellChange = (g:number,r:number,c:string,value:string)=>{
    const updated = [...tableData];
    updated[g].rows[r][c] = value;
    setTableData(updated);
  };

  const handleCellClick = (g:number,r:number,c:string)=>{
    const key = `${g}-${r}-${c}`;
    setSelected(prev =>
      prev.includes(key)
        ? prev.filter(x=>x!==key)
        : [...prev,key]
    );
  };

  const handleMerge = ()=>{
    if(selected.length < 2) return;
    saveHistory();

    const base = selected[0];
    const rows = selected.map(s=>Number(s.split("-")[1]));
    const cols = selected.map(s=>s.split("-")[2]);

    const rowSpan = Math.max(...rows) - Math.min(...rows) + 1;
    const colSpan = new Set(cols).size;

    const newMerged = {...mergedCells};
    newMerged[base] = { rowSpan, colSpan };

    selected.slice(1).forEach(s=>{
      newMerged[s] = { hidden:true };
    });

    setMergedCells(newMerged);
    setSelected([]);
    setMenu(null);
  };

  const headerMap: any = {
    index: "#",
    hindi: "Hindi",
    wh: "WH",
    hv1: "H.V.",
    subject: "Subject",
    hv2: "H.V.",
    verb: "Verb",
    object: "Object"
  };

  return (

    <div className="w-full h-full" onClick={()=>setMenu(null)}>

      <table className="w-full table-fixed border border-gray-400 text-sm">

        <thead className="bg-gray-300 text-center">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY, colIndex: i });
                }}
                className="border p-2"
              >
                {headerMap[col] || col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {tableData.map((group, gIndex) => (

            group.rows.map((row, rIndex) => (

              <tr key={`${gIndex}-${rIndex}`} className="text-center">

                {columns.map((col) => {

                  if (col === "index" && rIndex === 0) {
                    return (
                      <td key="index" rowSpan={group.rows.length} className="border p-2 font-semibold align-top">
                        {gIndex + 1}.
                      </td>
                    );
                  }

                  if (col === "hindi" && rIndex === 0) {
                    return (
                      <td key="hindi" rowSpan={group.rows.length} className="border p-2 text-left align-top whitespace-nowrap">
                        {group.hindi}
                      </td>
                    );
                  }

                  if (col === "index" || col === "hindi") return null;

                  const key = `${gIndex}-${rIndex}-${col}`;
                  const merge = mergedCells[key];

                  if(merge?.hidden) return null;

                  return (
                    <td
                      key={col}
                      rowSpan={merge?.rowSpan || 1}
                      colSpan={merge?.colSpan || 1}
                      onClick={()=>handleCellClick(gIndex,rIndex,col)}
                      onContextMenu={(e)=>{
                        e.preventDefault();
                        setMenu({ x:e.clientX, y:e.clientY, cell:true });
                      }}
                      className={`border p-1 ${
                        selected.includes(key) ? "bg-yellow-200" : ""
                      }`}
                    >
                      <input
                        value={row[col] || ""}
                        onChange={(e)=>handleCellChange(gIndex,rIndex,col,e.target.value)}
                        className="w-full outline-none text-center"
                      />
                    </td>
                  );

                })}

              </tr>

            ))

          ))}

        </tbody>

      </table>

      {menu && (
        <div
          className="fixed bg-white border shadow-lg text-sm z-50"
          style={{ top: menu.y, left: menu.x }}
        >
          {menu.cell && (
            <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleMerge}>
              🔗 Merge Cells
            </div>
          )}

          {menu.colIndex !== undefined && (
            <>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleAddColumn(menu.colIndex)}>➕ Add Column</div>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleRenameColumn(menu.colIndex)}>✏️ Rename Column</div>
              <div className="px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer" onClick={() => handleDeleteColumn(menu.colIndex)}>🗑 Delete Column</div>
            </>
          )}
        </div>
      )}

    </div>
  );
}