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

export default function GrammarTable({
  data,
  headers,
  tableSelector
}: {
  data: Group[],
  headers?: string[],
  tableSelector?: any
}) {

  const [tableData, setTableData] = useState<Group[]>(data);
  useEffect(() => {
    setTableData(data);
    setVisibleCells(0);
  }, [data]);
  const [columns, setColumns] = useState<string[]>([]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [menu, setMenu] = useState<any>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setCtrlPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const [mergedCells, setMergedCells] = useState<any>({});

  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [visibleCells, setVisibleCells] = useState(0);

useEffect(() => {

  if (columns.length > 0) return;

  if (headers && headers.length > 0) {

    const dynamicCols =
      headers
        .filter(
          (h: string) =>
            h.toLowerCase() !== "hindi"
        )
        .map((h: string) => {

          const key = h.toLowerCase();

          if (key === "hv") {
            return "hv1";
          }

          return key;

        });

    setColumns([
      "index",
      "hindi",
      ...dynamicCols
    ]);

    return;
  }

  if (!tableData || tableData.length === 0) return;

  const baseCols = ["index", "hindi"];

  const firstRow =
    tableData[0]?.rows[0] || {};

  const dynamicCols =
    Object.keys(firstRow);

  setColumns([
    ...baseCols,
    ...dynamicCols
  ]);

}, [tableData, headers]);

    const saveHistory = () => {
      setHistory(prev => [...prev, {
        tableData: JSON.parse(JSON.stringify(tableData)),
        columns,
        mergedCells
      }]);
      setRedoStack([]);
    };

    const undo = () => {
      if (history.length === 0) return;

      const last = history[history.length - 1];

      setRedoStack(prev => [...prev, { tableData, columns, mergedCells }]);

      setTableData(last.tableData);
      setColumns(last.columns);
      setMergedCells(last.mergedCells);

      setHistory(prev => prev.slice(0, -1));
    };

    const redo = () => {
      if (redoStack.length === 0) return;

      const last = redoStack[redoStack.length - 1];

      setHistory(prev => [...prev, { tableData, columns, mergedCells }]);

      setTableData(last.tableData);
      setColumns(last.columns);
      setMergedCells(last.mergedCells);

      setRedoStack(prev => prev.slice(0, -1));
    };

    useEffect(() => {
      const handleKey = (e: any) => {
        if (e.ctrlKey && e.key === "z") {
          e.preventDefault(); undo();
        }
        if (e.ctrlKey && e.key === "y") {
          e.preventDefault(); redo();
        }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
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

    const handleAddColumn = (index: number) => {
      const name = prompt("Column name?");
      if (!name) return;
      saveHistory();

      const newCols = [...columns];
      newCols.splice(index + 1, 0, name);

      const updatedData = tableData.map(g => ({
        ...g,
        rows: g.rows.map(r => ({ ...r, [name]: "" }))
      }));

      setColumns(newCols);
      setTableData(updatedData);
      setMenu(null);
    };

    const handleRenameColumn = (index: number) => {
      const oldName = columns[index];
      const name = prompt("New name?", oldName);
      if (!name) return;
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

    const handleDeleteColumn = (index: number) => {
      const col = columns[index];

      if (col === "index" || col === "hindi") {
        alert("Cannot delete this column");
        return;
      }
      saveHistory();

      const newCols = columns.filter((_, i) => i !== index);

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

    const handleCellChange = (g: number, r: number, c: string, value: string) => {
      const updated = [...tableData];
      updated[g].rows[r][c] = value;
      setTableData(updated);
    };

    const handleCellClick = (e: any, g: number, r: number, c: string) => {
      if (!e.shiftKey) {
        setSelected([]);
        return;
      }

      const key = `${g}-${r}-${c}`;

      if (selected.length === 0) {
        setSelected([key]);
        return;
      }

      const [sg, sr, sc] = selected[0].split("-");

      // same group only
      if (Number(sg) !== g) {
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

      for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {

          const colName = columns[colIndex];

          if (colName === "index" || colName === "hindi") continue;

          newSelection.push(`${g}-${rowIndex}-${colName}`);
        }
      }

      setSelected(newSelection);
    };



    const handleMerge = () => {
      if (selected.length < 2) return;
      saveHistory();

      const sorted = [...selected];

      const rows = sorted.map(s => Number(s.split("-")[1]));
      const cols = sorted.map(s => s.split("-")[2]);

      const uniqueCols = [...new Set(cols)];
      const uniqueRows = [...new Set(rows)];

      const rowSpan = uniqueRows.length;
      const colSpan = uniqueCols.length;

      const base = sorted.sort((a, b) => {
        const [ga, ra, ca] = a.split("-");
        const [gb, rb, cb] = b.split("-");

        if (Number(ra) !== Number(rb)) {
          return Number(ra) - Number(rb);
        }

        return columns.indexOf(ca) - columns.indexOf(cb);
      })[0];

      const newMerged = { ...mergedCells };

      newMerged[base] = { rowSpan, colSpan };

      sorted.slice(1).forEach(s => {
        newMerged[s] = { hidden: true };
      });

      setMergedCells(newMerged);
      setSelected([]);
      setMenu(null);
    };
    const revealPrevCell = () => {
      setVisibleCells(prev => {
        if (prev <= 0) {
          return 0;
        }

        return prev - 1;
      });
    };

    const revealNextCell = () => {

      setVisibleCells(prev => {

        const totalRows = tableData.reduce(
          (acc, group) => acc + group.rows.length,
          0
        );

        const totalCells =
          totalRows * columns.length;

        if (prev >= totalCells) {
          return prev;
        }

        return prev + 1;
      });

    };

    useEffect(() => {

      const handleKey = (e: any) => {
        if (
          e.target instanceof HTMLElement &&
          e.target.closest("input, textarea, select, button")
        ) {
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();

          const rowSize = columns.length;

          if (rowSize === 0) return;

          if (e.shiftKey) {

            const previousRow =
              Math.ceil(visibleCells / rowSize) - 1;

            setVisibleCells(
              Math.max(0, previousRow * rowSize)
            );

          } else {

            const currentRow =
              Math.floor(visibleCells / rowSize);

            const nextRowEnd =
              (currentRow + 1) * rowSize;

            setVisibleCells(nextRowEnd);

          }
        }
        if (e.key === "ArrowRight") {
          revealNextCell();
        }

        if (e.key === "ArrowLeft") {
          revealPrevCell();
        }

        if (e.key === "ArrowDown") {

          const totalRows = tableData.reduce(
            (acc, group) => acc + group.rows.length,
            0
          );

          const totalCells =
            totalRows * columns.length;

          setVisibleCells(totalCells);
        }

        if (e.key === "ArrowUp") {
          setVisibleCells(0);
        }

      };

      window.addEventListener("keydown", handleKey);

      return () =>
        window.removeEventListener("keydown", handleKey);

    }, [columns, tableData]);
    const headerMap: any = {
      index: "#",
      hindi: tableSelector || "Hindi"
    };

    headers?.forEach((h: string) => {

      const key =
        h.toLowerCase() === "hv"
          ? "hv1"
          : h.toLowerCase();

      headerMap[key] = h;

    });

    return (

      <div className="w-full h-full" onClick={() => setMenu(null)}>

        <table className="border border-gray-400 text-sm table-auto w-max">

          {/* ✅ PERFECT WIDTH CONTROL */}


          <thead className="bg-gray-300 align-middle">
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
                  className="border px-2 py-1 text-left transition-colors hover:bg-yellow-200 hover:text-black"
                >
                  <div className="text-left px-1 transition-colors group-hover:bg-yellow-200 group-hover:text-black">
                    {col === "hindi"
                      ? tableSelector || "Hindi"
                      : headerMap[col] || col}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>

            {tableData.map((group, gIndex) => (

              group.rows.map((row, rIndex) => (

                <tr
                  key={`${gIndex}-${rIndex}`}
                  className={`text-center relative group ${ctrlPressed && hoverRow === `${gIndex}-${rIndex}`
                    ? "bg-yellow-200"
                    : ""
                    }`}
                  onMouseEnter={() => {
                    setHoverRow(`${gIndex}-${rIndex}`);
                  }}
                  onMouseLeave={() => {
                    setHoverRow(null);
                  }}
                >

                  {columns.map((col) => {

                    if (col === "index" && rIndex === 0) {

                      const rowOffset = tableData
                        .slice(0, gIndex)
                        .reduce((acc, group) => acc + group.rows.length, 0);

                      const revealOrder =
                        (rowOffset + rIndex) * columns.length + 0;

                      if (revealOrder >= visibleCells) {
                        return (
                          <td
                            key="index"
                            rowSpan={group.rows.length}
                            className="border-0 p-0 h-0"
                          >
                          </td>
                        );
                      }



                      return (
                        <td
                          key="index"
                          rowSpan={group.rows.length}
                          className="border p-2 font-semibold align-top"
                        >
                          {gIndex + 1}.
                        </td>
                      );
                    }
                    if (col === "hindi" && rIndex === 0) {

                      const rowOffset = tableData
                        .slice(0, gIndex)
                        .reduce((acc, group) => acc + group.rows.length, 0);

                      const revealOrder =
                        (rowOffset + rIndex) * columns.length + 1;

                      if (revealOrder >= visibleCells) {
                        return (
                          <td
                            key="hindi"
                            rowSpan={group.rows.length}
                            className={`border-0 p-0 h-0 ${col.toLowerCase() === "wh"
                              ? "min-w-[60px]"
                              : ""
                              }`}
                          >
                          </td>
                        );
                      }
                      return (
                        <td
                          key="hindi"
                          rowSpan={group.rows.length}
                          className="border px-2 py-1 text-left align-top whitespace-nowrap transition-colors hover:bg-yellow-200 hover:text-black"
                        >
                          {group.hindi}
                        </td>
                      );
                    }
                    if (col === "index" || col === "hindi") return null;

                    const rowOffset = tableData
                      .slice(0, gIndex)
                      .reduce((acc, group) => acc + group.rows.length, 0);

                    const key = `${gIndex}-${rIndex}-${col}`;

                    const cellOrder =
                      (rowOffset + rIndex) * columns.length +
                      columns.indexOf(col);

                    const isVisible = cellOrder < visibleCells;

                    const merge = mergedCells[key];

                    if (merge?.hidden) {
                      return null;
                    }

                    if (!isVisible) {
                      return (
                        <td
                          key={col}
                          className="border-0 p-0 h-0"
                        >
                        </td>
                      );
                    }
                    return (
                      <td
                        key={col}
                        rowSpan={merge?.rowSpan || 1}
                        colSpan={merge?.colSpan || 1}
                        onClick={(e) => handleCellClick(e, gIndex, rIndex, col)}
                        onMouseDown={(e) => {
                          if (e.shiftKey) {
                            setIsDragging(true);
                            handleCellClick(e, gIndex, rIndex, col); // start selection
                          }
                        }}

                        onMouseEnter={(e) => {
                          if (isDragging && e.shiftKey) {
                            handleCellClick(e, gIndex, rIndex, col);
                          }
                        }}

                        onMouseUp={() => setIsDragging(false)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setMenu({ x: e.clientX, y: e.clientY, cell: true });
                        }}
                        className={`border px-1 py-0 whitespace-nowrap text-left ${selected.includes(key)
                          ? "bg-yellow-200 text-black"
                          : "hover:bg-yellow-200 hover:text-black"
                          }`}
                      >

                        <input
                          type="text"
                          value={row[col] || ""}
                          onChange={(e) =>
                            handleCellChange(gIndex, rIndex, col, e.target.value)
                          }
                          className="bg-transparent outline-none border-none p-0 m-0 text-left"
                          size={Math.max((row[col] || "").length, 1)}
                          style={{ width: `${(row[col] || "").length + 1}ch` }}
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