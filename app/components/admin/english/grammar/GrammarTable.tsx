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

  const [columns, setColumns] = useState<string[]>([]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [menu, setMenu] = useState<any>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mergedCells, setMergedCells] = useState<any>({});

  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
useEffect(() => {
  if (columns.length > 0) return;

  if (!tableData || tableData.length === 0) return;

  const baseCols = ["index", "hindi"];

  const firstRow = tableData[0]?.rows[0] || {};
  const dynamicCols = Object.keys(firstRow);

  setColumns([...baseCols, ...dynamicCols]);
}, [tableData]);
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

    setRedoStack(prev => [...prev, { tableData, columns, mergedCells }]);

    setTableData(last.tableData);
    setColumns(last.columns);
    setMergedCells(last.mergedCells);

    setHistory(prev => prev.slice(0,-1));
  };

  const redo = () => {
    if(redoStack.length === 0) return;

    const last = redoStack[redoStack.length - 1];

    setHistory(prev => [...prev, { tableData, columns, mergedCells }]);

    setTableData(last.tableData);
    setColumns(last.columns);
    setMergedCells(last.mergedCells);

    setRedoStack(prev => prev.slice(0,-1));
  };

  useEffect(()=>{
    const handleKey = (e:any)=>{
      if(e.ctrlKey && e.key === "z"){
        e.preventDefault(); undo();
      }
      if(e.ctrlKey && e.key === "y"){
        e.preventDefault(); redo();
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
const handleAddRow = (gIndex:number)=>{
  saveHistory();

  const newData = [...tableData];

  const newRow: any = {};
  columns.forEach(col=>{
    if(col !== "index" && col !== "hindi"){
      newRow[col] = "";
    }
  });

  newData[gIndex].rows.push(newRow);
  setTableData(newData);
};

const handleDeleteRow = (gIndex:number, rIndex:number)=>{
  saveHistory();

  const newData = [...tableData];
  if(newData[gIndex].rows.length === 1) return;

  newData[gIndex].rows.splice(rIndex,1);
  setTableData(newData);
};
  const handleCellClick = (e:any, g:number, r:number, c:string)=>{
  if(!e.shiftKey){
    setSelected([]);
    return;
  }

  const key = `${g}-${r}-${c}`;

  if(selected.length === 0){
    setSelected([key]);
    return;
  }

  const [sg, sr, sc] = selected[0].split("-");

  // same group only
  if(Number(sg) !== g){
    setSelected([key]);
    return;
  }

  const startRow = Number(sr);
  const endRow = r;

  const startCol = columns.indexOf(sc);
  const endCol = columns.indexOf(c);

  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  const newSelection: string[] = [];

  for(let rowIndex = minRow; rowIndex <= maxRow; rowIndex++){
    for(let colIndex = minCol; colIndex <= maxCol; colIndex++){

      const colName = columns[colIndex];

      if(colName === "index" || colName === "hindi") continue;

      newSelection.push(`${g}-${rowIndex}-${colName}`);
    }
  }

  setSelected(newSelection);
};
  
  

  const handleMerge = ()=>{
  if(selected.length < 2) return;
  saveHistory();

  const sorted = [...selected];

  const rows = sorted.map(s=>Number(s.split("-")[1]));
  const cols = sorted.map(s=>s.split("-")[2]);

  const uniqueCols = [...new Set(cols)];
  const uniqueRows = [...new Set(rows)];

  const rowSpan = uniqueRows.length;
  const colSpan = uniqueCols.length;

  const base = sorted.sort((a,b)=>{
  const [ga, ra, ca] = a.split("-");
  const [gb, rb, cb] = b.split("-");

  if(Number(ra) !== Number(rb)){
    return Number(ra) - Number(rb);
  }

  return columns.indexOf(ca) - columns.indexOf(cb);
})[0];

  const newMerged = {...mergedCells};

  newMerged[base] = { rowSpan, colSpan };

  sorted.slice(1).forEach(s=>{
    newMerged[s] = { hidden:true };
  });

  setMergedCells(newMerged);
  setSelected([]);
  setMenu(null);
};

  const headerMap: any = {
    index: "#",
    hindi: "Hindi",
    subject: "Subject",
    hv1: "H.V.",
    verb: "Verb",
    object: "Object"
  };

  return (

    <div className="w-full h-full" onClick={()=>setMenu(null)}>

      <table className="border border-gray-400 text-sm w-max">

        {/* ✅ PERFECT WIDTH CONTROL */}
        

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

              <tr key={`${gIndex}-${rIndex}`} className="text-center relative group">

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

                  if(merge?.hidden){
  return null;
}

                  return (
                    <td
                      key={col}
                      rowSpan={merge?.rowSpan || 1}
                      colSpan={merge?.colSpan || 1}
                      onClick={(e)=>handleCellClick(e,gIndex,rIndex,col)}
                      onMouseDown={(e)=>{
  if(e.shiftKey){
    setIsDragging(true);
    handleCellClick(e, gIndex, rIndex, col); // start selection
  }
}}

onMouseEnter={(e)=>{
  if(isDragging && e.shiftKey){
    handleCellClick(e, gIndex, rIndex, col);
  }
}}

onMouseUp={()=>setIsDragging(false)}
                      onContextMenu={(e)=>{
                        e.preventDefault();
                        setMenu({ x:e.clientX, y:e.clientY, cell:true });
                      }}
                      className={`border p-1 whitespace-nowrap ${
                        selected.includes(key) ? "bg-yellow-200" : ""
                      }`}
                    >
                     <input
  value={row[col] || ""}
  onChange={(e)=>handleCellChange(gIndex,rIndex,col,e.target.value)}
  onMouseDown={(e)=>e.stopPropagation()}
  style={{ width: (row[col]?.length || 1) + "ch" }}
  className="outline-none text-center"
/>
                    </td>
                  );

                })}
<td className="border p-1 opacity-0 group-hover:opacity-100">
  <button onClick={()=>handleAddRow(gIndex)} className="text-green-600 mr-1">＋</button>
  <button onClick={()=>handleDeleteRow(gIndex, rIndex)} className="text-red-600">－</button>
</td>
              </tr>

            ))

          ))}

        </tbody>

      </table>

      {menu && (
        <div className="fixed bg-white border shadow-lg text-sm z-50" style={{ top: menu.y, left: menu.x }}>
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