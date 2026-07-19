"use client";

import { useState } from "react";

interface WhiteBoardTableProps {
  id: string;
  x: number;
  y: number;
  rows: number;
  cols: number;
  selected: boolean;
  onMouseDown: (id: string, e: React.MouseEvent) => void;
}

export default function WhiteBoardTable({
  id,
  x,
  y,
  rows,
  cols,
  selected,
  onMouseDown,
}: WhiteBoardTableProps) {
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "")
    )
  );

  const updateCell = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setCells((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[rowIndex][colIndex] = value;
      return copy;
    });
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown(id, e)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        cursor: "move",
        userSelect: "none",
      }}
    >
      <table
        className={`border-collapse bg-white ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-500 p-0"
                >
                  <input
                    value={cell}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateCell(
                        rowIndex,
                        colIndex,
                        e.target.value
                      )
                    }
                    className="w-28 h-10 px-2 outline-none bg-transparent"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}