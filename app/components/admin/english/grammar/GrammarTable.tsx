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
  tableSelector,
  revealedRows,
  setRevealedRows
}: {
  data: Group[],
  headers?: string[],
  tableSelector?: any,
  revealedRows: number,
  setRevealedRows: React.Dispatch<React.SetStateAction<number>>
}) {

  const [tableData, setTableData] = useState<Group[]>(data);

  useEffect(() => {

    setTableData(data);

    setColumns([]);
    setHiddenColumns([]);
    setMergedCells({});
    setSelected([]);
    setHistory([]);
    setRedoStack([]);

  }, [data]);

  const [columns, setColumns] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
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



  useEffect(() => {

    if (columns.length > 0) return;

    if (headers && headers.length > 0) {

      const dynamicCols =
        headers.map((h: string) => {

          const key = h.toLowerCase();

          if (key === "hv") {
            return "hv1";
          }

          return key;

        });

      setColumns([
        "index",
        ...dynamicCols
      ]);

      return;
    }

    if (!tableData || tableData.length === 0) return;

    const baseCols = ["index"];

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
  const toggleColumnVisibility = (col: string) => {
    setHiddenColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    );
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

    if (col === "index") {
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
  const highlightText = (text: string) => {
    if (!text) return null;

    const parts = text.split(
      /(\([^)]*\)|नहीं|not|n't|क्[\u200c\u200d]?या|क्या|कब|कौन|कहॉं|कैसे|किसका|कितना|कितने|कितनी|किसे|क्[\u200c\u200d]?यों|क्यों)/giu
    );

    return parts.map((part, index) => {

      // () वाला पूरा text
      if (/^\([^)]*\)$/.test(part)) {
        return (
          <span
            key={index}
            className="bg-purple-600 text-white px-1 rounded"
          >
            {part}
          </span>
        );
      }

      // RED: नहीं / not / n't
      if (
        part === "नहीं" ||
        part.toLowerCase() === "not" ||
        part.toLowerCase() === "n't"
      ) {
        return (
          <span key={index} className="text-red-600">
            {part}
          </span>
        );
      }

      // BLUE: Question words
      if (
        /^(क्[\u200c\u200d]?या|क्या|कब|कौन|कहॉं|कैसे|किसका|कितना|कितने|कितनी|किसे|क्[\u200c\u200d]?यों|क्यों)$/u.test(part)
      ) {
        return (
          <span key={index} className="text-blue-600">
            {part}
          </span>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    });
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

        if (colName === "index") continue;

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
    setRevealedRows(prev => Math.max(0, prev - 1));
  };

  const revealNextCell = () => {
    const totalRows = tableData.reduce(
      (acc, group) => acc + group.rows.length,
      0
    );

    setRevealedRows(prev =>
      Math.min(totalRows, prev + 1)
    );
  };

  useEffect(() => {

    const handleKey = (e: any) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("input, textarea, select, button")
      ) {
        return;
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

        setRevealedRows(totalRows);
      }

      if (e.key === "ArrowUp") {
        setRevealedRows(0);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);

  }, [tableData]);
  const headerMap: any = {
    index: "#"
  };

  headers?.forEach((h: string) => {

    const key =
      h.toLowerCase() === "hv"
        ? "hv1"
        : h.toLowerCase();

    headerMap[key] = h;

  });
  const visibleTableData = (() => {
    let count = 0;

    return tableData
      .map(group => {
        const remaining = revealedRows - count;

        if (remaining <= 0) {
          return null;
        }

        const visibleGroupRows = group.rows.slice(
          0,
          remaining
        );

        count += visibleGroupRows.length;

        return {
          ...group,
          rows: visibleGroupRows
        };
      })
      .filter(Boolean) as Group[];
  })();
  return (

    <div className="relative w-full h-full" onClick={() => setMenu(null)}>

      <table className="border border-gray-400 text-sm table-auto w-max">

        {/* ✅ PERFECT WIDTH CONTROL */}


        <thead className="sticky top-0 z-10 bg-gray-300 align-middle">



          <tr>
            {columns.map((col, i) => {
              const isHidden = hiddenColumns.includes(col);

              if (isHidden) {
                return (
                  <th
                    key={`hidden-${i}-${col}`}
                    className="w-0 min-w-0 max-w-0 p-0 border-0 relative overflow-visible"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumnVisibility(col);
                      }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-4 h-4 rounded-full bg-white border-gray-500 flex items-center justify-center cursor-pointer shadow-sm hover:bg-yellow-500"
                      title={`Show ${headerMap[col] || col}`}
                    >
                      <span className="sr-only">
                        Show {headerMap[col] || col}
                      </span>
                    </button>
                  </th>
                );
              }

              return (
                <th
                  key={`header-${i}-${col}`}
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
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(col)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleColumnVisibility(col);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3 h-3 shrink-0"
                      />

                      {!hiddenColumns.includes(col) && (
                        <span>{headerMap[col] || col}</span>
                      )}
                    </label>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>

          {visibleTableData.map((group, gIndex) => (

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

                  const key = `${gIndex}-${rIndex}-${col}`;

                  const merge = mergedCells[key];

                  if (merge?.hidden) {
                    return null;
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
                          handleCellClick(e, gIndex, rIndex, col);
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
                        setMenu({
                          x: e.clientX,
                          y: e.clientY,
                          cell: true
                        });
                      }}
                      className={`border py-0 whitespace-nowrap text-left ${hiddenColumns.includes(col)
                        ? "w-0 min-w-0 max-w-0 p-0 border-0 overflow-hidden"
                        : "px-1"
                        } ${selected.includes(key)
                          ? "bg-yellow-200 text-black"
                          : "hover:bg-yellow-200 hover:text-black"
                        }`}
                    >

                      {!hiddenColumns.includes(col) && (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="bg-transparent outline-none border-none p-0 m-0 text-left min-w-[20px]"
                          onInput={(e) => {
                            handleCellChange(
                              gIndex,
                              rIndex,
                              col,
                              e.currentTarget.innerText
                            );
                          }}
                        >
                          {highlightText(row[col] || "")}
                        </div>
                      )}
                    </td>
                  );

                })}

              </tr>

            ))

          ))}

        </tbody>

      </table>
      <div className="absolute top-1 right-1 z-10 flex items-center gap-2 text-xs">
        <span className="font-semibold">Rows:</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            revealPrevCell();
          }}
          disabled={revealedRows <= 0}
          className="px-2 py-0.5 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
        >
          −
        </button>

        <span className="min-w-[24px] text-center font-semibold">
          {revealedRows}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            revealNextCell();
          }}
          disabled={
            revealedRows >=
            tableData.reduce(
              (acc, group) => acc + group.rows.length,
              0
            )
          }
          className="px-2 py-0.5 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
        >
          +
        </button>

        <span className="text-gray-500">
          / {tableData.reduce(
            (acc, group) => acc + group.rows.length,
            0
          )}
        </span>
      </div>

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