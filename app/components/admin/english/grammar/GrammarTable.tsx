"use client";

import { useState } from "react";

type Row = {
  wh: string;
  hv1: string;
  subject: string;
  hv2: string;
  verb: string;
  object: string;
};

type Group = {
  id: number;
  hindi: string;
  rows: Row[];
};

export default function GrammarTable({ data }: { data: Group[] }) {

  const [columns, setColumns] = useState([
    "index",
    "hindi",
    "wh",
    "hv1",
    "subject",
    "hv2",
    "verb",
    "object"
  ]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null) return;

    const newCols = [...columns];
    const dragged = newCols[dragIndex];

    newCols.splice(dragIndex, 1);
    newCols.splice(dropIndex, 0, dragged);

    setColumns(newCols);
    setDragIndex(null);
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

    <div className="w-full h-full">

      <table className="w-full table-fixed border border-gray-400 text-sm">

        {/* HEADER */}
        <thead className="bg-gray-300 text-center">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className="border p-2"
              >
                {headerMap[col]}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>

          {data.map((group, gIndex) => (

            group.rows.map((row, rIndex) => (

              <tr key={`${gIndex}-${rIndex}`} className="text-center">

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

                  if (col === "hindi" && rIndex === 0) {
                    return (
                      <td
                        key="hindi"
                        rowSpan={group.rows.length}
                        className="border p-2 text-left align-top whitespace-nowrap"
                      >
                        {group.hindi}
                      </td>
                    );
                  }

                  if (col === "index" || col === "hindi") return null;

                  return (
                    <td key={col} className="border p-2 break-words">
                      {(row as any)[col]}
                    </td>
                  );

                })}

              </tr>

            ))

          ))}

        </tbody>

      </table>

    </div>
  );
}